const asyncHandler = require("express-async-handler");
const JWT = require("jsonwebtoken");
const MessageModel = require("../models/Messagemodel");

const getCurrentUserInfo = (req) => {
  return new Promise((resolve, reject) => {
    // Try to get token from cookies first
    let token = req?.cookies?.token;
    
    // If not found in cookies, check Authorization header (for production)
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      JWT.verify(token, process.env.JWT_SECRET_KEY, (err, userData) => {
        if (err) {
          console.error('JWT Verification Error:', err);
          return reject(err);
        }
        console.log('Decoded userData:', userData); // Debug logging
        resolve(userData);
      });
    } else {
      console.log('No token found in request'); // Debug logging
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
