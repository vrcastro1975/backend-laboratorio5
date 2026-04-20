import mongoose from "mongoose";

const mongoUri = process.env.MONGO_URI ?? "mongodb://localhost:27017";
const dbName = process.env.MONGO_DB_NAME ?? "airbnb";

let isConnected = false;

export const connectMongoose = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  await mongoose.connect(mongoUri, {
    dbName,
  });

  isConnected = true;
};
