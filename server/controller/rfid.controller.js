import Students from "../models/student.model.js";
import Scans from "../models/scans.model.js";
import { io } from "../server.js";
import { sendWelcomeMessage } from "../utils/twilio.js";

export const rfidScan = async (req, res) => {
  try {
    const { uid_hex, uid_dec } = req.body; // Read same as ESP32 sends

    if (!uid_hex && !uid_dec) {
      return res.status(400).json({ message: "UID is required!" });
    }

    const normalizedHex = uid_hex?.toUpperCase() || "";
    const normalizedDec = uid_dec?.toString() || "";

    // Find the student
    const student = await Students.findOne({
      $or: [{ "rfid.hex": normalizedHex }, { "rfid.decimal": normalizedDec }],
    });

    if (!student) {
      return res.status(404).json({ message: "Student Not Found !!" });
    }

    // Create a scan record
    const scan = await Scans.create({
      student: student._id,
      scannedAt: new Date(), // Current timestamp
      rfid: {
        hex: normalizedHex,
        decimal: normalizedDec,
      },
      scanType: "in",
      location: "Main Desk",
    });

    // EMIT TO FRONTEND
    io.emit("new-scan", { student, scan, message: "You Can Enter Now !!!" });
    sendWelcomeMessage(student);
    res.status(200).json({
      message: "You Can Enter Now !!!",
      student,
      scan,
    });
  } catch (error) {
    console.error("RFID Scan Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLatestScan = async (req, res) => {
  try {
    console.log("Fetching the most recent scan...");
    // Calculate 5 seconds ago
    const fiveSecondsAgo = new Date(Date.now() - 5000);

    // Find the most recent scan within last 5 seconds
    const recentScan = await Scans.findOne({})
      .sort({ scannedAt: -1 })
      .populate("student") // Fill student details
      .lean();

    if (!recentScan) {
      return res.status(404).json({ message: "No scan in the last 5 seconds" });
    }

    console.log("Recent scan found:", recentScan);

    res.status(200).json({
      message: "Recent scan retrieved",
      scan: recentScan,
    });
  } catch (error) {
    console.error("Error fetching recent scan:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const isRfidActive = async (req, res) => {
  try {
    const { prn_number } = req.body;

    if (!prn_number) {
      return res.status(400).json({ success: false, message: "PRN number is required" });
    }

    const student = await Students.findOne({ prn_number: prn_number.toUpperCase() });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const latestScanToday = await Scans.findOne({
      student: student._id,
      scannedAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ scannedAt: -1 }) // get most recent
      .lean();

    const isActive = latestScanToday?.scanType === "in";

    return res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        prn_number: student.prn_number,
        name: student.name,
        class: student.class,
        section: student.section,
        rollNo: student.rollNo,
        gender: student.gender,
        contactNumber: student.contactNumber,
        email: student.email,
        photo: student.photo,
        rfid: student.rfid,
        credits: student.credits,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      },
      isActive,
      latestScan: latestScanToday || null,
      message: latestScanToday
        ? `Last scan today was '${latestScanToday.scanType}'.`
        : "No scans found for today.",
    });
  } catch (error) {
    console.error("Error checking RFID activity:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};