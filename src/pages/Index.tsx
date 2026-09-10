import { useState, useRef, useEffect } from 'react';
import { BankProvider } from '@/contexts/BankContext';
import { Dashboard } from '@/components/Dashboard';
import { PixTransfer } from '@/components/PixTransfer';
import { Statement } from '@/components/Statement';
import { Investments } from '@/components/Investments';
import { CreditCard } from '@/components/CreditCard';
import { Loan } from '@/components/Loan';
import { AdminPanel } from '@/components/AdminPanel';
import { ThemeSettings } from '@/components/ThemeSettings';
import { BottomNav } from '@/components/BottomNav';

type Screen = 'dashboard' | 'pix' | 'statement' | 'investments' | 'creditCard' | 'loan' | 'admin' | 'theme';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [logoClickCount, setLogoClickCount] = useState(0);
  const logoClickTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    if (logoClickTimer.current) {
      clearTimeout(logoClickTimer.current);
    }

    const newClickCount = logoClickCount + 1;
    setLogoClickCount(newClickCount);

    if (newClickCount === 3) {
      setLogoClickCount(0);
      setCurrentScreen('admin');
    } else {
      logoClickTimer.current = setTimeout(() => {
        setLogoClickCount(0);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (logoClickTimer.current) {
        clearTimeout(logoClickTimer.current);
      }
    };
  }, []);

  // Telas que não devem mostrar o menu inferior (como admin ou fluxo de pix se desejado)
  const hideNav = currentScreen === 'admin';

  return (
    <BankProvider>
      <div className="min-h-screen pb-20">
        {currentScreen === 'dashboard' && (
          <Dashboard
            onPixClick={() => setCurrentScreen('pix')}
            onStatementClick={() => setCurrentScreen('statement')}
            onInvestmentsClick={() => setCurrentScreen('investments')}
            onCreditCardClick={() => setCurrentScreen('creditCard')}
            onLoanClick={() => setCurrentScreen('loan')}
            onLogoClick={handleLogoClick}
          />
        )}
        {currentScreen === 'pix' && (
          <PixTransfer onBack={() => setCurrentScreen('dashboard')} />
        )}
        {currentScreen === 'statement' && (
          <Statement onBack={() => setCurrentScreen('dashboard')} />
        )}
        {currentScreen === 'investments' && (
          <Investments onBack={() => setCurrentScreen('dashboard')} />
        )}
        {currentScreen === 'creditCard' && (
          <CreditCard onBack={() => setCurrentScreen('dashboard')} />
        )}
        {currentScreen === 'loan' && (
          <Loan onBack={() => setCurrentScreen('dashboard')} />
        )}
        {currentScreen === 'admin' && (
          <AdminPanel onBack={() => setCurrentScreen('dashboard')} />
        )}
        {currentScreen === 'theme' && (
          <ThemeSettings onBack={() => setCurrentScreen('dashboard')} />
        )}
      </div>
      
      {!hideNav && (
        <BottomNav 
          currentScreen={currentScreen} 
          onNavigate={setCurrentScreen} 
        />
      )}
    </BankProvider>
  );
};

export default Index;