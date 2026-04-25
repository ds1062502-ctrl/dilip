import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { TransactionType } from '../types';
import { formatCurrency } from '../utils/helpers';
import { translations } from '../utils/translations';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, AlertCircle, History } from 'lucide-react';
import { startOfDay, format } from 'date-fns';
import { cn } from '../utils/helpers';

interface DashboardProps {
  t: typeof translations.en;
  onSelectCustomer: (id: number) => void;
}

export function Dashboard({ t, onSelectCustomer }: DashboardProps) {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().limit(10).toArray()) || [];
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  
  const stats = useLiveQuery(async () => {
    const txs = await db.transactions.toArray();
    const today = startOfDay(new Date()).getTime();

    let totalCredit = 0;
    let totalPayment = 0;
    let todayCredit = 0;

    txs.forEach(tx => {
      if (tx.type === TransactionType.CREDIT) {
        totalCredit += tx.amount;
        if (tx.date >= today) todayCredit += tx.amount;
      } else {
        totalPayment += tx.amount;
      }
    });

    return {
      totalOutstanding: totalCredit - totalPayment,
      todayCredit,
      totalPending: totalCredit - totalPayment 
    };
  }, []) || { totalOutstanding: 0, todayCredit: 0, totalPending: 0 };

  const getCustomerName = (id: number) => {
    return customers.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center space-y-2"
        >
          <div className="p-3 bg-emerald-50 rounded-2xl">
            <Wallet className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{t.totalOutstanding}</p>
          <h2 className="text-4xl font-black text-rose-600 tracking-tight">
            {formatCurrency(stats.totalOutstanding)}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.todaySales}</span>
            </div>
            <p className="text-xl font-black text-slate-900">{formatCurrency(stats.todayCredit)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.pendingDues}</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xl font-black text-slate-900">{formatCurrency(stats.totalPending)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{t.records}</h4>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t.today}</span>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-50 overflow-hidden shadow-sm">
           {transactions.length === 0 ? (
             <div className="p-8 text-center text-slate-400 text-sm">
                {t.noTransactions}
             </div>
           ) : (
             transactions.map(tx => (
               <button 
                key={tx.id} 
                onClick={() => onSelectCustomer(tx.customerId)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
               >
                 <div className="flex items-center gap-3">
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg",
                     tx.type === TransactionType.CREDIT ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                   )}>
                     {getCustomerName(tx.customerId).charAt(0)}
                   </div>
                   <div>
                     <p className="font-bold text-slate-900 text-sm">{getCustomerName(tx.customerId)}</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {tx.type === TransactionType.CREDIT ? t.credit : t.payment} • {startOfDay(tx.date).getTime() === startOfDay(new Date()).getTime() ? t.today : format(tx.date, 'MMM dd')}
                     </p>
                   </div>
                 </div>
                 <div className="text-right">
                    <p className={cn(
                      "font-black text-sm tracking-tight",
                      tx.type === TransactionType.CREDIT ? "text-rose-600" : "text-emerald-600"
                    )}>
                      {tx.type === TransactionType.CREDIT ? '+' : '-'}{formatCurrency(tx.amount).replace('₹', '')}
                    </p>
                 </div>
               </button>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
