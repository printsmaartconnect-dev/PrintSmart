# AWS Lambda S3 Cleanup Function (Folder-Based)

This Lambda function is designed to clean up temporary customer upload directories from Amazon S3. It is structured to run under **Node.js 22** using the native **AWS SDK v3**.

Instead of deleting files individually based only on S3 `LastModified` timestamps, this Lambda communicates with the Express backend API to determine which folders are actually eligible for deletion, and then deletes the entire folder prefixes securely.

---

## Environment Variables

Ensure the following environment variables are configured on the AWS Lambda configuration page:

| Variable Name | Example Value | Description |
|---|---|---|
| `BUCKET_NAME` | `printsmart-storage-prod` | The name of the S3 bucket. |
| `AWS_REGION` | `eu-north-1` | The AWS region where the Lambda function and the S3 bucket are located. |
| `BACKEND_API_URL` | `https://printsmart-api-prod.com` | Root URL of the Express backend API. |

---

## Workflow

1. **Query Backend**: Lambda makes a `GET` request to `${BACKEND_API_URL}/api/storage/cleanup` to fetch directories eligible for cleanup.
2. **Eligibility Rules (Backend Side)**:
   - Order Status == `COMPLETED` AND updated/completed time > 6 hours ago.
   - OR Order Status == `CANCELLED` AND updated/cancelled time > 6 hours ago.
3. **Recursive Batch Delete**: For each directory prefix returned (e.g. `uploads/customer-orders/order_123/`), Lambda recursively lists all S3 objects under that prefix and deletes them in batches of 1,000 using `DeleteObjectsCommand`.
4. **Safety Check**: Lambda strictly verifies that the prefix matches `uploads/customer-orders/` before deleting, ensuring permanent folders (e.g., `shop-logos/`, `user-avatars/`, `generated-invoices/`, `qr-posters/`) are never touched.

---

## Required IAM Permissions

The Lambda Execution Role needs permissions to list and delete objects under the specific bucket and prefix.

### S3 Permission Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3BucketCleanupPermissions",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::printsmart-storage-prod"
            ],
            "Condition": {
                "StringLike": {
                    "s3:prefix": [
                        "uploads/customer-orders/*"
                    ]
                }
            }
        },
        {
            "Sid": "S3ObjectCleanupPermissions",
            "Effect": "Allow",
            "Action": [
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::printsmart-storage-prod/uploads/customer-orders/*"
            ]
        }
    ]
}
```
