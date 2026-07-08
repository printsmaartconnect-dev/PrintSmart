# AWS Lambda S3 Cleanup Function

This Lambda function is designed to clean up temporary uploads and files older than **6 hours** from the Amazon S3 storage bucket. It is built to run on **Node.js 22** using the native **AWS SDK v3**.

## Environment Variables

Ensure the following environment variables are configured on the AWS Lambda configuration page:

| Variable Name | Example Value | Description |
|---|---|---|
| `BUCKET_NAME` | `printsmart-storage-prod` | The name of the S3 bucket to clean up. |
| `AWS_REGION` | `eu-north-1` | The AWS region where the bucket is located. |

> [!IMPORTANT]
> Do not hardcode the region or bucket name. The S3 Client is automatically configured to use these variables, resolving any `PermanentRedirect` region mismatch issues.

---

## Required IAM Permissions

The execution role associated with the Lambda function must have permissions to list and delete objects in the S3 bucket, as well as write logs to CloudWatch.

### S3 Permission Policy

Attach the following policy to the Lambda execution role (replace `printsmart-storage-prod` with your actual bucket name if it differs):

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
            ]
        },
        {
            "Sid": "S3ObjectCleanupPermissions",
            "Effect": "Allow",
            "Action": [
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::printsmart-storage-prod/*"
            ]
        }
    ]
}
```

### CloudWatch Logs Policy

Ensure standard execution permissions for CloudWatch are present:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
```

---

## Features

- **Pagination Support**: Utilizes `ContinuationToken` to handle buckets with thousands of files sequentially.
- **Batch Deletion**: Optimizes API execution cost and speed by using S3 batch deletion (`DeleteObjectsCommand`) instead of individual deletions.
- **Detailed Logging**: Logs execution performance metadata including scan counts, deletion counts, execution time, and exact error mappings.
- **Error Handling**: Gracefully maps S3/Network exceptions (e.g. `PermanentRedirect`, `AccessDenied`, `NoSuchBucket`, `InvalidAccessKeyId`) to standard JSON responses for easy debugging.
