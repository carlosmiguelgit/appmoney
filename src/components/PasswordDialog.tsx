import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PasswordDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PasswordDialog = ({ open, onConfirm, onCancel }: PasswordDialogProps) => {
  const [password, setPassword] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPassword(value);
  };

  const handleConfirm = () => {
    if (password.length === 4) {
      setPassword('');
      onConfirm();
    }
  };

  const handleCancel = () => {
    setPassword('');
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Digite sua senha</h2>
          <p className="text-sm text-muted-foreground">
            Insira sua senha de 4 dígitos para confirmar a transferência
          </p>
          
          <div className="flex justify-center gap-2 my-6">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="w-12 h-12 rounded-lg border-2 border-primary bg-secondary flex items-center justify-center text-2xl font-bold"
              >
                {password[index] ? '•' : ''}
              </div>
            ))}
          </div>

          <Input
            type="number"
            inputMode="numeric"
            value={password}
            onChange={handlePasswordChange}
            className="text-center text-2xl tracking-widest opacity-0 absolute pointer-events-none"
            maxLength={4}
            autoFocus
            aria-hidden
            tabIndex={-1}
          />

          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                className="h-14 text-xl"
                onClick={() => {
                  if (password.length < 4) {
                    setPassword(password + num);
                  }
                }}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              className="h-14 text-xl"
              onClick={() => setPassword(password.slice(0, -1))}
            >
              ←
            </Button>
            <Button
              variant="outline"
              className="h-14 text-xl"
              onClick={() => {
                if (password.length < 4) {
                  setPassword(password + '0');
                }
              }}
            >
              0
            </Button>
            <Button
              variant="outline"
              className="h-14 text-xl bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleConfirm}
              disabled={password.length !== 4}
            >
              ✓
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={handleCancel}
            className="w-full mt-4"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
