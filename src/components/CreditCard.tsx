import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CreditCard as CreditCardIcon, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/pixUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { useBank } from '@/contexts/BankContext';

interface CreditCardProps {
  onBack: () => void;
}

export const CreditCard = ({ onBack }: CreditCardProps) => {
  const { account, updateCreditLimit } = useBank();

  const months = useMemo(() => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) { // Gera o mês atual e os 5 anteriores
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
      const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      const value = `${year}-${String(month + 1).padStart(2, '0')}`;
      let label = `${capitalizedMonthName} ${year}`;
      
      if (i === 0) {
        label += ' (Atual)';
      }
      
      options.push({ value, label });
    }
    
    return options;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(months[0].value);
  const [showIncreaseLimit, setShowIncreaseLimit] = useState(false);
  
  const currentInvoice = 0; // in cents
  const [newLimit, setNewLimit] = useState<number[]>([account.creditLimit / 100]);

  useEffect(() => {
    setNewLimit([account.creditLimit / 100]);
  }, [account.creditLimit]);

  const handleConfirmLimit = () => {
    updateCreditLimit(Math.round(newLimit[0] * 100));
    setShowIncreaseLimit(false);
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="bg-gradient-primary px-5 pt-6 pb-6">
        <div className="max-w-md mx-auto">
          <button onClick={onBack} className="text-primary-foreground mb-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-primary-foreground text-2xl font-bold">Cartão de Crédito</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-8 space-y-6">
        
        {/* Seletor de Mês */}
        <div className="flex items-center gap-3">
          <Calendar className="text-muted-foreground" size={20} />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fatura Atual */}
        <Card className="p-6 shadow-md border-t-4 border-primary">
          <h2 className="text-lg font-semibold mb-2">Fatura {selectedMonth === months[0].value ? 'Atual' : 'Fechada'}</h2>
          <p className="text-4xl font-bold text-primary mb-4">{formatCurrency(currentInvoice)}</p>
          
          {currentInvoice === 0 ? (
            <p className="text-muted-foreground">Nenhuma compra registrada nesta fatura.</p>
          ) : (
            <Button className="w-full">Pagar Fatura</Button>
          )}
        </Card>

        {/* Limite Disponível */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Limite Disponível</h3>
              <p className="text-2xl font-bold text-success">{formatCurrency(account.creditLimit)}</p>
            </div>
            <CreditCardIcon className="text-success" size={32} />
          </div>
        </Card>

        {/* Botão para aumentar limite */}
        {!showIncreaseLimit && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowIncreaseLimit(true)}
          >
            Aumentar limite do seu cartão
          </Button>
        )}

        {/* Seção para aumentar limite */}
        {showIncreaseLimit && (
          <Card className="p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Ajustar Limite</h2>
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-primary">{formatCurrency(newLimit[0] * 100)}</p>
              <p className="text-sm text-muted-foreground">Novo limite desejado</p>
            </div>
            <Slider
              value={newLimit}
              max={100000}
              step={1000}
              onValueChange={setNewLimit}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{formatCurrency(0)}</span>
              <span>{formatCurrency(100000 * 100)}</span>
            </div>
            <div className="flex gap-4 mt-6">
              <Button 
                variant="ghost" 
                className="flex-1"
                onClick={() => {
                  setShowIncreaseLimit(false);
                  setNewLimit([account.creditLimit / 100]); // Reseta ao cancelar
                }}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1"
                onClick={handleConfirmLimit}
              >
                Confirmar
              </Button>
            </div>
          </Card>
        )}

        {/* Histórico de Transações (Vazio) */}
        <h2 className="text-xl font-bold pt-4">Transações</h2>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma transação encontrada para este mês.</p>
        </Card>
      </div>
    </div>
  );
};