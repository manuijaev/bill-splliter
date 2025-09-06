


// ==================== AUTH SECTION ====================

// Safe initialization of users array
let users;
try {
  users = JSON.parse(localStorage.getItem("users"));
  if (!Array.isArray(users)) users = [];
} catch {
  users = [];
}
localStorage.setItem("users", JSON.stringify(users));

let loggedInUser = localStorage.getItem("loggedInUser");

// Auth DOM elements
const authSection = document.getElementById("authSection");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authBtn = document.getElementById("authBtn");
const toggleAuth = document.getElementById("toggleAuth");

// Other sections
const landingSection = document.getElementById("landingSection");
const appSection = document.getElementById("appSection");

// Bill tracker elements
let activities = {};
let currentActivity = null;

const activityForm = document.getElementById("activityForm");
const activitySelect = document.getElementById("activitySelect");
const participantForm = document.getElementById("participantForm");
const participantsList = document.getElementById("participantsList");
const billForm = document.getElementById("billForm");
const billTableBody = document.querySelector("#billTable tbody");
const resultDiv = document.getElementById("result");
const resetBtn = document.getElementById("resetBtn");

let isLogin = true; // default mode

// ==================== AUTH FUNCTIONS ====================

// Toggle login/register mode
toggleAuth.addEventListener("click", (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  authTitle.textContent = isLogin ? "Login" : "Register";
  authBtn.textContent = isLogin ? "Login" : "Register";
  toggleAuth.textContent = isLogin
    ? "Don't have an account? Register"
    : "Already have an account? Login";
});

// Handle login/register form
authForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter both username and password");
    return;
  }

  if (isLogin) {
    // LOGIN
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      loggedInUser = username;
      localStorage.setItem("loggedInUser", username);
      loadUserData();
      showLandingPage();
      loadData();
    } else {
      alert("Invalid username or password. Please register first.");
    }
  } else {
    // REGISTER
    if (users.some(u => u.username === username)) {
      alert("Username already exists. Choose another.");
      return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registration successful! Please log in.");
    isLogin = true;
    authForm.reset();
    authTitle.textContent = "Login";
    authBtn.textContent = "Login";
    toggleAuth.textContent = "Don't have an account? Register";
  }

  authForm.reset();
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  loggedInUser = null;
  activities = {};

  authSection.style.display = "block";
  landingSection.style.display = "none";
  appSection.style.display = "none";

  activitySelect.innerHTML = "";
  participantsList.innerHTML = "";
  billTableBody.innerHTML = "";
  resultDiv.innerHTML = "";
});

// Go to main app from landing page
document.getElementById("goToAppBtn").addEventListener("click", showApp);

// ==================== BILL TRACKER FUNCTIONS ====================

// Show landing page
function showLandingPage() {
  authSection.style.display = "none";
  landingSection.style.display = "block";
  appSection.style.display = "none";
}

// Show main app
function showApp() {
  authSection.style.display = "none";
  landingSection.style.display = "none";
  appSection.style.display = "block";
}

// Load user-specific data
function loadUserData() {
  const data = JSON.parse(localStorage.getItem(`data_${loggedInUser}`)) || {};
  activities = data;
}

// Save user-specific data
function saveUserData() {
  localStorage.setItem(`data_${loggedInUser}`, JSON.stringify(activities));
}

// Load data into UI
function loadData() {
  activitySelect.innerHTML = "";
  Object.keys(activities).forEach(act => {
    const option = document.createElement("option");
    option.value = act;
    option.textContent = act;
    activitySelect.appendChild(option);
  });

  if (activitySelect.value) {
    currentActivity = activitySelect.value;
    renderParticipants();
    renderBills();
    calculateSettlements();
  }
}

// Add activity
activityForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const activityName = document.getElementById("activityName").value.trim();
  if (!activityName) return;

  if (!activities[activityName]) {
    activities[activityName] = { participants: [], bills: [] };
    saveUserData();
  }

  document.getElementById("activityName").value = "";
  loadData();
});

