import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import Jwt from "jsonwebtoken";

const verifyJWT = asynchandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Token not Found");
  }

  const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN);

  const user = await User.findById(decoded?._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }
  req.user = user;
  next();
});

export { verifyJWT };
