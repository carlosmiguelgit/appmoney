import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/pixUtils';
import { Transaction, PixKeyType } from '@/types/transaction';
import { X } from 'lucide-react';

interface ReceiptProps {
  transaction: Transaction;
  onClose: () => void;
}

// Constantes fixas
const SENDER_NAME = 'Tech Solutions LTDA';
const SENDER_CNPJ = '12345678000199'; // Novo CNPJ simulado
const SENDER_ACCOUNT = '8855299-1';
const SAFEPAG_BANK_CODE = '035';
const TRANSACTION_ID_PREFIX = 'E10573521202510171755BfiYq5z';
const SAFEPAG_INSTITUTION = 'RapidPag Instituição de Pagamento S.A.';
const SAFEPAG_CNPJ = '08.855.299/0001-78';

const maskPixKey = (key: string, type: PixKeyType): string => {
  if (!key) return '';
  switch (type) {
    case 'cpf':
      const cpfDigits = key.replace(/\D/g, '');
      if (cpfDigits.length === 11) return `***.***.${cpfDigits.slice(6, 9)}-**`;
      return '***.***.***-**';
    case 'phone':
      const phoneDigits = key.replace(/\D/g, '');
      if (phoneDigits.length === 11) return `(${phoneDigits.slice(0, 2)}) *****-${phoneDigits.slice(7)}`;
      if (phoneDigits.length === 10) return `(${phoneDigits.slice(0, 2)}) ****-${phoneDigits.slice(6)}`;
      return '(**) *****-****';
    case 'email':
      const parts = key.split('@');
      if (parts.length !== 2) return key;
      const [name, domain] = parts;
      return `${name.substring(0, 3)}***@${domain}`;
    case 'random':
      return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
    default:
      return key;
  }
};

const maskCNPJ = (cnpj: string): string => {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length === 14) {
    // Formato: XX.XXX.XXX/XXXX-XX
    return `**${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-**`;
  }
  return '**.***.***/****-**';
};

const getPixKeyTypeLabel = (type: PixKeyType): string => {
  switch (type) {
    case 'cpf': return 'CPF';
    case 'phone': return 'Telefone';
    case 'email': return 'E-mail';
    case 'random': return 'Chave Aleatória';
    default: return 'Chave';
  }
};

export const Receipt = ({ transaction, onClose }: ReceiptProps) => {
  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date).toUpperCase().replace('.', '');
  };

  // Gera um CPF mascarado com um final aleatório para parecer autêntico (para o DESTINO)
  const randomMaskedCPF = `***.***.${Math.floor(100 + Math.random() * 900)}-**`;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>

        <div className="py-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Comprovante de Transferência</h2>
            <p className="text-sm text-muted-foreground">
              Data/Hora: {formatDateTime(transaction.date)}
            </p>
          </div>

          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">Detalhes do Valor</h3>
              <p className="text-2xl font-bold">{formatCurrency(transaction.amount)}</p>
              <p className="text-sm text-muted-foreground mt-1">Tipo de transferência: Pix</p>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3">Destino</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Nome:</span> {transaction.recipientName}</p>
                {/* Mantendo CPF mascarado para o destino, pois o destinatário pode ser PF */}
                <p><span className="text-muted-foreground">CPF:</span> {randomMaskedCPF}</p> 
                <p><span className="text-muted-foreground">Instituição:</span> {transaction.recipientBank || 'NU PAGAMENTOS - IPA'}</p>
                <p><span className="text-muted-foreground">Agência:</span> 0001</p>
                <p><span className="text-muted-foreground">Conta:</span> *****-*</p>
                <p><span className="text-muted-foreground">Chave Pix:</span> {getPixKeyTypeLabel(transaction.recipientKeyType)}</p>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3">Origem</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Nome:</span> {SENDER_NAME}</p>
                <p><span className="text-muted-foreground">CNPJ:</span> {maskCNPJ(SENDER_CNPJ)}</p>
                <p><span className="text-muted-foreground">Instituição:</span> {SAFEPAG_INSTITUTION}</p>
                <p><span className="text-muted-foreground">Agência:</span> {SAFEPAG_BANK_CODE}</p>
                <p><span className="text-muted-foreground">Conta:</span> {SENDER_ACCOUNT}</p>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3">Informações Institucionais e ID</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Instituição:</span> {SAFEPAG_INSTITUTION}</p>
                <p><span className="text-muted-foreground">CNPJ:</span> {SAFEPAG_CNPJ}</p>
                <p className="break-all"><span className="text-muted-foreground">ID da transação:</span> {TRANSACTION_ID_PREFIX}{transaction.id.slice(0, 3)}</p>
              </div>
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Fechar Comprovante
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};