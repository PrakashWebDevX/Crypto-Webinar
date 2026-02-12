const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

const app = express();

// ===============================
// STATIC FILES
// ===============================
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
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
// INDEX ROUTE
// ===============================
app.get('/', (req, res) => {
  const publicPath = path.join(__dirname, 'public', 'index.html');
  const rootPath = path.join(__dirname, 'index.html');

  if (fs.existsSync(publicPath)) return res.sendFile(publicPath);
  if (fs.existsSync(rootPath)) return res.sendFile(rootPath);

  res.status(404).send('index.html not found');
});

// ===============================
// REGISTER ROUTE (FIXED PRO VERSION)
// ===============================
app.post('/register', async (req, res) => {
  console.log('📝 New registration:', req.body);

  try {
    let { name, email, phone, city, experience, goal, question } = req.body;

    name = (name || 'Anonymous').toString().substring(0, 100);

    const registration = {
      name,
      email: email || '',
      phone: phone || '',
      city: city || '',
      experience: experience || '',
      goal: goal || '',
      question: question || '',
      registeredAt: new Date().toISOString()
    };

    // ✅ SAVE FIRST
    registrations.push(registration);
    fs.writeFileSync(registrationsFile, JSON.stringify(registrations, null, 2));
    console.log('✅ Saved:', name);

    // ✅ RESPOND IMMEDIATELY (NO WAITING)
    res.json({ success: true, message: 'Registration successful!' });

    // ===============================
    // EMAIL (BACKGROUND)
    // ===============================
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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
        html: `<h2>Hello ${name},</h2>
               <p>🎉 You are successfully registered!</p>
               <p>📅 23 February 2026, 7PM IST</p>`
      }).then(() => {
        console.log("📧 Email sent");
      }).catch(err => {
        console.log("⚠ Email failed:", err.message);
      });
    }

    // ===============================
    // WHATSAPP (BACKGROUND)
    // ===============================
    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = twilio(
        process.env.TWILIO_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('91')) cleanPhone = cleanPhone.substring(2);
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

      client.messages.create({
        from: 'whatsapp:+14155238886',
        to: `whatsapp:+${cleanPhone}`,
        body: `Hi ${name}! You're registered for the Crypto Webinar 🚀`
      }).then(() => {
        console.log("📱 WhatsApp sent");
      }).catch(err => {
        console.log("⚠ WhatsApp failed:", err.message);
      });
    }

  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// ===============================
// ADMIN API
// ===============================
app.get('/api/registrations', (req, res) => {
  res.json({
    total: registrations.length,
    registrations,
    recent: registrations.slice(-5)
  });
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
