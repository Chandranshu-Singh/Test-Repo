# 🚀 Deployment Guide for SkillShare Backend

## 📋 Prerequisites
- GitHub repository with your code
- MongoDB database (local or cloud)
- Environment variables configured

## 🌐 **Option 1: Render (Recommended for Beginners)**

### Step 1: Sign Up
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Click "New +" → "Web Service"

### Step 2: Connect Repository
1. Connect your GitHub repository
2. Select the repository
3. Choose the branch (usually `main`)

### Step 3: Configure Service
- **Name**: `skillshare-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

### Step 4: Set Environment Variables
In Render dashboard, add these environment variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillshare
JWT_SECRET=your-super-secret-jwt-key-here
PORT=10000
```

### Step 5: Deploy
Click "Create Web Service" and wait for deployment.

## 🚂 **Option 2: Railway**

### Step 1: Sign Up
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"

### Step 2: Configure
- Select your repository
- Set environment variables
- Deploy automatically

## ☁️ **Option 3: MongoDB Atlas (Database)**

### Step 1: Create Cluster
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster (free tier)

### Step 2: Get Connection String
1. Click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password

## 🔧 **Environment Variables Setup**

Create a `.env` file in your backend folder:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillshare
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

## 📱 **Update Frontend API URL**

After deploying, update your frontend to use the new backend URL:

In `script.js`, change:
```javascript
const API_BASE_URL = 'https://your-backend-url.onrender.com';
```

## 🚀 **Deployment Commands**

```bash
# Local development
cd backend
npm install
npm run dev

# Production
cd backend
npm install
npm start
```

## 📊 **Monitoring Your Deployment**

- **Render**: Check dashboard for logs and status
- **Railway**: View deployment logs in real-time
- **MongoDB Atlas**: Monitor database performance

## 💰 **Cost Estimates**

- **Render**: Free tier (750 hours/month)
- **Railway**: $5/month credit (usually sufficient)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Total**: $0-5/month to start

## 🆘 **Troubleshooting**

### Common Issues:
1. **Build fails**: Check if all dependencies are in package.json
2. **Environment variables**: Ensure all required vars are set
3. **MongoDB connection**: Verify connection string and network access
4. **Port conflicts**: Use PORT environment variable

### Support:
- Render: Excellent documentation and support
- Railway: Good community support
- MongoDB Atlas: Comprehensive guides and support
