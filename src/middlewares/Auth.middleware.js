import { User } from "../models/User.model";
import { ApiError } from "../utils/ApiError";
import { asynchandler } from "../utils/asynchandler";
import Jwt  from "jsonwebtoken";

const verifyJWT = asynchandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers("Authorization").split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Invalid Token");
    }

    const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN);

    const user = User.findById(decoded?.id);

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }
    req.user = user;
    next()
  } 
  catch (error) {
    throw new ApiError(400,error.message || "Token Invalid");
  }
});

export {verifyJWT}
