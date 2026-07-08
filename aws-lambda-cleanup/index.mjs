import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

/**
 * Initializes the AWS S3 client using the region from the environment.
 * @returns {S3Client}
 */
export function createS3Client() {
    const region = process.env.AWS_REGION;
    if (!region) {
        throw new Error("AWS_REGION environment variable is missing.");
    }
    return new S3Client({ region });
}

/**
 * Lists S3 objects using a continuation token.
 * @param {S3Client} s3Client 
 * @param {string} bucketName 
 * @param {string|undefined} continuationToken 
 */
export async function listObjects(s3Client, bucketName, continuationToken) {
    const params = {
        Bucket: bucketName,
    };
    if (continuationToken) {
        params.ContinuationToken = continuationToken;
    }
    const command = new ListObjectsV2Command(params);
    return await s3Client.send(command);
}

/**
 * Batch deletes specified object keys from the S3 bucket.
 * @param {S3Client} s3Client 
 * @param {string} bucketName 
 * @param {string[]} keys 
 */
export async function deleteObjects(s3Client, bucketName, keys) {
    if (!keys || keys.length === 0) return;
    const command = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
            Objects: keys.map(key => ({ Key: key })),
            Quiet: true,
        },
    });
    return await s3Client.send(command);
}

/**
 * Iterates through objects in S3 and batch deletes those older than the cutoff time.
 * @param {S3Client} s3Client 
 * @param {string} bucketName 
 * @param {Date} cutoffTime 
 * @returns {Promise<{ filesScanned: number, filesDeleted: number }>}
 */
export async function cleanup(s3Client, bucketName, cutoffTime) {
    let continuationToken = undefined;
    let filesScanned = 0;
    let filesDeleted = 0;
    let isTruncated = true;

    while (isTruncated) {
        const data = await listObjects(s3Client, bucketName, continuationToken);
        const contents = data.Contents || [];
        filesScanned += contents.length;

        const keysToDelete = [];
        for (const obj of contents) {
            const lastModified = new Date(obj.LastModified);
            if (lastModified < cutoffTime) {
                keysToDelete.push(obj.Key);
            }
        }

        if (keysToDelete.length > 0) {
            await deleteObjects(s3Client, bucketName, keysToDelete);
            filesDeleted += keysToDelete.length;
        }

        isTruncated = data.IsTruncated;
        continuationToken = data.NextContinuationToken;
    }

    return { filesScanned, filesDeleted };
}

/**
 * AWS Lambda handler entrypoint.
 * @param {object} event 
 * @returns {Promise<object>}
 */
export const handler = async (event) => {
    const startTime = Date.now();
    const currentTime = new Date();
    const cutoffTime = new Date(currentTime.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago

    const bucketName = process.env.BUCKET_NAME;
    const awsRegion = process.env.AWS_REGION;

    // Validate environment variables
    if (!bucketName) {
        const errMsg = "BUCKET_NAME environment variable is missing.";
        console.error(`[ERROR] ${errMsg}`);
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: errMsg, code: "MissingBucketName" }),
        };
    }
    if (!awsRegion) {
        const errMsg = "AWS_REGION environment variable is missing.";
        console.error(`[ERROR] ${errMsg}`);
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: errMsg, code: "MissingAwsRegion" }),
        };
    }

    console.log(`[INFO] S3 Cleanup Started.`);
    console.log(`[INFO] Bucket Name: ${bucketName}`);
    console.log(`[INFO] AWS Region: ${awsRegion}`);
    console.log(`[INFO] Current Time: ${currentTime.toISOString()}`);
    console.log(`[INFO] Cutoff Time: ${cutoffTime.toISOString()}`);

    let s3Client;
    try {
        s3Client = createS3Client();
    } catch (err) {
        const executionTime = Date.now() - startTime;
        console.error("[ERROR] Failed to initialize S3 client:", err.message);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: `Failed to initialize S3 client: ${err.message}`,
                code: "ClientInitializationError",
                executionTimeMs: executionTime,
            }),
        };
    }

    try {
        const result = await cleanup(s3Client, bucketName, cutoffTime);
        const executionTime = Date.now() - startTime;

        console.log(`[INFO] S3 Cleanup Successful.`);
        console.log(`[INFO] Files Scanned: ${result.filesScanned}`);
        console.log(`[INFO] Files Deleted: ${result.filesDeleted}`);
        console.log(`[INFO] Execution Time: ${executionTime}ms`);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Cleanup completed successfully.",
                bucketName,
                awsRegion,
                currentTime: currentTime.toISOString(),
                cutoffTime: cutoffTime.toISOString(),
                filesScanned: result.filesScanned,
                filesDeleted: result.filesDeleted,
                executionTimeMs: executionTime,
            }),
        };
    } catch (err) {
        const executionTime = Date.now() - startTime;
        console.error("[ERROR] Cleanup failed:", err);

        let errorCode = "InternalError";
        let statusCode = 500;
        let message = err.message || "An unexpected error occurred.";

        if (err.name === "PermanentRedirect") {
            errorCode = "PermanentRedirect";
            statusCode = 301;
            message = `PermanentRedirect: The bucket must be accessed using the specified endpoint. Please verify AWS_REGION is set correctly (e.g. eu-north-1). Details: ${err.message}`;
        } else if (err.name === "AccessDenied" || err.code === "AccessDenied") {
            errorCode = "AccessDenied";
            statusCode = 403;
            message = "AccessDenied: The Lambda function role lacks permissions (e.g., s3:ListBucket or s3:DeleteObject).";
        } else if (err.name === "NoSuchBucket") {
            errorCode = "NoSuchBucket";
            statusCode = 404;
            message = `NoSuchBucket: The bucket "${bucketName}" was not found. Please verify BUCKET_NAME is correct.`;
        } else if (err.name === "InvalidAccessKeyId" || err.name === "SignatureDoesNotMatch") {
            errorCode = "InvalidCredentials";
            statusCode = 401;
            message = "InvalidCredentials: AWS credentials or signature verification failed.";
        } else if (err.code === "ENOTFOUND" || err.code === "EAI_AGAIN" || err.syscall === "getaddrinfo") {
            errorCode = "NetworkError";
            statusCode = 502;
            message = "NetworkError: Failed to connect to S3 endpoint. Please verify region and connectivity.";
        }

        return {
            statusCode,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: message,
                code: errorCode,
                bucketName,
                awsRegion,
                currentTime: currentTime.toISOString(),
                cutoffTime: cutoffTime.toISOString(),
                executionTimeMs: executionTime,
            }),
        };
    }
};
