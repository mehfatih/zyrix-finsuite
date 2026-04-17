// ================================================================
// Zyrix FinSuite — Mock API Server (mockServer.js)
// Run: node mockServer.js
// Mirrors: https://finsuite-backend-production.up.railway.app
// Use this for local dev when backend is unreachable
// ================================================================

const http = require("http");
const crypto = require("crypto");

const PORT = 3001;

// ── Fake DB ───────────────────────────────────────
const ADMIN = { id: "a1", email: "finsuite-admin@zyrix.co", password: "Zyrix@Admin2026", role: "admin", name: "Zyrix Admin" };
const CUSTOMER = { id: "c1", email: "customer@zyrix.co", password: "Customer123", role: "customer", name: "Ahmed Al-Rashid", phone: "+966 50 123 4567", country: "Saudi Arabia", created_at: "2024-01-15T10:00:00Z" };
const USERS_DB = [ADMIN, CUSTOMER,
  { id: "c2", email: "sara@example.com", role: "customer", name: "Sara Hassan", active: true, created_at: "2024-02-20T08:00:00Z" },
  { id: "c3", email: "omar@example.com", role: "customer", name: "Omar Khalid", active: false, created_at: "2024-03-10T14:00:00Z" },
  { id: "c4", email: "layla@example.com", role: "customer", name: "Layla Nasser", active: true, created_at: "2024-04-05T09:00:00Z" },
  { id: "c5", email: "fahad@example.com", role: "customer", name: "Fahad Al-Otaibi", active: true, created_at: "2024-05-18T11:00:00Z" },
];

const TOKENS = {};

function makeToken(user) {
  const id = crypto.randomBytes(16).toString("hex");
  const payload = { sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + 86400 };
  const token = `mock.${Buffer.from(JSON.stringify(payload)).toString("base64")}.sig`;
  TOKENS[id] = user;
  return token;
}

function parseToken(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer mock.")) return null;
  try {
    const parts = auth.split(".");
    return JSON.parse(Buffer.from(parts[1], "base64").toString());
  } catch { return null; }
}

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max)); }
function randItem(arr) { return arr[randInt(0, arr.length)]; }

// ── Generate realistic data ───────────────────────
function genTransactions(count = 30) {
  const descs = ["Salary Deposit", "Netflix Subscription", "Grocery Store", "Electricity Bill", "Restaurant", "Amazon Purchase", "Freelance Payment", "Hotel Booking", "Fuel", "ATM Withdrawal", "Investment Return", "Rent Payment", "Insurance Premium"];
  return Array.from({ length: count }, (_, i) => {
    const amount = rand(-1200, 2500);
    const statuses = ["completed", "completed", "completed", "pending", "failed"];
    return {
      id: `tx${i + 1}`, user_id: "c1",
      user: { name: "Ahmed Al-Rashid", email: "customer@zyrix.co" },
      description: randItem(descs), amount: parseFloat(amount.toFixed(2)),
      type: amount > 0 ? "credit" : "debit",
      status: randItem(statuses), reference: `REF${100000 + i}`,
      created_at: new Date(Date.now() - i * 86400000 * randInt(1, 3)).toISOString(),
    };
  });
}

function genInvestments() {
  return [
    { id: "inv1", name: "Apple Inc.", symbol: "AAPL", category: "Stocks", current_price: 189.50, value: 9475, cost: 8200, quantity: 50, change_pct: 15.5, allocation: 32.1, price_history: Array.from({length:14},(_,i)=>160+i*2+rand(-3,3)) },
    { id: "inv2", name: "Tesla Inc.", symbol: "TSLA", category: "Stocks", current_price: 248.20, value: 7446, cost: 9000, quantity: 30, change_pct: -17.3, allocation: 25.2, price_history: Array.from({length:14},(_,i)=>300-i*4+rand(-8,8)) },
    { id: "inv3", name: "Bitcoin", symbol: "BTC", category: "Crypto", current_price: 67400, value: 6740, cost: 4500, quantity: 0.1, change_pct: 49.8, allocation: 22.8, price_history: Array.from({length:14},(_,i)=>45000+i*1600+rand(-500,500)) },
    { id: "inv4", name: "S&P 500 ETF", symbol: "SPY", category: "ETF", current_price: 512.30, value: 5123, cost: 4800, quantity: 10, change_pct: 6.7, allocation: 17.3, price_history: Array.from({length:14},(_,i)=>480+i*2.3+rand(-2,2)) },
    { id: "inv5", name: "Ethereum", symbol: "ETH", category: "Crypto", current_price: 3820, value: 763, cost: 600, quantity: 0.2, change_pct: 27.2, allocation: 2.6, price_history: Array.from({length:14},(_,i)=>3000+i*58+rand(-80,80)) },
  ];
}

