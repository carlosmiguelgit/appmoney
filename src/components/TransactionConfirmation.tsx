import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/pixUtils';
import { useBank } from '@/contexts/BankContext';
import { Receipt } from './Receipt';

interface TransactionConfirmationProps {
  recipientName: string;
  recipientBank: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'phone' | 'email' | 'random' | string;
  amount: number;
  onClose: () => void;
  onConfirm: () => void;
  onNewTransfer?: () => void;
}

type Stage = 'confirming' | 'processing' | 'success';

// --- função de máscara: esconde 3 primeiros e 2 últimos, mantendo formatação
const maskPixKey = (key: string, type: 'cpf' | 'phone' | 'email' | 'random' | string): string => {
  if (!key) return key;

  const maskByDigitsKeepingFormat = (formatted: string) => {
    const chars = formatted.split('');
    const isMaskable = (c: string) => /[0-9A-Za-z]/.test(c);
    const maskableIndices: number[] = [];
    for (let i = 0; i < chars.length; i++) {
      if (isMaskable(chars[i])) maskableIndices.push(i);
    }
    const total = maskableIndices.length;
    for (let i = 0; i < total; i++) {
      const idx = maskableIndices[i];
      if (i < 3 || i >= total - 2) {
        chars[idx] = '*';
      }
    }
    return chars.join('');
  };

  switch (type) {
    case 'cpf': {
      const digits = key.replace(/\D/g, '').slice(0, 11);
      if (digits.length === 11) {
        const formatted = digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
        return maskByDigitsKeepingFormat(formatted);
      }
      // fallback: aplica máscara simples mantendo o que vier
      return maskByDigitsKeepingFormat(key);
    }

    case 'phone': {
      const digits = key.replace(/\D/g, '').slice(0, 11);
      if (digits.length === 11) {
        const formatted = digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        return maskByDigitsKeepingFormat(formatted);
      } else if (digits.length === 10) {
        const formatted = digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
        return maskByDigitsKeepingFormat(formatted);
      }
      return maskByDigitsKeepingFormat(key);
    }

    case 'email': {
      const parts = key.split('@');
      if (parts.length !== 2) return maskByDigitsKeepingFormat(key);
      const [name, domain] = parts;
      // mascara apenas o nome (3 primeiros e 2 últimos)
      const maskedName = name
        .split('')
        .map((c, i) => (i < 3 || i >= name.length - 2 ? '*' : c))
        .join('');
      return `${maskedName}@${domain}`;
    }

    case 'random': {
      // mantém hífens, conta apenas alfanuméricos para decidir quais esconder
      const arr = key.split('');
      const totalMaskable = arr.filter(ch => /[0-9A-Za-z]/.test(ch)).length;
      if (totalMaskable <= 0) return key;
      let seen = 0;
      return arr
        .map((ch) => {
          if (!/[0-9A-Za-z]/.test(ch)) return ch; // mantém hífen/pontuação
          const indexAmongMaskable = seen;
          seen += 1;
          if (indexAmongMaskable < 3 || indexAmongMaskable >= totalMaskable - 2) return '*';
          return ch;
        })
        .join('');
    }

    default:
      return maskByDigitsKeepingFormat(key);
  }
};

export const TransactionConfirmation = ({
  recipientName,
  recipientBank,
  pixKey,
  pixKeyType,
  amount,
  onClose,
  onConfirm,
  onNewTransfer,
}: TransactionConfirmationProps) => {
  const [stage, setStage] = useState<Stage>('confirming');
  const [showReceipt, setShowReceipt] = useState(false);
  const { transactions } = useBank();

  useEffect(() => {
    if (stage === 'confirming') {
      // Mostra os detalhes por 1.5s, avança e dispara onConfirm
      const timer = setTimeout(() => {
        setStage('processing');
        onConfirm();
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (stage === 'processing') {
      const timer = setTimeout(() => {
        setStage('success');
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Não fecha automaticamente no success, aguarda ação do usuário
  }, [stage, onConfirm]);

  const handleSendReceipt = () => {
    // Encontra a transação mais recente (a que acabou de ser criada)
    const latestTransaction = transactions[0];
    if (latestTransaction) {
      setShowReceipt(true);
    }
  };

  const handleNewTransfer = () => {
    if (onNewTransfer) {
      onNewTransfer();
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center justify-center py-8">
          {stage === 'confirming' && (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-2">Confirmando transferência</h3>
              <div className="mb-4">
                <p className="font-semibold">{recipientName}</p>
                <p className="text-sm text-muted-foreground">
                  {pixKeyType === 'cpf' && 'CPF '}
                  {pixKeyType === 'phone' && 'Telefone '}
                  {pixKeyType === 'email' && 'E-mail '}
                  {pixKeyType === 'random' && 'Chave '}
                  {maskPixKey(pixKey, pixKeyType as any)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{recipientBank}</p>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(amount)}</p>
            </div>
          )}

          {stage === 'processing' && (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <h3 className="text-xl font-bold mb-2">Aguardando envio</h3>
              <p className="text-muted-foreground">Processando sua transferência...</p>
            </div>
          )}

          {stage === 'success' && !showReceipt && (
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Check className="text-success-foreground animate-check" size={32} strokeWidth={3} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-success">Pagamento concluído!</h3>
              <p className="text-muted-foreground mb-2">
                Transferência realizada com sucesso
              </p>
              <div className="mb-4">
                <p className="font-semibold">{recipientName}</p>
                <p className="text-sm text-muted-foreground">
                  {pixKeyType === 'cpf' && 'CPF '}
                  {pixKeyType === 'phone' && 'Telefone '}
                  {pixKeyType === 'email' && 'E-mail '}
                  {pixKeyType === 'random' && 'Chave '}
                  {maskPixKey(pixKey, pixKeyType as any)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{recipientBank}</p>
              </div>
              <p className="text-2xl font-bold mb-6">{formatCurrency(amount)}</p>

              <div className="space-y-3">
                <Button 
                  onClick={handleSendReceipt}
                  className="w-full"
                >
                  MOSTRAR COMPROVANTE
                </Button>
                <Button 
                  onClick={handleNewTransfer}
                  variant="outline"
                  className="w-full"
                >
                  FAZER NOVA TRANSFERÊNCIA
                </Button>
              </div>
            </div>
          )}

          {showReceipt && transactions[0] && (
            <div className="animate-fade-in">
              <Receipt 
                transaction={transactions[0]}
                onClose={() => {
                  setShowReceipt(false);
                  onClose();
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};