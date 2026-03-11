const express = require("express");
const router = express.Router();
const {
  addSleepRecord,
  getSleepHistory,
  updateSleepRecord,
  deleteSleepRecord,
  getSleepAnalytics,
} = require("../controllers/sleepController");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, addSleepRecord);
router.get("/history", protect, getSleepHistory);
router.put("/update/:id", protect, updateSleepRecord);
router.delete("/delete/:id", protect, deleteSleepRecord);
router.get("/analytics", protect, getSleepAnalytics);

module.exports = router;
