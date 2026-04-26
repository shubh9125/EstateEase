# 🏡 EstateEase – Smart Real Estate Platform

## 📌 Overview

**EstateEase** is a full-stack real estate web application designed to simplify property discovery, booking, and management.
It integrates **modern web technologies, geolocation services, and machine learning** to provide a smarter and safer property platform.

---

## 🚀 Key Features

### 🔍 Property Search & Listings

* Advanced filtering (city, type, price, etc.)
* Dynamic property cards with images and details

### 🗺️ Location Integration

* Integrated maps using Google Maps API
* View property locations visually
* Real-time geolocation support

### 👤 Authentication System

* Secure user registration & login
* Role-based access (Admin / User)

### 🛠️ Admin Dashboard

* Add / update / delete property listings
* Monitor platform activity
* View analytics

### 🤖 AI & Machine Learning (Anomaly Detection)

* Detects **fake or suspicious property listings**
* Uses ML models to identify:

  * Unrealistic pricing
  * Duplicate listings
  * Abnormal data patterns

---

## 🧠 Tech Stack

### 🌐 Frontend

* HTML, CSS, JavaScript
* Responsive UI design

### ⚙️ Backend

* Node.js + Express.js
* REST API architecture

### 🗄️ Database

* MongoDB

### 🤖 Machine Learning

* Python (Scikit-learn)
* Anomaly Detection Models

---

## 📂 Project Structure

```
EstateEase/
│
├── frontend/        # UI (HTML, CSS, JS)
├── backend/         # Node.js + Express APIs
├── ml-model/        # ML scripts (Anomaly Detection)
├── database/        # MongoDB schemas/config
├── assets/          # Images, icons
├── README.md
└── .gitignore
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/EstateEase.git
cd EstateEase
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

---

### 3️⃣ Frontend Setup

Open `index.html` in browser
OR use Live Server (VS Code)

---

## 🔑 Environment Variables

Create `.env` file in backend:

```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
GOOGLE_MAPS_API_KEY=your_api_key
```

---

## 🧪 How Anomaly Detection Works

1. Collect property dataset
2. Preprocess data (price, location, features)
3. Train ML model (e.g., Isolation Forest / Logistic Regression)
4. Predict:

   * Normal listing ✅
   * Suspicious listing ⚠️

This helps prevent fraud and improves trust on the platform.

---

## 🎯 Future Enhancements

* 📱 Mobile App version
* 🤖 AI Chatbot (Agentic AI)
* 💳 Online Payment Integration
* 📈 Advanced analytics dashboard

---

## 👨‍💻 Author

**Shubh Dwivedi**
B.Tech CSE (AI & DS) – Graphic Era University


## 📜 License

This project is for educational and academic use.

---
