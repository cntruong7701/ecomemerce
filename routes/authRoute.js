const express = require("express");
const {
  createUser,
  loginUserCtrl,
  getAllUser,
  getaUser,
  deleteAUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.put("/password", authMiddleware, updatePassword);
router.post('/forgot-password-token', forgotPasswordToken);
router.put('/reset-password/:token', resetPassword);
router.get("/all-users", getAllUser);
router.get("/:id", authMiddleware, isAdmin, getaUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.delete("/:id", deleteAUser);
router.put("/edit-user", authMiddleware, updatedUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
module.exports = router;
