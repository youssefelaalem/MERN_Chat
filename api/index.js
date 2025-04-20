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
const verifyToken = require("./utils/verifyToken");
require("dotenv").config();
console.log(" process.env.REMOTE_CLEINT_URL", process.env.REMOTE_CLIENT_URL);

app.use(express.json()); //to receive json from the body
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173", // Remove trailing slash
  "https://mern-chat-theta.vercel.app",
].filter(Boolean); // Remove any undefined/null values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked CORS request from:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Error handling for CORS
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({
      status: "error",
      message: "CORS policy: Request not allowed",
    });
  } else {
    next(err);
  }
});

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
app.get("/hello:name", (req, res) => {
  // console.log("ree", req);
  const { name } = req.params;
  res.status(200).json({
    status: "Ok",
    message: `Hello ${name}`,
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
const MAX_WS_CONNECTIONS = 100;
wss.on("connection", async (connection, req) => {
  if (wss.clients.size >= MAX_WS_CONNECTIONS) {
    connection.close(1008, "Server overloaded");
    return;
  }
  // Notify all clients about online users
  const notifyOnlineUsers = _.throttle(() => {
    const onlineUsers = [...wss.clients]
      .filter((client) => client.readyState === ws.OPEN && client.userId)
      .map((client) => ({
        userId: client.userId,
        username: client.username,
      }));

    [...wss.clients].forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(
          JSON.stringify({
            online: onlineUsers,
          })
        );
      }
    });
  }, 1000);

  // Set up connection health check
  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyOnlineUsers();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  // Handle token verification
  const cookies = req.headers.cookie;
  // const authHeader = req.headers.authorization;

  let token;
  const queryParams = new URLSearchParams(url.parse(req.url, true).search);
  token = queryParams.get("token");

  // // Check Authorization header first (for production)
  // if (authHeader?.startsWith("Bearer ")) {
  //   token = authHeader.split(" ")[1];
  // }
  // Fall back to cookies (for local development)
  if (!token && cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.trim().startsWith("token="));
    token = tokenCookieString?.split("=")[1];
  }

  if (token) {
    try {
      const userData = await verifyToken(token);
      console.log("WebSocket user authenticated:", userData.userId);

      connection.userId = userData.userId;
      connection.username = userData.username;
    } catch (error) {
      console.error("WebSocket token verification error:", error);
      connection.close(1008, "Token verification failed"); // WebSocket status code
      return;
    }
  } else {
    connection.close(1008, "No token provided"); // WebSocket status code
    return;
  }

  // Initial notification
  notifyOnlineUsers();

  // Handle incoming messages
  connection.on("message", async (message) => {
    try {
      const messageData = JSON.parse(message.toString());
      const { recipient, text, fileUrl, fileMetadata } = messageData;

      if (recipient && (text || fileUrl)) {
        const messageDoc = await MessageModel.create({
          sender: connection.userId,
          recipient,
          text,
          fileUrl,
          fileMetadata,
        });

        // Send message to recipient if they're online
        [...wss.clients]
          .filter(
            (client) =>
              client.userId === recipient && client.readyState === ws.OPEN
          )
          .forEach((client) => {
            client.send(
              JSON.stringify({
                text,
                sender: connection.userId,
                recipient,
                fileUrl,
                fileMetadata,
                _id: messageDoc._id,
                createdAt: messageDoc.createdAt,
              })
            );
          });
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  // Handle connection close
  connection.on("close", () => {
    clearInterval(connection.timer);
    notifyOnlineUsers();
  });

  // Handle errors
  connection.on("error", (error) => {
    console.error("WebSocket error:", error);
    connection.close(1011, "Internal error");
  });
});
