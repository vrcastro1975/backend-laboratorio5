import { RequestHandler } from "express";
import { getUserRoleFromToken } from "../../pods/auth/auth.service";

export const requireAdmin: RequestHandler = (req, res, next) => {
  const authHeader = req.header("authorization");
  const [, token] = (authHeader ?? "").split(" ");
  const role = getUserRoleFromToken(token);

  if (!role) {
    res.status(401).send({ message: "authorization token required" });
    return;
  }

  if (role !== "admin") {
    res.status(403).send({ message: "admin role required" });
    return;
  }

  next();
};
