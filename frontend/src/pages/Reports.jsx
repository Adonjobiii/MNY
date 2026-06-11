import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FileText, Download, Printer, DownloadCloud } from 'lucide-react';
import MonthlyReportTemplate from '../components/reports/MonthlyReportTemplate';

export default function Reports() {
  const componentRef = useRef();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch all needed data
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`).then(res => res.json()),
      // Mock other APIs if they don't exist yet, or fetch if they do
      // Investments are available in backend
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/investments`).then(res => res.json()).catch(() => [])
    ]).then(([transactions, investments]) => {
      // Current Month Filtering
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const currentMonthTxs = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      });

      // Calculate Metrics
      let totalIncome = 0;
      let totalExpenses = 0;
      let totalDebt = 0;
      let totalAtmWithdrawals = 0;
      let totalBankTransfers = 0;
      
      const expenseCategoriesMap = {};
      const incomeSourcesMap = {};

      currentMonthTxs.forEach(tx => {
        if (tx.type === 'Income' && tx.category !== 'Transfer/Loan') {
          totalIncome += tx.amount;
          incomeSourcesMap[tx.category] = (incomeSourcesMap[tx.category] || 0) + tx.amount;
        } else if (tx.type === 'Expense' && tx.category !== 'Transfer/Loan') {
          totalExpenses += tx.amount;
          expenseCategoriesMap[tx.category] = (expenseCategoriesMap[tx.category] || 0) + tx.amount;
        } else if (tx.type === 'Debt') {
          totalDebt += tx.amount;
        } else if (tx.category === 'Transfer/Loan' && tx.type === 'Expense') {
          // Outgoing transfer represents the transfer
          if (tx.description.includes('Cash')) {
            totalAtmWithdrawals += tx.amount;
          } else {
            totalBankTransfers += tx.amount;
          }
        }
      });

      const expenseCategories = Object.entries(expenseCategoriesMap)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);
        
      const incomeSources = Object.entries(incomeSourcesMap)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);

      let highestExpenseCategory = 'None';
      let lowestExpenseCategory = 'None';
      if (expenseCategories.length > 0) {
        highestExpenseCategory = expenseCategories[0].name;
        lowestExpenseCategory = expenseCategories[expenseCategories.length - 1].name;
      }

      // Prepare report data object
      const reportData = {
        userName: 'User', // Could be fetched from profile
        monthYear: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
        healthScore: totalIncome > totalExpenses ? 85 : 40,
        healthStatus: totalIncome > totalExpenses ? 'Healthy' : 'Needs Attention',
        healthSummary: totalIncome > totalExpenses ? 'Positive cash flow maintained this month.' : 'Deficit detected. Reduce spending.',
        netWorth: 0, // Placeholder
        totalSavings: Math.max(0, totalIncome - totalExpenses),
        totalIncome,
        totalExpenses,
        totalDebt,
        totalAtmWithdrawals,
        totalBankTransfers,
        netCashFlow: totalIncome - totalExpenses,
        investmentGain: 0,
        budgetCompliance: 100, // Placeholder
        incomeSources: incomeSources.length > 0 ? incomeSources : [{ name: 'No Income', amount: 0 }],
        expenseCategories: expenseCategories.length > 0 ? expenseCategories : [{ name: 'No Expenses', amount: 0 }],
        highestExpenseCategory,
        lowestExpenseCategory,
        avgDailySpend: Math.round(totalExpenses / now.getDate()),
        budgets: [], // Placeholder
        goals: [], // Placeholder
        invested: investments.reduce((sum, i) => sum + i.amount, 0),
        portfolioValue: investments.reduce((sum, i) => sum + i.amount, 0),
        roi: 0,
        accounts: [],
        insights: [
          `You spent ₹${totalExpenses.toLocaleString()} this month so far.`,
          totalDebt > 0 ? `You have ₹${totalDebt.toLocaleString()} in new debts.` : 'No new debts recorded this month.'
        ],
        recommendations: [
          totalIncome > totalExpenses ? 'Continue your savings strategy.' : 'Review your expenses to find areas to cut back.'
        ],
        conclusion: `Monthly summary: Income ₹${totalIncome.toLocaleString()} | Expenses ₹${totalExpenses.toLocaleString()} | Net Cash Flow ₹${(totalIncome - totalExpenses).toLocaleString()}.`
      };

      setData(reportData);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `TrackMyMNY_Report_${data?.monthYear?.replace(' ', '_')}`
  });

  const exportCSV = () => {
    if (!data) return;
    const csvContent = `data:text/csv;charset=utf-8,Category,Amount\nIncome,${data.totalIncome}\nExpenses,${data.totalExpenses}\nSavings,${data.totalSavings}\nDebt,${data.totalDebt}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financial_summary_${data.monthYear.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-screen bg-[var(--bg)] custom-scrollbar">
      <div className="p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto pb-24">
        
        {/* Header Controls (Non-Printable) */}
        <div className="no-print mb-8 glass-panel p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 sticky top-20 z-10">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
              <FileText className="text-blue-500" /> Executive Reports
            </h1>
            <p className="opacity-60 text-sm">Generate and export your monthly financial statements.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={exportCSV}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[var(--card)] hover:bg-black/10 dark:hover:bg-white/10 px-6 py-3 rounded-xl transition-all border border-[var(--border)] font-bold text-sm"
            >
              <DownloadCloud size={18} />
              Export CSV
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:-translate-y-0.5 shadow-lg shadow-blue-500/30 transition-all font-bold text-sm"
            >
              <Printer size={18} />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Report Preview Wrapper */}
        <div className="bg-slate-200 dark:bg-slate-800 p-4 md:p-8 rounded-xl overflow-x-auto custom-scrollbar shadow-inner flex justify-center no-print">
          <div className="transform scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 origin-top transition-transform">
            <div ref={componentRef}>
              <MonthlyReportTemplate data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
