const jwt = require("jsonwebtoken");

const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET_KEY, {}, (err, data) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return reject({ type: "expired", message: err.message });
        }
        return reject({ type: "invalid", message: err.message });
      }
      resolve(data);
    });
  });

module.exports = verifyToken;
