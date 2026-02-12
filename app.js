const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

const app = express();

// ===============================
// STATIC + BODY PARSER
// ===============================
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ===============================
// REGISTRATION FILE SETUP
// ===============================
const registrationsFile = path.join(__dirname, 'registrations.json');

if (!fs.existsSync(registrationsFile)) {
  fs.writeFileSync(registrationsFile, '[]');
}

let registrations = [];
try {
  const data = fs.readFileSync(registrationsFile, 'utf8');
  registrations = JSON.parse(data);
} catch (err) {
  registrations = [];
}

// ===============================
// REGISTRATION ROUTE
// ===============================
app.post('/register', async (req, res) => {

  let { name, email, phone, city, experience, goal, question } = req.body;

  try {

    name = name || "Anonymous";
    email = email || "";
    phone = phone || "";

    const registration = {
      name,
      email,
      phone,
      city,
      experience,
      goal,
      question,
      registeredAt: new Date().toISOString()
    };

    registrations.push(registration);

    await fs.promises.writeFile(
      registrationsFile,
      JSON.stringify(registrations, null, 2)
    );

    res.json({ success: true });

   // ================= EMAIL =================
if (email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.sendMail({
    from: `"Crypto Awareness Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Webinar Registration Confirmed – Crypto Awareness Program",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; line-height: 1.6;">
        
        <h2 style="color:#0ea5e9;">Registration Confirmed ✅</h2>
        
        <p>Dear ${name},</p>
        
        <p>Thank you for registering for our upcoming <strong>Crypto Awareness Program</strong>. 
        We are excited to have you join us.</p>
        
        <div style="background:#f1f5f9; padding:15px; border-radius:8px; margin:20px 0;">
          <p><strong>📅 Date:</strong> 23 February 2026</p>
          <p><strong>⏰ Time:</strong> 7:00 PM IST</p>
          <p><strong>💻 Platform:</strong> Zoom Live Webinar</p>
        </div>

        <p><strong>🔗 Zoom Meeting Link:</strong></p>
        <p>
          <a href="https://us05web.zoom.us/j/83989603104?pwd=JMPuVsHx4ZigHBeaLNaxqKYuyXV8MN.1" 
             style="display:inline-block; padding:10px 15px; background:#0ea5e9; color:#ffffff; text-decoration:none; border-radius:6px;">
             Join Webinar
          </a>
        </p>

        <p>Please join 5 minutes before the session begins to avoid any technical delays.</p>

        <hr style="margin:25px 0;">

        <p style="font-size:14px; color:#64748b;">
          If you have any questions, feel free to reply to this email.<br>
          We look forward to seeing you at the webinar.
        </p>

        <p style="margin-top:20px;">
          Best Regards,<br>
          <strong>Crypto Awareness Team</strong><br>
          web3withpassiveincome@gmail.com
        </p>

      </div>
    `
  })
  .then(() => console.log("📧 Professional Email sent"))
  .catch(err => console.log("Email error:", err.message));
}

// ================= WHATSAPP =================
if (phone && process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {

  const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  let cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  client.messages.create({
    from: 'whatsapp:+14155238886',
    to: `whatsapp:+${cleanPhone}`,
    body: 
`Hello ${name},

Your registration for the Crypto Awareness Program has been successfully confirmed. ✅

📅 Date: 23 February 2026  
⏰ Time: 7:00 PM IST  
💻 Platform: Zoom Live Webinar  

🔗 Join Here:
https://us05web.zoom.us/j/83989603104?pwd=JMPuVsHx4ZigHBeaLNaxqKYuyXV8MN.1

Please join 5 minutes early.

We look forward to your participation.

– Crypto Awareness Team`
  })
  .then(() => console.log("📱 Professional WhatsApp sent"))
  .catch(err => console.log("WhatsApp error:", err.message));
}

// ===============================
// ADMIN ROUTE
// ===============================
app.get('/api/registrations', (req, res) => {
  res.json(registrations);
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
