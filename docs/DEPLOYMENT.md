# SmartComplAI Deployment Guide

This document provides step-by-step instructions for deploying the SmartComplAI platform using the codebase hosted at:

📦 **GitHub Repository:** [https://github.com/LlamaLogic/ecsd_platform](https://github.com/LlamaLogic/ecsd_platform)

The SmartComplAI MVP includes:

- Web frontend (React or similar)
- Backend API (Node.js + Prisma + MongoDB)
- MongoDB Atlas database
- Integrations:
  - **Postmark** – for transactional emails
  - **OpenAI API** – for AI chat assistant
- Mobile apps (iOS and Android, previously published)

---

## 1. Prerequisites

Ensure the following before deployment:

- A server or VM with:
  - Ubuntu 22.04+  
  - 2+ vCPUs, 4+ GB RAM
  - 20+ GB free storage
- Docker and Docker Compose installed *(recommended deployment method)*
- Node.js (v18+) and npm/yarn *(if deploying manually)*
- Git installed
- Registered domain name (for production)
- ECS-owned accounts for:
  - **MongoDB Atlas**
  - **Postmark**
  - **OpenAI**

---

## 2. Clone the Repository

```bash
git clone https://github.com/LlamaLogic/ecsd_platform.git
cd ecsd_platform
```

---

## 3. Configure Environment Variables

Copy the example file and update with ECS credentials:

```bash
cp .env.example .env
```

Fill in the following values:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/db
POSTMARK_API_KEY=your-postmark-api-key
OPENAI_API_KEY=your-openai-api-key
JWT_SECRET=your-jwt-secret
PORT=3000
```

---

## 4. Deploy with Docker Compose (Recommended)

```bash
docker-compose up -d --build
```

> Make sure your domain points to your server and the firewall allows ports 80 and 443.

---

## 5. Manual Deployment (Optional)

### Backend Setup

```bash
cd backend
npm install
npm run build
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run build
serve -s build  # Or configure Nginx to serve the `build/` directory
```

---

## 6. Database Initialization

Create a MongoDB Atlas cluster and import the provided sample data:

```bash
mongorestore --uri="<your-mongodb-uri>" ./data_dump/
```

Alternatively, use the in-app admin panel to create projects and users from scratch.

---

## 7. SSL and Reverse Proxy (Production)

Install Nginx and Certbot:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

Set up your domain and SSL certificate:

```bash
sudo certbot --nginx -d yourdomain.com
```

Use Nginx to proxy requests to your app running on port 3000 or 8080.

---

## 8. Mobile App Redeployment

The mobile apps were previously published to the App Store and Google Play. To re-deploy:

1. Update environment settings / API endpoint in the app
2. Build using:
   - **Xcode** for iOS
   - **Android Studio** for Android
3. Publish using ECS-owned developer accounts

Contact the original developer or refer to the mobile README for platform-specific steps.

---

## 9. Troubleshooting

- Check logs using:
  ```bash
  docker logs <container-name>
  ```
- Verify your `.env` file is complete and contains valid credentials
- Confirm MongoDB IP whitelist settings in Atlas
- Check Nginx and SSL certificate configuration

---

## 10. Support

For help deploying or configuring the system, refer to:

- The `README.md` and `docs/` directory
- GitHub Issues for tracking future enhancements or bugs
- Contact the development team for retained support arrangements

---
