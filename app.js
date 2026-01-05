// =========================
// CONFIG
// =========================
const BASE_URL = "https://attendence-be-2arx.onrender.com/";

// =========================
// AUTH
// =========================
function register() {
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  if (!name || !email || !password)
    return alert("All fields are required");

  fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  })
    .then(res => res.json())
    .then(res => alert(res.msg))
    .catch(() => alert("Server error"));
}

function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password)
    return alert("Email & password required");

  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(res => {
      if (!res.data) return alert(res.msg);

      localStorage.setItem("user", JSON.stringify(res.data));

      document.getElementById("loginfrm").classList.add("hidden");
      document.getElementById("registerfrm").classList.add("hidden");
      document.getElementById("attfrm").classList.remove("hidden");
      document.getElementById("repofrm").classList.remove("hidden");

      document.getElementById("userid").innerText = res.data.name;
      document.getElementById("userid").classList.remove("hidden");
    });
}

// =========================
// GEOLOCATION (STABLE)
// =========================
function getUserLocation(callback) {
  if (!navigator.geolocation)
    return alert("Geolocation not supported");

  let resolved = false;

  const watchId = navigator.geolocation.watchPosition(
    pos => {
      if (resolved) return;

      if (pos.coords.accuracy > 100) return;

      resolved = true;
      navigator.geolocation.clearWatch(watchId);

      callback(
        pos.coords.latitude,
        pos.coords.longitude
      );
    },
    () => alert("Location permission required"),
    { enableHighAccuracy: true }
  );

  setTimeout(() => {
    if (!resolved) {
      navigator.geolocation.clearWatch(watchId);
      alert("Unable to get accurate GPS location");
    }
  }, 8000);
}

// =========================
// ATTENDANCE
// =========================
function checkIn() {
  disableButtons();
  getUserLocation((lat, lng) => sendAttendance("in", lat, lng));
}

function checkOut() {
  disableButtons();
  getUserLocation((lat, lng) => sendAttendance("out", lat, lng));
}

function disableButtons() {
  document.getElementById("checkInBtn").disabled = true;
  document.getElementById("checkOutBtn").disabled = true;
}

function enableButtons() {
  document.getElementById("checkInBtn").disabled = false;
  document.getElementById("checkOutBtn").disabled = false;
}

function sendAttendance(type, lat, lng) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Not logged in");

  const now = new Date();

  const payload = {
    type,
    name: user.name,
    date: now.toISOString().split("T")[0],
    now: now.toLocaleTimeString("en-GB"),
    lat: Number(lat),
    lng: Number(lng)
  };

  fetch(`${BASE_URL}/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw data.msg;
      return data;
    })
    .then(res => {
      alert(res.msg);
      document.getElementById("table").innerHTML = `
        <span class="user">${payload.name}</span>
        <span class="text">
          ${type === "in" ? "Checked in 🏢" : "Checked out 🏡"}
        </span>
      `;
    })
    .catch(msg => alert(msg))
    .finally(enableButtons);
}

// =========================
// DAILY / RANGE REPORT (CSV)
// =========================
function generateReport() {
  const start = document.getElementById("start-date").value;
  const end = document.getElementById("end-date").value;

  let url = `${BASE_URL}/report`;
  if (start || end) url += `?start=${start}&end=${end}`;

  fetch(url)
    .then(res => res.blob())
    .then(blob => download(blob, "attendance_report.csv"));
}

// =========================
// MONTHLY SUMMARY
// =========================
function getMonthlySummary() {
  const month = document.getElementById("month").value;
  if (!month) return alert("Select month");

  fetch(`${BASE_URL}/summary?month=${month}`)
    .then(res => res.json())
    .then(data => {
      console.table(data);
      alert("Monthly summary logged to console");
    });
}

// =========================
// UTIL
// =========================
function download(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

