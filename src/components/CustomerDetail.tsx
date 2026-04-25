import { useState, useMemo, FormEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { TransactionType, Transaction } from '../types';
import { formatCurrency, cn, openWhatsApp } from '../utils/helpers';
import { translations } from '../utils/translations';
import { ArrowLeft, Plus, History, MessageCircle, ArrowUpRight, ArrowDownLeft, Info, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface CustomerDetailProps {
  t: typeof translations.en;
  customerId: number;
  onBack: () => void;
}

export function CustomerDetail({ t, customerId, onBack }: CustomerDetailProps) {
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [txType, setTxType] = useState<TransactionType>(TransactionType.CREDIT);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const customer = useLiveQuery(() => db.customers.get(customerId), [customerId]);
  const transactions = useLiveQuery(() => 
    db.transactions.where('customerId').equals(customerId).reverse().sortBy('date'),
    [customerId, isAddingTx]
  );

  const balance = useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce((sum, tx) => {
      return tx.type === TransactionType.CREDIT ? sum + tx.amount : sum - tx.amount;
    }, 0);
  }, [transactions]);

  const handleAddTransaction = async (e: FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount)) return;

    await db.transactions.add({
      customerId,
      amount: numAmount,
      type: txType,
      note: note || undefined,
      date: Date.now()
    });

    setAmount('');
    setNote('');
    setIsAddingTx(false);
  };

  const handleWhatsApp = () => {
    if (!customer) return;
    const message = t.reminderText
      .replace('{name}', customer.name)
      .replace('{balance}', balance.toString());
    openWhatsApp(customer.phone, message);
  };

  if (!customer) return null;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors border border-slate-100">
          <ArrowLeft className="w-5 h-5 text-emerald-700" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{customer.name}</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{customer.phone}</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-emerald-900 p-6 rounded-[32px] text-white shadow-xl shadow-emerald-900/20 flex flex-col items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Wallet className="w-24 h-24" />
        </div>
        <div className="text-center relative z-10">
          <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{t.balance}</p>
          <h3 className="text-4xl font-black tracking-tight">{formatCurrency(balance)}</h3>
        </div>
        
        <div className="flex w-full gap-3 relative z-10">
          <button 
            onClick={handleWhatsApp}
            disabled={balance <= 0}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-lg shadow-black/20"
          >
            <MessageCircle className="w-4 h-4 fill-white/10" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.sendReminder}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => { setTxType(TransactionType.CREDIT); setIsAddingTx(true); }}
          className="bg-white border border-slate-200 text-slate-900 p-5 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <div className="bg-rose-50 p-2 rounded-xl text-rose-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.1em] text-slate-400">{t.credit}</span>
        </button>
        <button 
          onClick={() => { setTxType(TransactionType.PAYMENT); setIsAddingTx(true); }}
          className="bg-white border border-slate-200 text-slate-900 p-5 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.1em] text-slate-400">{t.payment}</span>
        </button>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{t.history}</h4>
        </div>
        
        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-50">
          {!transactions || transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
               <p className="text-xs font-bold uppercase tracking-widest opacity-30">{t.noTransactions}</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    tx.type === TransactionType.CREDIT ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {tx.type === TransactionType.CREDIT ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {tx.type === TransactionType.CREDIT ? t.credit : t.payment}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                      {format(tx.date, 'MMM dd, HH:mm')}
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
                  {tx.note && <p className="text-[10px] text-slate-400 font-medium italic mt-0.5 truncate max-w-[100px]">{tx.note}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isAddingTx && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {txType === TransactionType.CREDIT ? t.credit : t.payment}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{customer.name}</p>
                </div>
                <button onClick={() => setIsAddingTx(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <Plus className="rotate-45 w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">{t.amount}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-200">₹</span>
                    <input 
                      autoFocus
                      required
                      type="number" 
                      inputMode="numeric"
                      className="w-full p-6 pl-12 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all outline-none text-4xl font-black tracking-tight"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Note (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all outline-none text-lg font-medium"
                    placeholder="E.g. Rice, Milk, Egg..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  className={cn(
                    "w-full py-5 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-transform text-white uppercase tracking-widest",
                    txType === TransactionType.CREDIT ? "bg-rose-600 shadow-rose-600/20" : "bg-emerald-600 shadow-emerald-600/20"
                  )}
                >
                  {t.save} {txType === TransactionType.CREDIT ? t.credit : t.payment}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
