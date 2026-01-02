const BASE_URL = "http://localhost:3000";
// const BASE_URL = "https://attendence-be-1.onrender.com";

/* =========================
   FACILITY CONFIG
========================= */
const FACILITY_LOCATION = {
  lat: 25.588283,
  lng: 56.267099,
  radius: 100 // meters
};

/* =========================
   AUTH
========================= */

// Register
function register() {
  const data = {
    name: document.getElementById("reg-name").value,
    email: document.getElementById("reg-email").value,
    password: document.getElementById("reg-password").value
  };

  if (!data.name || !data.email || !data.password)
    return alert("All fields are required");

  fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(res => {
      document.getElementById("reg-result").innerText =
        res.code === 200 ? "Registered successfully" : "Registration failed";
    });
}

// Login
function login() {
  const data = {
    email: document.getElementById("login-email").value,
    password: document.getElementById("login-password").value
  };

  if (!data.email || !data.password)
    return alert("Email and password required");

  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(res => {
      if (!res.data) return alert("Login failed");

      localStorage.setItem("user", JSON.stringify(res.data));

      document.getElementById("loginfrm").classList.add("hidden");
      document.getElementById("registerfrm").classList.add("hidden");
      document.getElementById("attfrm").classList.remove("hidden");
      document.getElementById("repofrm").classList.remove("hidden");

      document.getElementById("userid").innerHTML =
        `<span>${res.data.name}</span>`;
      document.getElementById("userid").classList.remove("hidden");
    });
}

/* =========================
   GEOLOCATION
========================= */

// Get user GPS and validate location
function getUserLocation(onAllowed) {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      const allowed = isInsideFacility(latitude, longitude);
      if (allowed) onAllowed();
    },
    () => {
      alert("Location permission is required for attendance");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

// Distance calculation
function getDistanceInMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = v => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Check if inside facility
function isInsideFacility(userLat, userLng) {
  const distance = getDistanceInMeters(
    userLat,
    userLng,
    FACILITY_LOCATION.lat,
    FACILITY_LOCATION.lng
  );

  if (distance <= FACILITY_LOCATION.radius) {
    console.log("✅ Inside facility");
    return true;
  } else {
    alert("❌ You must be inside the facility to check in/out");
    return false;
  }
}

/* =========================
   ATTENDANCE
========================= */

function checkIn() {
  getUserLocation(() => sendAttendance("in"));
}

function checkOut() {
  getUserLocation(() => sendAttendance("out"));
}

function sendAttendance(type) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Not logged in");

  const time = new Date();

  const payload = {
    type,
    name: user.name,
    date: time.toISOString().split("T")[0],
    now: time.toLocaleTimeString("en-GB"),
    shift: "AM"
  };

  fetch(`${BASE_URL}/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(res => {
      alert(res.msg);
      const last = res.data.at(-1);
      document.getElementById("table").innerHTML =
        `<span class="user">${last.name}</span>
         <span class="text">
           ${type === "in" ? "Start working 💪🏢" : "Going home 🏡"}
         </span>`;
    });
}

/* =========================
   REPORT
========================= */

function generateReport() {
  fetch(`${BASE_URL}/report`)
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "attendance_report.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
}
