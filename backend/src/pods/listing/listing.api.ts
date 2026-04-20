import { Router } from "express";
import { requireAdmin } from "../../common/middlewares/auth.middleware";
import {
  sanitizePagination,
} from "../../common/helpers/pagination.helper";
import {
  mapListingDetailFromModelToApi,
  mapListingSummaryFromModelToApi,
} from "./listing.mappers";
import {
  getListingById,
  insertListingReview,
  listListings,
  updateListingById,
} from "./listing.repository";
import { UpdateListingApiModel } from "./listing.update.api-model";

export const listingApi = Router();

listingApi.get("/", async (req, res) => {
  const country = req.query.country?.toString();
  const pagination = sanitizePagination(
    req.query.page?.toString(),
    req.query.pageSize?.toString()
  );

  const result = await listListings(country, pagination);
  const totalPages = Math.max(
    1,
    Math.ceil(result.total / pagination.pageSize)
  );

  res.send({
    items: result.data.map(mapListingSummaryFromModelToApi),
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: result.total,
      totalPages,
    },
  });
});

listingApi.get("/:id", async (req, res) => {
  const listing = await getListingById(req.params.id);

  if (!listing) {
    res.status(404).send({ message: "Listing not found" });
    return;
  }

  res.send(mapListingDetailFromModelToApi(listing));
});

listingApi.post("/:id/reviews", async (req, res) => {
  const name = req.body?.name?.toString().trim();
  const comments = req.body?.comments?.toString().trim();

  if (!name || !comments) {
    res
      .status(400)
      .send({ message: "Both name and comments are required fields" });
    return;
  }

  const listing = await insertListingReview(req.params.id, { name, comments });
  if (!listing) {
    res.status(404).send({ message: "Listing not found" });
    return;
  }

  res.status(201).send(mapListingDetailFromModelToApi(listing));
});

listingApi.put("/:id", requireAdmin, async (req, res) => {
  const listingId = req.params.id.toString();
  const payload = req.body as UpdateListingApiModel;
  const listing = await updateListingById(listingId, payload);

  if (!listing) {
    res.status(404).send({ message: "Listing not found" });
    return;
  }

  res.send(mapListingDetailFromModelToApi(listing));
});
