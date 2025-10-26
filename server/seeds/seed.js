import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "../models/book.model.js";

dotenv.config();

const booksData = [
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    publisher: "MIT Press",
    isbn: "9780262033848",
    section: "Computer Science",
    genre: "Algorithms",
    language: "English",
    publicationYear: 2009,
    totalCopies: 5,
    availableCopies: 5,
    description: "Comprehensive introduction to algorithms and data structures."
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    publisher: "Prentice Hall",
    isbn: "9780132350884",
    section: "Computer Science",
    genre: "Software Engineering",
    language: "English",
    publicationYear: 2008,
    totalCopies: 4,
    availableCopies: 4,
    description: "A handbook of agile software craftsmanship."
  },
  {
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell, Peter Norvig",
    publisher: "Pearson",
    isbn: "9780136042594",
    section: "Computer Science",
    genre: "Artificial Intelligence",
    language: "English",
    publicationYear: 2010,
    totalCopies: 6,
    availableCopies: 6,
    description: "Standard reference for AI concepts, algorithms, and applications."
  },
  {
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    publisher: "Pearson",
    isbn: "9780132126953",
    section: "Computer Science",
    genre: "Networking",
    language: "English",
    publicationYear: 2011,
    totalCopies: 5,
    availableCopies: 5,
    description: "Comprehensive guide to computer networking concepts and protocols."
  },
  {
    title: "Database System Concepts",
    author: "Abraham Silberschatz",
    publisher: "McGraw-Hill",
    isbn: "9780073523323",
    section: "Computer Science",
    genre: "Databases",
    language: "English",
    publicationYear: 2010,
    totalCopies: 4,
    availableCopies: 4,
    description: "Core concepts of database systems with practical examples."
  },
  {
    title: "Operating System Concepts",
    author: "Abraham Silberschatz",
    publisher: "Wiley",
    isbn: "9781118063330",
    section: "Computer Science",
    genre: "Operating Systems",
    language: "English",
    publicationYear: 2012,
    totalCopies: 6,
    availableCopies: 6,
    description: "Fundamentals of modern operating systems."
  },
  {
    title: "Computer Organization and Design",
    author: "David A. Patterson",
    publisher: "Morgan Kaufmann",
    isbn: "9780124077263",
    section: "Computer Science",
    genre: "Computer Architecture",
    language: "English",
    publicationYear: 2013,
    totalCopies: 5,
    availableCopies: 5,
    description: "Covers hardware design, CPU, memory, and I/O architecture."
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    publisher: "Addison-Wesley",
    isbn: "9780201616224",
    section: "Computer Science",
    genre: "Software Engineering",
    language: "English",
    publicationYear: 1999,
    totalCopies: 4,
    availableCopies: 4,
    description: "Best practices for software development and career growth."
  },
  {
    title: "Design Patterns",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    publisher: "Addison-Wesley",
    isbn: "9780201633610",
    section: "Computer Science",
    genre: "Software Engineering",
    language: "English",
    publicationYear: 1994,
    totalCopies: 3,
    availableCopies: 3,
    description: "Elements of reusable object-oriented software design."
  },
  {
    title: "Introduction to Machine Learning",
    author: "Ethem Alpaydin",
    publisher: "MIT Press",
    isbn: "9780262012430",
    section: "Computer Science",
    genre: "Machine Learning",
    language: "English",
    publicationYear: 2010,
    totalCopies: 4,
    availableCopies: 4,
    description: "Foundational concepts and techniques in machine learning."
  },
  {
    title: "Deep Learning",
    author: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
    publisher: "MIT Press",
    isbn: "9780262035613",
    section: "Computer Science",
    genre: "Machine Learning",
    language: "English",
    publicationYear: 2016,
    totalCopies: 5,
    availableCopies: 5,
    description: "Comprehensive book on deep learning techniques and architectures."
  },
  {
    title: "Pattern Recognition and Machine Learning",
    author: "Christopher M. Bishop",
    publisher: "Springer",
    isbn: "9780387310732",
    section: "Computer Science",
    genre: "Machine Learning",
    language: "English",
    publicationYear: 2006,
    totalCopies: 4,
    availableCopies: 4,
    description: "Statistical techniques in machine learning and pattern recognition."
  },
  {
    title: "Python Crash Course",
    author: "Eric Matthes",
    publisher: "No Starch Press",
    isbn: "9781593279288",
    section: "Computer Science",
    genre: "Programming",
    language: "English",
    publicationYear: 2015,
    totalCopies: 5,
    availableCopies: 5,
    description: "Hands-on, project-based introduction to Python programming."
  },
  {
    title: "Effective Java",
    author: "Joshua Bloch",
    publisher: "Addison-Wesley",
    isbn: "9780134685991",
    section: "Computer Science",
    genre: "Programming",
    language: "English",
    publicationYear: 2017,
    totalCopies: 4,
    availableCopies: 4,
    description: "Best practices for Java programming."
  },
  {
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    publisher: "O'Reilly Media",
    isbn: "9780596517748",
    section: "Computer Science",
    genre: "Programming",
    language: "English",
    publicationYear: 2008,
    totalCopies: 3,
    availableCopies: 3,
    description: "Core concepts and best practices in JavaScript."
  },
  {
    title: "Computer Graphics: Principles and Practice",
    author: "John F. Hughes",
    publisher: "Addison-Wesley",
    isbn: "9780321399526",
    section: "Computer Science",
    genre: "Graphics",
    language: "English",
    publicationYear: 2013,
    totalCopies: 4,
    availableCopies: 4,
    description: "Fundamentals of computer graphics and rendering techniques."
  },
  {
    title: "Compilers: Principles, Techniques, and Tools",
    author: "Alfred V. Aho",
    publisher: "Pearson",
    isbn: "9780321486813",
    section: "Computer Science",
    genre: "Compilers",
    language: "English",
    publicationYear: 2006,
    totalCopies: 4,
    availableCopies: 4,
    description: "Classic textbook on compiler design and construction."
  },
  {
    title: "Digital Design and Computer Architecture",
    author: "David Harris, Sarah Harris",
    publisher: "Morgan Kaufmann",
    isbn: "9780123944245",
    section: "Computer Science",
    genre: "Computer Architecture",
    language: "English",
    publicationYear: 2012,
    totalCopies: 5,
    availableCopies: 5,
    description: "Digital logic design and computer architecture concepts."
  },
  {
    title: "Introduction to the Theory of Computation",
    author: "Michael Sipser",
    publisher: "Cengage",
    isbn: "9781133187790",
    section: "Computer Science",
    genre: "Theory",
    language: "English",
    publicationYear: 2012,
    totalCopies: 4,
    availableCopies: 4,
    description: "Formal languages, automata, and computational theory."
  },
  {
    title: "Data Structures and Algorithms in Java",
    author: "Robert Lafore",
    publisher: "Sams Publishing",
    isbn: "9780672324536",
    section: "Computer Science",
    genre: "Algorithms",
    language: "English",
    publicationYear: 2002,
    totalCopies: 4,
    availableCopies: 4,
    description: "Comprehensive guide to Java data structures and algorithms."
  },
  {
    title: "Computer Security: Principles and Practice",
    author: "William Stallings",
    publisher: "Pearson",
    isbn: "9780134794105",
    section: "Computer Science",
    genre: "Security",
    language: "English",
    publicationYear: 2014,
    totalCopies: 5,
    availableCopies: 5,
    description: "Covers security concepts, cryptography, and system security."
  },
  {
    title: "Cryptography and Network Security",
    author: "William Stallings",
    publisher: "Pearson",
    isbn: "9780134444284",
    section: "Computer Science",
    genre: "Security",
    language: "English",
    publicationYear: 2016,
    totalCopies: 4,
    availableCopies: 4,
    description: "Foundations of cryptography and network security protocols."
  },
  {
    title: "Artificial Intelligence for Humans",
    author: "Jeff Heaton",
    publisher: "Heaton Research",
    isbn: "9780997092902",
    section: "Computer Science",
    genre: "Artificial Intelligence",
    language: "English",
    publicationYear: 2013,
    totalCopies: 4,
    availableCopies: 4,
    description: "Practical introduction to AI and machine learning techniques."
  },
  {
    title: "Big Data: Principles and Best Practices",
    author: "Jill Dyché",
    publisher: "IBM Press",
    isbn: "9780137035022",
    section: "Computer Science",
    genre: "Big Data",
    language: "English",
    publicationYear: 2011,
    totalCopies: 3,
    availableCopies: 3,
    description: "Overview of big data technologies, architectures, and best practices."
  },
  {
    title: "Computer Vision: Algorithms and Applications",
    author: "Richard Szeliski",
    publisher: "Springer",
    isbn: "9781848829343",
    section: "Computer Science",
    genre: "Computer Vision",
    language: "English",
    publicationYear: 2010,
    totalCopies: 4,
    availableCopies: 4,
    description: "Techniques, algorithms, and applications in computer vision."
  },
  {
    title: "Introduction to Information Retrieval",
    author: "Christopher D. Manning",
    publisher: "Cambridge University Press",
    isbn: "9780521865715",
    section: "Computer Science",
    genre: "Information Retrieval",
    language: "English",
    publicationYear: 2008,
    totalCopies: 4,
    availableCopies: 4,
    description: "Covers search engines, retrieval models, and text processing."
  },
  {
    title: "Programming Pearls",
    author: "Jon Bentley",
    publisher: "Addison-Wesley",
    isbn: "9780201657883",
    section: "Computer Science",
    genre: "Programming",
    language: "English",
    publicationYear: 1986,
    totalCopies: 3,
    availableCopies: 3,
    description: "Problem-solving and programming techniques."
  },
  {
    title: "Introduction to Embedded Systems",
    author: "Shibu K. V.",
    publisher: "Tata McGraw-Hill",
    isbn: "9780070682193",
    section: "Computer Science",
    genre: "Embedded Systems",
    language: "English",
    publicationYear: 2010,
    totalCopies: 3,
    availableCopies: 3,
    description: "Fundamentals of embedded system design and programming."
  },
  {
    title: "Learning Python",
    author: "Mark Lutz",
    publisher: "O'Reilly Media",
    isbn: "9781449355739",
    section: "Computer Science",
    genre: "Programming",
    language: "English",
    publicationYear: 2013,
    totalCopies: 5,
    availableCopies: 5,
    description: "Comprehensive guide to Python programming language."
  },
  {
    title: "Computer Simulation and Modeling",
    author: "Harold M. Klee",
    publisher: "Wiley",
    isbn: "9780471431075",
    section: "Computer Science",
    genre: "Simulation",
    language: "English",
    publicationYear: 2005,
    totalCopies: 3,
    availableCopies: 3,
    description: "Techniques and tools for computer simulation and modeling."
  }
];

// MANUALLY generate book_id to avoid duplicate key error
booksData.forEach((book, idx) => {
  const prefix = book.section.match(/\b\w/g).join("").toUpperCase();
  book.book_id = `${prefix}-${String(idx + 1).padStart(4, "0")}`;
});

const seedBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB, seeding CS/IT books...");

    await Book.deleteMany({});
    await Book.insertMany(booksData);

    console.log("Books inserted successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding books:", error);
    process.exit(1);
  }
};

seedBooks();
