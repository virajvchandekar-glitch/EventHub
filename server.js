const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML, CSS and JavaScript
app.use(express.static(__dirname));

// Booking file
const bookingsFile = path.join(__dirname, "bookings.json");


// ================================
// HOME PAGE
// ================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// ================================
// CREATE BOOKING
// ================================

app.post("/api/book", (req, res) => {

    try {

        const {
            name,
            email,
            mobile,
            event,
            tickets,
            paymentMethod
        } = req.body;


        // Validation

        if (!name || name.trim().length < 2) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid name."
            });

        }


        if (
            !email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid email."
            });

        }


        if (
            !mobile ||
            !/^[0-9]{10}$/.test(mobile)
        ) {

            return res.status(400).json({
                success: false,
                message: "Mobile number must contain 10 digits."
            });

        }


        if (!event) {

            return res.status(400).json({
                success: false,
                message: "Please select an event."
            });

        }


        if (
            !tickets ||
            Number(tickets) < 1 ||
            Number(tickets) > 10
        ) {

            return res.status(400).json({
                success: false,
                message: "Tickets must be between 1 and 10."
            });

        }


        // Event prices

        const eventPrices = {

            "Tech Conference 2026": 999,

            "Music Festival": 1499,

            "Business Summit": 1199

        };


        const ticketPrice = eventPrices[event];


        if (!ticketPrice) {

            return res.status(400).json({
                success: false,
                message: "Invalid event selected."
            });

        }


        // Calculate total

        const totalAmount =
            ticketPrice * Number(tickets);


        // Generate booking ID

        const bookingId =
            "EVT" +
            Date.now().toString().slice(-6);


        // Create booking

        const booking = {

            bookingId: bookingId,

            name: name.trim(),

            email: email.trim(),

            mobile: mobile,

            event: event,

            tickets: Number(tickets),

            ticketPrice: ticketPrice,

            totalAmount: totalAmount,

            paymentMethod:
                paymentMethod || "Demo Payment",

            bookingDate:
                new Date().toLocaleString()

        };


        // Read existing bookings

        let bookings = [];


        if (fs.existsSync(bookingsFile)) {

            const data =
                fs.readFileSync(
                    bookingsFile,
                    "utf8"
                );

            if (data.trim() !== "") {

                bookings = JSON.parse(data);

            }

        }


        // Add booking

        bookings.push(booking);


        // Save booking

        fs.writeFileSync(

            bookingsFile,

            JSON.stringify(
                bookings,
                null,
                2
            )

        );


        // Send response

        res.status(201).json({

            success: true,

            message: "Booking successful!",

            booking: booking

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server error."

        });

    }

});


// ================================
// VIEW ALL BOOKINGS
// ================================

app.get("/api/bookings", (req, res) => {

    try {

        if (!fs.existsSync(bookingsFile)) {

            return res.json([]);

        }


        const data =
            fs.readFileSync(
                bookingsFile,
                "utf8"
            );


        const bookings =
            data.trim() === ""
                ? []
                : JSON.parse(data);


        res.json(bookings);


    } catch (error) {

        res.status(500).json({

            success: false,

            message: "Unable to load bookings."

        });

    }

});


// ================================
// 404 PAGE
// ================================

app.use((req, res) => {

    res.status(404).send(`
        <h1>404 - Page Not Found</h1>
        <p>The page you requested does not exist.</p>
        <a href="/">Go to EventHub</a>
    `);

});


// ================================
// START SERVER
// ================================

app.listen(PORT, () => {

    console.log("================================");
    console.log("EventHub Server Started");
    console.log("================================");
    console.log("Open: http://localhost:3000");
    console.log("================================");

});