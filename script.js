// ===== AUTH SECTION =====
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const authForm = document.getElementById("authForm");
const toggleAuth = document.getElementById("toggleAuth");
const authTitle = document.getElementById("authTitle");
const authBtn = document.getElementById("authBtn");
const logoutBtn = document.getElementById("logoutBtn");

let isLogin = true;

// Load saved users
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser") || null;

if (currentUser) {
  authSection.style.display = "none";
  appSection.style.display = "block";
}

toggleAuth.addEventListener("click", (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  authTitle.textContent = isLogin ? "Login" : "Register";
  authBtn.textContent = isLogin ? "Login" : "Register";
  toggleAuth.textContent = isLogin
    ? "Don't have an account? Register"
    : "Already have an account? Login";
});

authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (isLogin) {
    if (users[username] && users[username] === password) {
      currentUser = username;
      localStorage.setItem("currentUser", username);
      authSection.style.display = "none";
      appSection.style.display = "block";
      loadData();
    } else {
      alert("Invalid credentials!");
    }
  } else {
    if (users[username]) {
      alert("User already exists!");
    } else {
      users[username] = password;
      localStorage.setItem("users", JSON.stringify(users));
      alert("Registration successful! Please login.");
      isLogin = true;
      authTitle.textContent = "Login";
      authBtn.textContent = "Login";
      toggleAuth.textContent = "Don't have an account? Register";
    }
  }
});

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("currentUser");
  appSection.style.display = "none";
  authSection.style.display = "block";
});

// ===== BILL TRACKER SECTION =====
const activityForm = document.getElementById("activityForm");
const activitySelect = document.getElementById("activitySelect");
const participantForm = document.getElementById("participantForm");
const participantName = document.getElementById("participantName");
const participantsList = document.getElementById("participantsList");
const billForm = document.getElementById("billForm");
const payerName = document.getElementById("payerName");
const amount = document.getElementById("amount");
const description = document.getElementById("description");
const tableBody = document.querySelector("#billTable tbody");
const resultDiv = document.getElementById("result");
const resetBtn = document.getElementById("resetBtn");

let data = {}; // { user: { activities: { activityName: { participants:[], bills:[] } } } }

function loadData() {
  data = JSON.parse(localStorage.getItem("data")) || {};
  if (!data[currentUser]) data[currentUser] = { activities: {} };
  renderActivities();
}

function saveData() {
  localStorage.setItem("data", JSON.stringify(data));
}

function renderActivities() {
  activitySelect.innerHTML = "";
  const activities = data[currentUser].activities;
  for (let act in activities) {
    const option = document.createElement("option");
    option.value = act;
    option.textContent = act;
    activitySelect.appendChild(option);
  }
  if (activitySelect.value) renderActivity(activitySelect.value);
}

function renderActivity(activity) {
  const actData = data[currentUser].activities[activity];
  // Render participants
  participantsList.innerHTML = "";
  actData.participants.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    participantsList.appendChild(li);
  });
  // Render bills
  tableBody.innerHTML = "";
  actData.bills.forEach(bill => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${bill.name}</td><td>${bill.amount}</td><td>${bill.description}</td>`;
    tableBody.appendChild(row);
  });
  calculateSettlements(activity);
}

activityForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("activityName").value.trim();
  if (!data[currentUser].activities[name]) {
    data[currentUser].activities[name] = { participants: [], bills: [] };
    saveData();
    renderActivities();
    activityForm.reset();
  } else {
    alert("Activity already exists!");
  }
});

participantForm.addEventListener("submit", e => {
  e.preventDefault();
  const activity = activitySelect.value;
  const pName = participantName.value.trim();
  if (activity && pName && !data[currentUser].activities[activity].participants.includes(pName)) {
    data[currentUser].activities[activity].participants.push(pName);
    saveData();
    renderActivity(activity);
    participantForm.reset();
  }
});

billForm.addEventListener("submit", e => {
  e.preventDefault();
  const activity = activitySelect.value;
  const bill = {
    name: payerName.value.trim(),
    amount: Number(amount.value),
    description: description.value.trim()
  };
  if (activity) {
    data[currentUser].activities[activity].bills.push(bill);
    saveData();
    renderActivity(activity);
    billForm.reset();
  }
});

function calculateSettlements(activity) {
  const actData = data[currentUser].activities[activity];
  let totals = {};
  actData.participants.forEach(p => totals[p] = 0);
  actData.bills.forEach(bill => {
    totals[bill.name] = (totals[bill.name] || 0) + bill.amount;
  });
  const names = Object.keys(totals);
  const totalAmount = Object.values(totals).reduce((a, b) => a + b, 0);
  const equalShare = names.length ? totalAmount / names.length : 0;
  let balances = {};
  names.forEach(n => balances[n] = totals[n] - equalShare);
  let creditors = names.filter(n => balances[n] > 0);
  let debtors = names.filter(n => balances[n] < 0);
  let settlements = [];
  while (creditors.length && debtors.length) {
    let creditor = creditors[0];
    let debtor = debtors[0];
    let amount = Math.min(balances[creditor], -balances[debtor]);
    settlements.push(`${debtor} should pay ${amount.toFixed(2)} to ${creditor}`);
    balances[creditor] -= amount;
    balances[debtor] += amount;
    if (balances[creditor] === 0) creditors.shift();
    if (balances[debtor] === 0) debtors.shift();
  }
  resultDiv.innerHTML = settlements.length ? `<ul>${settlements.map(s => `<li>${s}</li>`).join("")}</ul>` : "Everyone is settled!";
}

resetBtn.addEventListener("click", () => {
  if (confirm("Clear all data?")) {
    data[currentUser].activities = {};
    saveData();
    renderActivities();
    resultDiv.innerHTML = "";
  }
});

// Load initial
if (currentUser) loadData();

