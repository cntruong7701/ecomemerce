const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongooseId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");

// Create a user
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    //Create a new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    //User Already exists
    throw new Error("User Already Exists");
  }
});

// login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if user exists or not
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// admin login

// const loginAdmin = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   // check if user exists or not
//   const findAdmin = await User.findOne({ email });
//   if (findAdmin.role !== "admin") throw new Error("Not Authorized");
//   if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
//     const refreshToken = await generateRefreshToken(findAdmin?._id);
//     const updateuser = await User.findByIdAndUpdate(
//       findAdmin.id,
//       {
//         refreshToken: refreshToken,
//       },
//       { new: true }
//     );
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       maxAge: 72 * 60 * 60 * 1000,
//     });
//     res.json({
//       _id: findAdmin?._id,
//       firstname: findAdmin?.firstname,
//       lastname: findAdmin?.lastname,
//       email: findAdmin?.email,
//       mobile: findAdmin?.mobile,
//       token: generateToken(findAdmin?._id),
//     });
//   } else {
//     throw new Error("Invalid Credentials");
//   }
// });

//handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in cookie");
  const refreshToken = cookie.refreshToken;
  console.log(refreshToken);
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decode) => {
    if (err || user.id !== decode.id) {
      throw new Error("there id something with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

//logout functionality
const logout = asyncHandler(async(req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in cookie");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if(!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: true,
    });
    return res.sendStatus(204);//forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: true,
  });
  res.sendStatus(204); 
})

// get all users
const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUser = await User.find();
    res.json(getUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Update a user
const updatedUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongooseId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user
const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongooseId(id);
  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user
const deleteAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongooseId(id);
  try {
    const deleteAUser = await User.findByIdAndDelete(id);
    res.json({
      deleteAUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongooseId(id);
  try {
    const blockuser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(blockuser);
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongooseId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({ message: "User Unblock" });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  getAllUser,
  updatedUser,
  getaUser,
  deleteAUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
};