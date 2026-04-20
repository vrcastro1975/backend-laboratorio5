import { describe, expect, it } from "vitest";
import { Listing } from "../../dals/listing/listing.model";
import {
  mapListingDetailFromModelToApi,
  mapListingSummaryFromModelToApi,
} from "./listing.mappers";

const mockListing: Listing = {
  _id: "listing-99",
  name: "Sample listing",
  summary: "Summary",
  description: "Description",
  photos: ["https://img.dev/photo.jpg"],
  beds: 3,
  bedrooms: 2,
  bathrooms: 2,
  address: {
    street: "Main street",
    market: "Madrid",
    country: "Spain",
  },
  reviews: [
    {
      _id: "r1",
      date: new Date("2026-01-01"),
      reviewerName: "Laura",
      comments: "Excelente",
    },
    {
      _id: "r2",
      date: new Date("2026-01-10"),
      reviewerName: "Carlos",
      comments: "Muy buena estancia",
    },
  ],
};

describe("listing.mappers", () => {
  it("maps listing summary for list endpoint", () => {
    const summary = mapListingSummaryFromModelToApi(mockListing);

    expect(summary).toEqual({
      id: "listing-99",
      name: "Sample listing",
      image: "https://img.dev/photo.jpg",
      summary: "Summary",
    });
  });

  it("maps listing detail and sorts reviews by date desc", () => {
    const detail = mapListingDetailFromModelToApi(mockListing);

    expect(detail.id).toBe("listing-99");
    expect(detail.address).toBe("Main street, Madrid, Spain");
    expect(detail.latestReviews[0].id).toBe("r2");
    expect(detail.latestReviews[1].id).toBe("r1");
  });

  it("usa URL de S3 para la portada cuando bucket y base pública están definidos", () => {
    process.env.S3_BUCKET_LISTING_IMAGES = "mi-bucket";
    process.env.S3_PUBLIC_BASE_URL = "http://localhost:4566";

    try {
      const summary = mapListingSummaryFromModelToApi(mockListing);
      expect(summary.image).toBe(
        "http://localhost:4566/mi-bucket/listing-99/cover.jpg"
      );

      const detail = mapListingDetailFromModelToApi(mockListing);
      expect(detail.image).toBe(
        "http://localhost:4566/mi-bucket/listing-99/cover.jpg"
      );
    } finally {
      delete process.env.S3_BUCKET_LISTING_IMAGES;
      delete process.env.S3_PUBLIC_BASE_URL;
    }
  });
});
