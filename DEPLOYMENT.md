# PrintSmart Deployment Guide

This document provides step-by-step instructions for deploying the **PrintSmart** smart printing platform. It is formatted to be fully readable and actionable for both human developers and AI coding/deployment agents.

---

## Architecture Overview

PrintSmart is a decoupled full-stack application:
*   **Frontend**: Next.js 14 (React 18, Tailwind CSS, Lucide icons).
*   **Backend**: Node.js + Express + Prisma (ORM) + PostgreSQL.
*   **File Storage**: AWS S3 (with fallback to local container/server volume storage).
*   **AI Integration**: Groq SDK (prefills configuration from natural language).
*   **Data Feeds**: Automagic Excel-to-CSV extraction of "Did You Know" and "Astrology" content on startup.

```mermaid
graph TD
    User([Customer/Shopkeeper]) -->|HTTPS| FE[Next.js Frontend]
    FE -->|API Requests| BE[Express Backend]
    BE -->|Prisma Client| DB[(PostgreSQL Database)]
    BE -->|Presigned URLs / Uploads| S3[(AWS S3 Bucket / Local Storage)]
    FE -->|Config Generation| Groq[Groq AI SDK]
    BE -->|Startup Trigger| Excel[Excel to CSV Parser]
```

---

## Infrastructure Requirements & Services

Before deploying the codebase, provision the following external services:

1.  **PostgreSQL Database**:
    *   Services: Supabase, Neon, AWS RDS, or Render PostgreSQL.
    *   Connection Pooling: Make sure you use a transaction/session connection URL (e.g., Supabase Session Pooler or direct URL) for Prisma migrations.
2.  **AWS S3 (Optional - falls back to local server storage if omitted)**:
    *   Create an S3 Bucket.
    *   Generate IAM credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) with `PutObject`, `GetObject`, and `DeleteObject` permissions for the bucket.
    *   **Crucial**: Set the CORS configuration on your S3 bucket to allow uploads from your frontend domain (see S3 CORS section below).
3.  **Groq API Key**:
    *   Required by the frontend to process natural language input on the Shopkeeper AI page (`/shopkeeper/printsmart-ai`).
4.  **Google OAuth Client ID (Optional)**:
    *   Required if configuring Google Sign-In for shopkeepers.

---

## S3 Bucket CORS Configuration

If using AWS S3 for document storage, paste the following JSON into your AWS S3 Bucket CORS configuration tab (change `AllowedOrigins` to match your actual production frontend URL):

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://your-frontend-domain.vercel.app"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

---

## Environment Variables Reference

Create configurations on your hosting platforms matching the parameters below.

### 1. Backend Environment Variables (`backend/.env`)

| Variable | Description | Example / Default | Required? |
| :--- | :--- | :--- | :--- |
| `PORT` | Port for the Express server to listen on. | `5000` | Yes |
| `NODE_ENV` | Mode of operation. | `production` | Yes |
| `DATABASE_URL` | PostgreSQL connection string. | `postgresql://user:pass@host:5432/db` | Yes |
| `JWT_SECRET` | Secret key for signing Auth tokens. | *generate a secure random string* | Yes |
| `FRONTEND_URL` | Root URL of the frontend for CORS policy. | `https://printsmart.vercel.app` | Yes |
| `AWS_ACCESS_KEY_ID` | AWS Credentials for S3 uploads. | `AKIAIOSFODNN7EXAMPLE` | No (Fallback to local) |
| `AWS_SECRET_ACCESS_KEY`| AWS Credentials for S3 uploads. | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | No (Fallback to local) |
| `AWS_REGION` | AWS S3 Bucket location. | `us-east-1` | No (Fallback to local) |
| `AWS_S3_BUCKET_NAME` | S3 bucket name. | `printsmart-files` | No (Fallback to local) |
| `UPLOAD_DIR` | Local uploads backup directory. | `./uploads` | Yes (if no S3) |

### 2. Frontend Environment Variables (`frontend/.env.local`)

> [!IMPORTANT]
> Next.js embeds variables prefixed with `NEXT_PUBLIC_` at **build time**. They must be present when running the build script (`npm run build`).

| Variable | Description | Example / Default | Required? |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL of your deployed Backend API. | `https://printsmart-backend.onrender.com` | Yes |
| `NEXT_PUBLIC_APP_NAME` | Brand title of the application. | `PrintSmart` | Yes |
| `NEXT_PUBLIC_MAX_FILE_SIZE` | Maximum file size in bytes (50MB). | `52428800` | Yes |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`| Google Client ID for OAuth login. | `your-google-oauth-client-id` | No |
| `GROQ_API_KEY` | API Key for natural language AI processing. | `gsk_example_secret_key` | Yes (for AI features) |

---

## Deployment Option A: Cloud Platforms (Recommended / Easiest)

Deploying the services separately to managed platforms like **Render / Railway (Backend)** and **Vercel / Netlify (Frontend)**.

### Step 1: Deploy Backend (e.g., Render)
1. Link your git repository to Render.
2. Select **Web Service**.
3. Set environment variables on Render dashboard matching the `backend/.env` reference above.
4. Set the following build and start settings:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install && npx prisma generate`
   * **Start Command**: `node server.js`
5. *Note*: The backend server automatically runs `npx prisma db push` programmatically on start to synchronize schemas. It also seeds a default shopkeeper account if missing.

