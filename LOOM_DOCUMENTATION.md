# Loom Documentation

Loom is a modern, full-stack social networking platform designed for people to connect, share their stories, and build meaningful relationships. Built with performance, security, and real-time interaction in mind, Loom offers a seamless experience for social networking and real-time communication.

---

## 🚀 Tech Stack

### Backend
- **Core**: Node.js & Express.js (v5+)
- **Database**: MongoDB (Mongoose ODM)
- **Caching**: Redis (ioredis) for high-performance feed and state management
- **Real-time**: Socket.io for instant messaging and live notifications
- **Authentication**: JWT (JSON Web Tokens) with secure cookie-based persistence
- **Security**: Helmet, Express Rate Limit, and Mongo Saniti    ze
- **Media**: Cloudinary integration for cloud-based image storage
- **Email**: Brevo for transactional emails and OTP delivery

### Frontend
- **Framework**: React 19 with Vite for ultra-fast development
- State Management: Redux Toolkit for global data synchronization
- **Styling**: Tailwind CSS & DaisyUI for a premium, responsive design
- **Routing**: React Router 7 for declarative navigation
- Icons: Lucide React for consistent, high-quality iconography
- **Communication**: Axios for robust API interaction

---

## ✨ Features & Functionalities

### 🛡️ Secure Authentication
- **Multi-step Signup**: Secure account creation with email-based OTP verification.
- **Resend OTP**: Smooth onboarding with OTP retry logic.
- **Password Hashing**: Industry-standard Bcrypt protection.
- **Session Security**: JWT-based logout and secure session termination.

### 👤 Profile & Portfolio
- **Dynamic Profiles**: Showcase interests, bios, and social activity.
- **Profile Completion**: Guided onboarding flow to build a complete identity.
- **Edit & Personalization**: Real-time profile updates including photo uploads.
- **Search & Discovery**: Find and explore people across the platform.

### 🤝 Networking Ecosystem
- **Connection System**: Send, accept, or decline connection requests.
- **Connections List**: Manage your social circle easily.
- **Request Feed**: Real-time management of incoming social opportunities.

### 📯 Content & Engagement
- **Multimedia Posts**: Share text-only thoughts or rich media posts.
- **Engagement Flow**: Like/dislike toggle system and interactive comments.
- **Tailored Feed**: A high-performance feed showing content from your connections.
- **Ownership Control**: Full CRUD capabilities over your own content with strict authorization.

### 💬 Real-time Communication
- **Instant Messaging**: Low-latency private chat system via Socket.io.
- **Live Notifications**: Get notified instantly on likes, new comments, or connection updates.
- **Live Status**: Real-time feedback for message delivery and user activity.

---

## 🏗️ Architecture & Security
- **Modular Design**: Clean separation of concerns with dedicated controllers and routes.
- **Folder Isolation**: Frontend pages organized into `auth`, `profile`, and global `pages` for maintainability.
- **Testing**: Robust backend testing suite using **Jest**, **Supertest**, and **MongoDB Memory Server** for isolated integration checks.
- **Performance**: Redis integration ensures lightning-fast data retrieval for frequently accessed feeds.
- **Scalability**: Optimized database schemas and middleware-driven request handling.

---

*Loom — Connect with the world.*
