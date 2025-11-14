import { Router } from "express";
import {
  LoginUser,
  LogoutUser,
  registeruser,
  accessandrefreshToken,
  changepassword,
  getcurrentuser,
  updateaccountdetails,
  updateAvatar,
  updatecoverImage,
  getUserChnnelprofile,
  getWatchHistory,
} from "../controllers/User.Controller.js";
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

router.route("/logout").post(verifyJWT, LogoutUser);

router.route("/refresh-token").post(accessandrefreshToken);

router.route("/change-password").post(verifyJWT, changepassword);

router.route("/current-user").get(verifyJWT, getcurrentuser);

router.route("/update-account").patch(verifyJWT, updateaccountdetails);

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);

router
  .route("/coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updatecoverImage);

router.route("/channel/:username").get(verifyJWT, getUserChnnelprofile);

router.route("/watchHistory").get(verifyJWT, getWatchHistory);

export { router };
