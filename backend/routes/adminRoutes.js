const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, getAdminProfile, updateAdminProfile } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/profile", protect, getAdminProfile);
router.put("/profile", protect, updateAdminProfile);

module.exports = router;
