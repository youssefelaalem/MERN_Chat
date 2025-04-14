const asyncHandler = require("express-async-handler");
const userModel = require("../models/Usermodel");
const appError = require("../utils/appError");
const generate_token = require("../utils/generat_token");
const httpStatusText = require("../utils/httpStatusText");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const validator = require("validator");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

const registerFUN = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;
  const user = await userModel.findOne({ email });
  console.log("sss", user);

  if (user) {
    return next(
      appError.create("The Email Is Usedss.", 400, httpStatusText.FAIL)
    );
  }
  if (!validator.isEmail(email)) {
    return next(
      appError.create("Invalid Email Format.", 400, httpStatusText.FAIL)
    );
  }
  // Check if password is provided and meets length requirement
  if (!password || password.length < 5) {
    return next(
      appError.create(
        "Password Is Required And Must Be At Least 5 Characters Long.",
        400,
        httpStatusText.FAIL
      )
    );
  }

  if (
    validator.isStrongPassword(password, {
      minLength: 7,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
  ) {
    return next(
      appError.create(
        "Password must be at least 7 characters with 1 lowercase, 1 uppercase, and 1 number",
        400,
        httpStatusText.FAIL
      )
    );
  }
  // Check if username meets length requirement
  if (!username || username.length < 3) {
    return next(
      appError.create(
        "Username Must Be At Least 3 Characters Long.",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const olduser = await userModel.findOne({ username });
  if (olduser) {
    return res
      .status(409)
      .json(
        appError.create(
          "User Name Should Be Unique , It's Used.",
          409,
          httpStatusText.FAIL
        )
      );
  }

  const password_Hashed = await bcrypt.hash(password, 10);
  req.body.password = password_Hashed;

  const newUser = await userModel.create(req.body);

  const token = generate_token({
    userId: newUser._id,
    username: newUser.username,
  });
  return res
    .cookie("token", token)
    .status(201)
    .json({ id: newUser._id, token });
});

const loginFUN = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ username: req.body.username });
  // console.log("user check", user);
  if (!user) {
    return next(appError.create("this user don't have account.", 500));
  }
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(appError.create("user or password are not corrected", 500));
  }

  const token = generate_token({
    userId: user._id,
    username: user.username,
  });

  return res
    .cookie("token", token, { httpOnly: true, secure: true })
    .status(201)
    .json({ id: user._id, token });
  // res.status(200).json({ status: "success", Data: user, token: token });
});
const logOutFUN = (req, res) => {
  res
    .cookie("token", "", { sameSite: "none", secure: true })
    .json("successfully logout");
};
const profileFUN = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    const verifyToken = (token) =>
      new Promise((resolve, reject) => {
        JWT.verify(token, process.env.JWT_SECRET_KEY, {}, (err, data) => {
          if (err) {
            if (err.name === "TokenExpiredError") {
              return reject({ type: "expired", message: err.message });
            }
            return reject({ type: "invalid", message: err.message });
          }
          resolve(data);
        });
      });
    const userData = await verifyToken(token);
    console.log("userData at profile", userData);
    res.json(userData);
  } else {
    res.status(401).json("no token found");
  }
});

const getAllUsersFUN = asyncHandler(async (req, res, next) => {
  const AllUsers = await userModel.find({}, { _id: 1, username: 1 });

  if (AllUsers.length == 0) {
    return next(appError.create("there are any users.", 500));
  }
  return res.json({ AllUsers });
});
//////////////////
const forgetPasswordFUN = asyncHandler(async (req, res, next) => {
  try {
    // console.log("email", req.body.email);

    const user = await userModel.findOne({ email: req.body.email });

    if (!user) {
      return next(
        appError.create("This email address isn't registered with us.", 404)
      );
    }

    // Generate reset code
    const resetCoder = Math.floor(Math.random() * 899999 + 100000).toString();
    const hashCode = crypto
      .createHash("sha256")
      .update(resetCoder)
      .digest("hex");

    // console.log("hashCode", hashCode);
    // Update user document
    user.passwordResetCode = hashCode;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;

    // Save with await
    try {
      await user.save();
    } catch (saveError) {
      console.error("Save error:", saveError);
      throw saveError;
    }

    // Prepare email
    const message = `
Hi ${user.username},

We received a request to reset your Cineflix account password.

Your verification code is: 
${resetCoder}

This code will expire in 10 minutes.

If you didn't request this password reset, please ignore this email or contact our support team immediately.

Best regards,
Cineflix Support Team
support@cineflix.com
`;

    // For HTML emails (better formatting):
    const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; }
        .code { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2c3e50;
            margin: 20px 0;
            padding: 10px;
            background: #f8f9fa;
            display: inline-block;
        }
        .footer { 
            margin-top: 30px;
            color: #7f8c8d;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>Hi ${user.username},</p>
        <p>We received a request to reset your Cineflix account password.</p>
        
        <div class="code">${resetCoder}</div>
        
        <p>This verification code will expire in 10 minutes.</p>
        
        <p><strong>Didn't request this change?</strong><br>
        If you didn't initiate this password reset, please contact our support team immediately at 
        <a href="mailto:support@cineflix.com">support@cineflix.com</a></p>
        
        <div class="footer">
            <p>Best regards,<br>
            Cineflix Support Team</p>
            <p>Need help? Contact us at <a href="mailto:support@cineflix.com">support@cineflix.com</a></p>
            <p style="font-size: 0.8em; color: #95a5a6;">
                This is an automated message - please do not reply directly to this email
            </p>
        </div>
    </div>
</body>
</html>
`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Code",
        text: message,
        html: htmlMessage,
      });
    } catch (emailError) {
      // Rollback changes if email fails
      user.passwordResetCode = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetVerified = undefined;
      await user.save(); // Save rollback changes
      return next(appError.create("Failed to send reset email", 500));
    }

    res.status(200).json({
      status: "success",
      message: "Reset code sent to email",
    });
  } catch (error) {
    next(appError.create("Password reset failed", 500));
  }
});
const verifyResetCodeFUN = asyncHandler(async (req, res, next) => {
  try {
    // console.log("Received reset code:", req.body.resetCode);

    const hashResetCode = crypto
      .createHash("sha256") // Use SHA-256 instead of MD5
      .update(String(req.body.resetCode))
      .digest("hex");

    // console.log("Hashed reset code:", hashResetCode);

    const user = await userModel.findOne({
      passwordResetCode: hashResetCode,
      passwordResetExpires: { $gt: Date.now() },
    });

    // console.log("Found user:", user);

    if (!user) {
      return next(appError.create("Reset code invalid or expired", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(
        appError.create("Password and confirmation do not match", 400)
      );
    }
    const password_Hashed = await bcrypt.hash(req.body.password, 10);

    user.password = password_Hashed;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();
    res.status(200).json({ status: "success", message: "Password updated" });
  } catch (error) {
    console.error("Error in verifyResetCodeFUN:", error);
    next(appError.create("Password reset failed", 500));
  }
});
const wsRefreshTokenFUN = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "No refresh token provided",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    // Generate new access token with longer expiration for WebSocket
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" } // Longer expiration for WebSocket
    );

    // Set the new token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({
      status: "success",
      message: "WebSocket token refreshed successfully",
      token,
    });
  } catch (error) {
    console.error("WebSocket token refresh error:", error);
    res.status(401).json({
      status: "error",
      message: "Invalid refresh token",
    });
  }
};
module.exports = {
  profileFUN,
  registerFUN,
  loginFUN,
  logOutFUN,
  getAllUsersFUN,
  forgetPasswordFUN,
  verifyResetCodeFUN,
  wsRefreshTokenFUN,
};
