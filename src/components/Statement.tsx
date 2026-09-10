import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Calendar, Search, ReceiptText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useBank } from '@/contexts/BankContext';
import { formatCurrency } from '@/utils/pixUtils';
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

const periodDays: Record<string, number> = {
  today: 1,
  week: 7,
  month: 30,
  semester: 180,
  year: 365,
};

const dayLabel = (date: Date): string => {
  const now = new Date();
  const d = new Date(date);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (diff <= 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d);
};

export const Statement = ({ onBack }: StatementProps) => {
  const { transactions } = useBank();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0].value);
  const [query, setQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    const days = periodDays[selectedPeriod] ?? 365;
    const cutoff = Date.now() - days * 86400000;
    const q = query.trim().toLowerCase();
    return transactions
      .filter((t) => new Date(t.date).getTime() >= cutoff - 86400000)
      .filter((t) =>
        !q ||
        t.recipientName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        String(t.amount).includes(q.replace(/\D/g, ''))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedPeriod, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filteredTransactions) {
      const label = dayLabel(new Date(t.date));
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(t);
    }
    return [...map.entries()];
  }, [filteredTransactions]);

  return (
    <div className="bg-background min-h-screen animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-primary px-5 pt-6 pb-8">
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-md mx-auto">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-primary-foreground mb-4 active:scale-95 transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-primary-foreground text-[22px] font-bold tracking-tight">Extrato</h1>
          <p className="text-primary-foreground/70 text-[13px] mt-1 tabular">{filteredTransactions.length} movimentações</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-6 pb-28">
        
        <div className="relative mb-3">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou valor"
            className="pl-11 h-12 rounded-2xl bg-card border-black"
          />
        </div>

        {/* Seletor de Período */}
        <div className="mb-6 flex items-center gap-3">
          <Calendar className="text-muted-foreground shrink-0" size={18} />
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
          <Card className="p-10 text-center rounded-3xl border-black animate-slide-up">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <ReceiptText size={24} className="text-muted-foreground" />
            </div>
            <p className="font-semibold">Nada por aqui</p>
            <p className="text-sm text-muted-foreground mt-1">Nenhuma transação para este filtro</p>
          </Card>
        ) : (
          <div className="space-y-5">
            {grouped.map(([label, items]) => (
              <div key={label}>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">{label}</p>
                <div className="space-y-2.5">
                  {items.map((transaction) => (
              <Card 
                key={transaction.id} 
                className="p-4 rounded-2xl border-black hover:shadow-card hover:border-primary/25 active:scale-[0.99] transition-all cursor-pointer"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                    transaction.type === 'pix-sent' 
                      ? 'bg-destructive/10' 
                      : 'bg-success/10'
                  }`}>
                    {transaction.type === 'pix-sent' ? (
                      <ArrowUpRight className="text-destructive" size={19} />
                    ) : (
                      <ArrowDownRight className="text-success" size={19} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-0.5">
                      <div className="min-w-0">
                        <p className="font-semibold text-[14px] truncate">
                          {transaction.type === 'pix-sent' ? 'Transferência enviada' : 'Transferência recebida'}
                        </p>
                        <p className="text-[13px] text-muted-foreground truncate">{transaction.recipientName} • {formatTime(new Date(transaction.date))}</p>
                      </div>
                      <p className={`font-bold tabular text-[14px] whitespace-nowrap ${
                        transaction.type === 'pix-sent' 
                          ? 'text-foreground' 
                          : 'text-success'
                      }`}>
                        {transaction.type === 'pix-sent' ? '− ' : '+ '}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
                  ))}
                </div>
              </div>
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