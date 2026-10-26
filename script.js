/* =========================================
   EVENTHUB JAVASCRIPT
========================================= */


/* ---------- EVENT DATA ---------- */

const eventPrices = {
    "Tech Conference 2026": 999,
    "Music Festival": 1499,
    "Business Summit": 1199
};


/* ---------- CURRENT SELECTED EVENT ---------- */

let selectedEventPrice = 0;


/* ---------- SELECT EVENT ---------- */

function selectEvent(eventName, price) {

    // Select event in dropdown
    document.getElementById("event").value = eventName;

    // Store price
    selectedEventPrice = price;

    // Display ticket price
    document.getElementById("ticketPrice").value =
        "₹" + price.toLocaleString("en-IN");

    // Calculate total
    calculateTotal();

    // Scroll to booking section
    document.getElementById("booking").scrollIntoView({
        behavior: "smooth"
    });
}


/* ---------- EVENT DROPDOWN CHANGE ---------- */

document.getElementById("event").addEventListener("change", function () {

    const selectedEvent = this.value;

    if (selectedEvent === "") {

        selectedEventPrice = 0;

        document.getElementById("ticketPrice").value = "₹0";

        document.getElementById("totalAmount").value = "₹0";

        return;
    }

    selectedEventPrice = eventPrices[selectedEvent];

    document.getElementById("ticketPrice").value =
        "₹" + selectedEventPrice.toLocaleString("en-IN");

    calculateTotal();
});


/* ---------- CALCULATE TOTAL ---------- */

function calculateTotal() {

    const tickets =
        parseInt(document.getElementById("tickets").value) || 0;

    const total = selectedEventPrice * tickets;

    document.getElementById("totalAmount").value =
        "₹" + total.toLocaleString("en-IN");
}


/* ---------- TICKET NUMBER CHANGE ---------- */

document.getElementById("tickets").addEventListener(
    "input",
    calculateTotal
);


/* ---------- FORM SUBMISSION ---------- */

document.getElementById("bookingForm").addEventListener(
    "submit",
    function (event) {

        // Prevent normal form submission
        event.preventDefault();


        /* ---------- GET VALUES ---------- */

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const mobile =
            document.getElementById("mobile").value.trim();

        const selectedEvent =
            document.getElementById("event").value;

        const tickets =
            parseInt(document.getElementById("tickets").value);

        const total =
            selectedEventPrice * tickets;


        /* ---------- CLEAR ERRORS ---------- */

        document.getElementById("nameError").textContent = "";
        document.getElementById("emailError").textContent = "";
        document.getElementById("mobileError").textContent = "";
        document.getElementById("eventError").textContent = "";


        let isValid = true;


        /* ---------- NAME VALIDATION ---------- */

        if (name.length < 2) {

            document.getElementById("nameError").textContent =
                "Please enter your full name.";

            isValid = false;
        }


        /* ---------- EMAIL VALIDATION ---------- */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            document.getElementById("emailError").textContent =
                "Please enter a valid email address.";

            isValid = false;
        }


        /* ---------- MOBILE VALIDATION ---------- */

        const mobilePattern =
            /^[0-9]{10}$/;

        if (!mobilePattern.test(mobile)) {

            document.getElementById("mobileError").textContent =
                "Mobile number must contain exactly 10 digits.";

            isValid = false;
        }


        /* ---------- EVENT VALIDATION ---------- */

        if (selectedEvent === "") {

            document.getElementById("eventError").textContent =
                "Please select an event.";

            isValid = false;
        }


        /* ---------- TICKET VALIDATION ---------- */

        if (
            isNaN(tickets) ||
            tickets < 1 ||
            tickets > 10
        ) {

            alert("Please select between 1 and 10 tickets.");

            isValid = false;
        }


        /* ---------- STOP IF INVALID ---------- */

        if (!isValid) {
            return;
        }


        /* ---------- PAYMENT SIMULATION ---------- */

        const paymentMethod =
            document.querySelector(
                'input[name="payment"]:checked'
            ).value;


        /* ---------- GENERATE BOOKING ID ---------- */

        const bookingId =
            "EVT" +
            Date.now().toString().slice(-6);


        /* ---------- SHOW CONFIRMATION ---------- */

        const confirmation =
            document.getElementById("confirmation");

        confirmation.style.display = "block";

        confirmation.innerHTML = `

            <h4>
                🎉 Booking Confirmed!
            </h4>

            <p>
                <strong>Booking ID:</strong>
                ${bookingId}
            </p>

            <p>
                <strong>Name:</strong>
                ${name}
            </p>

            <p>
                <strong>Email:</strong>
                ${email}
            </p>

            <p>
                <strong>Event:</strong>
                ${selectedEvent}
            </p>

            <p>
                <strong>Tickets:</strong>
                ${tickets}
            </p>

            <p>
                <strong>Payment:</strong>
                ${paymentMethod}
            </p>

            <p>
                <strong>Total Paid:</strong>
                ₹${total.toLocaleString("en-IN")}
            </p>

            <hr>

            <p>
                🎟️ Your digital ticket will be sent to
                <strong>${email}</strong>.
            </p>

            <p>
                Please save your Booking ID:
                <strong>${bookingId}</strong>
            </p>
        `;


        /* ---------- SCROLL TO CONFIRMATION ---------- */

        confirmation.scrollIntoView({
            behavior: "smooth"
        });

    }
);