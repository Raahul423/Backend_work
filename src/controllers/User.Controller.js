import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import fileupload from "../utils/Cloudinary.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { log } from "console";
import path from "path";

const registeruser = asynchandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;
  console.log(req.body);

  if (fullname == "" || username == "" || email == "" || password == "") {
    throw new ApiError(400, "Please Fill All Required Field");
  }

  const Exist = await User.findOne({ email });

  if (Exist) {
    throw new ApiError(409, "User Already Exist");
  }

  const localavatar =(req.files?.avatar[0]?.path);
  const localcoverImage =(req.files?.coverImage[0].path);
  console.log("Files received =>", req.files);
  console.log("localavatar =>", localavatar);
  console.log("localcoverImage =>", localcoverImage);

  if (!localavatar) {
    throw new ApiError(400, "Fill is required field");
  }

  const avatar = await fileupload(localavatar);
  console.log(avatar);
  
  const coverImage = await fileupload(localcoverImage);
   console.log(coverImage);

  if (!avatar) {
    throw new ApiError(400, "Fill this required field");
  }

  const user = await User.create({
    fullname,
    username,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  console.log(avatar);
  console.log(coverImage);

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createduser) {
    throw new ApiError(500, "Internal Server Error");
  }

  return res
    .status(200)
    .json(new Apiresponse(200, createduser, "User Registered Successfully"));
});

export { registeruser };
