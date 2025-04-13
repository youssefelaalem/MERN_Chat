const asyncHandler = require("express-async-handler");
const JWT = require("jsonwebtoken");
const MessageModel = require("../models/Messagemodel");

const getCurrentUserInfo = (req) => {
  return new Promise((resolve, reject) => {
    const token = req?.cookies?.token;
    if (token) {
      JWT.verify(token, process.env.JWT_SECRET_KEY, (err, userData) => {
        if (err) {
          console.error("JWT Verification Error:", err);
          return reject(err);
        }
        resolve(userData);
      });
    } else {
      // No token provided
      resolve(null);
    }
  });
};

const retriveAllMessages = asyncHandler(async (req, res) => {
  const userIdSelected = req?.params?.userId;

  if (!userIdSelected || userIdSelected === "null") {
    return res.status(400).json({ error: "Invalid recipient id" });
  }

  const userData = await getCurrentUserInfo(req);

  // Check if user is authenticated
  if (!userData) {
    return res.status(401).json({ error: "User not authenticated issue with userData obj" });
  }
  const currentUserId = userData.userId;
  if (!currentUserId) {
    return res.status(401).json({ error: "User not authenticated issue wiht id" });
  }

  // Query the messages ensuring both ids are valid ObjectIds
  const allMessages = await MessageModel.find({
    sender: { $in: [userIdSelected, currentUserId] },
    recipient: { $in: [userIdSelected, currentUserId] },
  }).sort({ createdAt: 1 });

  res.json({ allMessages });
});

module.exports = {
  retriveAllMessages,
};
