const fs = require('fs');
const file = 'frontend/src/components/reports/MonthlyReportTemplate.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace standard ₹ symbol with dynamic currency string, unless it's inside title=
content = content.replace(/>₹{/g, '>{data.currency === "QAR" ? "QAR " : "₹"}{');
content = content.replace(/₹{/g, '{data.currency === "QAR" ? "QAR " : "₹"}{');

// Remove the QAR-specific block that we deleted
content = content.replace(/\{\(data\.totalIncomeQAR \> 0 \|\| data\.totalExpensesQAR \> 0\) \&\& \([\s\S]*?\)\}/, '');

fs.writeFileSync(file, content);
