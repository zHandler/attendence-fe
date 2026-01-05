// =========================
// CONFIG
// =========================
const BASE_URL = "https://attendence-be-1.onrender.com";

// =========================
// AUTH
// =========================

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
    .then(res => alert(res.msg));
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
// GEOLOCATION (FIXED)
// =========================
function getUserLocation(onSuccess) {
  if (!navigator.geolocation)
    return alert("Geolocation not supported");

  let resolved = false;

  const watchId = navigator.geolocation.watchPosition(
    position => {
      if (resolved) return;

      // 🔴 Reject weak GPS
      if (position.coords.accuracy > 100) return;

      resolved = true;
      navigator.geolocation.clearWatch(watchId);

      onSuccess(
        position.coords.latitude,
        position.coords.longitude
      );
    },
    () => alert("Location permission is required"),
    { enableHighAccuracy: true }
  );

  // Fallback timeout
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
  getUserLocation((lat, lng) => sendAttendance("in", lat, lng));
}

function checkOut() {
  getUserLocation((lat, lng) => sendAttendance("out", lat, lng));
}

function sendAttendance(type, lat, lng) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Not logged in");

  const time = new Date();

  const payload = {
    type,
    name: user.name,
    date: time.toISOString().split("T")[0],
    now: time.toLocaleTimeString("en-GB"),
    shift: "AM",
    lat: Number(lat),
    lng: Number(lng)
  };

  fetch(`${BASE_URL}/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(res => {
      if (!res.data) return alert(res.msg);

      alert(res.msg);

      const last = res.data.at(-1);
      document.getElementById("table").innerHTML = `
        <span class="user">${last.name}</span>
        <span class="text">
          ${type === "in" ? "Start working 💪🏢" : "Going home 🏡"}
        </span>
      `;
    });
}

// =========================
// REPORT
// =========================
function generateReport() {
  const start = document.getElementById("start-date").value;
  const end = document.getElementById("end-date").value;

  let url = `${BASE_URL}/report`;
  if (start || end) url += `?start=${start}&end=${end}`;

  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "attendance_report.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    });
}
