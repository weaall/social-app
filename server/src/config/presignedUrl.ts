import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const presignedUrl = async (key: string, contentType: string): Promise<string | undefined> => {
    const s3Client = new S3Client({
        region: process.env.AWS_S3_REGION as string,
        credentials: {
            accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
        },
    });

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME as string,
        Key: key,
        ContentType: contentType,
        ACL: "public-read"
    });

    try {
        // @ts-ignore
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return signedUrl;
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return undefined;
    }
};
