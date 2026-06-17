import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FileText, Download, Printer, DownloadCloud, ChevronLeft, ChevronRight } from 'lucide-react';
import MonthlyReportTemplate from '../components/reports/MonthlyReportTemplate';

export default function Reports() {
  const componentRef = useRef();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    if (d.getDate() === 1) {
      d.setMonth(d.getMonth() - 1);
    }
    return d;
  });

  const handlePrevMonth = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  useEffect(() => {
    setIsLoading(true);
    // Fetch all needed data
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/investments`).then(res => res.json()).catch(() => [])
    ]).then(([transactions, investments]) => {
      const currentMonth = selectedDate.getMonth();
      const currentYear = selectedDate.getFullYear();
      
      const prevDate = new Date(selectedDate);
      prevDate.setMonth(prevDate.getMonth() - 1);
      const prevMonth = prevDate.getMonth();
      const prevYear = prevDate.getFullYear();
      
      // We don't compare May 2026 or earlier (June 2026 is month 5 of year 2026)
      const isComparisonValid = !(currentYear < 2026 || (currentYear === 2026 && currentMonth <= 5));

      const isQAR = (tx) => tx.mode?.includes('Qatar') || tx.dueCurrency === 'QAR';

      const currentMonthTxs = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      });

      const prevMonthTxs = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === prevMonth && txDate.getFullYear() === prevYear;
      });

      const calculateMetrics = (txs) => {
        let totalIncome = 0;
        let totalExpenses = 0;
        let totalDebt = 0;
        let totalAtmWithdrawals = 0;
        let totalBankTransfers = 0;
        const expenseCategoriesMap = {};
        const incomeSourcesMap = {};

        txs.forEach(tx => {
          if (tx.type === 'Income' && tx.category !== 'Transfer/Loan') {
            totalIncome += tx.amount;
            incomeSourcesMap[tx.category] = (incomeSourcesMap[tx.category] || 0) + tx.amount;
          } else if (tx.type === 'Expense' && tx.category !== 'Transfer/Loan') {
            totalExpenses += tx.amount;
            expenseCategoriesMap[tx.category] = (expenseCategoriesMap[tx.category] || 0) + tx.amount;
          } else if (tx.type === 'Debt') {
            totalDebt += tx.amount;
          } else if (tx.category === 'Transfer/Loan' && tx.type === 'Expense') {
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

        return {
          totalIncome, totalExpenses, totalDebt, totalAtmWithdrawals, totalBankTransfers,
          expenseCategories, incomeSources, highestExpenseCategory, lowestExpenseCategory
        };
      };

      const cm = calculateMetrics(currentMonthTxs.filter(t => !isQAR(t)));
      const pm = calculateMetrics(prevMonthTxs.filter(t => !isQAR(t)));

      const cmQAR = calculateMetrics(currentMonthTxs.filter(t => isQAR(t)));
      const pmQAR = calculateMetrics(prevMonthTxs.filter(t => isQAR(t)));

      const calcMoM = (current, prev) => {
        if (!isComparisonValid) return null;
        if (prev === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - prev) / prev) * 100);
      };

      const momIncome = calcMoM(cm.totalIncome, pm.totalIncome);
      const momExpenses = calcMoM(cm.totalExpenses, pm.totalExpenses);
      const momNet = calcMoM(cm.totalIncome - cm.totalExpenses, pm.totalIncome - pm.totalExpenses);

      // Prepare report data object
      const reportData = {
        userName: 'User',
        monthYear: selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        healthScore: cm.totalIncome === 0 && cm.totalExpenses === 0 ? 0 : cm.totalIncome === 0 ? 0 : Math.max(0, Math.round(((cm.totalIncome - cm.totalExpenses) / cm.totalIncome) * 100)),
        healthStatus: cm.totalIncome >= cm.totalExpenses ? 'Healthy' : 'Needs Attention',
        healthSummary: cm.totalIncome >= cm.totalExpenses ? 'Positive cash flow maintained this month.' : 'Deficit detected. Reduce spending.',
        netWorth: 0, 
        totalSavings: Math.max(0, cm.totalIncome - cm.totalExpenses),
        totalIncome: cm.totalIncome,
        totalExpenses: cm.totalExpenses,
        totalDebt: cm.totalDebt,
        totalAtmWithdrawals: cm.totalAtmWithdrawals,
        totalBankTransfers: cm.totalBankTransfers,
        netCashFlow: cm.totalIncome - cm.totalExpenses,
        totalIncomeQAR: cmQAR.totalIncome,
        totalExpensesQAR: cmQAR.totalExpenses,
        totalSavingsQAR: Math.max(0, cmQAR.totalIncome - cmQAR.totalExpenses),
        momIncome,
        momExpenses,
        momNet,
        isComparisonValid,
        investmentGain: 0,
        budgetCompliance: 100, 
        incomeSources: cm.incomeSources.length > 0 ? cm.incomeSources : [{ name: 'No Income', amount: 0 }],
        expenseCategories: cm.expenseCategories.length > 0 ? cm.expenseCategories : [{ name: 'No Expenses', amount: 0 }],
        highestExpenseCategory: cm.highestExpenseCategory,
        lowestExpenseCategory: cm.lowestExpenseCategory,
        avgDailySpend: Math.round(cm.totalExpenses / Math.max(1, new Date().getDate())), // Avoid /0
        budgets: [], 
        goals: [], 
        invested: investments.reduce((sum, i) => sum + i.amount, 0),
        portfolioValue: investments.reduce((sum, i) => sum + i.amount, 0),
        roi: 0,
        accounts: [],
        duesData: transactions.filter(t => t.type === 'Dues'),
        insights: [
          `You spent ₹${cm.totalExpenses.toLocaleString()} this month.`,
          cm.totalDebt > 0 ? `You have ₹${cm.totalDebt.toLocaleString()} in new debts.` : 'No new debts recorded this month.'
        ],
        recommendations: [
          cm.totalIncome > cm.totalExpenses ? 'Continue your savings strategy.' : 'Review your expenses to find areas to cut back.'
        ],
        conclusion: `Monthly summary: Income ₹${cm.totalIncome.toLocaleString()} | Expenses ₹${cm.totalExpenses.toLocaleString()} | Net Cash Flow ₹${(cm.totalIncome - cm.totalExpenses).toLocaleString()}.`
      };

      setData(reportData);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [selectedDate]);

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
          
          <div className="flex items-center gap-4 bg-[var(--card)] p-2 rounded-xl border border-[var(--border)]">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="font-bold min-w-[150px] text-center">
              {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={exportCSV}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[var(--card)] hover:bg-black/10 dark:hover:bg-white/10 px-6 py-3 rounded-xl transition-all border border-[var(--border)] font-bold text-sm"
              disabled={isLoading}
            >
              <DownloadCloud size={18} />
              Export CSV
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:-translate-y-0.5 shadow-lg shadow-blue-500/30 transition-all font-bold text-sm disabled:opacity-50"
              disabled={isLoading}
            >
              <Printer size={18} />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Report Preview Wrapper */}
        <div className="bg-slate-200 dark:bg-slate-800 p-4 md:p-8 rounded-xl overflow-x-auto custom-scrollbar shadow-inner flex justify-center no-print min-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="transform scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 origin-top transition-transform">
              <div ref={componentRef}>
                <MonthlyReportTemplate data={data} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
