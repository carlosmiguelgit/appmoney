import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, BankAccount, Loan, PixKeyType } from '@/types/transaction';
import { generateRandomName, generateRandomBank } from '@/utils/pixUtils';

interface BankContextType {
  account: BankAccount;
  transactions: Transaction[];
  loans: Loan[];
  toggleBalanceVisibility: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  addLoan: (amountInCents: number) => void;
  updateCreditLimit: (newLimitInCents: number) => void;
  addBulkTransactions: (count: number, amountInCents: number, deduct: boolean) => void;
  setThemeColor: (color: string) => void;
  setContainerColor: (color: string) => void;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

const STORAGE_KEY = 'nubank-clone-data';

const defaultAccountState: BankAccount = {
  balance: 18200000,
  hideBalance: false,
  creditLimit: 4800000,
  themeColor: '260 80% 55%',
  containerColor: '270 60% 8%', // Roxo escuro original
};

export const BankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<BankAccount>(defaultAccountState);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const loadedAccount = { ...defaultAccountState, ...data.account };
      setAccount(loadedAccount);
      
      if (loadedAccount.themeColor) {
        document.documentElement.style.setProperty('--primary', loadedAccount.themeColor);
      }
      if (loadedAccount.containerColor) {
        updateContainerCSS(loadedAccount.containerColor);
      }

      setTransactions(data.transactions.map((t: any) => ({
        ...t,
        date: new Date(t.date)
      })));
      setLoans(data.loans?.map((l: any) => ({ ...l, date: new Date(l.date) })) || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ account, transactions, loans }));
  }, [account, transactions, loans]);

  const updateContainerCSS = (hsl: string) => {
    const [h, s, lStr] = hsl.split(' ');
    const l = parseInt(lStr);
    
    document.documentElement.style.setProperty('--background', hsl);
    document.documentElement.style.setProperty('--card', `${h} ${s} ${l + 4}%`);
    document.documentElement.style.setProperty('--secondary', `${h} ${s} ${l + 10}%`);
    document.documentElement.style.setProperty('--primary-glow', `${h} ${s} ${Math.max(0, l - 5)}%`);
  };

  const setThemeColor = (color: string) => {
    setAccount(prev => ({ ...prev, themeColor: color }));
    document.documentElement.style.setProperty('--primary', color);
  };

  const setContainerColor = (color: string) => {
    setAccount(prev => ({ ...prev, containerColor: color }));
    updateContainerCSS(color);
  };

  const toggleBalanceVisibility = () => setAccount(prev => ({ ...prev, hideBalance: !prev.hideBalance }));
  const addTransaction = (t: any) => {
    const nt = { ...t, id: crypto.randomUUID(), date: new Date() };
    setTransactions(prev => [nt, ...prev]);
    if (t.type === 'pix-sent') setAccount(prev => ({ ...prev, balance: prev.balance - t.amount }));
  };
  const addLoan = (a: number) => {
    const nl = { id: crypto.randomUUID(), amount: a, date: new Date() };
    setLoans(prev => [nl, ...prev]);
    setAccount(prev => ({ ...prev, balance: prev.balance + a }));
  };
  const updateCreditLimit = (l: number) => setAccount(prev => ({ ...prev, creditLimit: l }));
  const addBulkTransactions = (count: number, amount: number, deduct: boolean) => { /* ... manter implementação existente ... */ };

  return (
    <BankContext.Provider value={{
      account, transactions, loans, toggleBalanceVisibility, addTransaction, addLoan, updateCreditLimit, addBulkTransactions, setThemeColor, setContainerColor
    }}>
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => {
  const context = useContext(BankContext);
  if (!context) throw new Error('useBank must be used within BankProvider');
  return context;
};