### Step 2: Deploy Frontend (e.g., Vercel)
1. Link your git repository to Vercel.
2. Select the **frontend** directory as the root folder.
3. Configure the environment variables (`NEXT_PUBLIC_API_URL`, etc.) in the Vercel dashboard. Make sure `NEXT_PUBLIC_API_URL` matches your deployed backend URL.
4. Vercel automatically detects Next.js settings:
   * **Framework Preset**: `Next.js`
   * **Build Command**: `npm run build`
   * **Output Directory**: `.next`
5. Click **Deploy**.

---

## Deployment Option B: Unified Virtual Private Server (VPS / VM)

Deploying both frontend and backend on a clean Ubuntu VPS (using Nginx, PM2, and SSL).

### Step 1: Server Setup
SSH into the server and install prerequisites (Node.js 18+, Git, Nginx):
```bash
# Update server packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify versions
node -v
npm -v

# Install PM2 globally
sudo npm install pm2 -g
```

### Step 2: Code Deployment & Building
1. Clone the repository and configure environments:
   ```bash
   git clone <your-repo-url> /var/www/printsmart
   cd /var/www/printsmart
   ```
2. Create and configure environment files:
   ```bash
   # Backend Config
   cd backend
   cp .env.example .env
   nano .env # Paste your actual PostgreSQL connection string, secret, and frontend domains
   
   # Frontend Config
   cd ../frontend
   nano .env.local # Enter API URL, app name, and keys
   ```
3. Run builds:
   ```bash
   # Build Backend
   cd ../backend
   npm install
   npx prisma generate
   
   # Build Frontend
   cd ../frontend
   npm install
   npm run build
   ```

### Step 3: Run Services using PM2
```bash
# Start backend
cd /var/www/printsmart/backend
pm2 start server.js --name "printsmart-backend"

# Start frontend
cd /var/www/printsmart/frontend
pm2 start npm --name "printsmart-frontend" -- run start

# Save PM2 process list and configure to restart on server reboot
pm2 save
pm2 startup
```

### Step 4: Configure Nginx Reverse Proxy
Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/printsmart
```
Add the following content (replacing domains with your own):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Activate and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/printsmart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
Obtain SSL certificates using Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## Deployment Option C: Docker Compose Deployment

If Docker and Docker Compose are installed on your server, deploy the application using the preconfigured config files in the project root.

1.  Clone the project to the server.
2.  Open the root `docker-compose.yml` file and update the environment variables for `backend` and `frontend`.
3.  Deploy using Compose:
    ```bash
    # Build and start services in the background
    docker compose up --build -d
    ```
4.  View logs to monitor startup progress:
    ```bash
    docker compose logs -f backend
    ```

---

## Verification & Health Check Checklist

Execute these verification checks immediately after deployment to ensure components are working:

### 1. Backend Health Endpoint Check
Run this curl request or open it in a browser:
```bash
curl -s https://api.yourdomain.com/api/health
```
**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-06-14T21:05:00.000Z",
  "storage": "s3" 
}
```
*(Note: Storage field will display `"local"` if AWS S3 settings were not provided, which is safe for single-node VM deployments).*

### 2. Verify Database Migrations & Default Shopkeeper
Check the logs of the backend during boot. The application outputs:
*   `Running prisma db push programmatically on startup...`
*   `Prisma db push completed successfully.`
*   `Successfully seeded default shopkeeper.` (Checks db connection and initializes test accounts).

### 3. Verify Excel to CSV Parsing on Startup
During startup, the server looks for `backend/Card/Do You Know,Astrology.xlsx` and converts it:
*   `Successfully extracted did_you_know.csv from Excel sheet: ...`
*   `Successfully extracted astrology.csv from Excel sheet: ...`
If you notice error messages, verify the Excel spreadsheet matches the names (`Do You Know` / `Astrology`) and is placed in `/backend/Card/`.

### 4. S3 Diagnostic Hook
To verify bucket reachability, call the debug endpoint (restricted to administrators, or access it locally):
```bash
curl -s http://localhost:5000/debug/s3
```
This tests:
1. Connecting to AWS S3.
2. Writing a temporary validation file (`debug/s3-connection-check.txt`) to the target bucket.
If there are errors, they will be output in detail under `errorDetails` to help configure the correct IAM permissions and CORS policy.

---

## Troubleshooting Guide

### ⚠️ CORS Errors on Frontend Console
*   **Cause**: The backend's `FRONTEND_URL` environment variable doesn't match the URL of the Next.js frontend, or backend CORS settings block it.
*   **Resolution**: Set `FRONTEND_URL` to match exactly, including subdomains (no trailing slash). E.g. `FRONTEND_URL=https://printsmart.vercel.app`.

### ⚠️ Prisma "Query Engine Binary Not Found" in Docker/Cloud
*   **Cause**: Node modules were built on a different OS type (e.g., Windows/macOS) and copied into the container without rebuilding the Prisma client binary.
*   **Resolution**: Always run `npx prisma generate` inside the deployment build process or Docker entrypoint to generate the correct client binary matching the host OS architecture (e.g. `debian-openssl-1.1.x` or `linux-musl`).

### ⚠️ File Upload Failures
*   **Cause**: The local directory `./uploads` doesn't have write permissions, or the S3 Credentials/Bucket name are wrong.
*   **Resolution**:
    *   For local uploads, check directory ownership: `chmod 755 backend/uploads`.
    *   For S3 uploads, query the `/debug/s3` API endpoint to see the precise S3 connection logs.
