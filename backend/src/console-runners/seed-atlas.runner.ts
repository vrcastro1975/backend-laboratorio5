import mongoose from "mongoose";
import { ListingMongooseModel } from "../dals/listing/listing.mongoose-model";

const atlasSeedData = [
  {
    _id: new mongoose.Types.ObjectId("66f000000000000000000001"),
    name: "Loft panoramico en Valencia",
    summary: "Apartamento moderno cerca de la Ciudad de las Artes",
    description:
      "Alojamiento de produccion para pruebas del despliegue manual con Mongo Atlas.",
    images: {
      picture_url:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200",
    },
    address: {
      street: "Avenida del Puerto 45",
      market: "Valencia",
      country: "Spain",
    },
    beds: 2,
    bedrooms: 1,
    bathrooms: 1,
    reviews: [
      {
        _id: new mongoose.Types.ObjectId("66f000000000000000000011"),
        date: new Date("2026-04-20T08:00:00.000Z"),
        reviewer_name: "alumno",
        comments: "Seed de Atlas insertado correctamente.",
      },
    ],
  },
  {
    _id: new mongoose.Types.ObjectId("66f000000000000000000002"),
    name: "Casa familiar en Bilbao",
    summary: "Casa amplia para estancias de trabajo o vacaciones",
    description:
      "Segundo documento de ejemplo para validar que la API consume datos desde Atlas.",
    images: {
      picture_url:
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
    },
    address: {
      street: "Calle Ercilla 9",
      market: "Bilbao",
      country: "Spain",
    },
    beds: 4,
    bedrooms: 3,
    bathrooms: 2,
    reviews: [],
  },
  {
    _id: new mongoose.Types.ObjectId("66f000000000000000000003"),
    name: "Apartamento historico en Lisboa",
    summary: "Ubicacion centrica en barrio tradicional",
    description:
      "Tercer documento de ejemplo para comprobaciones de listado y detalle.",
    images: {
      picture_url:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
    },
    address: {
      street: "Rua Augusta 120",
      market: "Lisboa",
      country: "Portugal",
    },
    beds: 3,
    bedrooms: 2,
    bathrooms: 1,
    reviews: [],
  },
];

const mongoUri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME ?? "airbnb";

if (!mongoUri) {
  throw new Error(
    "Falta MONGO_URI. Configura la URI de MongoDB Atlas antes de ejecutar el runner."
  );
}

const run = async () => {
  await mongoose.connect(mongoUri, { dbName });

  await ListingMongooseModel.deleteMany({});
  await ListingMongooseModel.insertMany(atlasSeedData);

  console.log(
    `Seed de Atlas completado. Insertados ${atlasSeedData.length} documentos en '${dbName}'.`
  );

  await mongoose.disconnect();
};

void run().catch(async (error) => {
  console.error("Error ejecutando seed-atlas.runner:", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
