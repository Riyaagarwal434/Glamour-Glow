const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const { sendBookingEmail, sendOwnerNotificationEmail } = require("../utils/email");

// Import slots
const slots = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00"
];


// ✅ 1. CREATE BOOKING (with double booking prevention)
router.post("/book", async (req, res) => {
  try {
    const { name, email, service, date, time } = req.body;

    // Check if slot already booked
    const existingBooking = await Booking.findOne({
      date,
      time,
      status: { $in: ["pending", "confirmed"] }
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "This slot is already booked ❌"
      });
    }

    const booking = new Booking({
      name,
      email,
      service,
      date,
      time
    });

    await booking.save();

    // Notify the salon owner (to approve or reject)
    sendOwnerNotificationEmail(booking).catch(err => {
      console.error("Failed to send owner notification email:", err);
    });

    // Send receipt email to the client
    sendBookingEmail(booking, "pending").catch(err => {
      console.error("Failed to send pending booking email to client:", err);
    });

    res.status(201).json({
      message: "Booking created successfully ✅",
      booking
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ 2. GET ALL BOOKINGS
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ 3. GET AVAILABLE SLOTS FOR A DATE
router.get("/available-slots/:date", async (req, res) => {
  try {
    const { date } = req.params;

    const bookings = await Booking.find({
      date,
      status: { $in: ["pending", "confirmed"] }
    });

    const bookedSlots = bookings.map(b => b.time);

    const availableSlots = slots.filter(
      slot => !bookedSlots.includes(slot)
    );

    res.json(availableSlots);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ 4. UPDATE BOOKING STATUS (for Accept/Reject later)
router.put("/booking/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (updatedBooking) {
      // Send status update email notification (asynchronously)
      sendBookingEmail(updatedBooking, status).catch(err => {
        console.error(`Failed to send ${status} booking email:`, err);
      });
    }

    res.json(updatedBooking);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ 5. DELETE BOOKING
router.delete("/booking/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted 🗑️" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ 6. APPROVE BOOKING FROM EMAIL LINK
router.get("/booking/approve/:id", async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "confirmed" },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).send(`
        <div style="font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 100px; color: #721c24; background-color: #f8d7da; padding: 40px; border-radius: 8px; max-width: 500px; margin: auto; border: 1px solid #f5c6cb;">
          <h2>Booking Not Found ❌</h2>
          <p>This booking request does not exist or has been deleted.</p>
        </div>
      `);
    }

    // Send confirmation email to client
    sendBookingEmail(updatedBooking, "confirmed").catch(err => {
      console.error("Failed to send confirmed email to client:", err);
    });

    res.send(`
      <div style="font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 100px; color: #155724; background-color: #d4edda; padding: 40px; border-radius: 8px; max-width: 500px; margin: auto; border: 1px solid #c3e6cb;">
        <h2>Appointment Approved Successfully! ✅</h2>
        <p>A confirmation email has been sent to client <strong>${updatedBooking.name}</strong> (<strong>${updatedBooking.email}</strong>) for their appointment on <strong>${updatedBooking.date}</strong> at <strong>${updatedBooking.time}</strong>.</p>
      </div>
    `);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

// ✅ 7. REJECT BOOKING FROM EMAIL LINK
router.get("/booking/reject/:id", async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).send(`
        <div style="font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 100px; color: #721c24; background-color: #f8d7da; padding: 40px; border-radius: 8px; max-width: 500px; margin: auto; border: 1px solid #f5c6cb;">
          <h2>Booking Not Found ❌</h2>
          <p>This booking request does not exist or has been deleted.</p>
        </div>
      `);
    }

    // Send rejection email to client
    sendBookingEmail(updatedBooking, "rejected").catch(err => {
      console.error("Failed to send rejected email to client:", err);
    });

    res.send(`
      <div style="font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 100px; color: #721c24; background-color: #f8d7da; padding: 40px; border-radius: 8px; max-width: 500px; margin: auto; border: 1px solid #f5c6cb;">
        <h2>Appointment Rejected ❌</h2>
        <p>A rejection notification email has been sent to client <strong>${updatedBooking.name}</strong> (<strong>${updatedBooking.email}</strong>).</p>
      </div>
    `);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});


module.exports = router;