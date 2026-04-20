import { Types } from "mongoose";
import { PaginationParams } from "../../common/helpers/pagination.helper";
import { Listing, Review } from "../../dals/listing/listing.model";
import { mockListings } from "../../dals/listing/listing.mock-data";
import { ListingMongooseModel } from "../../dals/listing/listing.mongoose-model";

interface MongoReview {
  _id?: Types.ObjectId | string;
  date?: Date | string;
  reviewer_name?: string;
  comments?: string;
}

interface MongoListing {
  _id: Types.ObjectId;
  name?: string;
  summary?: string;
  description?: string;
  images?: {
    picture_url?: string;
  };
  address?: {
    street?: string;
    market?: string;
    country?: string;
  };
  beds?: number;
  bedrooms?: number;
  bathrooms?: unknown;
  reviews?: MongoReview[];
}

interface UpdateListingInput {
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

const dataSource = (process.env.DATA_SOURCE ?? "mock").toLowerCase();
const useMockData = dataSource === "mock";

const cloneListing = (listing: Listing): Listing => ({
  ...listing,
  address: { ...listing.address },
  photos: [...listing.photos],
  reviews: listing.reviews.map((review) => ({ ...review })),
});

const normalizeCountry = (country: string) => country.trim().toLowerCase();

const mockStore: Listing[] = mockListings.map(cloneListing);

const parseNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  if (value && typeof value === "object" && "toString" in value) {
    const parsed = Number.parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const mapReviewFromMongo = (review: MongoReview): Review => ({
  _id:
    review._id instanceof Types.ObjectId
      ? review._id.toHexString()
      : (review._id ?? new Types.ObjectId().toHexString()).toString(),
  date: review.date ? new Date(review.date) : new Date(),
  reviewerName: review.reviewer_name ?? "",
  comments: review.comments ?? "",
});

const mapListingFromMongo = (listing: MongoListing): Listing => ({
  _id: listing._id.toHexString(),
  name: listing.name ?? "",
  summary: listing.summary ?? "",
  description: listing.description ?? "",
  photos: listing.images?.picture_url ? [listing.images.picture_url] : [],
  beds: listing.beds ?? 0,
  bedrooms: listing.bedrooms ?? listing.beds ?? 0,
  bathrooms: parseNumber(listing.bathrooms),
  address: {
    street: listing.address?.street ?? "",
    market: listing.address?.market ?? "",
    country: listing.address?.country ?? "",
  },
  reviews: (listing.reviews ?? []).map(mapReviewFromMongo),
});

export const listListings = async (
  country: string | undefined,
  pagination: PaginationParams
): Promise<{ data: Listing[]; total: number }> => {
  if (useMockData) {
    const filtered = country
      ? mockStore.filter(
          (listing) =>
            normalizeCountry(listing.address.country) === normalizeCountry(country)
        )
      : mockStore;

    const start = (pagination.page - 1) * pagination.pageSize;
    const paged = filtered
      .slice(start, start + pagination.pageSize)
      .map(cloneListing);

    return {
      data: paged,
      total: filtered.length,
    };
  }

  const filter: Record<string, unknown> = country
    ? { "address.country": { $regex: new RegExp(`^${country.trim()}$`, "i") } }
    : {};

  const [total, items] = await Promise.all([
    ListingMongooseModel.countDocuments(filter),
    ListingMongooseModel.find(filter)
      .skip((pagination.page - 1) * pagination.pageSize)
      .limit(pagination.pageSize)
      .lean<MongoListing[]>(),
  ]);

  return {
    data: items.map(mapListingFromMongo),
    total,
  };
};

export const getListingById = async (id: string): Promise<Listing | null> => {
  if (useMockData) {
    const listing = mockStore.find((item) => item._id === id);
    return listing ? cloneListing(listing) : null;
  }

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const listing = await ListingMongooseModel.findById(id).lean<MongoListing>();

  return listing ? mapListingFromMongo(listing) : null;
};

export const insertListingReview = async (
  id: string,
  review: { name: string; comments: string }
): Promise<Listing | null> => {
  if (useMockData) {
    const listing = mockStore.find((item) => item._id === id);
    if (!listing) {
      return null;
    }

    const newReview: Review = {
      _id: `mock-review-${Date.now()}`,
      date: new Date(),
      reviewerName: review.name,
      comments: review.comments,
    };

    listing.reviews.unshift(newReview);
    return cloneListing(listing);
  }

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const updatedListing = await ListingMongooseModel.findByIdAndUpdate(
    id,
    {
      $push: {
        reviews: {
          _id: new Types.ObjectId(),
          date: new Date(),
          reviewer_name: review.name,
          comments: review.comments,
        },
      },
    }
  )
    .lean<MongoListing>()
    .setOptions({ new: true });

  return updatedListing ? mapListingFromMongo(updatedListing) : null;
};

export const updateListingById = async (
  id: string,
  input: UpdateListingInput
): Promise<Listing | null> => {
  if (useMockData) {
    const listing = mockStore.find((item) => item._id === id);
    if (!listing) {
      return null;
    }

    if (typeof input.name === "string") {
      listing.name = input.name.trim();
    }
    if (typeof input.summary === "string") {
      listing.summary = input.summary.trim();
    }
    if (typeof input.description === "string") {
      listing.description = input.description.trim();
    }
    if (typeof input.beds === "number") {
      listing.beds = input.beds;
    }
    if (typeof input.bedrooms === "number") {
      listing.bedrooms = input.bedrooms;
    }
    if (typeof input.bathrooms === "number") {
      listing.bathrooms = input.bathrooms;
    }
    if (typeof input.image === "string") {
      const image = input.image.trim();
      listing.photos = image ? [image] : [];
    }
    if (input.address) {
      if (typeof input.address.street === "string") {
        listing.address.street = input.address.street.trim();
      }
      if (typeof input.address.market === "string") {
        listing.address.market = input.address.market.trim();
      }
      if (typeof input.address.country === "string") {
        listing.address.country = input.address.country.trim();
      }
    }

    return cloneListing(listing);
  }

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const updateFields: Record<string, unknown> = {};
  if (typeof input.name === "string") {
    updateFields.name = input.name.trim();
  }
  if (typeof input.summary === "string") {
    updateFields.summary = input.summary.trim();
  }
  if (typeof input.description === "string") {
    updateFields.description = input.description.trim();
  }
  if (typeof input.beds === "number") {
    updateFields.beds = input.beds;
  }
  if (typeof input.bedrooms === "number") {
    updateFields.bedrooms = input.bedrooms;
  }
  if (typeof input.bathrooms === "number") {
    updateFields.bathrooms = input.bathrooms;
  }
  if (typeof input.image === "string") {
    updateFields["images.picture_url"] = input.image.trim();
  }
  if (input.address) {
    if (typeof input.address.street === "string") {
      updateFields["address.street"] = input.address.street.trim();
    }
    if (typeof input.address.market === "string") {
      updateFields["address.market"] = input.address.market.trim();
    }
    if (typeof input.address.country === "string") {
      updateFields["address.country"] = input.address.country.trim();
    }
  }

  if (Object.keys(updateFields).length === 0) {
    return getListingById(id);
  }

  const updatedListing = await ListingMongooseModel.findByIdAndUpdate(
    id,
    { $set: updateFields }
  )
    .lean<MongoListing>()
    .setOptions({ new: true });

  if (!updatedListing) {
    return null;
  }

  return mapListingFromMongo(updatedListing);
};
