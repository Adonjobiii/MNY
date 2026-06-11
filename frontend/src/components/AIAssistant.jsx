import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageSquare, X, Send, Bot, User, Sparkles, ChevronDown, Mic } from 'lucide-react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm your TrackMyMNY Personal CFO. Ask me anything about your finances, budgets, or if you can afford a new purchase!" }
  ]);
  const [input, setInput] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`);
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch transactions for AI:', err);
      }
    };
    fetchTx();

    const socket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`);
    socket.on('transaction_added', tx => setTransactions(prev => [tx, ...prev]));
    socket.on('transaction_updated', tx => setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t)));
    socket.on('transaction_deleted', id => setTransactions(prev => prev.filter(t => t.id !== id)));

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const parseQuery = (text) => {
    const q = text.toLowerCase();
    
    // Helper functions
    const isQAR = (tx) => tx.mode?.includes('Qatar') || tx.dueCurrency === 'QAR';
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const isThisMonth = (dStr) => {
      const d = new Date(dStr);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };
    
    const isLastMonth = (dStr) => {
      const d = new Date(dStr);
      let lm = currentMonth - 1;
      let ly = currentYear;
      if (lm < 0) { lm = 11; ly--; }
      return d.getMonth() === lm && d.getFullYear() === ly;
    };

    const formatCurrency = (val, currency = 'INR') => {
      return `${currency === 'INR' ? '₹' : 'QAR'} ${Math.abs(val).toLocaleString()}`;
    };

    // 1. "Can I afford X for Y?"
    if (q.includes('afford')) {
      // Very basic regex to find amount
      const amountMatch = q.match(/\d+(?:,\d+)*(?:\.\d+)?/);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[0].replace(/,/g, ''));
        const totalBalance = transactions.reduce((acc, tx) => {
          if (!isQAR(tx)) {
            if (tx.type === 'Income') return acc + tx.amount;
            if (tx.type === 'Expense') return acc - tx.amount;
            if (tx.type === 'Dues' && tx.includeInBalance) {
              return tx.dueAction === 'add' ? acc + tx.amount : acc - tx.amount;
            }
          }
          return acc;
        }, 0);

        if (totalBalance >= amount * 1.2) {
          return `Yes! Your current available balance is **${formatCurrency(totalBalance)}**. Even after spending ${formatCurrency(amount)}, you'll still have a healthy ${formatCurrency(totalBalance - amount)} buffer left.`;
        } else if (totalBalance >= amount) {
          return `Technically yes, as you have **${formatCurrency(totalBalance)}**. However, spending ${formatCurrency(amount)} will leave you with just ${formatCurrency(totalBalance - amount)}, which might be tight. Consider waiting until your next income.`;
        } else {
          return `I wouldn't recommend it right now. You currently have **${formatCurrency(totalBalance)}**, which is less than the ${formatCurrency(amount)} needed. Let's set it as a savings goal instead!`;
        }
      }
      return "I can help with that! Just tell me how much the item costs. For example: 'Can I afford a laptop for 85000?'";
    }

    // 2. "Where did I spend the most money this month?" or "largest expense category"
    if ((q.includes('most') && q.includes('spend')) || q.includes('largest expense')) {
      const expenses = transactions.filter(t => t.type === 'Expense' && isThisMonth(t.date));
      if (expenses.length === 0) return "You haven't recorded any expenses yet this month!";
      
      const categoryTotals = {};
      expenses.forEach(t => {
        const curr = isQAR(t) ? 'QAR' : 'INR';
        const key = `${t.category}_${curr}`;
        if (!categoryTotals[key]) {
          categoryTotals[key] = { cat: t.category, curr, amt: 0 };
        }
        categoryTotals[key].amt += t.amount;
      });
      
      let maxCat = '';
      let maxAmt = 0;
      let maxCurr = 'INR';
      for (const val of Object.values(categoryTotals)) {
        if (val.amt > maxAmt) {
          maxAmt = val.amt;
          maxCat = val.cat;
          maxCurr = val.curr;
        }
      }
      
      return `Your largest expense category this month is **${maxCat}**, totaling **${formatCurrency(maxAmt, maxCurr)}**.`;
    }

    // 3. "Compare this month with last month"
    if (q.includes('compare') || (q.includes('last month') && q.includes('this month'))) {
      const getTotals = (txs) => txs.reduce((acc, t) => {
        const c = isQAR(t) ? 'QAR' : 'INR';
        acc[c] += t.amount;
        return acc;
      }, { INR: 0, QAR: 0 });
      
      const currT = getTotals(transactions.filter(t => t.type === 'Expense' && isThisMonth(t.date)));
      const lastT = getTotals(transactions.filter(t => t.type === 'Expense' && isLastMonth(t.date)));
      
      let res = [];
      if (currT.INR > 0 || lastT.INR > 0) {
        const diff = currT.INR - lastT.INR;
        res.push(`**INR:** Spent ${formatCurrency(currT.INR, 'INR')} (${diff > 0 ? '+' : ''}${formatCurrency(diff, 'INR')} vs last month).`);
      }
      if (currT.QAR > 0 || lastT.QAR > 0) {
        const diff = currT.QAR - lastT.QAR;
        res.push(`**QAR:** Spent ${formatCurrency(currT.QAR, 'QAR')} (${diff > 0 ? '+' : ''}${formatCurrency(diff, 'QAR')} vs last month).`);
      }
      
      return res.length > 0 ? res.join(' ') : "You have no expenses recorded for this or last month yet!";
    }

    // 4. "How much did I spend on food"
    if (q.includes('spend on') || q.includes('spent on')) {
      // Find category mentioned
      const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Travel', 'Education', 'General'];
      const foundCat = categories.find(c => q.includes(c.toLowerCase()));
      
      if (foundCat) {
        const filtered = transactions.filter(t => t.type === 'Expense' && t.category === foundCat);
        const inrTotal = filtered.filter(t => !isQAR(t)).reduce((s, t) => s + t.amount, 0);
        const qarTotal = filtered.filter(t => isQAR(t)).reduce((s, t) => s + t.amount, 0);
        
        let msg = `You have spent `;
        if (inrTotal > 0 && qarTotal > 0) msg += `**${formatCurrency(inrTotal, 'INR')}** and **${formatCurrency(qarTotal, 'QAR')}**`;
        else if (qarTotal > 0) msg += `**${formatCurrency(qarTotal, 'QAR')}**`;
        else msg += `**${formatCurrency(inrTotal, 'INR')}**`;
        return msg + ` on ${foundCat} historically.`;
      }
      return "Which category are you asking about? (e.g., Food, Travel, Shopping)";
    }

    // 5. "Qatar accounts"
    if (q.includes('qatar') && (q.includes('balance') || q.includes('how much'))) {
      const qatarBalance = transactions.filter(t => isQAR(t)).reduce((acc, tx) => {
        if (tx.type === 'Income') return acc + tx.amount;
        if (tx.type === 'Expense') return acc - tx.amount;
        if (tx.type === 'Dues' && tx.includeInBalance) return tx.dueAction === 'add' ? acc + tx.amount : acc - tx.amount;
        return acc;
      }, 0);
      return `You currently have **${formatCurrency(qatarBalance, 'QAR')}** in your Qatar accounts.`;
    }

    // 6. "Which bank account has the highest balance"
    if (q.includes('highest balance') || q.includes('most money')) {
      const balances = {};
      transactions.forEach(tx => {
        if (!tx.mode) return;
        const amt = tx.amount;
        const mult = (tx.type === 'Income' || (tx.type === 'Dues' && tx.dueAction === 'add')) ? 1 : -1;
        if (tx.type === 'Transfer') return; // ignore for simple logic
        balances[tx.mode] = (balances[tx.mode] || 0) + (amt * mult);
      });
      
      let maxAcc = '';
      let maxAmt = -Infinity;
      for (const [acc, amt] of Object.entries(balances)) {
        if (amt > maxAmt && !acc.includes('Dues')) { // Don't count Dues as "highest balance"
          maxAmt = amt;
          maxAcc = acc;
        }
      }
      
      if (maxAcc) {
        const curr = maxAcc.includes('Qatar') ? 'QAR' : 'INR';
        return `**${maxAcc}** holds your highest balance right now at **${formatCurrency(maxAmt, curr)}**.`;
      }
    }

    // Default Fallback
    return "I'm analyzing your financial data, but I didn't quite catch that. You can ask me about your highest expenses, compare this month to last month, or check if you can afford a specific item!";
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    // Simulate AI thinking delay for premium feel
    setTimeout(() => {
      const response = parseQuery(userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  const quickPrompts = [
    "Where did I spend the most money this month?",
    "Compare this month with last month.",
    "Can I afford a laptop for 85000?",
    "How much money do I have in Qatar accounts?",
    "Which bank account has the highest balance?"
  ];

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 
          ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}
          bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center animate-pulse-glow group`}
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform duration-300" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 z-50 w-full sm:w-[400px] h-[600px] max-h-[85vh] sm:max-h-[80vh] flex flex-col 
        bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden
        transition-all duration-500 origin-bottom-right
        ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg text-white">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">TrackMyMNY AI</h3>
              <p className="text-xs font-medium opacity-60">Your Personal CFO</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-60 hover:opacity-100"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shrink-0 flex items-center justify-center text-white mr-2 mt-auto">
                  <Bot size={14} />
                </div>
              )}
              <div 
                className={`max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-sm' 
                  : 'bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-bl-sm text-slate-800 dark:text-slate-200'}`}
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
              />
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shrink-0 flex items-center justify-center text-white mr-2 mt-auto">
                <Bot size={14} />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl rounded-bl-sm p-4 shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-3 pb-1">
            {quickPrompts.map((prompt, i) => (
              <button 
                key={i}
                onClick={() => {
                  setInput(prompt);
                  // Optional: handleSend automatically, but letting user hit enter is safer
                }}
                className="whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask your CFO anything..."
              className="w-full pl-4 pr-24 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-inner text-sm transition-all"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button 
                type="button"
                className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Mic size={18} />
              </button>
              <button 
                type="submit"
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-blue-600 text-white disabled:opacity-50 disabled:bg-slate-400 hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