function genAccounts() {
  return [
    { id: "acc1", name: "Main Checking", type: "checking", bank: "Zyrix Bank", account_number: "4532901234567890", balance: 12450.75, available_balance: 12350.75, currency: "USD", status: "active", created_at: "2023-06-01T10:00:00Z" },
    { id: "acc2", name: "Savings Account", type: "savings", bank: "Zyrix Bank", account_number: "4532901234567891", balance: 38200.00, available_balance: 38200.00, currency: "USD", status: "active", created_at: "2023-06-01T10:00:00Z" },
    { id: "acc3", name: "Credit Card", type: "credit", bank: "Zyrix Credit", account_number: "5234901234567892", balance: 2340.50, credit_limit: 10000, available_balance: 7659.50, currency: "USD", status: "active", created_at: "2023-09-15T10:00:00Z" },
  ];
}

function genNotifications(count = 12) {
  const items = [
    { title: "Transaction Completed", body: "Your payment of $240.00 was processed successfully.", type: "transaction", icon: "💸" },
    { title: "Investment Update", body: "AAPL is up 3.2% today. Your portfolio gained $302.", type: "investment", icon: "📈" },
    { title: "Security Alert", body: "New login detected from Istanbul, Turkey.", type: "security", icon: "🔐" },
    { title: "Bill Due", body: "Your electricity bill of $85.00 is due in 3 days.", type: "reminder", icon: "⚡" },
    { title: "Monthly Report Ready", body: "Your March financial report is now available.", type: "report", icon: "📊" },
    { title: "Low Balance Alert", body: "Your checking account balance is below $500.", type: "alert", icon: "⚠️" },
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `notif${i+1}`,
    ...items[i % items.length],
    read: i > 3,
    created_at: new Date(Date.now() - i * 3600000 * randInt(2, 12)).toISOString(),
  }));
}

const ALL_TRANSACTIONS = genTransactions(50);
const ALL_INVESTMENTS = genInvestments();
const ALL_ACCOUNTS = genAccounts();
const ALL_NOTIFICATIONS = genNotifications(15);

