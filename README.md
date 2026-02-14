# 🚀 Crypto Webinar Registration Platform

A professional full-stack webinar registration system built using **Node.js, Express, Nodemailer, and Twilio**.

Users can register for a live crypto awareness webinar and instantly receive:

✅ Email confirmation  
✅ WhatsApp confirmation  
✅ Secure registration storage  

🌐 **Live Website:**  
https://crypto-webinars.onrender.com

<img width="1920" height="1025" alt="image" src="https://github.com/user-attachments/assets/ebf0deee-a433-47cd-9e8b-633af00eb731" />

---

## 📌 Project Overview

This project is a real-world event registration system designed for conducting online crypto awareness webinars.  

Once a user registers:

- Their data is securely saved
- A Zoom link is sent via Email
- A WhatsApp confirmation message is delivered instantly
- The system runs efficiently in production

This project is deployed on **Render** and uses environment variables for security.

---

## ✨ Features

- ⚡ Fast form submission
- 📧 Email confirmation using Gmail SMTP
- 📱 WhatsApp confirmation using Twilio API
- 🔐 Secure environment variable handling
- 💾 JSON-based lightweight data storage
- 🌍 Deployed live on Render
- 📱 Mobile responsive frontend
- 🚀 Background email & WhatsApp processing (non-blocking)

---

## 🛠 Tech Stack

- Node.js
- Express.js
- Nodemailer
- Twilio WhatsApp API
- Body-Parser
- Render (Deployment)
- HTML, CSS, JavaScript

---

## 📂 Project Structure

```
crypto-webinar/
│
├── public/              # Frontend files
├── registrations.json   # Registration storage
├── app.js               # Main server file
├── package.json
└── README.md
```

---

## ⚙️ Local Installation

### 1️⃣ Clone Repository

```
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2️⃣ Install Dependencies

```
npm install
```

### 3️⃣ Create `.env` File

```
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

### 4️⃣ Run the Server

```
node app.js
```

Visit:
http://localhost:3000

---

## 📧 Gmail Setup (Important for Email to Work)

1. Enable 2-Step Verification in Gmail
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`
4. Make sure environment variables are added in Render dashboard

---

## 📱 Twilio WhatsApp Setup

1. Create Twilio Account
2. Activate WhatsApp Sandbox
3. Add your number to sandbox
4. Add SID and Auth Token in environment variables

---

## 🚀 Deployment (Render)

1. Push code to GitHub
2. Create a Web Service in Render
3. Connect your GitHub repository
4. Add Environment Variables
5. Deploy

---

## 📅 Webinar Details

📌 Topic: Crypto Awareness & Safe Investing  
📅 Date: 23 February 2026  
⏰ Time: 7:00 PM IST  
💻 Mode: Live Zoom Webinar  

Zoom link is sent via Email & WhatsApp after successful registration.

---

## 🔐 Security Measures

- Sensitive keys stored in environment variables
- Basic input sanitization
- String length limits
- Non-blocking background mail sending
- Safe file handling

---

## 🧠 Future Improvements

- Database integration (MongoDB)
- Admin dashboard
- Email queue system
- Payment gateway integration
- Automated reminder system
- SMS backup notifications

---

## 👨‍💻 Author

Prakash A  
Crypto Webinar Organizer  
Coimbatore, Tamil Nadu  

---

## 📜 License

This project is licensed under the MIT License.
