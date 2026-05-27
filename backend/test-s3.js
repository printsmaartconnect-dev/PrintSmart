require("dotenv").config();

const {
    S3Client,
    PutObjectCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId:
            process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey:
            process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function uploadTest() {
    try {
        const command =
            new PutObjectCommand({
                Bucket:
                    process.env.AWS_S3_BUCKET,
                Key:
                    "test-folder/test.txt",
                Body:
                    "Hello from PrintSmart 🚀",
                ContentType:
                    "text/plain",
            });

        await s3.send(command);

        console.log(
            "✅ Upload successful"
        );

        console.log(
            `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/test-folder/test.txt`
        );
    } catch (err) {
        console.error(
            "❌ Upload failed"
        );
        console.error(err);
    }
}

uploadTest();