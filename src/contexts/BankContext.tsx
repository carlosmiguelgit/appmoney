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
}

const BankContext = createContext<BankContextType | undefined>(undefined);

const STORAGE_KEY = 'nubank-clone-data';

const defaultAccountState: BankAccount = {
  balance: 18200000,
  hideBalance: false,
  creditLimit: 4800000,
};

export const BankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<BankAccount>(defaultAccountState);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Ignora cores customizadas legadas (tema agora é fixo preto + verde)
      const { themeColor, containerColor, ...savedAccount } = data.account ?? {};
      const loadedAccount = { ...defaultAccountState, ...savedAccount };
      setAccount(loadedAccount);

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
      account, transactions, loans, toggleBalanceVisibility, addTransaction, addLoan, updateCreditLimit, addBulkTransactions
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