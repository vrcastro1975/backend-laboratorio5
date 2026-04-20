export interface Review {
  _id: string;
  date: Date;
  reviewerName: string;
  comments: string;
}

export interface Listing {
  _id: string;
  name: string;
  summary: string;
  description: string;
  photos: string[];
  beds: number;
  bedrooms: number;
  bathrooms: number;
  address: {
    street: string;
    market: string;
    country: string;
  };
  reviews: Review[];
}
