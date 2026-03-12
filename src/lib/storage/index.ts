import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKET_NAME } from "@/constants/bucket";

enum StorageProvider {
  S3 = "s3",
  R2 = "r2",
}

const createS3Client = () => {
  const provider = process.env.STORAGE_PROVIDER as StorageProvider;

  if (
    !provider ||
    ![StorageProvider.S3, StorageProvider.R2].includes(provider)
  ) {
    throw new Error("STORAGE_PROVIDER must be 's3' or 'r2'");
  }

  const isS3 = provider === StorageProvider.S3;

  if (isS3) {
    const awsRegion = process.env.AWS_REGION;
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!awsRegion) throw new Error("AWS_REGION is required");
    if (!accessKey) throw new Error("AWS_ACCESS_KEY_ID is required");
    if (!secretKey) throw new Error("AWS_SECRET_ACCESS_KEY is required");

    return new S3Client({
      region: awsRegion,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  } else {
    const accountID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKey = process.env.CLOUDFLARE_ACCESS_KEY;
    const secretKey = process.env.CLOUDFLARE_SECRET_KEY;

    if (!accountID) throw new Error("CLOUDFLARE_ACCOUNT_ID is required");
    if (!accessKey) throw new Error("CLOUDFLARE_ACCESS_KEY is required");
    if (!secretKey) throw new Error("CLOUDFLARE_SECRET_KEY is required");

    return new S3Client({
      region: "auto",
      endpoint: `https://${accountID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }
};

export const s3 = createS3Client();

export const generatePresignedUrl = async ({
  fileName,
  contentType,
  bucketName,
}: {
  fileName: string;
  contentType: string;
  bucketName?: string;
}) => {
  const bucket = bucketName || BUCKET_NAME;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 60 * 5, // 5 minutes
  });

  return url;
};
