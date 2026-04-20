import { Listing } from "./listing.model";

const createReview = (
  id: string,
  reviewerName: string,
  comments: string,
  date: string
) => ({
  _id: id,
  reviewerName,
  comments,
  date: new Date(date),
});

export const mockListings: Listing[] = [
  {
    _id: "mock-listing-1",
    name: "Cozy flat in Madrid center",
    summary: "Apartamento centrico y luminoso",
    description: "Ideal para estancias cortas en Madrid.",
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    ],
    beds: 2,
    bedrooms: 1,
    bathrooms: 1,
    address: {
      street: "Gran Via 12",
      market: "Madrid",
      country: "Spain",
    },
    reviews: [
      createReview(
        "mock-review-1",
        "ana",
        "Ubicacion excelente y piso muy limpio.",
        "2026-01-10T10:00:00.000Z"
      ),
    ],
  },
  {
    _id: "mock-listing-2",
    name: "Beach apartment in Malaga",
    summary: "A cinco minutos andando de la playa",
    description: "Perfecto para vacaciones familiares.",
    photos: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200",
    ],
    beds: 3,
    bedrooms: 2,
    bathrooms: 2,
    address: {
      street: "Paseo Maritimo 20",
      market: "Malaga",
      country: "Spain",
    },
    reviews: [],
  },
  {
    _id: "mock-listing-3",
    name: "Traditional house in Porto",
    summary: "Casa tradicional en barrio historico",
    description: "Muy bien comunicada y con encanto local.",
    photos: [
      "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1200",
    ],
    beds: 4,
    bedrooms: 3,
    bathrooms: 2,
    address: {
      street: "Rua das Flores 18",
      market: "Porto",
      country: "Portugal",
    },
    reviews: [],
  },
];
