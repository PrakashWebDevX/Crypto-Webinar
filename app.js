const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const fs = require("fs");
const path = require("path");

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===============================
// FILE SETUP
// ===============================
const registrationsFile = path.join(__dirname, "registrations.json");

if (!fs.existsSync(registrationsFile)) {
  fs.writeFileSync(registrationsFile, "[]");
}

let registrations = [];
try {
  const data = fs.readFileSync(registrationsFile, "utf8");
  registrations = JSON.parse(data);
} catch (err) {
  registrations = [];
}

// ===============================
// REGISTER ROUTE
// ===============================
app.post("/register", async (req, res) => {
  try {
    const {
      name = "Anonymous",
      email = "",
      phone = "",
      city = "",
      experience = "",
      goal = "",
      question = "",
    } = req.body;

    const registration = {
      name,
      email,
      phone,
      city,
      experience,
      goal,
      question,
      registeredAt: new Date().toISOString(),
    };

    registrations.push(registration);

    await fs.promises.writeFile(
      registrationsFile,
      JSON.stringify(registrations, null, 2)
    );

    res.json({ success: true, message: "Registration successful" });

    // ================= EMAIL =================
    if (email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Crypto Awareness Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Webinar Registration Confirmed",
        html: `
          <h2>Hello ${name},</h2>
          <p>Your registration for the Crypto Awareness Webinar is confirmed.</p>
          <p><strong>Date:</strong> 23 February 2026</p>
          <p><strong>Time:</strong> 7:00 PM IST</p>
          <p><strong>Zoom Link:</strong></p>
          <a href="https://us05web.zoom.us/j/83989603104?pwd=JMPuVsHx4ZigHBeaLNaxqKYuyXV8MN.1">
            Join Webinar
          </a>
          <p>Thank you.</p>
        `,
      });

      console.log("Email sent successfully");
    }

    // ================= WHATSAPP =================
    if (phone && process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = twilio(
        process.env.TWILIO_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      let cleanPhone = phone.replace(/\D/g, "");

      if (cleanPhone.length === 10) {
        cleanPhone = "91" + cleanPhone;
      }

      await client.messages.create({
        from: "whatsapp:+14155238886",
        to: `whatsapp:+${cleanPhone}`,
        body: `Hello ${name},

Your registration is confirmed.

Date: 23 February 2026
Time: 7:00 PM IST

Join Zoom:
https://us05web.zoom.us/j/83989603104?pwd=JMPuVsHx4ZigHBeaLNaxqKYuyXV8MN.1

Thank you.`,
      });

      console.log("WhatsApp sent successfully");
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===============================
// ADMIN VIEW
// ===============================
app.get("/api/registrations", (req, res) => {
  res.json(registrations);
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
