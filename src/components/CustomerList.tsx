import { useState, FormEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { TransactionType, CustomerWithBalance } from '../types';
import { formatCurrency, cn } from '../utils/helpers';
import { translations } from '../utils/translations';
import { Search, Plus, UserPlus, Phone, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerListProps {
  t: typeof translations.en;
  onSelectCustomer: (id: number) => void;
}

export function CustomerList({ t, onSelectCustomer }: CustomerListProps) {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showToast, setShowToast] = useState(false);

  const customers = useLiveQuery(async () => {
    const all = await db.customers.toArray();
    const transactions = await db.transactions.toArray();

    const result = all.map(c => {
      const cTxs = transactions.filter(t => t.customerId === c.id);
      const totalCredit = cTxs.filter(t => t.type === TransactionType.CREDIT).reduce((sum, t) => sum + t.amount, 0);
      const totalPayment = cTxs.filter(t => t.type === TransactionType.PAYMENT).reduce((sum, t) => sum + t.amount, 0);
      return {
        ...c,
        totalCredit,
        totalPayment,
        balance: totalCredit - totalPayment
      };
    });

    return result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  }, [search, isAdding]);

  const handleAddCustomer = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    await db.customers.add({
      name: newName,
      phone: newPhone,
      createdAt: Date.now()
    });
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const formatPhoneInput = (value: string) => {
    // Remove all non-digits and limit to 10 digits
    return value.replace(/\D/g, '').slice(0, 10);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={t.searchCustomer}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
        >
          <UserPlus className="w-6 h-6" />
        </button>
      </div>

      {/* Customer List */}
      <div className="space-y-2">
        {customers?.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>{t.noCustomers}</p>
          </div>
        ) : (
          customers?.map((customer) => (
            <motion.button
              layout
              key={customer.id}
              onClick={() => onSelectCustomer(customer.id!)}
              className="w-full text-left bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 font-black text-xl uppercase">
                {customer.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-slate-900 truncate">{customer.name}</h4>
                <p className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                  <Phone className="w-3 h-3" /> {customer.phone}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn(
                  "font-black text-sm",
                  customer.balance > 0 ? "text-rose-600" : "text-emerald-600"
                )}>
                  {formatCurrency(customer.balance)}
                </p>
                <div className="flex items-center justify-end text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                  {t.balance} <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-900 text-white px-6 py-3 rounded-full shadow-xl font-bold text-sm flex items-center gap-2 z-50 whitespace-nowrap"
          >
            <div className="w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
              <Plus className="w-3 h-3 text-emerald-900 stroke-[4px]" />
            </div>
            Customer Saved Successfully
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">{t.addCustomer}</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <Plus className="rotate-45 w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">{t.name}</label>
                  <input 
                    autoFocus
                    required
                    type="text" 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all outline-none text-lg font-medium"
                    placeholder="E.g. Manjunath"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">{t.phone}</label>
                  <input 
                    required
                    type="tel" 
                    inputMode="numeric"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all outline-none text-lg font-medium"
                    placeholder="10XXXXXX00"
                    value={newPhone}
                    onChange={(e) => setNewPhone(formatPhoneInput(e.target.value))}
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
                >
                  {t.save}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Users = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
