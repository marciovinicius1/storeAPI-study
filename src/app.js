import express from "express";
import bodyParser from "body-parser";
import routes from "../src/routes/index.js";
import database from "./database.js";

const app = express();

const configureExpress = () => {
  app.use(bodyParser.json());
  app.use("/", routes);
  app.database = database;

  return app;
};

export default async () => {
  const app = configureExpress();
  await app.database.connect();

  return app;
};
