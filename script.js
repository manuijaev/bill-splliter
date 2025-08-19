// Auth
const loginBox = document.getElementById("loginBox");
const signupBox = document.getElementById("signupBox");
const billTracker = document.getElementById("billTracker");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");
const welcome = document.getElementById("welcome");
const logoutBtn = document.getElementById("logoutBtn");

// Bill Tracker
const form = document.getElementById("billForm");
const tableBody = document.querySelector("#billTable tbody");
const resultDiv = document.getElementById("result");
const resetBtn = document.getElementById("resetBtn");

let bills = JSON.parse(localStorage.getItem("bills")) || [];

// Render bills & settlements
function renderBills() {
  tableBody.innerHTML = "";
  let totals = {};

  bills.forEach(bill => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${bill.name}</td>
      <td>${bill.amount}</td>
      <td>${bill.description}</td>
      <td>${bill.refund || "-"}</td>
    `;
    tableBody.appendChild(row);

    totals[bill.name] = (totals[bill.name] || 0) + Number(bill.amount);
  });

  const names = Object.keys(totals);
  const totalAmount = Object.values(totals).reduce((a, b) => a + b, 0);
  const equalShare = names.length ? totalAmount / names.length : 0;

  let balances = {};
  names.forEach(name => {
    balances[name] = totals[name] - equalShare;
  });

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

  if (settlements.length > 0) {
    resultDiv.innerHTML = `<h3>Settlements:</h3><ul>` +
      settlements.map(s => `<li>${s}</li>`).join("") +
      `</ul>`;
  } else {
    resultDiv.textContent = names.length ? "Everyone has paid equally. No settlements needed." : "";
  }

  localStorage.setItem("bills", JSON.stringify(bills));
}

// Add bill
form.addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const amount = document.getElementById("amount").value;
  const description = document.getElementById("description").value.trim();
  const refund = document.getElementById("refund").value.trim();

  bills.push({ name, amount: Number(amount), description, refund });
  form.reset();
  renderBills();
});

// Reset bills
resetBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all data?")) {
    bills = [];
    localStorage.removeItem("bills");
    renderBills();
  }
});

// Login/Signup Logic
showSignup.addEventListener("click", () => {
  loginBox.style.display = "none";
  signupBox.style.display = "block";
});

showLogin.addEventListener("click", () => {
  signupBox.style.display = "none";
  loginBox.style.display = "block";
});

signupForm.addEventListener("submit", e => {
  e.preventDefault();
  const username = document.getElementById("signupUser").value;
  const password = document.getElementById("signupPass").value;

  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[username]) {
    alert("Username already exists!");
  } else {
    users[username] = password;
    localStorage.setItem("users", JSON.stringify(users));
    alert("Signup successful! Please login.");
    signupBox.style.display = "none";
    loginBox.style.display = "block";
  }
});

loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const username = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPass").value;

  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[username] && users[username] === password) {
    localStorage.setItem("currentUser", username);
    loginBox.style.display = "none";
    billTracker.style.display = "block";
    welcome.textContent = `Welcome, ${username}!`;
    renderBills();
  } else {
    alert("Invalid credentials!");
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  billTracker.style.display = "none";
  loginBox.style.display = "block";
});

// Restore session if logged in
window.addEventListener("load", () => {
  let currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    loginBox.style.display = "none";
    billTracker.style.display = "block";
    welcome.textContent = `Welcome, ${currentUser}!`;
    renderBills();
  }
});


  
  