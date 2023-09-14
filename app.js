const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

// Local variables to store data
const rooms = [];
const bookings = [];
const customers = [];

// Function to check if a room is available for booking on a specific date and time
function isRoomAvailable(roomId, date, startTime, endTime) {
  return !bookings.some(
    (booking) =>
      booking.roomId === roomId &&
      booking.date === date &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime))
  );
}

// Create a Room
app.post("/rooms", (req, res) => {
  const { numberOfSeats, amenities, pricePerHour } = req.body;

  // Input validation - Check if required fields are provided
  if (!numberOfSeats || !pricePerHour) {
    return res
      .status(400)
      .json({ error: "Please provide numberOfSeats and pricePerHour." });
  }

  // Create a new room object
  const room = {
    id: rooms.length + 1,
    numberOfSeats,
    amenities: amenities || [],
    pricePerHour,
  };

  rooms.push(room);

  res.status(201).json(room);
});

// Book a Room
app.post("/bookings", (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  // Input validation - Check if required fields are provided
  if (!customerName || !date || !startTime || !endTime || !roomId) {
    return res
      .status(400)
      .json({
        error:
          "Please provide customerName, date, startTime, endTime, and roomId.",
      });
  }

  // Check if the room is available
  if (!isRoomAvailable(roomId, date, startTime, endTime)) {
    return res
      .status(400)
      .json({ error: "Room is already booked for the same date and time." });
  }

  // Create a new booking object
  const booking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
  };

  bookings.push(booking);

  // Update the customer list if the customer is new
  if (!customers.some((customer) => customer.name === customerName)) {
    customers.push({ name: customerName });
  }

  res.status(201).json(booking);
});

// List all Rooms with Booked Data
app.get("/rooms/booked", (req, res) => {
  const result = rooms.map((room) => {
    const booking = bookings.find((b) => b.roomId === room.id);
    return {
      roomName: `Room ${room.id}`,
      bookedStatus: booking ? "Booked" : "Available",
      customerName: booking ? booking.customerName : null,
      date: booking ? booking.date : null,
      startTime: booking ? booking.startTime : null,
      endTime: booking ? booking.endTime : null,
    };
  });
  res.json(result);
});

// List all Customers with Booked Data
app.get("/customers/booked", (req, res) => {
  const result = customers.map((customer) => {
    const booking = bookings.find((b) => b.customerName === customer.name);
    return {
      customerName: customer.name,
      roomName: booking ? `Room ${booking.roomId}` : null,
      date: booking ? booking.date : null,
      startTime: booking ? booking.startTime : null,
      endTime: booking ? booking.endTime : null,
    };
  });
  res.json(result);
});

// Count How Many Times a Customer Has Booked a Room
app.get("/customers/booking-count", (req, res) => {
  const { customerName } = req.query;
  const customerBookings = bookings.filter(
    (b) => b.customerName === customerName
  );
  res.json({
    customerName,
    bookingCount: customerBookings.length,
    bookings: customerBookings,
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
