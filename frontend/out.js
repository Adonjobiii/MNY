var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/pages/Analytics.jsx
var Analytics_exports = {};
__export(Analytics_exports, {
  default: () => Analytics
});
module.exports = __toCommonJS(Analytics_exports);
var import_react = require("react");
var import_recharts = require("recharts");
var import_lucide_react = require("lucide-react");
var import_meta = {};
var COLORS = ["#3b82f6", "#8b5cf6", "#f43f5e", "#10b981", "#f59e0b"];
function Analytics() {
  const [timeframe, setTimeframe] = (0, import_react.useState)("1M");
  const [selectedWeek, setSelectedWeek] = (0, import_react.useState)(1);
  const [transactions, setTransactions] = (0, import_react.useState)([]);
  const [displayCurrency, setDisplayCurrency] = (0, import_react.useState)("QAR");
  (0, import_react.useEffect)(() => {
    fetch(`${import_meta.env.VITE_API_URL || "http://localhost:5000"}/api/transactions`).then((res) => res.json()).then((data2) => setTransactions(Array.isArray(data2) ? data2 : [])).catch((err) => console.error("Failed to load transactions", err));
  }, []);
  const isQAR = (tx) => tx.mode?.includes("Qatar") || tx.dueCurrency === "QAR";
  const displayTransactions = transactions.filter(
    (t) => displayCurrency === "QAR" ? isQAR(t) : !isQAR(t)
  );
  const processTimeData = (txs, tf) => {
    const grouped = {};
    const now = /* @__PURE__ */ new Date();
    if (tf === "1M") {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const k = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        grouped[k] = { name: k, income: 0, expenses: 0 };
      }
    } else if (tf === "1W") {
      for (let i = 6; i >= 0; i--) {
        const d = /* @__PURE__ */ new Date();
        d.setDate(d.getDate() - i);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        grouped[k] = { name: k, income: 0, expenses: 0 };
      }
    }
    txs.forEach((t) => {
      let key = t.date || "";
      if (tf === "6M" || tf === "1Y") {
        key = key.substring(0, 7);
        if (!grouped[key]) grouped[key] = { name: key, income: 0, expenses: 0 };
      } else if (tf === "1M" && key.substring(0, 7) !== `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`) {
        return;
      } else if (tf === "1W" && !grouped[key]) {
        return;
      }
      if (!grouped[key]) grouped[key] = { name: key, income: 0, expenses: 0 };
      if (t.type === "Income") {
        grouped[key].income += Number(t.amount) || 0;
      }
      if (t.type === "Expense") {
        grouped[key].expenses += Number(t.amount) || 0;
      }
    });
    const sorted = Object.values(grouped).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (tf === "6M") return sorted.slice(-6);
    if (tf === "1Y") return sorted.slice(-12);
    return sorted;
  };
  const getCategoryData = (txs) => {
    const catMap = {};
    txs.filter((t) => t.type === "Expense").forEach((t) => {
      const cat = t.category || "Uncategorized";
      catMap[cat] = (catMap[cat] || 0) + (Number(t.amount) || 0);
    });
    return Object.keys(catMap).map((k) => ({ name: k, value: catMap[k] })).sort((a, b) => b.value - a.value);
  };
  const data = processTimeData(displayTransactions, timeframe);
  const categoryData = getCategoryData(displayTransactions);
  const currencySymbol = displayCurrency === "INR" ? "\u20B9" : "QAR ";
  const formatYAxis = (val) => {
    if (val >= 1e3) return `${currencySymbol}${(val / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
    return `${currencySymbol}${val}`;
  };
  return /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold mb-1" }, "Analytics Overview"), /* @__PURE__ */ React.createElement("p", { className: "opacity-60" }, "Deep dive into your financial patterns.")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row gap-4 items-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 p-1 glass rounded-xl" }, ["INR", "QAR"].map((cur) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: cur,
      onClick: () => setDisplayCurrency(cur),
      className: `px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${displayCurrency === cur ? "bg-indigo-600 text-white shadow-md" : "hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"}`
    },
    cur
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 p-1 glass rounded-xl" }, ["1W", "1M", "6M", "1Y"].map((tf) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: tf,
      onClick: () => setTimeframe(tf),
      className: `px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${timeframe === tf ? "bg-blue-600 text-white shadow-md" : "hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"}`
    },
    tf
  ))))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-2 glass-panel rounded-3xl p-6 hover:shadow-2xl transition-all duration-300" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-6" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold" }, "Income vs Expenses"), /* @__PURE__ */ React.createElement("button", { className: "p-2 glass hover:bg-[var(--card)] rounded-xl transition-colors opacity-70 hover:opacity-100" }, /* @__PURE__ */ React.createElement(import_lucide_react.Download, { size: 18 }))), /* @__PURE__ */ React.createElement("div", { className: "h-[350px] w-full" }, /* @__PURE__ */ React.createElement(import_recharts.ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement(import_recharts.AreaChart, { data }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: "colorIncome", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "5%", stopColor: "#10b981", stopOpacity: 0.3 }), /* @__PURE__ */ React.createElement("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0 })), /* @__PURE__ */ React.createElement("linearGradient", { id: "colorExpense", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "5%", stopColor: "#f43f5e", stopOpacity: 0.3 }), /* @__PURE__ */ React.createElement("stop", { offset: "95%", stopColor: "#f43f5e", stopOpacity: 0 }))), /* @__PURE__ */ React.createElement(import_recharts.CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "rgba(255,255,255,0.1)" }), /* @__PURE__ */ React.createElement(import_recharts.XAxis, { dataKey: "name", axisLine: false, tickLine: false, tick: { fill: "var(--foreground)", opacity: 0.5 }, dy: 10 }), /* @__PURE__ */ React.createElement(import_recharts.YAxis, { width: 80, axisLine: false, tickLine: false, tick: { fill: "var(--foreground)", opacity: 0.5 }, dx: -10, tickFormatter: formatYAxis }), /* @__PURE__ */ React.createElement(import_recharts.Tooltip, { content: /* @__PURE__ */ React.createElement(CustomTooltip, { currencySymbol }) }), /* @__PURE__ */ React.createElement(import_recharts.Area, { type: "monotone", dataKey: "income", stroke: "#10b981", strokeWidth: 3, fillOpacity: 1, fill: "url(#colorIncome)" }), /* @__PURE__ */ React.createElement(import_recharts.Area, { type: "monotone", dataKey: "expenses", stroke: "#f43f5e", strokeWidth: 3, fillOpacity: 1, fill: "url(#colorExpense)" }))))), /* @__PURE__ */ React.createElement("div", { className: "glass-panel rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 flex flex-col" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold mb-6" }, "Spending by Category"), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-h-[300px] flex items-center justify-center relative" }, /* @__PURE__ */ React.createElement(import_recharts.ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement(import_recharts.PieChart, null, /* @__PURE__ */ React.createElement(
    import_recharts.Pie,
    {
      data: categoryData,
      innerRadius: 80,
      outerRadius: 110,
      paddingAngle: 5,
      dataKey: "value",
      stroke: "none"
    },
    categoryData.map((entry, index) => /* @__PURE__ */ React.createElement(import_recharts.Cell, { key: `cell-${index}`, fill: COLORS[index % COLORS.length] }))
  ), /* @__PURE__ */ React.createElement(import_recharts.Tooltip, { content: /* @__PURE__ */ React.createElement(PieCustomTooltip, { currencySymbol, categoryData }) }))), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold" }, currencySymbol, categoryData.reduce((a, b) => a + b.value, 0).toLocaleString()), /* @__PURE__ */ React.createElement("span", { className: "text-sm opacity-50" }, "Total"))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 space-y-3" }, categoryData.map((cat, i) => /* @__PURE__ */ React.createElement("div", { key: cat.name, className: "flex items-center justify-between text-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: COLORS[i % COLORS.length] } }), /* @__PURE__ */ React.createElement("span", { className: "opacity-80" }, cat.name)), /* @__PURE__ */ React.createElement("span", { className: "font-semibold" }, currencySymbol, cat.value.toLocaleString())))))), /* @__PURE__ */ React.createElement("div", { className: "glass-panel rounded-3xl p-6 hover:shadow-2xl transition-all duration-300" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-6" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold" }, "Monthly Cash Flow Comparison"), timeframe === "1M" && /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedWeek,
      onChange: (e) => setSelectedWeek(Number(e.target.value)),
      className: "bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 text-[var(--foreground)]"
    },
    Array.from({ length: Math.ceil(data.length / 7) }).map((_, i) => /* @__PURE__ */ React.createElement("option", { key: i + 1, value: i + 1 }, "Week ", i + 1))
  )), /* @__PURE__ */ React.createElement("div", { className: "h-[300px] w-full" }, /* @__PURE__ */ React.createElement(import_recharts.ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement(import_recharts.BarChart, { data: timeframe === "1M" ? data.slice((selectedWeek - 1) * 7, selectedWeek * 7) : data }, /* @__PURE__ */ React.createElement(import_recharts.CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "rgba(255,255,255,0.1)" }), /* @__PURE__ */ React.createElement(import_recharts.XAxis, { dataKey: "name", axisLine: false, tickLine: false, tick: { fill: "var(--foreground)", opacity: 0.5 }, dy: 10 }), /* @__PURE__ */ React.createElement(import_recharts.YAxis, { width: 80, axisLine: false, tickLine: false, tick: { fill: "var(--foreground)", opacity: 0.5 }, dx: -10, tickFormatter: formatYAxis }), /* @__PURE__ */ React.createElement(
    import_recharts.Tooltip,
    {
      cursor: { fill: "rgba(255,255,255,0.05)" },
      content: /* @__PURE__ */ React.createElement(CustomTooltip, { currencySymbol })
    }
  ), /* @__PURE__ */ React.createElement(import_recharts.Bar, { dataKey: "income", fill: "#10b981", radius: [4, 4, 0, 0] }), /* @__PURE__ */ React.createElement(import_recharts.Bar, { dataKey: "expenses", fill: "#f43f5e", radius: [4, 4, 0, 0] }))))));
}
var CustomTooltip = ({ active, payload, label, currencySymbol }) => {
  if (active && payload && payload.length) {
    const incomeObj = payload.find((p) => p.dataKey === "income");
    const expensesObj = payload.find((p) => p.dataKey === "expenses");
    const income = incomeObj ? incomeObj.value : 0;
    const expenses = expensesObj ? expensesObj.value : 0;
    let spendingPercentage = 0;
    if (income > 0) {
      spendingPercentage = Math.round(expenses / income * 100);
    } else if (expenses > 0) {
      spendingPercentage = 100;
    }
    let colorClass = "text-green-500";
    if (spendingPercentage > 60) {
      colorClass = "text-red-500";
    } else if (spendingPercentage > 30) {
      colorClass = "text-orange-500";
    }
    return /* @__PURE__ */ React.createElement("div", { className: "bg-[var(--card)] border border-[var(--border)] p-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold mb-2 text-[var(--foreground)]" }, label), payload.map((entry, index) => /* @__PURE__ */ React.createElement("p", { key: index, style: { color: entry.color }, className: "text-sm font-medium" }, entry.name, ": ", currencySymbol, entry.value.toLocaleString())), /* @__PURE__ */ React.createElement("p", { className: `text-sm font-bold mt-2 pt-2 border-t border-[var(--border)] ${colorClass}` }, "Spending: ", income === 0 && expenses > 0 ? "> 100" : spendingPercentage, "%"));
  }
  return null;
};
var PieCustomTooltip = ({ active, payload, currencySymbol, categoryData }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = categoryData.reduce((sum, item) => sum + item.value, 0);
    const percentage = total > 0 ? Math.round(data.value / total * 100) : 0;
    return /* @__PURE__ */ React.createElement("div", { className: "bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-lg" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-[var(--foreground)] flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-3 h-3 rounded-full", style: { backgroundColor: data.payload.fill } }), data.name), /* @__PURE__ */ React.createElement("p", { className: "text-sm mt-1" }, currencySymbol, data.value.toLocaleString()), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-slate-500 mt-1" }, percentage, "% of Total Expenses"));
  }
  return null;
};
