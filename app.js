const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

const app = express();

// ✅ Serve STATIC files from /public folder + root fallback
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));  // Fallback for index.html
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
// ===============================
// REGISTRATION ROUTE - FAST & SAFE
// ===============================
app.post('/register', async (req, res) => {
  console.log('📝 New registration attempt:', req.body);

  let { name, email, phone, city, experience, goal, question, timestamp } = req.body;

  try {
    // Basic cleanup
    name = (name || 'Anonymous').toString().substring(0, 100);
    email = email || '';
    phone = phone || '';
    city = city || '';
    experience = experience || '';
    goal = goal || '';
    question = question || '';
    timestamp = timestamp || new Date().toISOString();

    // Save registration FIRST
    const registration = {
      name,
      email,
      phone,
      city,
      experience,
      goal,
      question,
      timestamp,
      registeredAt: new Date().toISOString()
    };

    registrations.push(registration);
    fs.writeFileSync(registrationsFile, JSON.stringify(registrations, null, 2));

    console.log('✅ Registration saved instantly:', name);

    // 🚀 Respond immediately
    res.json({ success: true, message: 'Registration successful!' });

    // ===================================================
    // EMAIL (Background)
    // ===================================================
    if (email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: '✅ Crypto Webinar Registration Confirmed',
        html: `
          <h2>Hello ${name},</h2>
          <p>🎉 Thank you for registering for the <strong>Crypto Awareness Program</strong>.</p>

          <p><strong>📅 Date:</strong> 23 February 2026</p>
          <p><strong>⏰ Time:</strong> 7:00 PM IST</p>
          <p><strong>💻 Mode:</strong> Live Zoom Webinar</p>

          <p><strong>🔗 Zoom Link:</strong></p>
          <a href="https://us05web.zoom.us/j/83989603104?pwd=JMPuVsHx4ZigHBeaLNaxqKYuyXV8MN.1">
          Join Webinar
          </a>

          <p>See you there 🚀</p>
        `
      })
      .then(() => console.log("📧 Email sent:", email))
      .catch(err => console.log("⚠️ Email failed:", err.message));
    }

    // ===================================================
    // WHATSAPP (Background)
    // ===================================================
    if (phone && process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {

      const client = twilio(
        process.env.TWILIO_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      let cleanPhone = phone.replace(/\D/g, '');

      if (cleanPhone.startsWith('91')) {
        cleanPhone = cleanPhone.substring(2);
      }

      if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
      }

      client.messages.create({
        from: 'whatsapp:+14155238886',
        to: `whatsapp:+${cleanPhone}`,
        body: `✅ Hi ${name}! Your Crypto Webinar registration is confirmed!

📅 23 Feb 2026
⏰ 7:00 PM IST

🔗 Join here:
https://us05web.zoom.us/j/83989603104?pwd=JMPuVsHx4ZigHBeaLNaxqKYuyXV8MN.1

See you there 🚀`
      })
      .then(() => console.log("📱 WhatsApp sent:", cleanPhone))
      .catch(err => console.log("⚠️ WhatsApp failed:", err.message));
    }

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

