import express from "express";
import productsRoute from "./products.js";
import usersRoute from "./users.js";

const router = express.Router();

router.use("/products", productsRoute);
router.use("/users", usersRoute);
router.get("/", (req, res) => res.send("Hello world! ❤️"));

export default router;
