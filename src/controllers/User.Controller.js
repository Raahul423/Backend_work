import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import fileupload from "../utils/Cloudinary.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";
import mongoose, { set } from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registeruser = asynchandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  if (fullname == "" || username == "" || email == "" || password == "") {
    throw new ApiError(400, "Please Fill All Required Field");
  }

  const Exist = await User.findOne({ email });

  if (Exist) {
    throw new ApiError(409, "User Already Exist");
  }

  const localavatar = req.files?.avatar[0]?.path;
  const localcoverImage = req.files?.coverImage?.[0]?.path || "";

  if (!localavatar) {
    throw new ApiError(400, "Fill is required field");
  }

  const avatar = await fileupload(localavatar);
  const coverImage = await fileupload(localcoverImage);

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

// User Login Logic

const LoginUser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body; // Take data from User

  if (!username && !email) {
    throw new ApiError(400, "uername or email is required");
  } // check user fill one of them field

  const user = await User.findOne({
    $or: [{ username }, { email }],
  }); // Find user from database

  if (!user) {
    throw new ApiError(400, "User not Registered");
  } // if user not find in db then

  const passwordcheck = await user.ispasswordcorrect(password); // check password by db and user enter password

  if (!passwordcheck) {
    throw new ApiError(400, "Password is incorrect");
  } // if password not match or empty data then send this message

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  ); // generate accesstoken or refreshtoken by with the help og userid

  const options = {
    httpOnly: true,
    secure: true,
  }; // option store in user cookie

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new Apiresponse(
        200,
        { user, accessToken, refreshToken },
        "User Successfully logged in"
      )
    );
});

// User LogOut Logic

const LogoutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshToken: null },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Apiresponse(200, {}, "User Logged Out"));
});

//User Add New RefreshToken when Accesstoken Expire then renew token

const accessandrefreshToken = asynchandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookie?.refreshToken || req.body.refreshToken;
  // when i was find the refresh token from user cookie

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Invalid Token");
    //check whether refrehToken found in user cookie or not
  }

  const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN);

  const user = await User.findById(decoded?._id);

  if (!user) {
    throw new ApiError(401, "Token not valid");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "refresh and accessToken are expired");
  }

  const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", newrefreshToken)
    .res(
      new Apiresponse(
        200,
        { accessToken, newrefreshToken },
        "Accesstoken refreshed"
      )
    );
});

// change Password

const changepassword = asynchandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;

    if (!oldpassword || !newpassword) {
      throw new ApiError(500,"Please provide both of them")
    }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(400, "Token Invalid");
  }

  const passwordcorrect = await user.ispasswordcorrect(oldpassword);

  if (!passwordcorrect) {
    throw new ApiError(400, "Please enter valid old password");
  }

  if(oldpassword === newpassword){
    throw new ApiError(500,"New password cannot same as old password")
  }

  // set new password

  user.password = newpassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new Apiresponse(200, {}, "Password updated sucessfully"));
});

const getcurrentuser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new Apiresponse(200, req.user, "user fetched sucessfully"));
});

//updated account details

const updateaccountdetails = asynchandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!(fullname || email)) {
    throw new ApiError(400, "please fill both field");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullname, email },
    },
    { new: true }
  );

  return res.status(200).json(new Apiresponse(200, user, "account updated"));
});

const updateAvatar = asynchandler(async (req, res) => {
  const avatarlocal = req.file?.path;

  if (!avatarlocal) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await fileupload(avatarlocal);

  if (!avatar.url) {
    throw new ApiError(200, "upload failed file in cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new Apiresponse(200, user, "Avatar Updated Sucessfully"));
});

const updatecoverImage = asynchandler(async (req, res) => {
  const coverImagelocal = req.file?.path;

  if (!coverImagelocal) {
    throw new ApiError(400, "coverImage is required");
  }

  const coverImage = await fileupload(coverImagelocal);

  if (!coverImage.url) {
    throw new ApiError(200, "upload failed file in cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req,
    user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new Apiresponse(200, user, "coverImage Updated Sucessfully"));
});

// aggrigation pipelines

const getUserChnnelprofile = asynchandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscribers",
        localField: "_id",
        foreignField: "subscription",
        as: "subscribeTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channel: {
          $size: "$subscribeTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        avatar: 1,
        subscriberCount: 1,
        channel: 1,
        isSubscribed: 1,
        coverImage: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(400, "channel does not found");
  }

  console.log(channel);

  return res
    .status(200)
    .json(new Apiresponse(200, channel[0], "user channel fetched succesfully"));
});

const getWatchHistory = asynchandler(async (req, res) => {

  if(!req.user?._id){
    throw new ApiError(401,"Unauthorize user")
  }

  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      }
    },
    {
      $lookup: {
        from: "vedios",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    avatar: 1,
                    username: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
  .status(200)
  .json(
    new Apiresponse(200,user[0].watchHistory,"watch History fetched sucessfully")
  )
});

export {
  registeruser,
  LoginUser,
  LogoutUser,
  accessandrefreshToken,
  updateaccountdetails,
  getcurrentuser,
  changepassword,
  updateAvatar,
  updatecoverImage,
  getUserChnnelprofile,
  getWatchHistory
};
