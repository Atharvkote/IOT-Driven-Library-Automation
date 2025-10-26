import Students from "../models/student.model.js";

// CREATE Student
export const createStudent = async (req, res) => {
  try {
    const data = req.body;

    // Required top-level fields
    const requiredFields = [
      "prn_number",
      "name",
      "class",
      "section",
      "gender",
      "rfid",
      "email",
      "contactNumber",
    ];
    for (let field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // RFID validation (expecting object with hex & decimal)
    if (typeof data.rfid !== "object" || !data.rfid.hex || !data.rfid.decimal) {
      return res
        .status(400)
        .json({ message: "RFID must include both hex and decimal values" });
    }

    // Prevent duplicates (using PRN or RFID)
    const existing = await Students.findOne({
      $or: [
        { prn_number: data.prn_number },
        { "rfid.hex": data.rfid.hex },
        { "rfid.decimal": data.rfid.decimal },
      ],
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Student with this PRN or RFID already exists" });
    }

    // Create new student
    const student = await Students.create(data);
    res.status(201).json({ message: "Student created successfully", student });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE Student by PRN or ID
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params; // could be _id or prn_number

    const student = await Students.findOneAndDelete({
      $or: [{ _id: id }, { prn_number: id }],
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully", student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// UPDATE Student
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const student = await Students.findOneAndUpdate(
      { $or: [{ _id: id }, { prn_number: id }] },
      data,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student updated successfully", student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET Student by PRN, ID, or RFID
export const getStudent = async (req, res) => {
  try {
    const { id, rfid } = req?.body;

    let student;

    if (rfid) {
      const normalizedRFID = rfid.replace(/\s/g, "").toUpperCase();
      student = await Students.findOne({
        $or: [
          { "rfid.hex": normalizedRFID },
          { "rfid.decimal": normalizedRFID },
        ],
      });
    } else if (id) {
      student = await Students.findOne({ prn_number: id });
    } else {
      return res
        .status(400)
        .json({ message: "Provide ID or RFID to fetch student" });
    }

    if (!student) {
      console.error("Student not found with provided identifier");
      return res.status(404).json({ message: "Student not Found" });

    }

    res.status(200).json({ message: "Student Found !!!!!", student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
