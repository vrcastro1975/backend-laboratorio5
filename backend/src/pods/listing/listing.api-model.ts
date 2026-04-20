export interface ListingSummaryApiModel {
  id: string;
  name: string;
  image: string;
  summary: string;
}

export interface ListingReviewApiModel {
  id: string;
  date: string;
  name: string;
  comments: string;
}

export interface ListingDetailApiModel {
  id: string;
  name: string;
  image: string;
  description: string;
  address: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  latestReviews: ListingReviewApiModel[];
}

export interface CreateReviewApiModel {
  name: string;
  comments: string;
}
