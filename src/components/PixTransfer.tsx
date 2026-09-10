import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBank } from '@/contexts/BankContext';
import { generateRandomName, generateRandomBank, formatCurrency, formatPixKey } from '@/utils/pixUtils';
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
  const [manualType, setManualType] = useState<PixKeyType | 'auto'>('auto');

  const autoType = useMemo(() => determinePixKeyType(rawPixKey), [rawPixKey]);
  const pixKeyType: PixKeyType = manualType === 'auto' ? autoType : manualType;
  // Sem máscara ao digitar; formata só para exibição (000.000.000-00 / (51) 99999-9999)
  const displayPixKey = formatPixKey(rawPixKey, pixKeyType);

  const isKeyValid = useMemo(() => {
    if (pixKeyType === 'cpf') return isValidCPF(rawPixKey);
    if (pixKeyType === 'phone') return isValidPhone(rawPixKey);
    if (pixKeyType === 'email') return isValidEmailBasic(rawPixKey);
    if (pixKeyType === 'random') return isValidRandomKey(rawPixKey);
    return false;
  }, [rawPixKey, pixKeyType]);

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
    if (pixKeyType === 'cpf') return 'Ex: 12345678900';
    if (pixKeyType === 'phone') return 'Ex: 11999999999';
    if (pixKeyType === 'email') return 'Ex: nome@email.com';
    if (pixKeyType === 'random') return 'Ex: chave aleatória';
    return 'CPF, Telefone, E-mail ou Chave Aleatória';
  };

  const keyTypeLabel = (t: PixKeyType | 'auto') => {
    if (t === 'auto') return 'Auto';
    if (t === 'cpf') return 'CPF';
    if (t === 'phone') return 'Telefone';
    if (t === 'email') return 'E-mail';
    return 'Aleatória';
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
      recipientKey: displayPixKey,
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
        pixKey={displayPixKey}
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
      <div className="relative overflow-hidden bg-gradient-primary p-6 pb-8">
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-md mx-auto">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-primary-foreground mb-4 active:scale-95 transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-primary-foreground text-[22px] font-bold tracking-tight">
            {step === 'amount' ? 'Enviar Pix' : 'Para quem transferir?'}
          </h1>
          <div className="flex items-center gap-2 mt-4">
            {['Valor', 'Chave'].map((label, i) => {
              const activeStep = step === 'amount' ? 0 : 1;
              const done = i < activeStep || (step === 'key' && i === 0);
              return (
                <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold ${
                    i === activeStep ? 'bg-white text-primary' : done ? 'bg-white/25 text-white' : 'bg-white/10 text-white/60'
                  }`}>
                    <span className="tabular">{i + 1}</span> {label}
                  </div>
                  {i === 0 && <div className="flex-1 h-px bg-white/25 rounded" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-6 pb-28">
        {step === 'amount' && (
          <Card className="p-6 rounded-3xl shadow-card border-black animate-slide-up">
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
              className="w-full bg-primary text-primary-foreground"
            >
              Continuar
            </Button>
          </Card>
        )}

        {step === 'key' && (
          <Card className="p-6 rounded-3xl shadow-card border-black animate-slide-up">
            <h2 className="text-lg font-semibold mb-4">Digite a chave Pix</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {(['auto', 'cpf', 'phone', 'email', 'random'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setManualType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    manualType === t
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-muted-foreground border-transparent hover:border-primary'
                  }`}
                >
                  {keyTypeLabel(t)}
                </button>
              ))}
            </div>
            
            {pixKeyType !== 'unknown' && (
              <div className="mb-4 text-sm text-primary font-medium">
                {manualType === 'auto'
                  ? `Tipo detectado: ${pixKeyType === 'cpf' ? 'CPF' : pixKeyType === 'phone' ? 'Telefone' : pixKeyType === 'email' ? 'E-mail' : 'Aleatória'}`
                  : `Tipo selecionado: ${pixKeyType === 'cpf' ? 'CPF' : pixKeyType === 'phone' ? 'Telefone' : pixKeyType === 'email' ? 'E-mail' : 'Aleatória'}`}
              </div>
            )}

            <Input
              type="text"
              placeholder={getPlaceholder()}
              value={rawPixKey}
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
                className="flex-1 bg-primary text-primary-foreground"
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