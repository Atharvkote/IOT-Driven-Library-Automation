import Book from "../models/book.model.js";

export const createBook = async (req, res) => {
  try {
    const data = req.body;

    // Required fields
    const requiredFields = ["title", "author", "isbn", "section"];
    for (let field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const book = await Book.create(data);
    res.status(201).json({ message: "Book created successfully", book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get all books
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json({ books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get a single book by ID or book_id
export const getBook = async (req, res) => {
  try {
    console.log("Fetching book with identifier:", req.params.id);
    const { id } = req.params;
    const book = await Book.findOne( { book_id: id });
    if (!book) return res.status(404).json({ message: "Book not found" });

    res.status(200).json({ book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Update a book
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const book = await Book.findOneAndUpdate(
      { $or: [{ _id: id }, { book_id: id }] },
      updatedData,
      { new: true }
    );

    if (!book) return res.status(404).json({ message: "Book not found" });

    res.status(200).json({ message: "Book updated successfully", book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete a book
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOneAndDelete({ $or: [{ _id: id }, { book_id: id }] });
    if (!book) return res.status(404).json({ message: "Book not found" });

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
