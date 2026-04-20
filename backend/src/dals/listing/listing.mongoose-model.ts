import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.Mixed },
    date: { type: Date },
    reviewer_name: { type: String },
    comments: { type: String },
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    name: String,
    summary: String,
    description: String,
    images: {
      picture_url: String,
    },
    address: {
      street: String,
      market: String,
      country: String,
    },
    beds: Number,
    bedrooms: Number,
    bathrooms: mongoose.Schema.Types.Mixed,
    reviews: [reviewSchema],
  },
  {
    collection: "listingsAndReviews",
    strict: false,
  }
);

export const ListingMongooseModel =
  mongoose.models.Listing ||
  mongoose.model("Listing", listingSchema, "listingsAndReviews");
