const SleepData = require("../models/SleepData");

// Helper: calculate duration in hours between two "HH:MM" strings
const calcDuration = (sleepTime, wakeTime) => {
  const [sleepH, sleepM] = sleepTime.split(":").map(Number);
  const [wakeH, wakeM] = wakeTime.split(":").map(Number);

  let sleepMinutes = sleepH * 60 + sleepM;
  let wakeMinutes = wakeH * 60 + wakeM;

  if (wakeMinutes <= sleepMinutes) wakeMinutes += 24 * 60;

  return parseFloat(((wakeMinutes - sleepMinutes) / 60).toFixed(2));
};

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// @desc    Add a sleep record
// @route   POST /api/sleep/add
// @access  Protected
const addSleepRecord = async (req, res) => {
  const { sleepTime, wakeTime, date, quality, notes } = req.body;

  if (!sleepTime || !wakeTime) {
    return res.status(400).json({ message: "sleepTime and wakeTime are required" });
  }
  if (!timeRegex.test(sleepTime) || !timeRegex.test(wakeTime)) {
    return res.status(400).json({ message: "Times must be in HH:MM format (24-hour)" });
  }

  try {
    const sleepDuration = calcDuration(sleepTime, wakeTime);
    const record = await SleepData.create({
      userId: req.admin.id,
      sleepTime,
      wakeTime,
      sleepDuration,
      date: date ? new Date(date) : new Date(),
      quality: quality || "Good",
      notes: notes || "",
    });

    res.status(201).json({ message: "Sleep record added successfully", record });
  } catch (error) {
    res.status(500).json({ message: "Server error adding sleep record" });
  }
};

// @desc    Get all sleep records for the logged-in admin
// @route   GET /api/sleep/history
// @access  Protected
const getSleepHistory = async (req, res) => {
  try {
    const records = await SleepData.find({ userId: req.admin.id })
      .sort({ date: -1 })
      .select("-__v");

    res.status(200).json({ count: records.length, records });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching sleep history" });
  }
};

// @desc    Update a sleep record
// @route   PUT /api/sleep/update/:id
// @access  Protected
const updateSleepRecord = async (req, res) => {
  try {
    const record = await SleepData.findOne({ _id: req.params.id, userId: req.admin.id });
    if (!record) {
      return res.status(404).json({ message: "Record not found or not authorized" });
    }

    const { sleepTime, wakeTime, date, quality, notes } = req.body;

    if (sleepTime && !timeRegex.test(sleepTime)) {
      return res.status(400).json({ message: "sleepTime must be in HH:MM format" });
    }
    if (wakeTime && !timeRegex.test(wakeTime)) {
      return res.status(400).json({ message: "wakeTime must be in HH:MM format" });
    }

    const newSleepTime = sleepTime || record.sleepTime;
    const newWakeTime = wakeTime || record.wakeTime;

    record.sleepTime = newSleepTime;
    record.wakeTime = newWakeTime;
    record.sleepDuration = calcDuration(newSleepTime, newWakeTime);
    if (date) record.date = new Date(date);
    if (quality) record.quality = quality;
    if (notes !== undefined) record.notes = notes;

    await record.save();
    res.status(200).json({ message: "Record updated successfully", record });
  } catch (error) {
    res.status(500).json({ message: "Server error updating sleep record" });
  }
};

// @desc    Delete a sleep record
// @route   DELETE /api/sleep/delete/:id
// @access  Protected
const deleteSleepRecord = async (req, res) => {
  try {
    const record = await SleepData.findOneAndDelete({ _id: req.params.id, userId: req.admin.id });
    if (!record) {
      return res.status(404).json({ message: "Record not found or not authorized" });
    }
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting sleep record" });
  }
};

// @desc    Get sleep analytics
// @route   GET /api/sleep/analytics
// @access  Protected
const getSleepAnalytics = async (req, res) => {
  try {
    const records = await SleepData.find({ userId: req.admin.id }).sort({ date: 1 });

    if (records.length === 0) {
      return res.status(200).json({
        totalRecords: 0,
        averageSleepDuration: 0,
        todaySleep: 0,
        weekTotal: 0,
        weeklyTrend: [],
        qualityBreakdown: { Poor: 0, Fair: 0, Good: 0, Excellent: 0 },
      });
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Today's sleep
    const todayRecords = records.filter(
      (r) => new Date(r.date).toISOString().split("T")[0] === todayStr
    );
    const todaySleep = parseFloat(
      todayRecords.reduce((s, r) => s + r.sleepDuration, 0).toFixed(2)
    );

    // This week total
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);
    const weekRecords = records.filter((r) => new Date(r.date) >= weekStart);
    const weekTotal = parseFloat(
      weekRecords.reduce((s, r) => s + r.sleepDuration, 0).toFixed(2)
    );

    // Average
    const totalDuration = records.reduce((sum, r) => sum + r.sleepDuration, 0);
    const averageSleepDuration = parseFloat((totalDuration / records.length).toFixed(2));

    // Last 7 days trend
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      const dayRecs = records.filter(
        (r) => new Date(r.date).toISOString().split("T")[0] === key
      );
      last7.push({
        date: key,
        label,
        duration: parseFloat(dayRecs.reduce((s, r) => s + r.sleepDuration, 0).toFixed(2)),
      });
    }

    // Quality breakdown
    const qualityBreakdown = { Poor: 0, Fair: 0, Good: 0, Excellent: 0 };
    records.forEach((r) => {
      if (r.quality && qualityBreakdown[r.quality] !== undefined) {
        qualityBreakdown[r.quality]++;
      }
    });

    res.status(200).json({
      totalRecords: records.length,
      averageSleepDuration,
      todaySleep,
      weekTotal,
      weeklyTrend: last7,
      qualityBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching analytics" });
  }
};

module.exports = {
  addSleepRecord,
  getSleepHistory,
  updateSleepRecord,
  deleteSleepRecord,
  getSleepAnalytics,
};
