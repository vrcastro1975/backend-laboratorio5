import { Listing } from "../../dals/listing/listing.model";

/** IDs usados en mock y en el seed de Atlas; deben coincidir con las claves subidas a S3. */
export const listingIdsForS3Seed = [
  "mock-listing-1",
  "mock-listing-2",
  "mock-listing-3",
  "66f000000000000000000001",
  "66f000000000000000000002",
  "66f000000000000000000003",
] as const;

const coverObjectKey = (listingId: string) => `${listingId}/cover.jpg`;

/**
 * Si `S3_BUCKET_LISTING_IMAGES` y `S3_PUBLIC_BASE_URL` están definidos, la portada
 * apunta al objeto en S3 (LocalStack o AWS). Si no, se usa la primera URL de `photos`.
 */
export const resolveListingCoverImageUrl = (listing: Listing): string => {
  const bucket = process.env.S3_BUCKET_LISTING_IMAGES?.trim();
  const publicBase = process.env.S3_PUBLIC_BASE_URL?.trim();

  if (bucket && publicBase) {
    const base = publicBase.replace(/\/+$/, "");
    const key = coverObjectKey(listing._id);
    return `${base}/${bucket}/${key}`;
  }

  return listing.photos[0] ?? "";
};
