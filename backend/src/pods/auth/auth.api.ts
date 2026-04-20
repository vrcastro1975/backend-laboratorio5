import { Router } from "express";
import { RequestHandler } from "express";
import { login } from "./auth.service";

export const authApi = Router();

authApi.get("/login", (_req, res) => {
  res.redirect("/");
});

export const loginHandler: RequestHandler = (req, res) => {
  const username = req.body?.username?.toString().trim();
  const password = req.body?.password?.toString().trim();

  if (!username || !password) {
    res.status(400).send({ message: "username and password are required" });
    return;
  }

  const auth = login(username, password);
  if (!auth) {
    res.status(401).send({ message: "invalid credentials" });
    return;
  }

  res.send(auth);
};

authApi.post("/login", loginHandler);
