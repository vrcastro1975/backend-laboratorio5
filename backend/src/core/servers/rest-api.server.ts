import cors from "cors";
import express from "express";
import path from "node:path";
import { authApi, loginHandler } from "../../pods/auth/auth.api";
import { listingApi } from "../../pods/listing/listing.api";

export const createRestApiServer = () => {
  const app = express();
  const frontendPath = path.resolve(process.cwd(), "../frontend");

  app.use(cors());
  app.use(express.json());
  app.use(express.static(frontendPath));

  app.get("/api/health", (_req, res) => {
    res.send({ status: "ok" });
  });

  app.get("/api/login", (_req, res) => {
    res.redirect("/");
  });
  app.post("/api/login", loginHandler);
  app.use("/api/auth", authApi);
  app.use("/api/listings", listingApi);

  return app;
};
