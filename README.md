<div align="center">

# 🔗 Identity Reconciliation API

Backend service that links multiple email and phone records belonging to the same user and returns a unified contact identity.

![Node.js](https://img.shields.io/badge/Node.js-backend-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-API-black?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Render](https://img.shields.io/badge/Deployment-Render-purple?logo=render)

### 🌐 Base URL
```
https://bitespeed-identity-reconciliation-vf92.onrender.com
```

### 🔌 Identify Endpoint
```
POST /identify
```

### 🧪 Try it with Postman
```
POST https://bitespeed-identity-reconciliation-vf92.onrender.com/identify
```

</div>

---

## 📌 What This Project Does

In many systems, the same user may place orders using **different emails or phone numbers**.

Example:

| Email | Phone |
|------|------|
| a@gmail.com | 111 |
| b@gmail.com | 111 |
| a@gmail.com | 222 |

Even though the details differ, they belong to **the same person**.

This API identifies these relationships and **consolidates them into one identity**.

---

## 🔌 API Endpoint

```
POST /identify
```

Live Endpoint:

```
https://bitespeed-identity-reconciliation-vf92.onrender.com/identify
```

---

## 📤 Example Request

```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

---

## 📥 Example Response

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

---

## ⚙️ Tech Stack

- Node.js  
- Express.js  
- TypeScript  
- Render (Deployment)

---

## 🧠 Identity Reconciliation Logic

1️⃣ If no contact exists → create **primary contact**

2️⃣ If email or phone matches → create **secondary contact**

3️⃣ If two primary contacts connect →  
the **oldest stays primary**, the other becomes secondary

---

## 👩‍💻 Author

**Chandana T S**  
Computer Science Engineering Student  

GitHub:  
https://github.com/chandana-2203
