import { Router } from "express";
import { LoginUser, LogoutUser, registeruser } from "../controllers/User.Controller.js";
import { upload } from "../middlewares/Multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
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

router.route("/login").post(LoginUser);

router.route("/logout").post( verifyJWT , LogoutUser )

export { router };
