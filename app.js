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

console.log('🟢 STATIC FILES: public/ + root/ served');

// ===============================
// LOAD REGISTRATIONS
// ===============================
let registrations = [];
const registrationsFile = path.join(__dirname, 'registrations.json');

if (fs.existsSync(registrationsFile)) {
  try {
    registrations = JSON.parse(fs.readFileSync(registrationsFile, 'utf8'));
  } catch (err) {
    console.log('Error loading registrations:', err);
  }
}

// ===============================
// SERVE INDEX PAGE
// ===============================
app.get('/', (req, res) => {
  // Try public/index.html first, then root index.html
  const publicPath = path.join(__dirname, 'public', 'index.html');
  const rootPath = path.join(__dirname, 'index.html');

  if (fs.existsSync(publicPath)) {
    res.sendFile(publicPath);
  } else if (fs.existsSync(rootPath)) {
    res.sendFile(rootPath);
  } else {
    res.status(404).send('index.html not found in public/ or root folder');
  }
});

// ===============================
// REGISTRATION ROUTE - FIXED FOR ANY NAME
// ===============================
app.post('/register', async (req, res) => {
  console.log('📝 New registration attempt:', req.body);

  let { name, email, phone, city, experience, goal, question, timestamp } = req.body;

  try {
    // 🔥 FIXED: Accept ANY name (Chinese, Arabic, Emoji, special chars)
    name = name || 'Anonymous';
    name = name.toString().substring(0, 100);  // Max 100 chars

    email = email || '';
    phone = phone || '';
    city = city || '';
    experience = experience || '';
    goal = goal || '';
    question = question || '';
    timestamp = timestamp || new Date().toISOString();

    // Save registration
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
    console.log('✅ Saved:', name);

    // ===============================
    // EMAIL SETUP
    // ===============================
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // IMPORTANT
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    await transporter.sendMail({
      from: 'web3withpassiveincome@gmail.com',
      to: email,
      subject: '✅ Crypto Webinar Registration Confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #22d3ee;">Hello ${name},</h2>
          <p style="font-size: 16px;">🎉 Thank you for registering for the <strong>Crypto Awareness Program</strong>.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #22d3ee;">
            <h3>📅 Event Details:</h3>
            <p><strong>Date:</strong> 23 February 2026 (Saturday)</p>
            <p><strong>Time:</strong> 7:00 PM IST</p>
            <p><strong>Mode:</strong> Live Zoom Webinar</p>
          </div>
          <p>📧 Zoom link: https://us06web.zoom.us/j/4201681872?pwd=C4h0kVClelsbWb0C9qk3gxdaY3l6nY.1</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            <strong>web3withpassiveincome@gmail.com</strong><br>
            Bringing crypto education to everyone 🚀
          </p>
        </div>
      `
    });

    console.log('📧 Email sent to:', email);

    // ===============================
    // WHATSAPP (TWILIO) - FIXED PHONE
    // ===============================
    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );


    // 🔥 FIXED: Clean Indian phone numbers (+91 or 10 digits)
    let cleanPhone = phone.replace(/\D/g, '');  // Remove non-digits
    if (cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.substring(2);  // Remove 91 prefix
    }
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;  // Add 91 prefix
    }

    await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:+${cleanPhone}`,
      body: `✅ Hi ${name}! Your Crypto Webinar registration is confirmed!\n\n📅 Date: 23 Feb 2026, 7PM IST\n📱 Zooom link https://us06web.zoom.us/j/4201681872?pwd=C4h0kVClelsbWb0C9qk3gxdaY3l6nY.1 🚀`
    });

    console.log('📱 WhatsApp sent to:', cleanPhone);

    res.json({ success: true, message: 'Registration successful!' });

  } catch (error) {
    console.error('❌ Registration error:', error.message);

    // Still save failed attempts for debugging
    const failedReg = {
      ...req.body,
      error: error.message,
      registeredAt: new Date().toISOString()
    };
    registrations.push(failedReg);
    fs.writeFileSync(registrationsFile, JSON.stringify(registrations, null, 2));

    res.status(500).json({ success: false, message: 'Server error, but data saved for admin review.' });
  }
});

// ===============================
// ADMIN: VIEW USERS + EXCEL DOWNLOAD
// ===============================
app.get('/api/registrations', (req, res) => {
  res.json({
    registrations,
    total: registrations.length,
    recent: registrations.slice(-5)
  });
});

// ===============================
// ADMIN DASHBOARD
// ===============================
app.get('/admin', (req, res) => {
  res.json({ registrations, total: registrations.length });
});

// ===============================
// START SERVER (RENDER FIX)
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
