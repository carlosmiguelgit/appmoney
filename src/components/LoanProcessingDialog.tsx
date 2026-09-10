import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, CheckCircle } from 'lucide-react';

interface LoanProcessingDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const messages = [
  'Analisando seu pedido...',
  'Comunicando com a provedora de crédito...',
  'Verificando seu score...',
  'Finalizando aprovação...',
];

export const LoanProcessingDialog = ({ open, onClose, onComplete }: LoanProcessingDialogProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [status, setStatus] = useState<'processing' | 'success'>('processing');
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (open && status === 'processing') {
      const interval = setInterval(() => {
        setCurrentMessageIndex(prevIndex => {
          if (prevIndex < messages.length - 1) {
            return prevIndex + 1;
          }
          clearInterval(interval);
          setStatus('success');
          return prevIndex;
        });
      }, 2000); // Change message every 2 seconds

      return () => clearInterval(interval);
    }
  }, [open, status]);

  useEffect(() => {
    if (status === 'success' && !hasCompleted) {
      onComplete();
      setHasCompleted(true);
      const timer = setTimeout(() => {
        onClose();
      }, 2500); // Close dialog 2.5s after success
      return () => clearTimeout(timer);
    }
  }, [status, onComplete, onClose, hasCompleted]);

  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStatus('processing');
        setCurrentMessageIndex(0);
        setHasCompleted(false);
      }, 300); // Delay reset to allow for closing animation
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          {status === 'processing' ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h3 className="text-xl font-bold">Aguarde um momento</h3>
              <p className="text-muted-foreground animate-fade-in">
                {messages[currentMessageIndex]}
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="w-12 h-12 text-success animate-scale-in" />
              <h3 className="text-xl font-bold text-success">Crédito Aprovado!</h3>
              <p className="text-muted-foreground">O valor já está na sua conta.</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};