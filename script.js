/* ================================
   EVENT MANAGEMENT SYSTEM - BTECH
================================ */

// ---------------- STORAGE KEYS ----------------
const STORAGE = {
    USERS: "ems_users",
    EVENTS: "ems_events",
    BOOKINGS: "ems_bookings",
    SESSION: "ems_session"
};

// ---------------- INITIAL DATA ----------------
let users = JSON.parse(localStorage.getItem(STORAGE.USERS)) || [
    { id: 1, username: "admin", password: "admin123", role: "admin" },
    { id: 2, username: "user", password: "user123", role: "user" }
];

let events = JSON.parse(localStorage.getItem(STORAGE.EVENTS)) || [
    { id: 101, name: "Tech Fest 2026", date: "2026-03-10", seats: 50, category: "Technical" },
    { id: 102, name: "Music Night", date: "2026-04-05", seats: 30, category: "Cultural" }
];

let bookings = JSON.parse(localStorage.getItem(STORAGE.BOOKINGS)) || [];

let session = JSON.parse(localStorage.getItem(STORAGE.SESSION)) || null;

// ---------------- AUTO LOGIN ----------------
document.addEventListener("DOMContentLoaded", () => {
    if (session) {
        showDashboard();
    }
});

// ---------------- AUTH SYSTEM ----------------
function login(username, password) {
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert("Invalid credentials");
        return false;
    }

    session = {
        token: generateToken(),
        userId: user.id,
        role: user.role,
        username: user.username
    };

    localStorage.setItem(STORAGE.SESSION, JSON.stringify(session));
    showDashboard();
    return true;
}

function logout() {
    localStorage.removeItem(STORAGE.SESSION);
    location.reload();
}

function generateToken() {
    return "TOKEN_" + Math.random().toString(36).substr(2);
}

// ---------------- DASHBOARD ----------------
function showDashboard() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    document.getElementById("userNameDisplay").innerText = session.username;

    if (session.role === "admin") {
        document.getElementById("adminPanel").style.display = "block";
    }

    renderEvents();
    renderBookings();
    updateStats();
}

// ---------------- EVENT CRUD ----------------
function addEvent(name, date, seats, category) {
    if (session.role !== "admin") return;

    if (!name || !date || seats <= 0) {
        alert("Invalid event data");
        return;
    }

    events.push({
        id: Date.now(),
        name,
        date,
        seats: parseInt(seats),
        category
    });

    saveData();
    renderEvents();
    updateStats();
}

function editEvent(id, updatedData) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    Object.assign(event, updatedData);

    saveData();
    renderEvents();
}

function deleteEvent(id) {
    if (session.role !== "admin") return;

    events = events.filter(e => e.id !== id);

    saveData();
    renderEvents();
    updateStats();
}

// ---------------- BOOKING SYSTEM ----------------
function bookEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (event.seats <= 0) {
        alert("Event is Full!");
        return;
    }

    event.seats -= 1;

    const booking = {
        id: "BK" + Date.now(),
        userId: session.userId,
        eventId: event.id,
        eventName: event.name,
        date: event.date,
        bookingTime: new Date().toLocaleString()
    };

    bookings.push(booking);

    saveData();
    renderEvents();
    renderBookings();
    updateStats();

    alert("Booking Successful! ID: " + booking.id);
}

function cancelBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const event = events.find(e => e.id === booking.eventId);
    if (event) event.seats += 1;

    bookings = bookings.filter(b => b.id !== bookingId);

    saveData();
    renderEvents();
    renderBookings();
    updateStats();
}

// ---------------- SEARCH ----------------
function searchEvents(keyword) {
    return events.filter(e =>
        e.name.toLowerCase().includes(keyword.toLowerCase())
    );
}

// ---------------- RENDER EVENTS ----------------
function renderEvents(filteredEvents = events) {
    const container = document.getElementById("eventContainer");
    container.innerHTML = "";

    filteredEvents.forEach(event => {
        const card = document.createElement("div");
        card.className = "event-card";

        card.innerHTML = `
            <h3>${event.name}</h3>
            <p>Date: ${event.date}</p>
            <p>Category: ${event.category}</p>
            <p>Available Seats: ${event.seats}</p>
        `;

        if (session.role === "admin") {
            card.innerHTML += `
                <button onclick="deleteEvent(${event.id})">Delete</button>
            `;
        } else {
            card.innerHTML += `
                <button onclick="bookEvent(${event.id})">Book</button>
            `;
        }

        container.appendChild(card);
    });
}

// ---------------- RENDER BOOKINGS ----------------
function renderBookings() {
    const container = document.getElementById("bookingHistory");
    container.innerHTML = "";

    const userBookings = bookings.filter(b => b.userId === session.userId);

    userBookings.forEach(b => {
        container.innerHTML += `
            <div>
                ${b.eventName} | ${b.date} | ID: ${b.id}
                <button onclick="cancelBooking('${b.id}')">Cancel</button>
            </div>
        `;
    });
}

// ---------------- DASHBOARD STATS ----------------
function updateStats() {
    document.getElementById("totalEvents").innerText = events.length;
    document.getElementById("totalBookings").innerText = bookings.length;
}

// ---------------- SAVE TO STORAGE ----------------
function saveData() {
    localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE.EVENTS, JSON.stringify(events));
    localStorage.setItem(STORAGE.BOOKINGS, JSON.stringify(bookings));
}
