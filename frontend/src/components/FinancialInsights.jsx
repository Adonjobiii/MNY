import React, { useMemo } from 'react';
import { 
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, 
  AlertCircle, DollarSign, Wallet, ArrowRight, Activity, 
  ShoppingCart, Coffee, Plane, Film, Lightbulb, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FinancialInsights({ transactions, activeCurrency }) {
  const insights = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const currencySymbol = activeCurrency === 'INR' ? '₹' : 'QAR';
    
    // Filter by currency
    const isQAR = (tx) => tx.mode?.includes('Qatar') || tx.dueCurrency === 'QAR' || tx.mode === 'Cash (Qatar Riyal)';
    const currencyTxs = transactions.filter(tx => activeCurrency === 'QAR' ? isQAR(tx) : !isQAR(tx));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    let currMonthExpenses = 0;
    let prevMonthExpenses = 0;
    let currMonthIncome = 0;
    let prevMonthIncome = 0;
    let currMonthTransfers = 0;

    const currCategoryTotals = {};
    const prevCategoryTotals = {};

    currencyTxs.forEach(tx => {
      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      const isPrevMonth = txDate.getMonth() === prevMonth && txDate.getFullYear() === prevYear;

      if (isCurrentMonth) {
        if (tx.type === 'Expense') {
          currMonthExpenses += tx.amount;
          currCategoryTotals[tx.category] = (currCategoryTotals[tx.category] || 0) + tx.amount;
        } else if (tx.type === 'Income') {
          currMonthIncome += tx.amount;
        } else if (tx.type === 'Transfer') {
          currMonthTransfers += tx.amount;
        }
      } else if (isPrevMonth) {
        if (tx.type === 'Expense') {
          prevMonthExpenses += tx.amount;
          prevCategoryTotals[tx.category] = (prevCategoryTotals[tx.category] || 0) + tx.amount;
        } else if (tx.type === 'Income') {
          prevMonthIncome += tx.amount;
        }
      }
    });

    const generatedInsights = [];
    const hasPrevMonthData = prevMonthExpenses > 0 || prevMonthIncome > 0 || Object.keys(prevCategoryTotals).length > 0;

    // 1. Savings Insight
    const currSavings = currMonthIncome - currMonthExpenses;
    const prevSavings = prevMonthIncome - prevMonthExpenses;
    if (currSavings > 0) {
      if (hasPrevMonthData) {
        const savingDiff = currSavings - prevSavings;
        if (savingDiff > 0) {
          generatedInsights.push({
            id: 'savings-up',
            type: 'Savings Insights',
            color: 'green',
            icon: <ShieldCheck />,
            title: 'Savings Increased',
            amountDiff: `+${currencySymbol}${savingDiff.toLocaleString()}`,
            description: `You saved ${currencySymbol}${savingDiff.toLocaleString()} more this month compared to last month.`,
            trend: 'up',
            isHighlight: true
          });
        } else if (savingDiff < 0) {
          generatedInsights.push({
            id: 'savings-down',
            type: 'Savings Insights',
            color: 'amber',
            icon: <AlertCircle />,
            title: 'Savings Decreased',
            amountDiff: `${currencySymbol}${savingDiff.toLocaleString()}`,
            description: `You saved ${currencySymbol}${Math.abs(savingDiff).toLocaleString()} less this month.`,
            trend: 'down'
          });
        } else {
          generatedInsights.push({
            id: 'savings-steady',
            type: 'Savings Insights',
            color: 'blue',
            icon: <ShieldCheck />,
            title: 'Savings Steady',
            amountDiff: `${currencySymbol}${currSavings.toLocaleString()}`,
            description: `You have saved ${currencySymbol}${currSavings.toLocaleString()} this month after expenses.`,
            trend: 'up'
          });
        }
      } else {
        // No previous data, just show absolute savings
        generatedInsights.push({
          id: 'savings-absolute',
          type: 'Savings Insights',
          color: 'green',
          icon: <ShieldCheck />,
          title: 'Total Savings',
          amountDiff: `${currencySymbol}${currSavings.toLocaleString()}`,
          description: `You have saved a total of ${currencySymbol}${currSavings.toLocaleString()} so far this month.`,
          trend: 'up',
          isHighlight: true
        });
      }
    }

    // 2. Spending Insight
    if (currMonthExpenses > 0) {
      if (hasPrevMonthData) {
        const expenseDiff = currMonthExpenses - prevMonthExpenses;
        if (expenseDiff > 0) {
          generatedInsights.push({
            id: 'spending-up',
            type: 'Spending Insights',
            color: 'red',
            icon: <TrendingUp />,
            title: 'Expenses Increased',
            amountDiff: `+${currencySymbol}${expenseDiff.toLocaleString()}`,
            description: `Your overall spending is ${currencySymbol}${expenseDiff.toLocaleString()} higher than last month.`,
            trend: 'up',
            isHighlight: generatedInsights.length === 0
          });
        } else if (expenseDiff < 0) {
          generatedInsights.push({
            id: 'spending-down',
            type: 'Spending Insights',
            color: 'green',
            icon: <TrendingDown />,
            title: 'Expenses Decreased',
            amountDiff: `-${currencySymbol}${Math.abs(expenseDiff).toLocaleString()}`,
            description: `Great job! You spent ${currencySymbol}${Math.abs(expenseDiff).toLocaleString()} less than last month overall.`,
            trend: 'down',
            isHighlight: generatedInsights.length === 0
          });
        }
      } else {
        // Just show current expenses
        generatedInsights.push({
          id: 'spending-absolute',
          type: 'Spending Insights',
          color: 'blue',
          icon: <Activity />,
          title: 'Total Expenses',
          amountDiff: `${currencySymbol}${currMonthExpenses.toLocaleString()}`,
          description: `You have spent ${currencySymbol}${currMonthExpenses.toLocaleString()} this month.`,
          trend: 'neutral',
          isHighlight: generatedInsights.length === 0
        });
      }
    }

    // 3. Category Insights
    if (hasPrevMonthData) {
      let maxCatIncrease = { cat: null, diff: 0, amount: 0 };
      Object.keys(currCategoryTotals).forEach(cat => {
        const curr = currCategoryTotals[cat];
        const prev = prevCategoryTotals[cat] || 0;
        const diff = curr - prev;
        if (diff > maxCatIncrease.diff) {
          maxCatIncrease = { cat, diff, amount: curr };
        }
      });

      if (maxCatIncrease.cat && maxCatIncrease.diff > 0) {
        generatedInsights.push({
          id: 'cat-up',
          type: 'Spending Insights',
          color: 'amber',
          icon: <ShoppingCart />,
          title: `${maxCatIncrease.cat} Spending ↑`,
          amountDiff: `+${currencySymbol}${maxCatIncrease.diff.toLocaleString()}`,
          description: `You spent ${currencySymbol}${maxCatIncrease.diff.toLocaleString()} more on ${maxCatIncrease.cat} compared to last month.`,
          trend: 'up'
        });
      }
    }

    let topCat = { cat: null, amount: 0 };
    Object.keys(currCategoryTotals).forEach(cat => {
      if (currCategoryTotals[cat] > topCat.amount) {
        topCat = { cat, amount: currCategoryTotals[cat] };
      }
    });

    if (topCat.cat) {
      generatedInsights.push({
        id: 'top-cat',
        type: 'Spending Insights',
        color: 'blue',
        icon: <Activity />,
        title: `Top Category: ${topCat.cat}`,
        amountDiff: `${currencySymbol}${topCat.amount.toLocaleString()}`,
        description: `Your highest spending category this month is ${topCat.cat} at ${currencySymbol}${topCat.amount.toLocaleString()}.`,
        trend: 'neutral'
      });
    }

    // 4. Transfer Insight
    if (currMonthTransfers > 0) {
      generatedInsights.push({
        id: 'transfers',
        type: 'Currency Insights',
        color: 'blue',
        icon: <ArrowRight />,
        title: 'Transfers Made',
        amountDiff: `${currencySymbol}${currMonthTransfers.toLocaleString()}`,
        description: `You transferred ${currencySymbol}${currMonthTransfers.toLocaleString()} to other accounts this month.`,
        trend: 'neutral'
      });
    }

    if (!hasPrevMonthData && generatedInsights.length > 0) {
      generatedInsights.push({
        id: 'baseline',
        type: 'Account Insights',
        color: 'blue',
        icon: <Activity />,
        title: 'Establishing Baseline',
        amountDiff: 'AI',
        description: `Keep logging your transactions this month. The AI will unlock powerful comparative insights next month!`,
        trend: 'neutral'
      });
    } else if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: 'no-data',
        type: 'Account Insights',
        color: 'blue',
        icon: <Lightbulb />,
        title: 'No Recent Insights',
        amountDiff: `${currencySymbol}0`,
        description: `Add more transactions this month to generate AI insights.`,
        trend: 'neutral',
        isHighlight: true
      });
    }

    return generatedInsights.sort((a, b) => (b.isHighlight ? 1 : 0) - (a.isHighlight ? 1 : 0));
  }, [transactions, activeCurrency]);

  if (insights.length === 0) return null;

  const highlight = insights.find(i => i.isHighlight) || insights[0];
  const otherInsights = insights.filter(i => i.id !== highlight.id);

  const getColorClasses = (color) => {
    switch(color) {
      case 'green': return 'from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-500';
      case 'red': return 'from-red-500/20 to-rose-500/10 border-red-500/30 text-red-500';
      case 'amber': return 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-500';
      case 'blue': default: return 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-500';
    }
  };

  return (
    <div className="mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-xl text-white shadow-lg shadow-purple-500/20">
          <Lightbulb size={20} />
        </div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-purple-500">Finance Intelligence</h2>
      </div>

      <div className={`glass-panel rounded-3xl p-1 relative overflow-hidden mb-6 group`}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-transparent opacity-50"></div>
        <div className={`relative bg-gradient-to-br ${getColorClasses(highlight.color).split(' ').slice(0,2).join(' ')} border ${getColorClasses(highlight.color).split(' ')[2]} backdrop-blur-xl rounded-[22px] p-6 md:p-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 transition-all hover:bg-opacity-80`}>
          
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-4 rounded-2xl bg-[var(--background)] shadow-xl shrink-0 ${getColorClasses(highlight.color).split(' ')[3]}`}>
              {highlight.icon}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Highlight • {highlight.type}</div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 flex flex-wrap items-center gap-3">
                {highlight.title}
                <span className={`text-base md:text-lg font-bold px-3 py-1 rounded-full bg-[var(--background)] shadow-sm ${getColorClasses(highlight.color).split(' ')[3]}`}>
                  {highlight.amountDiff}
                </span>
              </h3>
              <p className="text-base md:text-lg opacity-80 leading-relaxed max-w-2xl">
                {highlight.description}
              </p>
            </div>
          </div>

          <Link to="/analytics" className="shrink-0 px-6 py-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold hover:scale-105 transition-transform shadow-xl w-full xl:w-auto text-center">
            View Analysis
          </Link>
        </div>
      </div>

      {otherInsights.length > 0 && (
        <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 snap-x custom-scrollbar">
          {otherInsights.map((insight) => (
            <div key={insight.id} className="snap-start shrink-0 w-72 md:w-80 glass-panel rounded-2xl p-5 border border-[var(--border)] hover:border-blue-500/30 transition-colors flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-[var(--background)] shadow-sm ${getColorClasses(insight.color).split(' ')[3]}`}>
                    {insight.icon}
                  </div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full bg-[var(--background)] shadow-sm border ${getColorClasses(insight.color).split(' ')[2]} ${getColorClasses(insight.color).split(' ')[3]}`}>
                    {insight.amountDiff}
                  </div>
                </div>
                <h4 className="font-bold text-lg mb-2">{insight.title}</h4>
                <p className="text-sm opacity-70 leading-relaxed mb-4">{insight.description}</p>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-40">{insight.type}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
