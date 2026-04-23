# 🚀 Vercel Deployment Guide for WheelShare

## 📋 Current Setup

- **Frontend Vercel URL**: https://wheel-share-z5wy.vercel.app
- **Backend**: Needs to be deployed (Options below)
- **Database**: MongoDB Atlas (already configured)

## ✅ What's Been Configured

1. ✅ Created `.env.production` for frontend with AWS backend URL
2. ✅ Updated backend CORS to allow Vercel URL
3. ✅ Vercel configuration file exists (`vercel.json`)

## 🎯 Deployment Options

### Option 1: Frontend on Vercel + Backend on AWS (Current Setup)

**Frontend** → Vercel  
**Backend** → AWS EKS at `http://100.48.94.34:30239/api`

#### Steps:

1. **Deploy Backend to AWS** (if not already deployed):
   ```bash
   # On your AWS machine with kubectl
   cd k8s
   kubectl apply -f backend-deployment.yaml
   kubectl rollout restart deployment/wheelshare-server
   ```

2. **Deploy Frontend to Vercel**:
   ```bash
   cd wheelshare-client
   
   # Install Vercel CLI (if not installed)
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard**:
   - Go to: https://vercel.com/your-project/settings/environment-variables
   - Add: `VITE_API_URL` = `http://100.48.94.34:30239/api`

### Option 2: Both on Vercel (Recommended for Simplicity)

Deploy both frontend and backend to Vercel.

#### Backend Deployment to Vercel:

1. **Create `vercel.json` for backend**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "index.js"
       }
     ]
   }
   ```

2. **Deploy backend**:
   ```bash
   cd wheelshare-server
   vercel --prod
   ```

3. **Get backend URL** (e.g., `https://wheelshare-server.vercel.app`)

4. **Update frontend `.env.production`**:
   ```
   VITE_API_URL=https://wheelshare-server.vercel.app/api
   ```

5. **Redeploy frontend**:
   ```bash
   cd wheelshare-client
   vercel --prod
   ```

### Option 3: Frontend on Vercel + Backend on Render

**Frontend** → Vercel  
**Backend** → Render (Free tier available)

#### Backend on Render:

1. Go to https://render.com
2. Create new Web Service
3. Connect your GitHub repo
4. Select `wheelshare-server` directory
5. Set environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: `ws_prod_jwt_secret_2026_a8f3k9m2p5q7r1t4v6x8z0b3d5f7h9j2`
   - `ADMIN_SECRET`: `ws_admin_bootstrap_secret_2026_k3m5p7q9r1t3v5x7z9b1d3f5h7j9l1`
   - `ALLOWED_ORIGINS`: `https://wheel-share-z5wy.vercel.app`
   - `NODE_ENV`: `production`

6. Deploy and get URL (e.g., `https://wheelshare-backend.onrender.com`)

7. Update frontend `.env.production`:
   ```
   VITE_API_URL=https://wheelshare-backend.onrender.com/api
   ```

8. Redeploy frontend to Vercel

## 🔧 Current Configuration Files

### Frontend `.env.production` (Created)
```
VITE_API_URL=http://100.48.94.34:30239/api
```

### Backend `.env` (Updated)
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5173,https://wheel-share-z5wy.vercel.app,http://100.48.94.34:30238
```

## 📝 Vercel Environment Variables

Set these in Vercel Dashboard for your frontend project:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `http://100.48.94.34:30239/api` (or your backend URL) |

## 🚀 Quick Deploy to Vercel

### Frontend Only (Using AWS Backend):

```bash
cd "RentIt 2/wheelshare-client"

# Login to Vercel (first time only)
vercel login

# Deploy to production
vercel --prod

# Or link to existing project
vercel link
vercel --prod
```

### Set Environment Variable via CLI:

```bash
vercel env add VITE_API_URL production
# Enter: http://100.48.94.34:30239/api
```

## ✅ Verification Steps

After deployment:

1. **Check frontend**: https://wheel-share-z5wy.vercel.app
2. **Open browser console** (F12)
3. **Try to signup/login**
4. **Check Network tab** - API calls should go to your backend URL
5. **No CORS errors** should appear

## 🐛 Troubleshooting

### CORS Errors:

Make sure backend `ALLOWED_ORIGINS` includes your Vercel URL:
```
ALLOWED_ORIGINS=https://wheel-share-z5wy.vercel.app
```

### API calls going to wrong URL:

1. Check Vercel environment variables
2. Rebuild and redeploy: `vercel --prod --force`

### Backend not accessible:

- If using AWS: Ensure backend service is running
- If using Render: Check Render dashboard for errors
- If using Vercel: Check Vercel function logs

## 📊 Recommended Setup

For production, I recommend:

1. **Frontend**: Vercel ✅ (Already set up)
2. **Backend**: Render or Railway (Free tier, easier than AWS)
3. **Database**: MongoDB Atlas ✅ (Already configured)

This gives you:
- ✅ Free hosting
- ✅ Automatic deployments
- ✅ HTTPS by default
- ✅ Easy environment variable management
- ✅ No server management

## 🎯 Next Steps

Choose one of the options above and follow the steps. The easiest path:

1. Deploy backend to Render (5 minutes)
2. Update frontend `.env.production` with Render URL
3. Redeploy frontend to Vercel
4. Done! 🎉

Let me know which option you prefer and I can help with the specific steps!
