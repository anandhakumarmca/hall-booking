const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

// Local variables to store data
const rooms = [
  {
    id: 1,
    roomName: "Room 1",
    numberOfSeats: 50,
    amenities: ["Projector", "Whiteboard"],
    pricePerHour: 100,
  },
  {
    id: 2,
    roomName: "Room 2",
    numberOfSeats: 25,
    amenities: ["Blackboard"],
    pricePerHour: 50,
  },
];

const bookings = [
  {
    id: 1,
    roomName: "Room 1",
    customerName: "Anandh",
    date: "2023-09-14",
    startTime: "09:00 AM",
    endTime: "11:00 AM",
  },
  {
    id: 2,
    roomName: "Room 2",
    customerName: "Arun",
    date: "2023-09-15",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
  },
];

const customers = [
  {
    name: "Anandh",
  },
  {
    name: "Arun",
  },
];
const customerNames = ["Anandh","Arun"];

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

//1. Room Creation
app.post("/createRoom", (req, res) => {
  const { roomName, numberOfSeats, amenities, pricePerHour } = req.body;

  // Input validation - Check if required fields are provided
  if ( !numberOfSeats || !amenities || !pricePerHour) {
    return res
      .status(400)
      .json({ error: "Please Provide numberOfSeats, amenities, pricePerHour" });
  }

  // Create a new room object
  const room = {
    id: rooms.length + 1,
    roomName: `Room ${rooms.length + 1}`,
    numberOfSeats,
    amenities: amenities || [],
    pricePerHour,
  };

  rooms.push(room);

  // Update the local variable with booking details for this room
    const booking = bookings.find((b) => b.roomId === room.id);
    if (booking) {
      room.bookedStatus = "Booked";
      room.customerName = booking.customerName;
      room.date = booking.date;
      room.startTime = booking.startTime;
      room.endTime = booking.endTime;
    } else {
      room.bookedStatus = "Available";
    }

  res.status(201).send({ message: `Room  created successfully room name: ${room.roomName}` });
});

// 2. Room Booking
app.post("/bookRoom", (req, res) => {
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
    roomName: rooms.find((room) => room.id === roomId).roomName,
  };

  bookings.push(booking);

  // Update the customer list if the customer is new
  if (!customerNames.includes(customerName)) {
    customers.push({ name: customerName });
    customerNames.push(customerName);
  }

  res.status(201).json(booking);
});

//3. List all Rooms with Booked Data
app.get("/rooms/booked", (req, res) => {
  const result = rooms.map((room) => {
    const booking = bookings.find((b) => b.roomId === room.id);
    return {
      roomName: room.roomName,
      bookedStatus: booking ? "Booked" : "Available",
      customerName: booking ? booking.customerName : null,
      date: booking ? booking.date : null,
      startTime: booking ? booking.startTime : null,
      endTime: booking ? booking.endTime : null,
    };
  });
  res.json(result);
});

//4. List all Customers with Booked Data
app.get("/customers/booked", (req, res) => {
  const result = customers.map((customer) => {
    const booking = bookings.find((b) => b.customerName === customer.name);
    return {
      customerName: customer.name,
      roomName: booking ? booking.roomName : null,
      date: booking ? booking.date : null,
      startTime: booking ? booking.startTime : null,
      endTime: booking ? booking.endTime : null,
    };
  });
  res.json(result);
});

//5. Count How Many Times a Customer Has Booked a Room
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
