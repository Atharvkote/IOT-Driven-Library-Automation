import Book from "../models/book.model.js";
import BorrowedBook from "../models/borrowed-books.model.js";
import Section from "../models/section.model.js";

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

// Get books with stock analytics (issue counts, shelf visits, demand scores)
export const getBooksWithStockAnalytics = async (req, res) => {
  try {
    console.log("getBooksWithStockAnalytics called");
    // Get all books
    const books = await Book.find().lean();
    console.log(`Found ${books.length} books`);

    // Get all borrow records to count issues per book
    const borrowRecords = await BorrowedBook.find().lean();
    
    // Count issues per book
    const issueCounts = {};
    borrowRecords.forEach(record => {
      const bookId = record.book?.toString();
      if (bookId) {
        issueCounts[bookId] = (issueCounts[bookId] || 0) + 1;
      }
    });

    // Get section visit counts
    const sections = await Section.find().lean();
    const sectionVisits = {};
    sections.forEach(section => {
      sectionVisits[section.sectionName?.toUpperCase()] = section.visitCount || 0;
    });

    // Calculate max values for normalization
    const maxIssues = Math.max(...Object.values(issueCounts), 1);
    const maxVisits = Math.max(...Object.values(sectionVisits), 1);

    // Enrich books with analytics
    const booksWithAnalytics = books.map(book => {
      const timesIssued = issueCounts[book._id.toString()] || 0;
      const shelfVisits = sectionVisits[book.section?.toUpperCase()] || 0;
      
      // Calculate demand score (0-100)
      // Weight: 60% issues, 40% visits
      const issueScore = (timesIssued / maxIssues) * 60;
      const visitScore = (shelfVisits / maxVisits) * 40;
      const demandScore = Math.round(issueScore + visitScore);

      // Determine status
      let status = "moderate";
      if (demandScore > 85) status = "hot";
      else if (demandScore > 70) status = "popular";

      return {
        ...book,
        currentStock: book.availableCopies || 0,
        totalCopies: book.totalCopies || 0,
        timesIssued,
        shelfVisits,
        demandScore,
        status
      };
    });

    // Sort by demand score (descending)
    booksWithAnalytics.sort((a, b) => b.demandScore - a.demandScore);

    res.status(200).json({
      success: true,
      books: booksWithAnalytics,
      sections: sections.map(s => ({
        name: s.sectionName,
        visits: s.visitCount || 0
      }))
    });
  } catch (error) {
    console.error("Error fetching books with stock analytics:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};