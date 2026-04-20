import request from "supertest";
import { describe, expect, it } from "vitest";
import { createRestApiServer } from "../../core/servers/rest-api.server";

describe("auth.api integration", () => {
  it("returns token for valid credentials", async () => {
    const app = createRestApiServer();

    const response = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "admin123",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toContain("lab5-token:admin:admin");
    expect(response.body.role).toBe("admin");
  });

  it("returns 401 for invalid credentials", async () => {
    const app = createRestApiServer();

    const response = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "wrong-pass",
    });

    expect(response.status).toBe(401);
  });
});
