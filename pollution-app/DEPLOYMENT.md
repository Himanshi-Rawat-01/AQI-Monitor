# Deployment Guide: Vercel + Render

This guide explains how to deploy your full-stack Pollution App using a high-performance "Split Deployment" strategy.

## Step 1: Deploy the Backend (Render)
Because your backend uses heavy ML libraries (`scikit-learn`, `matplotlib`), it should be hosted on a dedicated Python service.

1.  Create an account on [Render.com](https://render.com).
2.  Create a **New Web Service**.
3.  Connect your GitHub repository.
4.  Set the **Root Directory** to `pollution-app/backend`.
5.  Set the **Environment** to `Python 3`.
6.  Set the **Build Command**: `pip install -r requirements.txt`
7.  Set the **Start Command**: `gunicorn app:app`
8.  Add your **Environment Variables** (Copy them from your `.env` file):
    *   `MONGO_URI`
    *   `OPENWEATHER_API_KEY`
    *   `JWT_SECRET_KEY`
9.  Once deployed, copy your service URL (e.g., `https://pollution-app-backend.onrender.com`).

---

## Step 2: Deploy the Frontend (Vercel)
Vercel is optimized for React/Vite apps.

1.  Create an account on [Vercel.com](https://vercel.com).
2.  Click **Add New** > **Project**.
3.  Import your GitHub repository.
4.  Configure the **Project Settings**:
    *   **Project Name:** `pollution-app-frontend`
    *   **Framework Preset:** `Vite`
    *   **Root Directory:** `pollution-app/react-app`
5.  Add the following **Environment Variable**:
    *   **Key:** `VITE_API_URL`
    *   **Value:** Paste your Render Backend URL (from Step 1).
6.  Click **Deploy**.

---

## How it Works
*   **API Calls:** Your React app now uses the `VITE_API_URL` to send data to Render.
*   **Dashboard Redirect:** When you click "Start Monitoring", the app will redirect you to the Render URL to view the legacy HTML dashboard.
*   **Routing:** The `vercel.json` I created handles internal React routing to prevent 404 errors on page refresh.

Your project is now ready for world-class production hosting!
