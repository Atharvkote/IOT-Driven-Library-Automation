// controllers/whatsapp.controller.js
import twilio from "twilio";
import finesModel from "../models/fines.model.js";
import "dotenv/config";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendFineNotifications = async (fines) => {
  if (!fines?.length) {
    console.log("No fines to notify today.");
    return;
  }

  const populatedFines = await finesModel
    .find({ _id: { $in: fines.map((f) => f._id) } })
    .populate({
      path: "borrowedBook",
      populate: [
        { path: "student", select: "name prn_number whatsappNumber" },
        { path: "book", select: "title" },
      ],
    });

  for (const fine of populatedFines) {
    const student = fine.borrowedBook?.student;
    const book = fine.borrowedBook?.book;

    // if (!student?.whatsappNumber) {
    //   console.warn(`Skipping ${student?.name || "unknown"} — no WhatsApp number.`);
    //   continue;
    // }

    const msg = `
📚 *Library Fine Alert*  

Hello ${student.name},  
You have an unpaid fine of ₹${fine.amount}  
for returning *${book?.title || "a book"}* late.  

Reason: ${fine.reason}  
Please clear your dues at the library counter.  

Thank you,  
📖 Digital Library-TWIN
📖 Sanjivani SCOE
    `;

    try {
      await client.messages.create({
        from: process.env.TWILIO_FROM || "+14155238886",
        to: `whatsapp:+918830952127`,
        body: msg.trim(),
        mediaUrl: [
          "https://res.cloudinary.com/dgz7hqbl9/image/upload/v1761492761/Screenshot_2025-10-26_205811_spnyqs.png",
        ],
      });

      console.log(`✅ WhatsApp with image sent to ${student.name}`);
    } catch (error) {
      console.error(
        `❌ Failed to send message to ${student.name}: ${error.message}`
      );
    }
  }
};

export const sendWelcomeMessage = async (student) => {
  // if (!student?.whatsappNumber) {
  //   console.warn(
  //     `Skipping ${student?.name || "unknown"} — no WhatsApp number.`
  //   );
  //   return;
  // }

  const msg = `
🎉 *Welcome to the Digital Library!* 🎉

Hello ${student.name},  
We are excited to have you on board.  
Explore a vast collection of books, journals, and digital resources.  

Happy Reading!  
📖 Digital Library-TWIN
📖 Sanjivani SCOE
  `;

  try {
    await client.messages.create({
      from: process.env.TWILIO_FROM || "+14155238886", // e.g., 'whatsapp:+14155238886'
      to: `whatsapp:+918830952127`,
      body: msg.trim(),
      mediaUrl: [
        "https://res.cloudinary.com/dgz7hqbl9/image/upload/v1761492761/Screenshot_2025-10-26_205811_spnyqs.png", // welcome banner
      ],
    });

    console.log(`✅ Welcome message sent to ${student.name}`);
  } catch (error) {
    console.error(
      `❌ Failed to send welcome message to ${student.name}: ${error.message}`
    );
  }
};
