import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

/**
 * Initializes the AWS S3 client using the Lambda's own region.
 * @returns {S3Client}
 */
export function createS3Client() {
    const region = process.env.AWS_REGION;
    if (!region) {
        throw new Error("AWS_REGION environment variable is missing.");
    }
    return new S3Client({ 
        region,
        maxAttempts: 3
    });
}

/**
 * Lists S3 objects under a specific prefix.
 * @param {S3Client} s3Client 
 * @param {string} bucketName 
 * @param {string} prefix 
 * @param {string|undefined} continuationToken 
 */
export async function listObjects(s3Client, bucketName, prefix, continuationToken) {
    const params = {
        Bucket: bucketName,
        Prefix: prefix,
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
 * Deletes all objects recursively residing within a specific folder prefix.
 * @param {S3Client} s3Client 
 * @param {string} bucketName 
 * @param {string} prefix 
 * @returns {Promise<{ filesScanned: number, filesDeleted: number }>}
 */
export async function cleanupFolder(s3Client, bucketName, prefix) {
    let continuationToken = undefined;
    let filesScanned = 0;
    let filesDeleted = 0;
    let isTruncated = true;

    while (isTruncated) {
        const data = await listObjects(s3Client, bucketName, prefix, continuationToken);
        const contents = data.Contents || [];
        filesScanned += contents.length;

        const keysToDelete = contents.map(obj => obj.Key);
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
 * Fetches folders eligible for deletion from Backend API and recursively cleans them up.
 * @param {object} event 
 * @returns {Promise<object>}
 */
export const handler = async (event) => {
    const startTime = Date.now();
    const currentTime = new Date();

    const bucketName = process.env.BUCKET_NAME;
    const awsRegion = process.env.AWS_REGION || "unknown";
    const s3Endpoint = `s3.${awsRegion}.amazonaws.com`;
    const backendApiUrl = process.env.BACKEND_API_URL;

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
    if (!awsRegion || awsRegion === "unknown") {
        const errMsg = "AWS_REGION environment variable is missing or unknown.";
        console.error(`[ERROR] ${errMsg}`);
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: errMsg, code: "MissingAwsRegion" }),
        };
    }
    if (!backendApiUrl) {
        const errMsg = "BACKEND_API_URL environment variable is missing.";
        console.error(`[ERROR] ${errMsg}`);
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: errMsg, code: "MissingBackendApiUrl" }),
        };
    }

    // Initial logging
    console.log(`[INFO] S3 Cleanup Started.`);
    console.log(`[INFO] AWS Region: ${awsRegion}`);
    console.log(`[INFO] Bucket Name: ${bucketName}`);
    console.log(`[INFO] S3 Endpoint: ${s3Endpoint}`);
    console.log(`[INFO] Current Time: ${currentTime.toISOString()}`);

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
                awsRegion,
                bucketName,
                s3Endpoint,
                currentTime: currentTime.toISOString(),
                executionTimeMs: executionTime,
            }),
        };
    }

    // Step 1: Call Backend API to fetch folders eligible for deletion
    let foldersToDelete = [];
    try {
        const response = await fetch(`${backendApiUrl.replace(/\/$/, "")}/api/storage/cleanup`);
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
        }
        foldersToDelete = await response.json();
        console.log(`[INFO] Fetched ${foldersToDelete.length} folder(s) eligible for cleanup.`);
    } catch (apiErr) {
        const executionTime = Date.now() - startTime;
        console.error("[ERROR] Failed to fetch cleanup list from backend API:", apiErr.message);
        return {
            statusCode: 502,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: `Failed to fetch cleanup folders from Backend API: ${apiErr.message}`,
                code: "BackendApiError",
                awsRegion,
                bucketName,
                s3Endpoint,
                currentTime: currentTime.toISOString(),
                executionTimeMs: executionTime,
            }),
        };
    }

    // Step 2: Iterate and delete each folder prefix
    let totalFilesScanned = 0;
    let totalFilesDeleted = 0;
    const deletedFolders = [];
    const cleanedOrderIds = [];

    try {
        for (const item of foldersToDelete) {
            const folderPrefix = item.folder;
            // Strict prefix validation: only scan and delete customer-orders prefix
            if (!folderPrefix || !folderPrefix.startsWith("uploads/customer-orders/")) {
                console.warn(`[WARNING] Skipping unsafe prefix: "${folderPrefix}". Only paths starting with uploads/customer-orders/ are permitted.`);
                continue;
            }

            console.log(`[INFO] Cleaning folder prefix: ${folderPrefix}`);
            const result = await cleanupFolder(s3Client, bucketName, folderPrefix);
            
            totalFilesScanned += result.filesScanned;
            totalFilesDeleted += result.filesDeleted;
            deletedFolders.push(folderPrefix);
            if (item.orderId) {
                cleanedOrderIds.push(item.orderId);
            }
            
            console.log(`[INFO] Completed folder ${folderPrefix}. Scanned: ${result.filesScanned}, Deleted: ${result.filesDeleted}`);
        }

        // Notify backend about successfully cleaned order IDs to update database status
        if (cleanedOrderIds.length > 0) {
            try {
                const notifyResponse = await fetch(`${backendApiUrl.replace(/\/$/, "")}/api/storage/cleanup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderIds: cleanedOrderIds }),
                });
                if (!notifyResponse.ok) {
                    console.error(`[ERROR] Failed to notify backend: ${await notifyResponse.text()}`);
                } else {
                    console.log(`[INFO] Successfully notified backend of ${cleanedOrderIds.length} cleaned order(s).`);
                }
            } catch (notifyErr) {
                console.error("[ERROR] Failed to connect to backend for cleanup notification:", notifyErr.message);
            }
        }

        const executionTime = Date.now() - startTime;
        console.log(`[INFO] S3 Cleanup Successful.`);
        console.log(`[INFO] Files Scanned: ${totalFilesScanned}`);
        console.log(`[INFO] Files Deleted: ${totalFilesDeleted}`);
        console.log(`[INFO] Execution Time: ${executionTime}ms`);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Folder-based S3 cleanup completed successfully.",
                awsRegion,
                bucketName,
                s3Endpoint,
                currentTime: currentTime.toISOString(),
                deletedFolders,
                filesScanned: totalFilesScanned,
                filesDeleted: totalFilesDeleted,
                executionTimeMs: executionTime,
            }),
        };

    } catch (err) {
        const executionTime = Date.now() - startTime;
        console.error("[ERROR] Cleanup execution failed:", err);

        let errorCode = "InternalError";
        let statusCode = 500;
        let message = err.message || "An unexpected error occurred.";

        // Handle specific AWS exceptions
        if (err.name === "PermanentRedirect") {
            errorCode = "PermanentRedirect";
            statusCode = 301;
            message = `PermanentRedirect: S3 bucket redirection occurred. The bucket is located in a different region than the Lambda function. Please deploy this Lambda in the same region as the S3 bucket (${awsRegion}). Details: ${err.message}`;
        } else if (err.name === "AccessDenied" || err.code === "AccessDenied") {
            errorCode = "AccessDenied";
            statusCode = 403;
            message = "AccessDenied: The Lambda execution role lacks required IAM permissions (s3:ListBucket / s3:DeleteObject).";
        } else if (err.name === "NoSuchBucket") {
            errorCode = "NoSuchBucket";
            statusCode = 404;
            message = `NoSuchBucket: S3 bucket "${bucketName}" not found. Please confirm the bucket name configuration.`;
        } else if (err.name === "InvalidBucketName") {
            errorCode = "InvalidBucketName";
            statusCode = 400;
            message = `InvalidBucketName: S3 bucket name "${bucketName}" is invalid.`;
        } else if (err.code === "ENOTFOUND" || err.code === "EAI_AGAIN" || err.syscall === "getaddrinfo") {
            errorCode = "NetworkError";
            statusCode = 502;
            message = "NetworkError: Failed to connect to S3 endpoint. Check region configuration and VPC internet access.";
        }

        return {
            statusCode,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: message,
                code: errorCode,
                awsRegion,
                bucketName,
                s3Endpoint,
                currentTime: currentTime.toISOString(),
                filesScanned: totalFilesScanned,
                filesDeleted: totalFilesDeleted,
                executionTimeMs: executionTime,
            }),
        };
    }
};
