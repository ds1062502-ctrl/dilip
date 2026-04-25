/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { db } from './db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { translations, Language } from './utils/translations';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/CustomerList';
import { CustomerDetail } from './components/CustomerDetail';
import { TransactionType } from './types';
import { Plus, Users, LayoutDashboard, Globe } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'CUSTOMERS' | 'CUSTOMER_DETAIL'>('DASHBOARD');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [lang, setLang] = useState<Language>('en');

  const t = translations[lang];

  const handleSelectCustomer = (id: number) => {
    setSelectedCustomerId(id);
    setActiveView('CUSTOMER_DETAIL');
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'kn' : 'en');
  };

  return (
    <Layout 
      title={t.appName}
      activeView={activeView}
      onViewChange={setActiveView}
      actions={
        <button 
          onClick={toggleLang}
          className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-xs font-medium hover:bg-white/20 transition-colors"
        >
          <Globe className="w-3 h-3" />
          {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
        </button>
      }
      navItems={[
        { id: 'DASHBOARD', label: t.dashboard, icon: LayoutDashboard },
        { id: 'CUSTOMERS', label: t.customers, icon: Users },
      ]}
    >
      {activeView === 'DASHBOARD' && (
        <Dashboard t={t} onSelectCustomer={handleSelectCustomer} />
      )}
      
      {activeView === 'CUSTOMERS' && (
        <CustomerList t={t} onSelectCustomer={handleSelectCustomer} />
      )}

      {activeView === 'CUSTOMER_DETAIL' && selectedCustomerId && (
        <CustomerDetail 
          t={t} 
          customerId={selectedCustomerId} 
          onBack={() => setActiveView('CUSTOMERS')} 
        />
      )}
    </Layout>
  );
}

