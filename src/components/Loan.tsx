import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, DollarSign, Calendar, Percent } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatCurrency, formatDate } from '@/utils/pixUtils';
import { useBank } from '@/contexts/BankContext';
import { LoanProcessingDialog } from './LoanProcessingDialog';

interface LoanProps {
  onBack: () => void;
}

const INITIAL_MAX_LOAN = 1000000; // R$ 1.000.000,00

export const Loan = ({ onBack }: LoanProps) => {
  const { addLoan, loans } = useBank();

  const totalLoanTaken = useMemo(() => loans.reduce((sum, loan) => sum + loan.amount, 0), [loans]);
  const availableLoanLimit = (INITIAL_MAX_LOAN * 100) - totalLoanTaken;

  const initialSliderValue = useMemo(() => {
    if (availableLoanLimit <= 0) return 0;
    return Math.min(50000, availableLoanLimit / 100);
  }, [availableLoanLimit]);

  const [loanAmount, setLoanAmount] = useState<number[]>([initialSliderValue]);
  const [installments, setInstallments] = useState(12);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setLoanAmount([initialSliderValue]);
  }, [initialSliderValue]);

  const currentAmount = loanAmount[0];
  
  const monthlyRate = 0.015; // 1.5% ao mês
  const totalInterest = currentAmount * monthlyRate * installments;
  const totalToPay = currentAmount + totalInterest;
  const monthlyPayment = totalToPay / installments;

  const handleRequestLoan = () => {
    if (currentAmount > 0) {
      setIsProcessing(true);
    }
  };

  const handleLoanComplete = () => {
    addLoan(Math.round(currentAmount * 100));
  };

  return (
    <>
      <LoanProcessingDialog
        open={isProcessing}
        onClose={() => setIsProcessing(false)}
        onComplete={handleLoanComplete}
      />
      <div className="bg-background">
        <div className="bg-gradient-primary px-5 pt-6 pb-6">
          <div className="max-w-md mx-auto">
            <button onClick={onBack} className="text-primary-foreground mb-4">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-primary-foreground text-2xl font-bold">Empréstimo Pessoal</h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-5 py-8 space-y-6">
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {availableLoanLimit > 0 ? "Quanto você precisa?" : "Limite de empréstimo atingido"}
            </h2>
            
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-primary">{formatCurrency(currentAmount * 100)}</p>
              <p className="text-sm text-muted-foreground">
                {availableLoanLimit > 0 ? "Valor solicitado" : "Você já utilizou todo o seu limite"}
              </p>
            </div>

            <Slider
              value={loanAmount}
              max={availableLoanLimit > 0 ? availableLoanLimit / 100 : 0}
              step={1000}
              onValueChange={setLoanAmount}
              className="w-full"
              disabled={availableLoanLimit <= 0}
            />
            
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{formatCurrency(0)}</span>
              <span>{formatCurrency(availableLoanLimit > 0 ? availableLoanLimit : 0)}</span>
            </div>
          </Card>

          {availableLoanLimit > 0 && (
            <>
              <Card className="p-6 space-y-4">
                <h2 className="text-lg font-semibold mb-4">Simulação</h2>
                
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-muted-foreground" />
                    <span className="font-medium">Parcelas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setInstallments(Math.max(6, installments - 6))}
                      disabled={installments === 6}
                    >
                      -
                    </Button>
                    <span className="font-bold text-lg w-12 text-center">{installments}x</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setInstallments(Math.min(48, installments + 6))}
                      disabled={installments === 48}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Percent size={20} className="text-muted-foreground" />
                    <span className="font-medium">Taxa de Juros Mensal</span>
                  </div>
                  <span className="font-bold text-primary">1.5% a.m.</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-semibold">Valor da Parcela</span>
                  <span className="font-bold text-xl">{formatCurrency(monthlyPayment * 100)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Total a pagar ({installments} meses)</span>
                  <span>{formatCurrency(totalToPay * 100)}</span>
                </div>
              </Card>

              <Button 
                className="w-full bg-primary text-primary-foreground mt-6"
                onClick={handleRequestLoan}
                disabled={currentAmount <= 0}
              >
                Solicitar Empréstimo
              </Button>
            </>
          )}

          {loans.length > 0 && (
            <div className="pt-6">
              <h2 className="text-xl font-bold mb-4">Empréstimos Contratados</h2>
              <div className="space-y-4">
                {loans.map(loan => (
                  <Card key={loan.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-primary">{formatCurrency(loan.amount)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(loan.date)}</p>
                      </div>
                      <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                        Aprovado
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};