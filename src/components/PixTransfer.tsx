import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBank } from '@/contexts/BankContext';
import { generateRandomName, generateRandomBank, formatCurrency } from '@/utils/pixUtils';
import { TransactionConfirmation } from './TransactionConfirmation';
import { PasswordDialog } from './PasswordDialog';
import { PixKeyType } from '@/types/transaction';

interface PixTransferProps {
  onBack: () => void;
}

type Step = 'amount' | 'key' | 'confirmation';

// ---------- Funções de Validação e Formatação ----------

const isValidEmailBasic = (email: string) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};

const isValidCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  return digits.length === 11;
};

const isValidPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};

const isValidRandomKey = (key: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key) || key.length > 20;
};

const determinePixKeyType = (rawKey: string): PixKeyType => {
  const cleanedDigits = rawKey.replace(/\D/g, '');
  
  if (isValidEmailBasic(rawKey)) return 'email';
  if (isValidCPF(rawKey)) return 'cpf';
  if (isValidPhone(rawKey)) return 'phone';
  if (isValidRandomKey(rawKey)) return 'random';

  // Fallback detection
  if (rawKey.includes('@')) return 'email';
  if (cleanedDigits.length === 11 && !rawKey.includes('@')) return 'cpf';
  if (cleanedDigits.length >= 10 && cleanedDigits.length <= 11 && !rawKey.includes('@')) return 'phone';
  if (rawKey.includes('-') || rawKey.length > 20) return 'random';

  return 'unknown';
};

const formatPixKeyInput = (raw: string, type: PixKeyType) => {
  if (type === 'cpf') {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) formatted = digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, '$1.$2.$3-$4');
    else if (digits.length > 6) formatted = digits.replace(/^(\d{3})(\d{3})(\d{0,3})$/, '$1.$2.$3');
    else if (digits.length > 3) formatted = digits.replace(/^(\d{3})(\d{0,3})$/, '$1.$2');
    return formatted;
  }
  if (type === 'phone') {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return raw;
};

// ---------- Componente principal ----------
export const PixTransfer = ({ onBack }: PixTransferProps) => {
  const { account, addTransaction } = useBank();
  const [step, setStep] = useState<Step>('amount');
  const [rawPixKey, setRawPixKey] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [amount, setAmount] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const pixKeyType = useMemo(() => determinePixKeyType(rawPixKey), [rawPixKey]);
  const formattedPixKey = useMemo(() => formatPixKeyInput(rawPixKey, pixKeyType), [rawPixKey, pixKeyType]);

  const isKeyValid = useMemo(() => {
    if (pixKeyType === 'cpf') return isValidCPF(formattedPixKey);
    if (pixKeyType === 'phone') return isValidPhone(formattedPixKey);
    if (pixKeyType === 'email') return isValidEmailBasic(formattedPixKey);
    if (pixKeyType === 'random') return isValidRandomKey(formattedPixKey);
    return false;
  }, [formattedPixKey, pixKeyType]);

  const handleAmountSubmit = () => {
    const amountInCents = Math.round(parseFloat(amount) * 100);
    if (amountInCents > 0 && amountInCents <= account.balance) {
      setStep('key');
    }
  };

  const handleKeySubmit = () => {
    if (!isKeyValid) return;
    const name = generateRandomName();
    const bank = generateRandomBank();
    setRecipientName(name);
    setRecipientBank(bank);
    setShowPasswordDialog(true);
  };

  const getPlaceholder = () => {
    return 'CPF, Telefone, E-mail ou Chave Aleatória';
  };

  const handlePasswordConfirm = () => {
    setShowPasswordDialog(false);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    addTransaction({
      type: 'pix-sent',
      amount: Math.round(parseFloat(amount) * 100),
      recipientName,
      recipientKey: formattedPixKey,
      recipientKeyType: pixKeyType,
      recipientBank,
      description: `Transferência Pix para ${recipientName}`,
    });
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setRawPixKey('');
    setAmount('');
    setRecipientName('');
    setRecipientBank('');
    setStep('amount');
    onBack();
  };

  if (showConfirmation) {
    return (
      <TransactionConfirmation
        recipientName={recipientName}
        recipientBank={recipientBank}
        pixKey={formattedPixKey}
        pixKeyType={pixKeyType}
        amount={Math.round(parseFloat(amount) * 100)}
        onClose={handleConfirmationClose}
        onConfirm={handleConfirm}
        onNewTransfer={onBack}
      />
    );
  }

  return (
    <div className="bg-background">
      <PasswordDialog
        open={showPasswordDialog}
        onConfirm={handlePasswordConfirm}
        onCancel={() => setShowPasswordDialog(false)}
      />
      {/* Header */}
      <div className="bg-gradient-primary p-6">
        <div className="max-w-md mx-auto">
          <button onClick={onBack} className="text-primary-foreground mb-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-primary-foreground text-2xl font-bold">
            {step === 'amount' ? 'Enviar' : 'Para quem você quer transferir?'}
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        {step === 'amount' && (
          <Card className="p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Qual é o valor da transferência?</h2>
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">R$</span>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-2xl border-0 border-b rounded-none px-0 focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  step="0.01"
                  min="0"
                  autoFocus
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Saldo disponível: {account.hideBalance ? '••••••' : formatCurrency(account.balance)}
              </p>
            </div>

            <Button
              onClick={handleAmountSubmit}
              disabled={!amount || Math.round(parseFloat(amount) * 100) <= 0 || Math.round(parseFloat(amount) * 100) > account.balance}
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              Continuar
            </Button>
          </Card>
        )}

        {step === 'key' && (
          <Card className="p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Digite a chave Pix</h2>
            
            {pixKeyType !== 'unknown' && (
              <div className="mb-4 text-sm text-primary font-medium">
                Tipo detectado: {pixKeyType === 'cpf' ? 'CPF' : pixKeyType === 'phone' ? 'Telefone' : pixKeyType === 'email' ? 'E-mail' : 'Aleatória'}
              </div>
            )}

            <Input
              type="text"
              placeholder={getPlaceholder()}
              value={formattedPixKey}
              onChange={(e) => setRawPixKey(e.target.value)}
              className="mb-4"
              autoFocus
            />

            <div className="flex gap-4">
              <Button
                onClick={() => setStep('amount')}
                variant="outline"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handleKeySubmit}
                disabled={!isKeyValid}
                className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                Continuar
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};