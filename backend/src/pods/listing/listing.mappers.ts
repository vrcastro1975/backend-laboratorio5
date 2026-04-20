import { Listing, Review } from "../../dals/listing/listing.model";
import {
  ListingDetailApiModel,
  ListingReviewApiModel,
  ListingSummaryApiModel,
} from "./listing.api-model";
import { resolveListingCoverImageUrl } from "./listing-s3-image-url";

const mapReviewFromModelToApi = (review: Review): ListingReviewApiModel => ({
  id: review._id,
  date: review.date.toISOString(),
  name: review.reviewerName,
  comments: review.comments,
});

export const mapListingSummaryFromModelToApi = (
  listing: Listing
): ListingSummaryApiModel => ({
  id: listing._id,
  name: listing.name,
  image: resolveListingCoverImageUrl(listing),
  summary: listing.summary,
});

export const mapListingDetailFromModelToApi = (
  listing: Listing
): ListingDetailApiModel => ({
  id: listing._id,
  name: listing.name,
  image: resolveListingCoverImageUrl(listing),
  description: listing.description,
  address: `${listing.address.street}, ${listing.address.market}, ${listing.address.country}`,
  bedrooms: listing.bedrooms,
  beds: listing.beds,
  bathrooms: listing.bathrooms,
  latestReviews: [...listing.reviews]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5)
    .map(mapReviewFromModelToApi),
});
