const express = require("express");
const messagesController = require("../controllers/messagesController");
const route = express.Router();

route.get("/messages/:userId", messagesController.retriveAllMessages);

module.exports = route;
