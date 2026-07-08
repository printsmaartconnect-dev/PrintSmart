# Storage Refactoring Migration & Deployment Guide

This guide describes how to deploy the database changes, configure environment variables, and verify that the structured S3 folder system and folder-based cleanup Lambda function are running correctly.

---

## 1. Database Schema Migration

The refactoring stores the `s3Key` alongside the `fileUrl` in the `OrderFile` table in PostgreSQL.

### Execution
Prisma Client is programmatically updated upon backend startup. To manually deploy the database schema changes and regenerate the Prisma Client, run:

```bash
cd backend
npx prisma db push
```

*Note: Pushing changes dynamically updates the PostgreSQL table `OrderFile` with a nullable `s3Key` column, maintaining backward compatibility with existing rows.*

---

## 2. Environment Variables

### Backend Configuration (`backend/.env`)
Ensure S3 is enabled and configured:
```ini
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=printsmart-storage-prod
```

### AWS Lambda Configuration
Set the following environment variables in the AWS Lambda configuration tab:
```ini
BUCKET_NAME=printsmart-storage-prod
AWS_REGION=eu-north-1
BACKEND_API_URL=https://your-express-backend.com
```

---

## 3. Verify API Cleanups

You can verify the backend cleanup list endpoint by visiting or sending a request to:

`GET /api/storage/cleanup`

It will output a JSON list of folder paths eligible for cleanup:
```json
[
  {
    "orderId": "5a41cf6b-8b5e-4db9-8e42-127e57c6b911",
    "orderIdCode": "0726PBW01",
    "folder": "uploads/customer-orders/0726PBW01/"
  }
]
```

---

## 4. Path Layout Structure

Under the refactored system, the S3 bucket folders are mapped as follows:

| Asset Type | Prefix / Key Path | Lifetime / Deletion |
|---|---|---|
| Customer files (pre-order) | `uploads/temporary/{uuidFilename}.pdf` | Temporary (not tracked, cleanup handled by S3 lifecycle or Lambda) |
| Customer files (active order) | `uploads/customer-orders/{orderId}/{filename}.pdf` | Cleaned up 6 hours after completion/cancellation |
| Shop Logo | `shop-logos/{shopId}.png` | Permanent (never deleted) |
| User Avatar | `user-avatars/{userId}.jpg` | Permanent (never deleted) |
| Generated Invoice | `generated-invoices/{invoiceId}.pdf` | Permanent (never deleted) |
| QR Poster | `qr-posters/{shopId}.pdf` | Permanent (never deleted) |
| Marketing Images | `marketing/{campaignId}/{filename}` | Permanent (never deleted) |
| AI Generated Images | `ai-images/{shopId}/{filename}` | Permanent (never deleted) |
