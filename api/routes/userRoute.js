const express = require("express");
const route = express.Router();
const usersController = require("../controllers/usersController");
//register
route.post("/register", usersController.registerFUN);
route.post("/login", usersController.loginFUN);
route.post("/logout", usersController.logOutFUN);
route.get("/profile", usersController.profileFUN);
route.get("/AllUsers", usersController.getAllUsersFUN);
route.route("/forgetPassword").post(usersController.forgetPasswordFUN);
route.route("/verifyResetCode").post(usersController.verifyResetCodeFUN);
// route.route("/refresh-token").post(usersController.refreshTokenFUN);
route.route("/ws-refresh-token").post(usersController.wsRefreshTokenFUN);
module.exports = route;
module.exports = route;
