import React from 'react';
import { Target, TrendingUp, PieChart, Briefcase, Activity, CheckCircle2, AlertTriangle, FileText, Sparkles, CreditCard, Building, Banknote } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPieChart, Pie } from 'recharts';

const ReportCover = ({ data }) => (
  <div className="page-break-after min-h-[297mm] bg-white text-slate-900 flex flex-col items-center justify-center p-20 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-4 bg-blue-600"></div>
    <div className="absolute top-4 left-0 w-full h-2 bg-purple-600"></div>
    
    <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl mb-12">
      T
    </div>
    
    <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4 text-center">Monthly Financial Report</h1>
    <h2 className="text-3xl font-light text-slate-500 mb-16">{data.monthYear}</h2>
    
    <div className="w-full max-w-lg border-t-2 border-slate-200 pt-16 mt-16 text-center space-y-4">
      <p className="text-xl font-medium text-slate-400 uppercase tracking-widest">Prepared For</p>
      <p className="text-3xl font-bold text-slate-800">{data.userName}</p>
    </div>
    
    <div className="mt-20 w-full max-w-3xl bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 grid grid-cols-3 gap-4 md:gap-8 text-center shadow-lg">
      <div className="overflow-hidden flex flex-col justify-center min-w-0">
        <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Health Score</p>
        <p className="text-xl md:text-3xl font-black text-blue-600 truncate">{data.healthScore}/100</p>
      </div>
      <div className="border-l border-r border-slate-200 overflow-hidden px-2 md:px-4 flex flex-col justify-center min-w-0">
        <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Net Worth</p>
        <p className="text-xl md:text-3xl font-black text-slate-800 truncate" title={`₹${data.netWorth.toLocaleString()}`}>₹{data.netWorth.toLocaleString()}</p>
      </div>
      <div className="overflow-hidden flex flex-col justify-center min-w-0">
        <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Saved</p>
        <p className="text-xl md:text-3xl font-black text-emerald-600 truncate" title={`₹${data.totalSavings.toLocaleString()}`}>₹{data.totalSavings.toLocaleString()}</p>
      </div>
    </div>

    {(data.totalIncomeQAR > 0 || data.totalExpensesQAR > 0) && (
      <div className="mt-6 w-full max-w-xl bg-purple-50 p-6 rounded-3xl border border-purple-100 grid grid-cols-2 gap-6 text-center shadow-md">
        <div className="overflow-hidden flex flex-col justify-center min-w-0">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">QAR Income</p>
          <p className="text-lg md:text-xl font-black text-purple-700 truncate">QAR {data.totalIncomeQAR.toLocaleString()}</p>
        </div>
        <div className="border-l border-purple-200 overflow-hidden px-4 flex flex-col justify-center min-w-0">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">QAR Spent</p>
          <p className="text-lg md:text-xl font-black text-pink-600 truncate">QAR {data.totalExpensesQAR.toLocaleString()}</p>
        </div>
      </div>
    )}
    
    <div className="absolute bottom-10 text-slate-400 text-sm font-medium">
      Generated on {new Date().toLocaleString()}
    </div>
  </div>
);

const SectionHeader = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-4 mb-8 border-b-2 border-slate-200 pb-4">
    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
      <Icon size={24} />
    </div>
    <h2 className="text-3xl font-black text-slate-800">{title}</h2>
  </div>
);

