# PrintSmart - QUICK START GUIDE

## Overview
PrintSmart is a modern smart printing platform with complete frontend-backend integration using:
- **Frontend:** Next.js 14 + React 18 + Tailwind CSS
- **Backend:** Node.js + Express + Prisma + PostgreSQL
- **File Storage:** AWS S3 (with local fallback)
- **QR/PDF Generation:** QRCode + PDFKit libraries

---

## Installation & Setup

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your PostgreSQL URL and JWT secret

# Run database migrations
npm run prisma:migrate dev

# Start backend server
npm run dev
# Backend runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies  
npm install

# Setup environment variables
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=PrintSmart
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
EOF

# Start frontend dev server
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Access the Application
- **Customer Entry:** http://localhost:3000
- **Shopkeeper:** http://localhost:3000/shopkeeper/login
- **Admin:** Click logo 5 times on homepage to access /admin
- **API Health Check:** http://localhost:5000/api/health

---

## Key Features Implemented

### ✅ Global Features
- **Hidden Admin Access:** Click the Printsmart logo 5 times on homepage
- **Floating Feedback & Help:** On all customer pages (links to support)
- **Back Button:** Navigation on all pages

### ✅ Customer Workflow
1. **Home** → Click "Take a Print"
2. **QR Scan/Shop Selection** → Scan shopkeeper QR or enter shop ID
3. **Language & Details** → Auto-detect language, enter name/phone/email
4. **Upload Files** → Drag-drop multiple files with rename capability
5. **Configuration** → Set print type, copies, paper size, quality, orientation
6. **Review** → Confirm shopkeeper details and settings
7. **Order Confirmation** → Get custom order ID (0526PBW/C01 format)
8. **Track Order** → View estimated time, track status
9. **My Orders** → Download invoices, delete pending orders

### ✅ Backend APIs
- **User Management:** Create user with language preference
- **Shopkeeper Management:** Get shopkeeper by slug/ID, QR code display
- **Feedback System:** Submit, retrieve, manage support tickets
- **Statistics:** Daily/weekly/monthly analytics by shopkeeper
- **QR Code:** Generate unique QR codes for each shopkeeper
- **Invoices:** Auto-generate professional PDF invoices

### 🎨 Database Schema
Complete normalized schema with:
- User (language, phone, email)
- Shopkeeper (QR code, statistics, profile)
- Order (custom ID, estimated time, status)
- OrderFile (thumbnails, renamed files)
- PrintConfiguration (all print settings)
- Invoice (PDF URL, invoice number)
- Feedback (support tickets)
- ShopkeeperStatistics (daily/weekly/monthly metrics)
- Queue (order position and status)

---

## File Structure

```
PrintSmart/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma (✅ COMPLETE)
│   ├── services/
│   │   ├── qrcode.service.js (✅ COMPLETE)
│   │   ├── invoice.service.js (✅ COMPLETE)
│   │   ├── order.service.js (✅ COMPLETE)
│   │   └── storage.service.js (✅ EXISTS)
│   ├── controllers/
│   │   ├── feedback.controller.js (✅ COMPLETE)
│   │   ├── statistics.controller.js (✅ COMPLETE)
│   │   └── auth.controller.js (✅ EXISTS)
│   ├── routes/
│   │   ├── feedback.routes.js (✅ COMPLETE)
│   │   ├── statistics.routes.js (✅ COMPLETE)
│   │   └── *.routes.js (✅ EXISTS)
│   ├── server.js (✅ UPDATED)
│   └── package.json (✅ UPDATED)
│
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── FeedbackButton.js (✅ CREATED)
│   │   │   └── BackButton.js (✅ CREATED)
│   │   ├── page.js (✅ UPDATED)
│   │   ├── take-a-print/page.js (✅ CREATED)
│   │   └── customer/
│   │       ├── language/page.js (✅ UPDATED)
│   │       ├── upload/page.js (⚠️ NEEDS UPDATE)
│   │       ├── configuration/page.js (✅ UPDATED)
│   │       ├── review/page.js (⚠️ NEEDS UPDATE)
│   │       └── order-placed/page.js (⚠️ NEEDS UPDATE)
│   └── package.json (✅ EXISTS)
│
└── IMPLEMENTATION_SUMMARY.md (✅ CREATED)
```

---

## Database Migration

```bash
cd backend

# Create and run migrations
npm run prisma:migrate dev

# This creates:
- users table
- shopkeepers table
- orders table
- orderFiles table
- printConfigurations table
- invoices table
- feedback table
- shopkeeperStatistics table
- queues table
```

---

## Testing Checklist

### 1. Backend APIs
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test feedback
curl -X POST http://localhost:5000/api/feedback/submit \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user", "subject":"Test", "message":"Working"}'

# Test statistics
curl http://localhost:5000/api/statistics/shopkeeper-123
```

### 2. Frontend Pages
- [ ] Homepage (with hidden admin access)
- [ ] /take-a-print (shop selection)
- [ ] /customer/language (auto-detect + user details)
- [ ] /customer/upload (multiple files with rename)
- [ ] /customer/configuration (full print options)
- [ ] /customer/review (shopkeeper + config confirmation)
- [ ] /customer/order-placed (order ID + estimated time)
- [ ] /customer/orders (list, download invoice, delete)

### 3. Shopkeeper Features
- [ ] QR code generation in profile
- [ ] Dashboard statistics
- [ ] Analytics graphs (daily/weekly/monthly)

---

## Environment Configuration

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/printsmart
JWT_SECRET=your-secret-key-here-change-in-production
FRONTEND_URL=http://localhost:3000

# S3 Settings (Optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=

# Local Storage
UPLOAD_DIR=./uploads
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=PrintSmart
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
```

---

## Troubleshooting

### "Cannot find module 'qrcode'"
```bash
cd backend
npm install qrcode pdfkit
```

### "Database connection failed"
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Run migrations: `npm run prisma:migrate dev`

### "API not responding"
- Check backend is running on port 5000
- Verify CORS is enabled in server.js
- Check NEXT_PUBLIC_API_URL matches backend URL

### "Files not uploading"
- Check upload directory exists
- Verify file type is allowed
- Check S3 credentials if using S3

---

## Next Steps

1. ✅ Run database migrations
2. ✅ Start backend server  
3. ✅ Start frontend server
4. ⚠️ Implement missing endpoint controllers (see IMPLEMENTATION_SUMMARY.md)
5. ⚠️ Update remaining customer pages (Upload, Review, Order Placed)
6. ⚠️ Test end-to-end workflow
7. ⚠️ Add shopkeeper features (QR display, statistics)
8. ⚠️ Update PROJECT_FULL_DOCUMENTATION.md

---

## Support & Documentation

- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`
- **Full Project Docs:** See `PROJECT_FULL_DOCUMENTATION.md`
- **API Endpoints:** Check `/backend/routes/*.js` files
- **Database Schema:** Check `/backend/prisma/schema.prisma`

---

## Production Deployment

Before deploying:
- [ ] Update JWT_SECRET in production
- [ ] Configure AWS S3 for file storage
- [ ] Setup PostgreSQL on managed service (AWS RDS, Supabase)
- [ ] Add rate limiting and authentication middleware
- [ ] Configure CORS for production domains
- [ ] Setup error logging (Sentry, DataDog)
- [ ] Enable HTTPS everywhere
- [ ] Run security audit (`npm audit`)
- [ ] Setup CI/CD pipeline
- [ ] Create database backups

---

**Last Updated:** 2026-05-25
**Status:** 60% Complete - Core APIs + Frontend Architecture Ready
