import { Eye, EyeOff, CreditCard as CreditCardIcon, Receipt, TrendingUp, Zap, DollarSign, Newspaper, ArrowUpRight, ChevronRight } from 'lucide-react';
import { useBank } from '@/contexts/BankContext';
import { formatCurrency } from '@/utils/pixUtils';
import { Card } from '@/components/ui/card';

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
    <div className="bg-background min-h-screen animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-primary px-5 pt-6 pb-32">
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute top-10 -left-24 w-72 h-72 rounded-full bg-black/20 blur-3xl" />
        <div className="relative max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onLogoClick} className="flex items-center gap-3 text-left group">
              <img
                src="/logo.png"
                alt="RapidPag"
                className="h-14 w-auto rounded-2xl bg-black border border-white/10 shadow-float group-active:scale-95 transition-transform"
              />
              <div className="text-primary-foreground/70 text-[11px] font-semibold tracking-widest">Seu Banco<br />Digital</div>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-primary-foreground/80 text-sm">Olá,</span>
              <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-primary-foreground font-bold">
                T
              </div>
            </div>
          </div>
          
          <h1 className="text-primary-foreground text-[26px] leading-tight font-bold tracking-tight">Tech Solutions LTDA</h1>
          <div className="text-primary-foreground/70 text-[11px] font-semibold tracking-widest mt-1">CONTA JURIDICA</div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="max-w-md mx-auto px-5 -mt-24 relative">
        <Card className="p-6 shadow-float border-black bg-card/95 backdrop-blur rounded-3xl animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-[13px] font-medium uppercase tracking-wider">Conta PJ</span>
            <button 
              onClick={toggleBalanceVisibility}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition"
              aria-label="Alternar visibilidade do saldo"
            >
              {account.hideBalance ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          
          <div className="mb-6">
            <div className="tabular text-[34px] leading-none font-bold tracking-tight mb-2">
              {account.hideBalance ? '••••••' : formatCurrency(account.balance)}
            </div>
            <div className="text-[13px] text-muted-foreground tabular">
              {account.hideBalance ? '••••••' : `Saldo + Crédito • ${formatCurrency(account.balance + account.creditLimit)}`}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {[
              { label: 'Enviar', icon: ArrowUpRight, onClick: onPixClick },
              { label: 'Extrato', icon: Receipt, onClick: onStatementClick },
              { label: 'Investir', icon: TrendingUp, onClick: onInvestmentsClick },
            ].map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                className="flex-1 min-w-[96px] flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-secondary/70 hover:bg-secondary border border-black active:scale-[0.97] transition group"
              >
                <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                  <a.icon className="text-primary-foreground" size={19} />
                </div>
                <span className="text-[13px] font-semibold">{a.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Info Cards */}
        <div className="mt-5 space-y-3 pb-28">
          <Card className="p-5 rounded-3xl shadow-card border-black hover:border-primary/30 hover:shadow-glow transition-all cursor-pointer group" >
            <div className="flex items-center gap-4" onClick={onCreditCardClick}>
              <div className="w-12 h-12 rounded-2xl bg-primary/12 flex items-center justify-center shrink-0">
                <CreditCardIcon className="text-primary" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[15px]">Cartão de Crédito</h3>
                <p className="text-[13px] text-muted-foreground tabular">Limite: {displayLimit}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </Card>

          <Card className="p-5 rounded-3xl shadow-card border-black hover:border-primary/30 hover:shadow-glow transition-all cursor-pointer group">
            <div className="flex items-center gap-4" onClick={onLoanClick}>
              <div className="w-12 h-12 rounded-2xl bg-success/12 flex items-center justify-center shrink-0">
                <DollarSign className="text-success" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[15px]">Empréstimo PJ</h3>
                <p className="text-[13px] text-muted-foreground">Crédito disponível</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </Card>

          {/* News */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2 mt-5">Mercado</h4>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { icon: Newspaper, text: 'Selic deve manter taxa em 2026' },
                { icon: TrendingUp, text: 'Bolsa atinge novo recorde' },
                { icon: Zap, text: 'FIIs em alta no mês' },
              ].map((n, i) => (
                <Card key={i} className="p-3.5 rounded-2xl border-black hover:shadow-card hover:-translate-y-0.5 transition-all">
                  <n.icon className="text-primary mb-2" size={18} />
                  <p className="text-[11.5px] font-medium leading-snug line-clamp-3">{n.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};