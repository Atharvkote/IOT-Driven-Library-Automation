import Section from "../models/section.model.js"; // adjust path

export const incrementVisit = async (req, res) => {
  try {
    const { sectionName } = req.body;

    if (!sectionName) {
      return res.status(400).json({ message: "Section name is required" });
    }

    const section = await Section.findOneAndUpdate(
      { sectionName: sectionName.toUpperCase() },
      { $inc: { visitCount: 1 } },   // Increment visit count
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if(!section) return res.status(404).json({ message: "Section not found" });

    res.status(200).json({
      message: "Visit count updated",
      section,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating visit count", error });
  }
};


export const incrementBooksBought = async (req, res) => {
  try {
    const { sectionName } = req.body;

    if (!sectionName) {
      return res.status(400).json({ message: "Section name is required" });
    }

    const section = await SectionStats.findOneAndUpdate(
      { sectionName: sectionName.toUpperCase() },
      { $inc: { booksBoughtCount: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: "Books bought count updated",
      section,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating books bought count", error });
  }
};
