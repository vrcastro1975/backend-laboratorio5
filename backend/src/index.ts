import { createRestApiServer } from "./core/servers/rest-api.server";
import { connectMongoose } from "./dals/mongo/mongoose.connection";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const app = createRestApiServer();
const dataSource = (process.env.DATA_SOURCE ?? "mock").toLowerCase();
const useMockData = dataSource === "mock";

const startServer = async () => {
  if (!useMockData) {
    await connectMongoose();
  }

  app.listen(port, () => {
    console.log(
      `REST API running on http://localhost:${port} (data source: ${
        useMockData ? "mock" : "mongo"
      })`
    );
  });
};

void startServer();
