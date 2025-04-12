// const { text } = require("body-parser");
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const emailOptions = {
      from: `"Cineflix Support" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.text, // Plain text version
      html: options.html, // HTML version
    };

    await transporter.sendMail(emailOptions);
  } catch (error) {
    console.error("Email send failed:", error);
    throw error;
  }
};

module.exports = sendEmail;