const ExecutiveSummary = ({ data }) => {
  const formatMoM = (val) => {
    if (val === null || !data.isComparisonValid) return null;
    if (val > 0) return <span className="text-xs font-bold text-slate-400 ml-2 bg-slate-200 px-2 py-1 rounded-full">+{val}% vs last mo</span>;
    if (val < 0) return <span className="text-xs font-bold text-slate-400 ml-2 bg-slate-200 px-2 py-1 rounded-full">{val}% vs last mo</span>;
    return <span className="text-xs font-bold text-slate-400 ml-2 bg-slate-200 px-2 py-1 rounded-full">No change</span>;
  };

  return (
  <div className="page-break-after min-h-[297mm] bg-white text-slate-900 p-16">
    <SectionHeader title="Executive Summary" icon={FileText} />
    
    <div className="grid grid-cols-2 gap-8 mb-12">
      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-500 mb-6 uppercase tracking-wider">Cash Flow</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-600">Total Income</span>
            <span className="font-bold text-emerald-600 text-xl flex items-center">
              ₹{data.totalIncome.toLocaleString()} {formatMoM(data.momIncome)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-600">Total Expenses</span>
            <span className="font-bold text-red-600 text-xl flex items-center">
              ₹{data.totalExpenses.toLocaleString()} {formatMoM(data.momExpenses)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-slate-800 text-lg">Net Cash Flow</span>
            <span className={`font-black text-2xl flex items-center ${data.netCashFlow > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {data.netCashFlow > 0 ? '+' : ''}₹{data.netCashFlow.toLocaleString()}
              {formatMoM(data.momNet)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-500 mb-6 uppercase tracking-wider">Performance</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-600">Total Savings</span>
            <span className="font-bold text-emerald-600 text-xl">₹{data.totalSavings.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-600">Investment Gain</span>
            <span className="font-bold text-purple-600 text-xl">₹{data.investmentGain.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-slate-800 text-lg">Budget Compliance</span>
            <span className="font-black text-2xl text-blue-600">{data.budgetCompliance}%</span>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 p-8 rounded-3xl mb-12">
      <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
        <Activity size={24} /> Financial Health Assessment
      </h3>
      <div className="flex items-center gap-8">
        <div className="text-6xl font-black text-blue-600">{data.healthScore}<span className="text-3xl text-blue-300">/100</span></div>
        <div className="flex-1">
          <p className="text-lg text-blue-900 leading-relaxed font-medium">
            Status: <span className="font-black uppercase">{data.healthStatus}</span>
          </p>
          <p className="text-blue-800/70 mt-2">
            {data.healthSummary}
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};

const IncomeExpenseAnalysis = ({ data }) => {
  // Chart Data Preparation
  const chartData = data.expenseCategories.map(cat => ({
    name: cat.name,
    amount: cat.amount
  })).slice(0, 5); // Top 5 for the chart

  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4'];

  return (
    <div className="page-break-after min-h-[297mm] bg-white text-slate-900 p-16">
      <SectionHeader title="Income, Expense & Transfers" icon={PieChart} />
      
      <div className="mb-12 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Income Breakdown</h3>
          <div className="space-y-3">
            {data.incomeSources.map(inc => (
              <div key={inc.name} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-medium">{inc.name}</span>
                <span className="font-bold text-emerald-600">₹{inc.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Debt & Transfers</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><CreditCard size={20} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-500 uppercase">Total Debt Issued</p>
                <p className="font-bold text-indigo-600 text-lg">₹{data.totalDebt.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Building size={20} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-500 uppercase">Bank Transfers</p>
                <p className="font-bold text-blue-600 text-lg">₹{data.totalBankTransfers.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Banknote size={20} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-500 uppercase">ATM Withdrawals</p>
                <p className="font-bold text-purple-600 text-lg">₹{data.totalAtmWithdrawals.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Expense Categories</h3>
        
        <div className="grid grid-cols-[1fr_1fr_250px] gap-8">
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col justify-center h-80">
            <h4 className="text-center font-bold text-slate-500 mb-4 uppercase tracking-wide">Expense Distribution</h4>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie data={data.expenseCategories} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} stroke="none">
                  {data.expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(val) => `₹${val.toLocaleString()}`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col justify-center h-80">
            <h4 className="text-center font-bold text-slate-500 mb-4 uppercase tracking-wide">Top Expenses</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                <TrendingUp size={14} className="text-red-500" /> Highest Spend
              </p>
              <p className="font-black text-slate-800 text-xl">{data.highestExpenseCategory}</p>
              {data.expenseCategories[0] && (
                <p className="text-red-600 font-bold mt-1">₹{data.expenseCategories[0].amount.toLocaleString()}</p>
              )}
            </div>
            
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                <TrendingUp size={14} className="rotate-180" /> Lowest Spend
              </p>
              <p className="font-black text-slate-800 text-xl">{data.lowestExpenseCategory}</p>
              {data.expenseCategories[data.expenseCategories.length - 1] && (
                <p className="text-emerald-600 font-bold mt-1">₹{data.expenseCategories[data.expenseCategories.length - 1].amount.toLocaleString()}</p>
              )}
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Daily Spend</p>
              <p className="font-black text-slate-800 text-2xl">₹{data.avgDailySpend.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BudgetGoalsAnalysis = ({ data }) => (
  <div className="page-break-after min-h-[297mm] bg-white text-slate-900 p-16">
    <SectionHeader title="Budget & Goals Performance" icon={Target} />
    
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Budget Compliance</h3>
      <div className="space-y-6">
        {data.budgets.map(b => {
          const util = (b.used / b.allocated) * 100;
          return (
            <div key={b.name} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{b.name}</h4>
                  <p className="text-sm font-medium text-slate-500">Allocated: ₹{b.allocated.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${util > 100 ? 'text-red-600' : 'text-slate-800'}`}>Used: ₹{b.used.toLocaleString()}</p>
                  <p className="text-sm font-medium text-slate-500">Remaining: ₹{Math.max(0, b.allocated - b.used).toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className={`h-3 rounded-full ${util > 100 ? 'bg-red-500' : util > 75 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(util, 100)}%` }}></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Goals Progress</h3>
      <div className="grid grid-cols-2 gap-6">
        {data.goals.map(g => (
          <div key={g.name} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">{g.name}</h4>
              <p className="text-sm font-medium text-slate-500 mb-3">₹{g.saved.toLocaleString()} / ₹{g.target.toLocaleString()}</p>
              <p className="text-xs font-bold text-blue-600 bg-blue-100 inline-block px-2 py-1 rounded">ETA: {g.eta}</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center font-bold text-slate-800">
              {Math.round((g.saved / g.target) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const InvestmentAndAI = ({ data }) => (
  <div className="min-h-[297mm] bg-white text-slate-900 p-16">
    <SectionHeader title="Investments & Insights" icon={Sparkles} />
    
    <div className="mb-12 grid grid-cols-2 gap-8">
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Portfolio Summary</h3>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-600 font-medium">Total Invested</span>
            <span className="font-bold">₹{data.invested.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-600 font-medium">Current Value</span>
            <span className="font-bold text-blue-600">₹{data.portfolioValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-600 font-medium">Profit / Loss</span>
            <span className="font-bold text-emerald-600">+₹{data.investmentGain.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-600 font-medium">ROI</span>
            <span className="font-black text-xl text-emerald-600">{data.roi}%</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Accounts</h3>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          {data.accounts.map(acc => (
            <div key={acc.name} className="flex justify-between border-b border-slate-200 pb-2 last:border-0 last:pb-0">
              <span className="text-slate-600 font-medium">{acc.name}</span>
              <span className="font-bold">{acc.currency} {acc.balance.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="mb-12">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">AI Financial Insights & Recommendations</h3>
      <div className="bg-purple-50 border border-purple-200 p-8 rounded-3xl space-y-6">
        <div>
          <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2"><TrendingUp size={18}/> Observations</h4>
          <ul className="list-disc pl-5 space-y-2 text-purple-900/80 font-medium">
            {data.insights.map((ins, i) => <li key={i}>{ins}</li>)}
          </ul>
        </div>
        <div className="pt-6 border-t border-purple-200">
          <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2"><CheckCircle2 size={18}/> Recommendations</h4>
          <ul className="list-disc pl-5 space-y-2 text-purple-900/80 font-medium">
            {data.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
          </ul>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Executive Conclusion</h3>
      <div className="p-8 bg-slate-800 text-slate-100 rounded-3xl leading-relaxed text-lg font-medium">
        {data.conclusion}
      </div>
    </div>
  </div>
);

const DuesDetails = ({ data }) => {
  if (!data.duesData || data.duesData.length === 0) return null;

  return (
    <div className="page-break-after min-h-[297mm] bg-white text-slate-900 p-16">
      <SectionHeader title="Active Dues & Receivables" icon={AlertTriangle} />
      
      <div className="mb-12">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
          <div className="grid grid-cols-4 font-bold text-slate-500 uppercase tracking-wider text-sm border-b border-slate-200 pb-3">
            <div>Description</div>
            <div>Action</div>
            <div>To/From</div>
            <div className="text-right">Amount</div>
          </div>
          {data.duesData.map(due => (
            <div key={due.id} className="grid grid-cols-4 items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0 pt-2">
              <div className="font-medium text-slate-800">{due.description}</div>
              <div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${due.dueAction === 'give' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {due.dueAction}
                </span>
              </div>
              <div className="text-slate-600">{due.toWhom || '-'}</div>
              <div className={`text-right font-bold ${due.dueAction === 'give' ? 'text-red-600' : 'text-emerald-600'}`}>
                {due.dueCurrency === 'QAR' ? 'QAR ' : '₹'}{Number(due.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MonthlyReportTemplate = ({ data }) => {
  return (
    <div className="report-container max-w-[210mm] mx-auto bg-white shadow-2xl rounded-sm print:shadow-none print:max-w-none text-slate-900">
      <style>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .report-container { width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; }
          .page-break-after { page-break-after: always; }
          /* Reset any parent transforms during print */
          * { transform: none !important; }
          /* Hide non-print UI */
          .no-print { display: none !important; }
        }
      `}</style>
      
      <ReportCover data={data} />
      <ExecutiveSummary data={data} />
      <IncomeExpenseAnalysis data={data} />
      <DuesDetails data={data} />
      <BudgetGoalsAnalysis data={data} />
      <InvestmentAndAI data={data} />
    </div>
  );
};

export default MonthlyReportTemplate;
