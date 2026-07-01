import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FileText, Printer, DownloadCloud, ChevronLeft, ChevronRight } from 'lucide-react';
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
    setIsLoading(true);
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setIsLoading(true);
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  useEffect(() => {
    // Fetch all needed data
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`)
        .then(res => res.json())
        .then(data => Array.isArray(data) ? data : [])
        .catch(() => []),
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/investments`)
        .then(res => res.json())
        .then(data => Array.isArray(data) ? data : [])
        .catch(() => [])
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
          const amt = Number(tx.amount) || 0;
          if (tx.type === 'Income' && tx.category !== 'Transfer/Loan') {
            totalIncome += amt;
            incomeSourcesMap[tx.category] = (incomeSourcesMap[tx.category] || 0) + amt;
          } else if (tx.type === 'Expense' && tx.category !== 'Transfer/Loan') {
            totalExpenses += amt;
            expenseCategoriesMap[tx.category] = (expenseCategoriesMap[tx.category] || 0) + amt;
          } else if (tx.type === 'Debt') {
            totalDebt += amt;
          } else if (tx.category === 'Transfer/Loan' && tx.type === 'Expense') {
            if (tx.description && tx.description.includes('Cash')) {
              totalAtmWithdrawals += amt;
            } else {
              totalBankTransfers += amt;
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

      const cmINR = calculateMetrics(currentMonthTxs.filter(t => !isQAR(t)));
      const cmQAR = calculateMetrics(currentMonthTxs.filter(t => isQAR(t)));
      const pmINR = calculateMetrics(prevMonthTxs.filter(t => !isQAR(t)));
      const pmQAR = calculateMetrics(prevMonthTxs.filter(t => isQAR(t)));

      const calcMoM = (current, prev) => {
        if (!isComparisonValid) return null;
        if (prev === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - prev) / prev) * 100);
      };

      const momIncomeINR = calcMoM(cmINR.totalIncome, pmINR.totalIncome);
      const momExpensesINR = calcMoM(cmINR.totalExpenses, pmINR.totalExpenses);
      const momNetINR = calcMoM(cmINR.totalIncome - cmINR.totalExpenses, pmINR.totalIncome - pmINR.totalExpenses);

      const momIncomeQAR = calcMoM(cmQAR.totalIncome, pmQAR.totalIncome);
      const momExpensesQAR = calcMoM(cmQAR.totalExpenses, pmQAR.totalExpenses);
      const momNetQAR = calcMoM(cmQAR.totalIncome - cmQAR.totalExpenses, pmQAR.totalIncome - pmQAR.totalExpenses);

      const healthScoreINR = cmINR.totalIncome === 0 && cmINR.totalExpenses === 0 ? 0 : cmINR.totalIncome === 0 ? 0 : Math.max(0, Math.round(((cmINR.totalIncome - cmINR.totalExpenses) / cmINR.totalIncome) * 100));
      const healthScoreQAR = cmQAR.totalIncome === 0 && cmQAR.totalExpenses === 0 ? 0 : cmQAR.totalIncome === 0 ? 0 : Math.max(0, Math.round(((cmQAR.totalIncome - cmQAR.totalExpenses) / cmQAR.totalIncome) * 100));
      const healthScore = Math.max(healthScoreINR, healthScoreQAR);

      const reportData = {
        userName: 'User',
        monthYear: selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        healthScore: healthScore,
        healthStatus: (cmINR.totalIncome >= cmINR.totalExpenses && cmQAR.totalIncome >= cmQAR.totalExpenses) ? 'Healthy' : 'Needs Attention',
        healthSummary: 'Combined cash flow assessment.',
        netWorthINR: 0, 
        netWorthQAR: 0,
        totalSavingsINR: Math.max(0, cmINR.totalIncome - cmINR.totalExpenses),
        totalSavingsQAR: Math.max(0, cmQAR.totalIncome - cmQAR.totalExpenses),
        totalIncomeINR: cmINR.totalIncome,
        totalIncomeQAR: cmQAR.totalIncome,
        totalExpensesINR: cmINR.totalExpenses,
        totalExpensesQAR: cmQAR.totalExpenses,
        totalDebtINR: cmINR.totalDebt,
        totalDebtQAR: cmQAR.totalDebt,
        totalAtmWithdrawalsINR: cmINR.totalAtmWithdrawals,
        totalAtmWithdrawalsQAR: cmQAR.totalAtmWithdrawals,
        totalBankTransfersINR: cmINR.totalBankTransfers,
        totalBankTransfersQAR: cmQAR.totalBankTransfers,
        netCashFlowINR: cmINR.totalIncome - cmINR.totalExpenses,
        netCashFlowQAR: cmQAR.totalIncome - cmQAR.totalExpenses,
        momIncomeINR, momExpensesINR, momNetINR,
        momIncomeQAR, momExpensesQAR, momNetQAR,
        isComparisonValid,
        investmentGain: 0,
        budgetCompliance: 100, 
        incomeSourcesINR: cmINR.incomeSources.length > 0 ? cmINR.incomeSources : [{ name: 'No Income', amount: 0 }],
        incomeSourcesQAR: cmQAR.incomeSources.length > 0 ? cmQAR.incomeSources : [{ name: 'No Income', amount: 0 }],
        expenseCategoriesINR: cmINR.expenseCategories.length > 0 ? cmINR.expenseCategories : [{ name: 'No Expenses', amount: 0 }],
        expenseCategoriesQAR: cmQAR.expenseCategories.length > 0 ? cmQAR.expenseCategories : [{ name: 'No Expenses', amount: 0 }],
        highestExpenseCategoryINR: cmINR.highestExpenseCategory,
        highestExpenseCategoryQAR: cmQAR.highestExpenseCategory,
        lowestExpenseCategoryINR: cmINR.lowestExpenseCategory,
        lowestExpenseCategoryQAR: cmQAR.lowestExpenseCategory,
        avgDailySpendINR: Math.round(cmINR.totalExpenses / Math.max(1, new Date().getDate())), 
        avgDailySpendQAR: Math.round(cmQAR.totalExpenses / Math.max(1, new Date().getDate())), 
        budgets: [], 
        goals: [], 
        invested: investments.reduce((sum, i) => sum + i.amount, 0),
        portfolioValue: investments.reduce((sum, i) => sum + i.amount, 0),
        roi: 0,
        accounts: [],
        duesData: transactions.filter(t => t.type === 'Dues'),
        insights: [
          `You spent ₹${cmINR.totalExpenses.toLocaleString()} and QAR ${cmQAR.totalExpenses.toLocaleString()} this month.`,
          (cmINR.totalDebt > 0 || cmQAR.totalDebt > 0) ? `You have ₹${cmINR.totalDebt.toLocaleString()} | QAR ${cmQAR.totalDebt.toLocaleString()} in new debts.` : 'No new debts recorded this month.'
        ],
        recommendations: [
          'Review your combined expenses to find areas to cut back.'
        ],
        conclusion: `Monthly summary: Income ₹${cmINR.totalIncome.toLocaleString()} | QAR ${cmQAR.totalIncome.toLocaleString()} - Expenses ₹${cmINR.totalExpenses.toLocaleString()} | QAR ${cmQAR.totalExpenses.toLocaleString()}`
      };

      setData(reportData);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [selectedDate]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
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