// ── Router ────────────────────────────────────────
function route(method, path, body, token) {
  const p = path.split("?")[0];
  const query = Object.fromEntries(new URLSearchParams(path.split("?")[1] || ""));

  // ── AUTH ────────────────────────────────────────
  if (method === "POST" && p === "/api/auth/login") {
    const u = [ADMIN, CUSTOMER, ...USERS_DB].find(u => u.email === body.email && u.password === body.password);
    if (!u) return [401, { error: "Invalid email or password" }];
    return [200, { token: makeToken(u), user: { id: u.id, email: u.email, role: u.role, name: u.name } }];
  }

  if (method === "GET" && p === "/api/auth/me") {
    if (!token) return [401, { error: "Unauthorized" }];
    const u = USERS_DB.find(u => u.id === token.sub) || (token.role === "admin" ? ADMIN : CUSTOMER);
    return [200, { user: u }];
  }

  if (method === "POST" && p === "/api/auth/logout") return [200, { success: true }];

  // ── CUSTOMER ────────────────────────────────────
  if (p === "/api/customer/stats") return [200, {
    total_balance: 50650.75, portfolio_value: 29547, monthly_income: 8200,
    monthly_spend: 3420.50, balance_change: 4.2, portfolio_change: 7.8,
    income_change: 2.1, spend_change: -8.5,
  }];

  if (p === "/api/customer/portfolio") return [200, { balance: 50650.75, total_value: 29547, currency: "USD" }];

  if (p === "/api/customer/transactions") {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const type = query.type;
    const search = (query.search || "").toLowerCase();
    let filtered = ALL_TRANSACTIONS;
    if (type && type !== "all") filtered = filtered.filter(t => t.type === type);
    if (search) filtered = filtered.filter(t => t.description.toLowerCase().includes(search));
    const start = (page - 1) * limit;
    return [200, { data: filtered.slice(start, start + limit), meta: { total: filtered.length, page, pages: Math.ceil(filtered.length / limit) } }];
  }

  if (p === "/api/customer/investments") return [200, { data: ALL_INVESTMENTS }];
  if (p === "/api/customer/accounts") return [200, { data: ALL_ACCOUNTS }];
  if (p === "/api/customer/notifications") return [200, { data: ALL_NOTIFICATIONS }];
  if (method === "PATCH" && p.startsWith("/api/customer/notifications/")) {
    const id = p.split("/")[4];
    const n = ALL_NOTIFICATIONS.find(n => n.id === id);
    if (n) n.read = true;
    return [200, { success: true }];
  }
  if (p === "/api/customer/profile") return [200, CUSTOMER];

  // ── ADMIN ───────────────────────────────────────
  if (p === "/api/admin/stats") return [200, {
    total_users: USERS_DB.length, total_revenue: 284500, active_accounts: 4,
    pending_transactions: ALL_TRANSACTIONS.filter(t => t.status === "pending").length,
    users_growth: 12.4, revenue_growth: 8.7, accounts_growth: 5.2,
    success_rate: 97.8, avg_response_ms: 112, error_rate: 0.4,
  }];

  if (p === "/api/admin/users") {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const search = (query.search || "").toLowerCase();
    let filtered = USERS_DB.map(u => ({ ...u, active: u.active !== false }));
    if (search) filtered = filtered.filter(u => u.name?.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
    const start = (page - 1) * limit;
    return [200, { data: filtered.slice(start, start + limit), meta: { total: filtered.length, pages: Math.ceil(filtered.length / limit) } }];
  }

  if (method === "POST" && p === "/api/admin/users") {
    const newUser = { id: `u${Date.now()}`, ...body, active: true, created_at: new Date().toISOString() };
    USERS_DB.push(newUser);
    return [201, { user: newUser }];
  }

  if (method === "PATCH" && p.match(/\/api\/admin\/users\/.+\/status/)) {
    const id = p.split("/")[4];
    const u = USERS_DB.find(u => u.id === id);
    if (u) u.active = body.active;
    return [200, { success: true }];
  }

  if (method === "DELETE" && p.match(/\/api\/admin\/users\/.+/)) {
    const id = p.split("/")[4];
    const idx = USERS_DB.findIndex(u => u.id === id);
    if (idx >= 0) USERS_DB.splice(idx, 1);
    return [200, { success: true }];
  }

  if (p === "/api/admin/transactions") {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const status = query.status;
    let filtered = ALL_TRANSACTIONS;
    if (status) filtered = filtered.filter(t => t.status === status);
    const start = (page - 1) * limit;
    return [200, { data: filtered.slice(start, start + limit), meta: { total: filtered.length, pages: Math.ceil(filtered.length / limit) } }];
  }

  if (method === "PATCH" && p.match(/\/api\/admin\/transactions\/.+\/status/)) {
    const id = p.split("/")[4];
    const tx = ALL_TRANSACTIONS.find(t => t.id === id);
    if (tx) tx.status = body.status;
    return [200, { success: true }];
  }

  if (p.startsWith("/api/admin/reports/")) {
    const type = p.split("/")[4];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const rows = months.slice(0, 6).map((m, i) => ({
      period: m, revenue: parseFloat((rand(20000, 55000)).toFixed(2)),
      transactions: randInt(120, 480), new_users: randInt(8, 45),
      change_pct: parseFloat((rand(-15, 30)).toFixed(1)),
    }));
    return [200, { data: rows, summary: { total_revenue: 284500, avg_monthly: 47416, peak_month: "March" } }];
  }

  if (p === "/api/admin/settings") return [200, {
    platform_name: "Zyrix FinSuite", support_email: "support@zyrix.co",
    timezone: "Asia/Riyadh", currency: "USD",
    session_timeout_minutes: 30, max_login_attempts: 5,
    require_2fa_admin: false, email_notifications: true,
    transaction_alerts: true, daily_report: true,
  }];

  if (method === "PUT" && p === "/api/admin/settings") return [200, { ...body, updated_at: new Date().toISOString() }];

  if (p === "/api/admin/logs") {
    const logs = Array.from({ length: 20 }, (_, i) => ({
      id: `log${i}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      user: { name: i % 3 === 0 ? "Zyrix Admin" : USERS_DB[i % USERS_DB.length]?.name },
      action: ["create","update","delete","login","export"][i % 5],
      resource: ["User","Transaction","Settings","Report","Account"][i % 5],
      details: `Action performed on resource #${1000 + i}`,
      ip_address: `192.168.${randInt(1,5)}.${randInt(10,200)}`,
    }));
    return [200, { data: logs, meta: { total: 20, pages: 1 } }];
  }

  return [404, { error: "Endpoint not found", path: p }];
}

// ── HTTP Server ───────────────────────────────────
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    let parsed = {};
    try { parsed = body ? JSON.parse(body) : {}; } catch {}

    const token = parseToken(req);
    const [status, data] = route(req.method, req.url, parsed, token);

    // Simulate network delay (50-150ms)
    setTimeout(() => {
      res.writeHead(status);
      res.end(JSON.stringify(data));
      console.log(`\x1b[${status < 300 ? "32" : "31"}m${req.method} ${req.url} → ${status}\x1b[0m`);
    }, rand(50, 150));
  });
});

server.listen(PORT, () => {
  console.log(`\n\x1b[36m╔════════════════════════════════════╗`);
  console.log(`║   Zyrix FinSuite Mock API Server   ║`);
  console.log(`╚════════════════════════════════════╝\x1b[0m`);
  console.log(`\n🚀 Running at: \x1b[32mhttp://localhost:${PORT}\x1b[0m\n`);
  console.log(`\x1b[33mTest accounts:\x1b[0m`);
  console.log(`  Admin:    finsuite-admin@zyrix.co  /  Zyrix@Admin2026`);
  console.log(`  Customer: customer@zyrix.co         /  Customer123\n`);
  console.log(`\x1b[90mAll endpoints ready. Ctrl+C to stop.\x1b[0m\n`);
});