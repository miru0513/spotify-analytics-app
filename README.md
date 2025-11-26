# spotify-analytics-app

<img width="2157" height="1089" alt="image" src="https://github.com/user-attachments/assets/239ab117-b644-434a-8514-089e272e3b38" />
<img width="1758" height="1008" alt="image" src="https://github.com/user-attachments/assets/a6f532da-d7d8-4e75-b9bc-c4b874748e2a" />



# 🎧 Spotify Listening Analytics Dashboard  
*A full-stack app that analyzes your Spotify listening behavior through clean, interactive charts & insights.*

---

## 🌟 Overview

This project connects to the Spotify Web API, downloads your listening history, saves it locally, and presents beautiful analytics in a modern dashboard UI.

It demonstrates:

- 🟢 Full-stack development (FastAPI + React)
- 🔐 OAuth2 authentication with Spotify
- 📊 Data analytics and chart visualizations
- 🎨 TailwindCSS UI design
- 🗄 SQLAlchemy ORM + SQLite
- 🌐 REST API architecture

Perfect for portfolios, recruiters, and real-world development practice.

---

# 🛠 Tech Stack

### **Frontend**
- React (Vite)
- TailwindCSS
- Axios
- Recharts

### **Backend**
- FastAPI
- SQLAlchemy
- OAuth2 (Spotify)
- SQLite

---

# ⚙️ Local Setup (Developer Mode)

> ⚠️ This version requires **your own Spotify Developer App** in order to log in locally.

To create one:
1. Go to https://developer.spotify.com/dashboard
2. Create an app  
3. Add redirect URI:  
   `http://127.0.0.1:8000/spotify/callback`
4. Copy your:
   - CLIENT_ID  
   - CLIENT_SECRET

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/spotify-analytics-app.git
cd spotify-analytics-app
```

---

## 2️⃣ Backend Setup

Enter backend folder:

```bash
cd backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file (NOT included in GitHub):

```env
DATABASE_URL=sqlite:///./spotify.db
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/spotify/callback
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
uvicorn main:app --reload
```

Backend runs at:  
➡ `http://127.0.0.1:8000`

---

## 3️⃣ Frontend Setup

Enter the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_BACKEND_URL=http://127.0.0.1:8000
```

Run the frontend:

```bash
npm run dev
```

Frontend runs at:  
➡ `http://localhost:5173`

# 📊 Features

### ✔ Listening Insights
- Total tracks played
- Most active listening day
- Longest session
- Hourly listening heatmap
- Genre distribution
- Artist distribution

### ✔ Charts
- Daily trend graph
- Top genres bar chart
- Top artists bar chart
- Session list
- Time-of-day heatmap

### ✔ UI Enhancements
- Gradient background
- Spotify-themed navbar
- Live “Re-Sync” button
- “Last Synced” timestamp
- Summary statistics block


# 🚀 Deployment (Optional Future Feature)

Once deployed:

- Users will NOT need their own Spotify developer app.
- You will host your own CLIENT_ID / CLIENT_SECRET on the backend server.
- Example deployment stack:
  - Backend → Render / Railway / Fly.io
  - Frontend → Vercel / Netlify

If you want deployment help, just ask — I can generate the exact steps.


MIT License – free to use and modify.




