import { Eye, EyeOff, CreditCard as CreditCardIcon, Receipt, TrendingUp, Zap, DollarSign, Newspaper, ArrowUpRight } from 'lucide-react';
import { useBank } from '@/contexts/BankContext';
import { formatCurrency } from '@/utils/pixUtils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  onPixClick: () => void;
  onStatementClick: () => void;
  onInvestmentsClick: () => void;
  onCreditCardClick: () => void;
  onLoanClick: () => void;
  onLogoClick: () => void;
}

export const Dashboard = ({ onPixClick, onStatementClick, onInvestmentsClick, onCreditCardClick, onLoanClick, onLogoClick }: DashboardProps) => {
  const { account, toggleBalanceVisibility } = useBank();
  
  const displayLimit = account.hideBalance ? '••••••' : formatCurrency(account.creditLimit);

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="bg-gradient-primary p-6 pb-32">
        <div className="max-w-md mx-auto">
          <button onClick={onLogoClick} className="flex items-center gap-2 mb-8 text-left">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Zap className="text-primary-foreground" size={24} />
            </div>
            <span className="text-primary-foreground font-bold text-xl">RapidPag</span>
          </button>
          
          <div className="text-primary-foreground/80 text-sm mb-2">Olá,</div>
          <h1 className="text-primary-foreground text-2xl font-bold">Tech Solutions LTDA</h1>
          <div className="text-primary-foreground/80 text-sm mb-2">PESSOA JURÍDICA</div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="max-w-md mx-auto px-6 -mt-24">
        <Card className="p-6 shadow-glow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm">Conta</span>
            <button 
              onClick={toggleBalanceVisibility}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {account.hideBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="mb-6">
            <div className="text-3xl font-bold mb-2">
              {account.hideBalance ? '••••••' : formatCurrency(account.balance)}
            </div>
            <div className="text-sm text-muted-foreground">
              {account.hideBalance ? '••••••' : `Saldo + Crédito = ${formatCurrency(account.balance + account.creditLimit)}`}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={onPixClick}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <ArrowUpRight className="text-primary-foreground" size={20} />
              </div>
              <span className="text-sm font-medium">Enviar</span>
            </button>

            <button
              onClick={onStatementClick}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <Receipt className="text-primary-foreground" size={20} />
              </div>
              <span className="text-sm font-medium">Extrato</span>
            </button>

            <button 
              onClick={onInvestmentsClick}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <TrendingUp className="text-primary-foreground" size={20} />
              </div>
              <span className="text-sm font-medium">Investir</span>
            </button>
          </div>
        </Card>

        {/* Info Cards */}
        <div className="mt-6 space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <CreditCardIcon className="text-primary" size={32} />
              <div className="flex-1">
                <h3 className="font-semibold">Cartão de Crédito</h3>
                <p className="text-sm text-muted-foreground">Limite Atual: {displayLimit}</p>
                <button 
                  onClick={onCreditCardClick} 
                  className="text-sm text-primary hover:underline mt-1"
                >
                  Ver fatura atual
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 cursor-pointer" onClick={onLoanClick}>
              <DollarSign className="text-primary" size={32} />
              <div>
                <h3 className="font-semibold">Empréstimo Pessoal</h3>
                <p className="text-sm text-muted-foreground">Disponível</p>
              </div>
            </div>
          </Card>

          {/* News Cards */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Card className="p-3 hover:shadow-md transition-shadow">
              <Newspaper className="text-primary mb-2" size={20} />
              <p className="text-xs font-medium line-clamp-2">Selic deve manter taxa em 2026</p>
            </Card>
            <Card className="p-3 hover:shadow-md transition-shadow">
              <TrendingUp className="text-primary mb-2" size={20} />
              <p className="text-xs font-medium line-clamp-2">Bolsa atinge novo recorde histórico</p>
            </Card>
            <Card className="p-3 hover:shadow-md transition-shadow">
              <Zap className="text-primary mb-2" size={20} />
              <p className="text-xs font-medium line-clamp-2">Fundos imobiliários em alta</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};