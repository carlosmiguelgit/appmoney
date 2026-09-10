import { useState } from 'react';
import { ArrowLeft, Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBank } from '@/contexts/BankContext';
import { toast } from 'sonner';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const { addBulkTransactions } = useBank();
  const [count, setCount] = useState('');
  const [amount, setAmount] = useState('');
  const [deductFromBalance, setDeductFromBalance] = useState(true);

  const handleGenerate = () => {
    const numCount = parseInt(count, 10);
    const numAmount = parseFloat(amount);

    if (isNaN(numCount) || numCount <= 0) {
      toast.error('Por favor, insira um número válido de transferências.');
      return;
    }
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Por favor, insira um valor válido para as transferências.');
      return;
    }

    if (numCount > 500) {
      toast.warning('Gerar muitas transferências pode deixar o app lento.');
    }

    const amountInCents = Math.round(numAmount * 100);
    addBulkTransactions(numCount, amountInCents, deductFromBalance);
    
    toast.success(`${numCount} transferências de R$ ${numAmount.toFixed(2).replace('.', ',')} foram geradas com sucesso!`);
    setCount('');
    setAmount('');
    onBack(); // Volta para o dashboard após gerar
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="bg-gradient-primary px-5 pt-6 pb-6">
        <div className="max-w-md mx-auto">
          <button onClick={onBack} className="text-primary-foreground mb-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-primary-foreground text-2xl font-bold">Painel de Admin</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="text-primary" size={24} />
            <h2 className="text-lg font-semibold">Gerador de Transações Enviadas</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Use esta ferramenta para simular o envio de múltiplas transferências.
          </p>
          
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Quantas transferências gerar?"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min="1"
            />
            <Input
              type="number"
              placeholder="Qual o valor de cada transferência?"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
            />
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="deduct-balance" 
                checked={deductFromBalance}
                onCheckedChange={setDeductFromBalance}
              />
              <Label htmlFor="deduct-balance">Deduzir do saldo</Label>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!count || parseInt(count, 10) <= 0 || !amount || parseFloat(amount) <= 0}
              className="w-full bg-primary text-primary-foreground !mt-6"
            >
              Gerar Transferências
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};