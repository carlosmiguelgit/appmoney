import { Home, Receipt, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: any) => void;
}

export const BottomNav = ({ currentScreen, onNavigate }: BottomNavProps) => {
  const items = [
    { id: 'dashboard', icon: Home, label: 'Início' },
    { id: 'pix', icon: ArrowUpRight, label: 'Enviar' },
    { id: 'statement', icon: Receipt, label: 'Extrato' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none">
      <div className="max-w-md mx-auto px-5 pb-4">
        <div className="pointer-events-auto glass border border-white/10 rounded-full shadow-float px-2 py-2 grid grid-cols-3">
          {items.map((item) => {
            const active = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2 rounded-full transition-all active:scale-95",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && <span className="absolute inset-0 rounded-full bg-gradient-primary shadow-glow" />}
                <item.icon size={19} className="relative transition-transform" />
                <span className="relative text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};