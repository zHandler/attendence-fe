const BASE_URL = "https://attendence-be-1.onrender.com/";

// Register
function register() {
  const data = {
    name: document.getElementById("reg-name").value,
    email: document.getElementById("reg-email").value,
    password: document.getElementById("reg-password").value
  };
  if (data.email == null || data.email == "") return alert("enter email")
  if (data.name == null || data.name == "") return alert("enter name")
  if (data.password == null || data.password == "") return alert("enter password")

  fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then((res) => res.json())
    .then((result) => {
      console.log(result.code)

      if (result.code == 200) {

        document.getElementById("reg-result").innerText = "Registered successfully";
      }
      else {
        document.getElementById("reg-result").innerText = "Registration failed try again";

      }
    })
    .catch(() => {
      document.getElementById("reg-result").innerText = "Registration failed";
    });
}

// Login
function login() {
  const data = {
    email: document.getElementById("login-email").value,
    password: document.getElementById("login-password").value
  };
  if (data.email == null || data.email == "") return alert("enter email")
  if (data.password == null || data.password == "") return alert("enter password")

  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(msg => {
      console.log(msg)
      console.log(msg)
      document.getElementById("login-result").innerText = msg.msg;

      document.getElementById("loginfrm").classList.add("hidden")
      document.getElementById("registerfrm").classList.add("hidden")


      document.getElementById("attfrm").classList.remove("hidden")
      document.getElementById("repofrm").classList.remove("hidden")
      localStorage.setItem("user", JSON.stringify(msg.data))
      const loggedUser = JSON.parse(localStorage.getItem("user"))
      document.getElementById("userid").innerHTML += `<span>${loggedUser.name}</span>`
    });
}

// Check In
let user = JSON.parse(localStorage.getItem("user"))
function checkIn() {
  let time = new Date();
  const checkin = {
    type: "in",
    name: user.name,
    date: time.toISOString().split("T")[0],
    now: time.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }),
    shift: "AM"

  }
  fetch(`${BASE_URL}/in`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(checkin) })
    .then(res => res.text())
    .then(alert);
}

// Check Out
function checkOut() {
  let time = new Date();
  const checkin = {
    type: "out",
    name: user.name,
    date: time.toISOString().split("T")[0],
    now: time.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }),
    shift: "AM"

  }
  fetch(`${BASE_URL}/in`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(checkin) })
    .then(res => res.text())
    .then(alert);
}

// Generate Report
function generateReport() {
  fetch("http://127.0.0.1:3000/report")
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "main_report.csv";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => console.error("Download failed", err));
}

