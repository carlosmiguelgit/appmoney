import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useBank } from '@/contexts/BankContext';
import { formatCurrency, formatDate } from '@/utils/pixUtils';
import { Receipt } from './Receipt';
import { Transaction } from '@/types/transaction';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatementProps {
  onBack: () => void;
}

const periodOptions = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Essa Semana' },
  { value: 'month', label: 'Esse Mês' },
  { value: 'semester', label: 'Esse Semestre' },
  { value: 'year', label: 'Esse Ano' },
];

// Função auxiliar para formatar apenas a hora (HH:MM)
const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const Statement = ({ onBack }: StatementProps) => {
  const { transactions } = useBank();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0].value);

  // Lógica de filtragem (apenas visual, não funcional)
  const filteredTransactions = transactions; 

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="bg-gradient-primary p-6">
        <div className="max-w-md mx-auto">
          <button onClick={onBack} className="text-primary-foreground mb-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-primary-foreground text-2xl font-bold">Extrato</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        
        {/* Seletor de Período */}
        <div className="mb-6 flex items-center gap-3">
          <Calendar className="text-muted-foreground" size={20} />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o Período" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma transação realizada ainda</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <Card 
                key={transaction.id} 
                className="p-4 hover:shadow-glow transition-shadow cursor-pointer"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'pix-sent' 
                      ? 'bg-destructive/10' 
                      : 'bg-success/10'
                  }`}>
                    {transaction.type === 'pix-sent' ? (
                      <ArrowUpRight className="text-destructive" size={20} />
                    ) : (
                      <ArrowDownRight className="text-success" size={20} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-semibold">
                          {transaction.type === 'pix-sent' ? 'Transferência enviada' : 'Transferência recebida'}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.recipientName}</p>
                      </div>
                      <p className={`font-bold ${
                        transaction.type === 'pix-sent' 
                          ? 'text-destructive' 
                          : 'text-success'
                      }`}>
                        {transaction.type === 'pix-sent' ? '' : '+ '}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    {/* Horário removido daqui */}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedTransaction && (
        <Receipt 
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};