// Switch activity
activitySelect.addEventListener("change", () => {
  currentActivity = activitySelect.value;
  renderParticipants();
  renderBills();
  calculateSettlements();
});

// Add participant
participantForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("participantName").value.trim();
  if (!name || !currentActivity) return;

  activities[currentActivity].participants.push(name);
  saveUserData();
  document.getElementById("participantName").value = "";
  renderParticipants();
});

// Render participants
function renderParticipants() {
  participantsList.innerHTML = "";
  if (!currentActivity) return;

  activities[currentActivity].participants.forEach((p, index) => {
    const li = document.createElement("li");
    li.textContent = p;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      activities[currentActivity].participants.splice(index, 1);
      saveUserData();
      renderParticipants();
      calculateSettlements();
    };

    li.appendChild(delBtn);
    participantsList.appendChild(li);
  });
}

// Add bill
billForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentActivity) return;

  const payer = document.getElementById("payerName").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const desc = document.getElementById("description").value.trim();

  if (!payer || isNaN(amount) || !desc) return;

  activities[currentActivity].bills.push({ payer, amount, desc });
  saveUserData();
  billForm.reset();
  renderBills();
  calculateSettlements();
});

// Render bills
function renderBills() {
  billTableBody.innerHTML = "";
  if (!currentActivity) return;

  activities[currentActivity].bills.forEach((bill, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${bill.payer}</td>
      <td>${bill.amount}</td>
      <td>${bill.desc}</td>
    `;
    const td = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      activities[currentActivity].bills.splice(index, 1);
      saveUserData();
      renderBills();
      calculateSettlements();
    };
    td.appendChild(delBtn);
    row.appendChild(td);
    billTableBody.appendChild(row);
  });
}

// Calculate settlements and summary
function calculateSettlements() {
  resultDiv.innerHTML = "";
  const summaryDiv = document.getElementById("summary");
  summaryDiv.innerHTML = "";

  if (!currentActivity) return;

  const bills = activities[currentActivity].bills;
  const participants = activities[currentActivity].participants;

  if (participants.length === 0 || bills.length === 0) return;

  let totals = {};
  participants.forEach(p => totals[p] = 0);
  bills.forEach(b => {
    if (totals[b.payer] !== undefined) totals[b.payer] += b.amount;
  });

  const totalSpent = Object.values(totals).reduce((a, b) => a + b, 0);
  const share = totalSpent / participants.length;

  // Summary
  let summaryHTML = `<h3>Summary</h3>`;
  summaryHTML += `<p><strong>Total Spent:</strong> ${totalSpent.toFixed(2)}</p>`;
  summaryHTML += `<p><strong>Equal Share:</strong> ${share.toFixed(2)}</p>`;
  summaryHTML += `<ul>`;
  participants.forEach(p => {
    summaryHTML += `<li>${p}: Paid ${totals[p].toFixed(2)}</li>`;
  });
  summaryHTML += `</ul>`;
  summaryDiv.innerHTML = summaryHTML;

  // Settlements
  let settlements = [];
  participants.forEach(p => {
    const balance = totals[p] - share;
    if (balance > 0) settlements.push(`${p} should receive ${balance.toFixed(2)}`);
    else if (balance < 0) settlements.push(`${p} should pay ${Math.abs(balance).toFixed(2)}`);
    else settlements.push(`${p} is settled up.`);
  });
  resultDiv.innerHTML = `<h3>Settlements</h3>` + settlements.join("<br>");
}

// Reset all data for current user
resetBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all data?")) {
    activities = {};
    saveUserData();
    loadData();
    participantsList.innerHTML = "";
    billTableBody.innerHTML = "";
    resultDiv.innerHTML = "";
  }
});

// ==================== INITIAL LOAD ====================
window.addEventListener("DOMContentLoaded", () => {
  if (loggedInUser) {
    showLandingPage();
    loadUserData();
    loadData();
  } else {
    authSection.style.display = "block";
    landingSection.style.display = "none";
    appSection.style.display = "none";
  }
});