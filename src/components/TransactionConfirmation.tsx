import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, maskPixKey } from '@/utils/pixUtils';
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