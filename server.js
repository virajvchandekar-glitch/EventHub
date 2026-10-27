const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(__dirname));

// Booking file
const bookingsFile = path.join(__dirname, "bookings.json");

// Make sure bookings.json exists
if (!fs.existsSync(bookingsFile)) {
    fs.writeFileSync(bookingsFile, "[]");
}

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Submit booking
app.post("/submit", (req, res) => {
    try {
        const {
            name,
            email,
            mobile,
            event,
            tickets,
            ticketPrice,
            totalAmount,
            paymentMethod
        } = req.body;

        // Server-side validation
        if (!name || !email || !mobile || !event || !tickets) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: "Mobile number must contain 10 digits."
            });
        }

        // Generate booking ID
        const bookingId =
            "EVT" + Math.floor(100000 + Math.random() * 900000);

        const booking = {
            bookingId,
            name,
            email,
            mobile,
            event,
            tickets: Number(tickets),
            ticketPrice: Number(ticketPrice),
            totalAmount: Number(totalAmount),
            paymentMethod,
            bookingDate: new Date().toLocaleString()
        };

        // Read existing bookings
        const bookings = JSON.parse(
            fs.readFileSync(bookingsFile, "utf8")
        );

        // Add new booking
        bookings.push(booking);

        // Save booking
        fs.writeFileSync(
            bookingsFile,
            JSON.stringify(bookings, null, 2)
        );

        res.json({
            success: true,
            message: "Booking confirmed successfully!",
            booking
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error. Please try again."
        });
    }
});

// View all bookings
app.get("/submissions", (req, res) => {
    try {
        const bookings = JSON.parse(
            fs.readFileSync(bookingsFile, "utf8")
        );

        res.json(bookings);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to load bookings."
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Page not found."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`EventHub server running on port ${PORT}`);
});