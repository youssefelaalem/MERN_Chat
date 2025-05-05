# MERN Chat App 💬

**Thrilled to finally launch my latest project — a real-time MERN Chat App built with a strong focus on performance, scalability, and user experience.**

---

## 🚀 Tech Stack

### 🖥 Frontend (Vite + React):
- ⚡ **Vite + ReactJS** for lightning-fast UI
- 🔁 **Axios** for seamless API communication
- 🔐 **Dotenv** for environment config
- ⚙️ **Lodash (debounce)** to reduce API calls detecting user presence
- ✅ **Formik & Yup** for robust form validation
- 🖼 **React Lightbox** for image previews in chat

### 🔧 Backend (Express + WebSocket):
- 🚀 **Express** + `express-async-handler` for clean API logic
- 🔒 **JWT** for secure authentication
- ⚙️ **Lodash (throttle)** for real-time notification optimization
- 🧠 **WebSocket Server** for real-time messaging
- ✉️ **Nodemailer** for reset code emails
- 🗂 **MongoDB** for persistence
- 🔑 **Bcrypt** for password hashing
- 🛡 **Cookie-parser & CORS** for security

### ☁️ Storage:
- **Supabase Storage** for all file types

---

## 🛠 Getting Started

### 🔽 Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- Supabase account (for file storage)
- Railway or similar service (if you want to deploy backend)

---

### 🧩 Installation

#### 🔹 Clone the Repo:
```bash
git clone https://github.com/youssefelaalem/MERN_Chat.git
cd MERN_Chat
🔹 Setup Frontend:
bash
Copy
Edit
cd client
npm install
Create a .env file inside client/:
Start the frontend:
bash
Copy
Edit
npm run dev
🔹 Setup Backend:
bash
Copy
Edit
cd ../server
npm install
npm run dev
