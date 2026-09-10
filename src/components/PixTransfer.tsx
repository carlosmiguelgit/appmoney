import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBank } from '@/contexts/BankContext';
import { generateRandomName, generateRandomBank, formatCurrency, maskPixKey } from '@/utils/pixUtils';
import { TransactionConfirmation } from './TransactionConfirmation';
import { PasswordDialog } from './PasswordDialog';
import { PixKeyType } from '@/types/transaction';

interface PixTransferProps {
  onBack: () => void;
}

type Step = 'amount' | 'key' | 'review';

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

// Máscara progressiva: só insere . - ( ) quando há dígito após eles
const formatCpfLive = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  const a = d.slice(0, 3), b = d.slice(3, 6), c = d.slice(6, 9), e = d.slice(9, 11);
  let out = a;
  if (b) out += '.' + b;
  if (c) out += '.' + c;
  if (e) out += '-' + e;
  return out;
};

const formatPhoneLive = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  const ddd = d.slice(0, 2), rest = d.slice(2);
  const splitAt = d.length > 10 ? 5 : 4;
  const p1 = rest.slice(0, splitAt), p2 = rest.slice(splitAt);
  return `(${ddd}) ${p1}${p2 ? '-' + p2 : ''}`;
};

const formatPixKeyLive = (raw: string, type: PixKeyType) => {
  if (type === 'cpf') return formatCpfLive(raw);
  if (type === 'phone') return formatPhoneLive(raw);
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
  const [manualType, setManualType] = useState<PixKeyType | 'auto'>('auto');

  const autoType = useMemo(() => determinePixKeyType(rawPixKey), [rawPixKey]);
  const pixKeyType: PixKeyType = manualType === 'auto' ? autoType : manualType;
  // Sem máscara ao digitar; formata só para exibição (000.000.000-00 / (51) 99999-9999)
  const displayPixKey = useMemo(() => formatPixKeyLive(rawPixKey, pixKeyType), [rawPixKey, pixKeyType]);

  const isKeyValid = useMemo(() => {
    if (pixKeyType === 'cpf') return isValidCPF(displayPixKey);
    if (pixKeyType === 'phone') return isValidPhone(displayPixKey);
    if (pixKeyType === 'email') return isValidEmailBasic(displayPixKey);
    if (pixKeyType === 'random') return isValidRandomKey(displayPixKey);
    return false;
  }, [displayPixKey, pixKeyType]);

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
    setStep('review');
  };

  const handleReviewConfirm = () => {
    setShowPasswordDialog(true);
  };

  const handleReviewCancel = () => {
    setRecipientName('');
    setRecipientBank('');
    setStep('key');
  };

  const getPlaceholder = () => {
    if (pixKeyType === 'cpf') return 'Ex: 123.456.789-00';
    if (pixKeyType === 'phone') return 'Ex: (51) 99999-9999';
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
      <div className="relative overflow-hidden bg-gradient-primary px-5 pt-6 pb-8">
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-md mx-auto">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-primary-foreground mb-4 active:scale-95 transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-primary-foreground text-[22px] font-bold tracking-tight">
            {step === 'amount' ? 'Enviar Pix' : step === 'key' ? 'Para quem transferir?' : 'Revisar transferência'}
          </h1>
          <div className="flex items-center gap-2 mt-4">
            {['Valor', 'Chave', 'Revisar'].map((label, i) => {
              const activeStep = step === 'amount' ? 0 : step === 'key' ? 1 : 2;
              const done = i < activeStep;
              return (
                <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold ${
                    i === activeStep ? 'bg-white text-primary' : done ? 'bg-white/25 text-white' : 'bg-white/10 text-white/60'
                  }`}>
                    <span className="tabular">{i + 1}</span> {label}
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-white/25 rounded" />}
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
              value={displayPixKey}
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

        {step === 'review' && (
          <Card className="p-6 rounded-3xl shadow-card border-black animate-slide-up">
            <h2 className="text-lg font-semibold mb-1">Confira o destinatário</h2>
            <p className="text-sm text-muted-foreground mb-5">Verifique os dados antes de confirmar</p>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/70 border border-black mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                {recipientName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate">{recipientName}</p>
                <p className="text-[13px] text-muted-foreground truncate">{recipientBank}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  {pixKeyType === 'cpf' ? 'CPF' : pixKeyType === 'phone' ? 'Telefone' : pixKeyType === 'email' ? 'E-mail' : 'Chave aleatória'}
                </span>
                <span className="text-sm font-semibold tabular">{maskPixKey(displayPixKey, pixKeyType)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Valor</span>
                <span className="text-xl font-bold tabular">{formatCurrency(Math.round(parseFloat(amount) * 100))}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleReviewCancel}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReviewConfirm}
                className="flex-1 bg-primary text-primary-foreground"
              >
                Confirmar
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};