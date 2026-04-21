# <img src="./src/assets/Icon.png" width="45" align="center" /> **LOOM** — *The Social Pulse* ⚡

<p align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js_5+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

---

### 🌊 **The Vibe**
**Loom** isn't just another social app; it’s a high-performance, real-time ecosystem built for the next gen of creators. We’re talking **glassmorphic UI**, **ultra-low latency chats**, and a **clean-as-hell** experience. Connect, share, and vibe in real-time.

---

## 🛠️ **The Tech Stack (The "Receipts")**

<div align="center">

| **Frontend** 🎨 | **Backend** ⚙️ | **Infrastructure** ☁️ |
| :--- | :--- | :--- |
| **React 19** (Vite-powered) | **Node.js & Express v5+** | **MongoDB** (Mongoose) |
| **Redux Toolkit** (State God) | **Redis** (Speed Demon) | **Cloudinary** (Media Hub) |
| **Tailwind CSS** + **DaisyUI** | **Socket.io** (Real-time) | **Brevo** (Email/OTP) |
| **Lucide Icons** | **JWT Auth** (Secure AF) | **Jest/Supertest** (QA) |

</div>

---

## ✨ **Main Hooks (Features)**

### 🛡️ **No Cap Security**
- **OTP Verification**: Secure email-based onboarding. No bots allowed.
- **JWT Persistence**: Secure `httpOnly` cookies. Your session, your rules.
- **Bcrypt Protection**: Industry-standard hashing. Password security is 10/10.

### 👤 **Profile Aesthetic**
- **Dynamic Portfolios**: Showcase your bio, age, and vibes.
- **Real-time Edits**: Update your profile pic via Cloudinary in a snap.
- **Discovery**: Search for your squad with a debounced, high-speed algorithm.

### 🤝 **The Networking Loop**
- **Connection System**: Swipe-style requests. `Interested`, `Accepted`, or `Ignored`.
- **Live Feed**: A tailor-made scroll of content from people you actually care about.
- **Optimistic Likes**: Double-tap and watch the count jump instantly. Speed is the priority.

### 💬 **Real-time Pulse**
- **DM System**: Instant messaging that actually feels instant.
- **Live Notifications**: Get that "New Connection" or "New Like" hit the second it happens.
- **Live Status**: See who's online and vibing in real-time.

---

## 🏗️ **Architecture & Ops**

> **"Clean code is the only way."**

- **Modular Controllers**: Logic is separated. Routes stay clean. Scalability is baked in.
- **Security Middleware**: 
    - `Helmet` for that extra shield.
    - `Express-Rate-Limit` to stop the spammers.
    - `Mongo-Sanitize` to keep the DB clean from NoSQL injections.
- **Redis Caching**: Frequently accessed feeds are stored in RAM. Zero lag, all gas.

---

## 🏗️ **Engineering Standards & Best Practices**

To ensure stability and maintainability, the DevTinder engineering team adheres to the following standards:

1. **Route Guard Parity**: Route redirection (like `/signup` to `/complete-profile` or `/`) must explicitly check user states (`isProfileCompleted`, verification status) to avoid deadlocks.
2. **Cookie Policy Unification**: All authentication cookies (Login, Logout, OTP verification) share a unified options object ensuring standard flags like `httpOnly`, `secure` (production), and `sameSite` are consistently applied across environments.
3. **Strict React Hooks Dependencies**: We enforce complete dependency arrays in `useEffect`. Async operations inside hooks are memoized via `useCallback` to prevent cascading renders and infinite loops.
4. **Functional State Updates**: Components use functional state updates (`setState(prev => ...)`) especially in effect-driven actions to avoid stale closures.
5. **Test Configuration Parity**: The backend test environment uses dedicated configuration (`config/test.json`) mirroring production setups and mocks external APIs like Mail services to ensure deterministic test runs.

---

## 📂 **Inside the Files**

<details>
<summary><b>📂 Backend Structure</b> (Expand for the sauce)</summary>

```text
├── config/             # DB, Redis, Cloudinary setup
├── controllers/        # The brains (Auth, Feed, Chat)
├── middlewares/        # The bouncers (Auth Guards, Sanitize)
├── models/             # Mongoose Schemas (User, Post, Connection)
├── routes/             # API Endpoints
└── utils/              # Socket.js, OTP Mailer, JWT Signers
```
</details>

<details>
<summary><b>📂 Frontend Structure</b> (Expand for the look)</summary>


```text
├── src/
│   ├── components/     # UI atoms (Post, Navbar, Sidebar, Toast)
│   ├── store/          # Redux Slices (User, Feed, Search)
│   ├── pages/          # Full-page views (Home, Profile, Auth)
│   └── utils/          # Constants, Validations, Socket.js
```
</details>


## 🚀 Getting Started (For the Devs)
### Clone the Repo: git clone ...

### Environment Setup: Pop these in your .env:
```
 MONGO_URI, REDIS_URL, JWT_SECRET, BREVO_API_KEY, CLOUDINARY_URL
```

### Install & Run:

```
# For the Backend ⚙️
npm install
npm start

# For the Frontend 🎨
cd client
npm install
npm run dev
```

<p align="center">
<b>Built with ❤️ by the Loom Engineering Squad</b>


<i>Loom — Connect with the world.</i>
</p>

<p align="center">
<img src="https://www.google.com/search?q=https://forthebadge.com/images/featured/featured-built-with-love.svg" height="25" />
<img src="https://www.google.com/search?q=https://forthebadge.com/images/featured/featured-runs-with-butter.svg" height="25" />
</p>



```
set DEBUG=development