import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { listingIdsForS3Seed } from "../pods/listing/listing-s3-image-url";

/** JPEG 1×1 mínimo (válido) para rellenar objetos de prueba en LocalStack. */
const placeholderJpeg = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwkHBgoICAgLChYLDQ4NExYUExgRExYXFxYUFB0eHyAkJCgoJCwwLi0zND07Ozs7Ozs7Ozs7Ozs7Ozv/2wBDAQ0NDQ4NDg4OEBAQEBAQEBAQEBAQEBAQEBAQEBAUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q==",
  "base64"
);

const bucket = process.env.S3_BUCKET_LISTING_IMAGES?.trim();
const endpoint = process.env.S3_ENDPOINT_URL?.trim() ?? "http://127.0.0.1:4566";
const region = process.env.AWS_REGION?.trim() ?? "us-east-1";

if (!bucket) {
  throw new Error(
    "Falta S3_BUCKET_LISTING_IMAGES. Ejemplo: S3_BUCKET_LISTING_IMAGES=lab5-listings"
  );
}

const client = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
  },
  forcePathStyle: true,
});

const ensureBucket = async () => {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    return;
  } catch {
    // bucket ausente u otro error: intentar crear
  }

  await client.send(new CreateBucketCommand({ Bucket: bucket }));
};

const run = async () => {
  await ensureBucket();

  for (const listingId of listingIdsForS3Seed) {
    const key = `${listingId}/cover.jpg`;
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: placeholderJpeg,
        ContentType: "image/jpeg",
        ACL: "public-read",
      })
    );
    console.log(`Subido s3://${bucket}/${key}`);
  }

  console.log(
    `Seed S3 completado: ${listingIdsForS3Seed.length} portadas en el bucket '${bucket}' (${endpoint}).`
  );
};

void run().catch((error) => {
  console.error("Error ejecutando seed-s3-localstack.runner:", error);
  process.exitCode = 1;
});
