export interface UpdateListingApiModel {
  name?: string;
  summary?: string;
  description?: string;
  beds?: number;
  bedrooms?: number;
  bathrooms?: number;
  image?: string;
  address?: {
    street?: string;
    market?: string;
    country?: string;
  };
}
