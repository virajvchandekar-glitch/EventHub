/* EventHub frontend demo: saves profile and bookings in this browser only. */
"use strict";

const EVENTS = [
  { id: "tech", name: "Tech Conference 2026", category: "Technology", price: 999, date: "15 Nov 2026", time: "10:00 AM", venue: "Innovation Hall, Pune", description: "Meet curious minds and explore technology shaping tomorrow.", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85" },
  { id: "musicfest", name: "Music Festival", category: "Music", price: 1499, date: "21 Nov 2026", time: "5:30 PM", venue: "Riverside Grounds, Pune", description: "Big sound, bright lights, and a night made for singing along.", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=85" },
  { id: "business", name: "Business Summit", category: "Business", price: 1199, date: "28 Nov 2026", time: "9:30 AM", venue: "Grand Convention Centre, Pune", description: "Connect with founders and ambitious people ready to turn ideas into action.", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=85" },
  { id: "gaming", name: "Ultimate Gaming Championship", category: "Gaming", price: 499, date: "6 Dec 2026", time: "11:00 AM", venue: "Arena Gaming Lounge, Pune", description: "Bring your skills, build your squad, and compete in esports.", image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=900&q=85" },
  { id: "comedy", name: "Stand-Up Comedy Night", category: "Comedy", price: 399, date: "12 Dec 2026", time: "7:00 PM", venue: "The Laugh Room, Pune", description: "A live night of punchlines, relatable stories, and laughs.", image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=900&q=85" },
  { id: "concert", name: "Live Concert Experience", category: "Music", price: 1299, date: "19 Dec 2026", time: "6:00 PM", venue: "Open Air Amphitheatre, Pune", description: "Feel the bass, catch the lights, and enjoy a live performance.", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85" },
  { id: "esports", name: "College E-Sports Tournament", category: "Gaming", price: 299, date: "10 Jan 2027", time: "10:00 AM", venue: "Campus Esports Arena, Pune", description: "A friendly but fierce competition for campus gamers.", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=85" },
  { id: "openmic", name: "Open Mic & Poetry Night", category: "Entertainment", price: 199, date: "16 Jan 2027", time: "6:30 PM", venue: "The Creative Corner, Pune", description: "Share a poem, tell a story, or enjoy a night of creativity.", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85" },
  { id: "startup", name: "Startup Pitch Battle", category: "Business", price: 599, date: "24 Jan 2027", time: "11:00 AM", venue: "Founders Hub, Pune", description: "Watch bold ideas take the stage and meet future builders.", image: "https://images.unsplash.com/photo-1559223607-a43c990c692c?auto=format&fit=crop&w=900&q=85" },
  { id: "football", name: "Football Championship", category: "Sports", price: 349, date: "31 Jan 2027", time: "4:00 PM", venue: "City Sports Ground, Pune", description: "Feel the match-day energy and cheer for your team.", image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=85" },
  { id: "dance", name: "Dance Battle 2026", category: "Dance", price: 299, date: "7 Feb 2027", time: "5:00 PM", venue: "Urban Stage, Pune", description: "Big moves, creative crews, and a high-energy dance showdown.", image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=85" },
  { id: "ai", name: "AI & Innovation Expo", category: "Technology", price: 799, date: "14 Feb 2027", time: "10:00 AM", venue: "FutureTech Centre, Pune", description: "Explore AI demos, student innovations, and practical ideas.", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=85" }
];

const PROFILE_KEY = "eventhubProfileV1";
const BOOKINGS_KEY = "eventhubBookingsV1";

let category = "All Events";
let currentEventId = "";

const $ = id => document.getElementById(id);

const money = amount =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);

const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Local save unavailable", error);
  }
}

function findEvent(id) {
  return EVENTS.find(event => event.id === id);
}

function showView(name) {
  if (name !== "welcome" && !read(PROFILE_KEY, null)) {
    name = "welcome";
  }

  document.querySelectorAll(".view").forEach(view => {
    view.classList.toggle("active", view.id === name + "View");
  });

  document.querySelectorAll(".header nav button").forEach(button => {
    button.classList.toggle("active", button.dataset.view === name);
  });

  const nav = $("nav");
  if (nav) nav.classList.remove("open");

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (name === "explore") renderEvents();
  if (name === "mybookings") renderHistory();
}

function renderOptions() {
  $("event").innerHTML =
    '<option value="">Choose an event</option>' +
    EVENTS.map(event =>
      `<option value="${event.id}">${esc(event.name)} — ${money(event.price)}</option>`
    ).join("");
}

function renderEvents() {
  const searchInput = $("eventSearch");
  const query = searchInput.value.trim().toLowerCase();

  const filteredEvents = EVENTS.filter(event => {
    const matchesCategory =
      category === "All Events" || event.category === category;

    const matchesSearch =
      !query ||
      [event.name, event.category, event.description, event.venue]
        .some(value => value.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  $("eventsGrid").innerHTML = filteredEvents.map(event => `
    <article class="event-card">
      <div class="event-image">
        <img
          loading="lazy"
          src="${esc(event.image)}"
          alt="${esc(event.name)}"
          onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80'"
        >
        <span class="badge">${esc(event.category)}</span>
      </div>

      <div class="event-body">
        <h3>${esc(event.name)}</h3>
        <p class="description">${esc(event.description)}</p>

        <div class="meta">
          <span>◷ ${esc(event.date)} · ${esc(event.time)}</span>
          <span>⌖ ${esc(event.venue)}</span>
        </div>

        <div class="event-bottom">
          <div class="price">
            <small>Tickets from</small>
            <strong>${money(event.price)}</strong>
          </div>

          <button class="primary" data-book="${event.id}">
            Book tickets →
          </button>
        </div>
      </div>
    </article>
  `).join("");

  $("eventCount").textContent = filteredEvents.length;

  $("eventCountLabel").textContent =
    category === "All Events" && !query
      ? "experiences to explore"
      : "matching experiences";

  $("emptyState").classList.toggle("hidden", filteredEvents.length > 0);
  $("eventsGrid").classList.toggle("hidden", filteredEvents.length === 0);

  document.querySelectorAll(".chip").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === category
    );
  });
}

function setProfile(profile) {
  write(PROFILE_KEY, profile);

  $("welcomeUser").textContent = profile?.name
    ? `Hi, ${profile.name.split(/\s+/)[0]}`
    : "";
}

function openBooking(id) {
  const event = findEvent(id);
  if (!event) return;

  currentEventId = id;

  $("event").value = id;
  $("bookingEventImage").src = event.image;
  $("bookingEventCategory").textContent = event.category;
  $("bookingEventName").textContent = event.name;
  $("bookingEventDescription").textContent = event.description;
  $("bookingEventDate").textContent = `◷ ${event.date} · ${event.time}`;
  $("bookingEventVenue").textContent = `⌖ ${event.venue}`;

  $("tickets").value = 1;
  $("bookingError").textContent = "";

  calculate();
  showView("booking");
}

function rateFor(quantity) {
  if (quantity >= 10) return 15;
  if (quantity >= 5) return 10;
  if (quantity >= 3) return 5;
  return 0;
}

function calculate() {
  const event = findEvent($("event").value);
  let quantity = Number($("tickets").value);

  if (!Number.isFinite(quantity) || quantity < 0) {
    quantity = 0;
  }

  const subtotal = (event?.price || 0) * quantity;
  const rate = rateFor(quantity);
  const discount = Math.round(subtotal * rate) / 100;
  const total = subtotal - discount;

  $("ticketPrice").textContent = money(event?.price || 0);
  $("ticketCount").textContent = quantity;
  $("subtotalAmount").textContent = money(subtotal);
  $("discountLabel").textContent = `(${rate}%)`;
  $("discountAmount").textContent = "−" + money(discount);
  $("totalAmount").textContent = money(total);

  if (quantity > 10) {
    $("groupDiscountMessage").textContent =
      "Please reduce your booking to 10 tickets or fewer.";
  } else if (quantity >= 10) {
    $("groupDiscountMessage").textContent =
      "Maximum group discount unlocked: 15% off!";
  } else if (quantity >= 5) {
    $("groupDiscountMessage").textContent =
      "Nice! Your group gets 10% off.";
  } else if (quantity >= 3) {
    $("groupDiscountMessage").textContent =
      "Group deal unlocked: 5% off your subtotal.";
  } else {
    $("groupDiscountMessage").textContent =
      "Book 3 or more tickets to unlock group discounts!";
  }

  $("ticketWarning").hidden = quantity <= 10;
  $("ticketWarning").textContent =
    quantity > 10
      ? "Maximum 10 tickets per booking. Reduce quantity to continue."
      : "";

  return { event, quantity, subtotal, rate, discount, total };
}

function showConfirmation(booking) {
  const rows = [
    ["Booking ID", booking.id],
    ["Event", booking.eventName],
    ["Date", booking.date],
    ["Venue", booking.venue],
    ["Name", booking.name],
    ["Email", booking.email],
    ["Tickets", booking.quantity],
    ["Payment method", booking.payment + " (demo)"],
    ["Subtotal", money(booking.subtotal)],
    ["Group discount", `${booking.rate}% (−${money(booking.discount)})`],
    ["Final amount", money(booking.total)]
  ];

  $("confirmationDetails").innerHTML = rows.map(([label, value]) => `
    <div class="detail">
      <span>${esc(label)}</span>
      <strong>${esc(value)}</strong>
    </div>
  `).join("");

  showView("confirmation");
}

function renderHistory() {
  const bookings = read(BOOKINGS_KEY, []);

  if (!bookings.length) {
    $("bookingHistoryList").innerHTML = `
      <div class="empty">
        <h3>No bookings yet</h3>
        <p>Find an event you love and your demo booking will appear here.</p>
        <button class="primary" data-view="explore">Explore events →</button>
      </div>
    `;
    return;
  }

  $("bookingHistoryList").innerHTML = bookings.map(booking => {
    const event = findEvent(booking.eventId);

    return `
      <article class="history-card">
        <img src="${esc(event?.image || "")}" alt="">
        <div class="history-copy">
          <h3>${esc(booking.eventName)}</h3>
          <p>${esc(booking.date)} · ${esc(booking.venue)}</p>
          <p>${esc(booking.id)} · ${booking.quantity} ticket(s)</p>
        </div>
        <strong class="history-price">${money(booking.total)}</strong>
      </article>
    `;
  }).join("");
}

function editProfile() {
  const profile = read(PROFILE_KEY, null);

  if (profile) {
    $("profileName").value = profile.name || "";
    $("profileEmail").value = profile.email || "";
    $("profileInterest").value = profile.interest || "All Events";
  }

  showView("welcome");
}

function clearFilters() {
  category = "All Events";
  $("eventSearch").value = "";
  renderEvents();
}

document.addEventListener("DOMContentLoaded", () => {
  // Stop early if the HTML doesn't contain the expected elements.
  const requiredIds = [
    "currentYear", "event", "profileForm", "profileName",
    "profileEmail", "profileInterest", "eventsGrid", "eventSearch",
    "eventCount", "eventCountLabel", "emptyState", "categoryFilters",
    "clearFilters", "emptyClearBtn", "bookingForm", "tickets",
    "bookingError", "bookingHistoryList", "confirmationDetails",
    "changeProfileBtn", "jumpToEvents", "groupBookingBtn", "menuToggle",
    "nav", "customCursor"
  ];

  const missingIds = requiredIds.filter(id => !$(id));

  if (missingIds.length) {
    console.error(
      "EventHub could not start. Missing HTML element IDs:",
      missingIds.join(", ")
    );
    return;
  }

  $("currentYear").textContent = new Date().getFullYear();

  renderOptions();

  const savedProfile = read(PROFILE_KEY, null);

  if (savedProfile) {
    setProfile(savedProfile);
    category = savedProfile.interest || "All Events";
    showView("explore");
  } else {
    showView("welcome");
  }

  // Profile form
  $("profileForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("profileName").value.trim();
    const email = $("profileEmail").value.trim();
    const interest = $("profileInterest").value;

    $("profileError").textContent = "";

    if (name.length < 2) {
      $("profileError").textContent =
        "Enter a name with at least 2 characters.";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $("profileError").textContent = "Enter a valid email address.";
      return;
    }

    setProfile({ name, email, interest });
    category = interest;
    showView("explore");
  });

  // Category filters
  $("categoryFilters").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");

    if (button) {
      category = button.dataset.category;
      renderEvents();
    }
  });

  $("eventSearch").addEventListener("input", renderEvents);

  $("clearFilters").addEventListener("click", clearFilters);
  $("emptyClearBtn").addEventListener("click", clearFilters);

  // Open booking form from an event card
  $("eventsGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-book]");

    if (button) {
      openBooking(button.dataset.book);
    }
  });

  // Update selected event details
  $("event").addEventListener("change", () => {
    const selectedEvent = findEvent($("event").value);
    currentEventId = selectedEvent?.id || "";

    if (selectedEvent) {
      $("bookingEventImage").src = selectedEvent.image;
      $("bookingEventCategory").textContent = selectedEvent.category;
      $("bookingEventName").textContent = selectedEvent.name;
      $("bookingEventDescription").textContent = selectedEvent.description;
      $("bookingEventDate").textContent =
        `◷ ${selectedEvent.date} · ${selectedEvent.time}`;
      $("bookingEventVenue").textContent = `⌖ ${selectedEvent.venue}`;
    }

    calculate();
  });

  $("tickets").addEventListener("input", calculate);

  // Submit a demo booking
  $("bookingForm").addEventListener("submit", event => {
    event.preventDefault();

    const error = $("bookingError");
    error.textContent = "";

    const result = calculate();
    const name = $("fullName").value.trim();
    const email = $("email").value.trim();
    const mobile = $("mobile").value.replace(/\D/g, "");
    const payment =
      document.querySelector('input[name="paymentMethod"]:checked')?.value
      || "UPI";

    if (name.length < 2) {
      error.textContent = "Enter your full name.";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error.textContent = "Enter a valid email address.";
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      error.textContent = "Enter a valid 10-digit mobile number.";
      return;
    }

    if (!result.event) {
      error.textContent = "Choose an event.";
      return;
    }

    if (
      !Number.isInteger(result.quantity) ||
      result.quantity < 1 ||
      result.quantity > 10
    ) {
      error.textContent = "Choose between 1 and 10 tickets.";
      return;
    }

    const booking = {
      id: "EH-" + Date.now().toString().slice(-8),
      eventId: result.event.id,
      eventName: result.event.name,
      date: result.event.date,
      venue: result.event.venue,
      name,
      email,
      mobile,
      quantity: result.quantity,
      subtotal: result.subtotal,
      rate: result.rate,
      discount: result.discount,
      total: result.total,
      payment,
      createdAt: new Date().toISOString()
    };

    const bookings = read(BOOKINGS_KEY, []);
    bookings.unshift(booking);
    write(BOOKINGS_KEY, bookings);

    showConfirmation(booking);
  });

  // Navigation buttons and links
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-view]");

    if (button) {
      event.preventDefault();
      showView(button.dataset.view);
    }
  });

  $("changeProfileBtn").addEventListener("click", editProfile);

  $("jumpToEvents").addEventListener("click", () => {
    $("eventsSection").scrollIntoView({ behavior: "smooth" });
  });

  $("groupBookingBtn").addEventListener("click", () => {
    clearFilters();
    $("eventsSection").scrollIntoView({ behavior: "smooth" });
  });

  $("menuToggle").addEventListener("click", () => {
    $("nav").classList.toggle("open");
  });

  // Custom cursor on computers with a mouse
  const cursor = $("customCursor");

  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    document.addEventListener("mousemove", event => {
      cursor.style.left = event.clientX + "px";
      cursor.style.top = event.clientY + "px";
      cursor.style.opacity = 1;
    });

    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = 0;
    });
  } else {
    cursor.remove();
  }
});
