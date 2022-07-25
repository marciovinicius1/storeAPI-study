import mongoose from "mongoose";
import config from "config";

const mongodbUrl = config.get("database.mongoUrl");

const connect = () => mongoose.connect(mongodbUrl);
const close = () => mongoose.connection.close();

export default {
  connect,
  connection: mongoose.connection,
};
