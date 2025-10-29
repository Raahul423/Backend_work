import { Router } from "express";
import { registeruser } from "../controllers/User.Controller.js";
import { upload } from "../middlewares/Multer.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registeruser
);

export { router };
