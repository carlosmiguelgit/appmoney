import { ArrowLeft, DollarSign, Home, Briefcase, BarChart3, TrendingUp } from 'lucide-react';
import { useBank } from '@/contexts/BankContext';
import { formatCurrency } from '@/utils/pixUtils';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InvestmentsProps {
  onBack: () => void;
}

interface InvestmentOptionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
}

const InvestmentOption = ({ icon: Icon, title, description, className }: InvestmentOptionProps) => (
  <Card className={cn("p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer", className)}>
    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
      <Icon className="text-primary" size={20} />
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-base">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </Card>
);

export const Investments = ({ onBack }: InvestmentsProps) => {
  const { account } = useBank();
  
  const displayBalance = account.hideBalance ? '••••••' : formatCurrency(account.balance);

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="bg-gradient-primary p-6">
        <div className="max-w-md mx-auto">
          <button onClick={onBack} className="text-primary-foreground mb-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-primary-foreground text-2xl font-bold">Investimentos</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        {/* Current Balance */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Saldo Disponível para Investir</h2>
          <p className="text-3xl font-bold text-primary">{displayBalance}</p>
          <p className="text-sm text-muted-foreground mt-1">Seu saldo em conta corrente.</p>
        </Card>

        {/* Investment Options */}
        <h2 className="text-xl font-bold mb-4">Explore Opções</h2>
        
        <div className="space-y-4">
          <InvestmentOption 
            icon={DollarSign} 
            title="Renda Fixa (CDB, LCI/LCA)" 
            description="Segurança e previsibilidade para seu capital."
          />
          <InvestmentOption 
            icon={BarChart3} 
            title="Ações (Renda Variável)" 
            description="Participe do crescimento das maiores empresas."
          />
          <InvestmentOption 
            icon={Home} 
            title="Fundos Imobiliários (FIIs)" 
            description="Invista em imóveis com cotas a partir de R$10."
          />
          <InvestmentOption 
            icon={Briefcase} 
            title="Fundos de Investimento" 
            description="Gestão profissional e diversificação automática."
          />
          <InvestmentOption 
            icon={TrendingUp} 
            title="Previdência Privada" 
            description="Planeje seu futuro e aposentadoria."
          />
        </div>
      </div>
    </div>
  );
};