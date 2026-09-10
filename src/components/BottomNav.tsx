import { Home, Receipt, ArrowUpRight, Menu as MenuIcon } from 'lucide-react';
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
    { id: 'theme', icon: MenuIcon, label: 'Menu ☰' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-colors",
              currentScreen === item.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-transform",
              currentScreen === item.id && "scale-110"
            )} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};