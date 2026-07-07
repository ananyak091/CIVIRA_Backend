import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP Error:", error);
  } else {
    console.log("SMTP Ready");
  }
});
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);

const sendAdminOtp = async (email, otp) => {
  console.log("Inside sendAdminOtp");
  console.log("Sending to:", email);

  const info = await transporter.sendMail({
    from: `"CIVIRA Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "CIVIRA Admin Login OTP",
    html: `
      <h2>CIVIRA Admin Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 5 minutes.</p>
    `,
  });

  console.log("Mail sent:", info.messageId);
};

export default sendAdminOtp;
