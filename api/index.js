const express = require("express");
var _ = require("lodash");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { default: mongoose } = require("mongoose");
const userRoute = require("./routes/userRoute");
const messageRoute = require("./routes/messageRoute");
const ws = require("ws");
const jwt = require("jsonwebtoken");
const MessageModel = require("./models/Messagemodel");
require("dotenv").config();
console.log(" process.env.REMOTE_CLEINT_URL", process.env.REMOTE_CLIENT_URL);

app.use(express.json()); //to receive json from the body
app.use(cookieParser()); //
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://mern-chat-theta.vercel.app/",
        "http://localhost:5173", //local development URL
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"], // Explicitly expose Set-Cookie header
  })
);

app.use("/", userRoute);
app.use("/", messageRoute);
// to connect with the database

mongoose.connect(process.env.MONGO_LINK).then(() => {
  console.log("connected to the database");
});

// Middleware to catch errors
app.use(function (err, req, res, next) {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const statusText = err.statusText || "error";
  const message = err.message || "Something went wrong!";

  res.status(statusCode).json({
    status: statusText,
    message: message,
  });
});

//to handle all another routes
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "this resource is not available",
  });
});

const server = app.listen(process.env.PORT, (req, res) => {
  console.log(`listening on 
    http://localhost:${process.env.PORT}`);
});

const wss = new ws.WebSocketServer({ server: server });

wss.on("connection", (connection, req) => {
  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyOnlineUsers();
      console.log("destroy");
    }, 1000);
  }, 5000);
  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.trim().startsWith("token=")); // Trim to avoid space issues

    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, {}, (err, userData) => {
          if (err) {
            console.error("JWT Verification Error:", err);
            return;
          }

          connection.userId = userData.userId;
          connection.username = userData.username;
        });
      }
    }
  }
  // Notify all clients after setting user details
  const notifyOnlineUsers = _.throttle(() => {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId || null,
            username: c.username || "UnKnown",
          })),
        })
      );
    });
  }, 1000); // Send updates at most once per second
  notifyOnlineUsers();
  // function notifyOnlineUsers() {
  //   [...wss.clients].forEach((client) => {
  //     client.send(
  //       JSON.stringify({
  //         online: [...wss.clients].map((c) => ({
  //           userId: c.userId || null, // Ensure null instead of undefined
  //           username: c.username || "Unknown",
  //         })),
  //       })
  //     );
  //   });
  // }

  // Handle incoming messages
  connection.on("message", async (message) => {
    try {
      const messageData = JSON.parse(message.toString());
      const { recipient, text, fileUrl, fileMetadata } = messageData;
      if (recipient && (text || fileUrl)) {
        const messageDoc = await MessageModel.create({
          sender: connection.userId,
          fileUrl,
          recipient,
          text,
          fileMetadata,
        });

        [...wss.clients]
          .filter((client) => client.userId === recipient)
          .forEach((client) =>
            client.send(
              JSON.stringify({
                fileUrl,
                fileMetadata,
                text,
                createdAt: messageDoc.createdAt,
                sender: connection.userId,
                recipient,
                _id: messageDoc._id,
              })
            )
          );
      }
    } catch (error) {
      console.error("Message Handling Error:", error);
    }
  });
});
