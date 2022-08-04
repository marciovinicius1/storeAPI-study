import express from "express";
import bodyParser from "body-parser";
import routes from "../src/routes/index.js";
import database from "./database.js";
import acl from "express-acl";
import authMiddleware from "./middlewares/auth.js";

const app = express();

acl.config({
  baseUrl: "/",
  path: "config",
});

const configureExpress = () => {
  app.use(bodyParser.json());
  app.use(authMiddleware);
  app.use(acl.authorize.unless({ path: ["/users/authenticate"] }));

  app.use("/", routes);
  app.database = database;

  return app;
};

export default async () => {
  const app = configureExpress();
  await app.database.connect();

  return app;
};
