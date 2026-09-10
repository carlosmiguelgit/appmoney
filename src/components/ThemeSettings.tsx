import { useState } from 'react';
import { ArrowLeft, Check, Layout, Palette } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBank } from '@/contexts/BankContext';
import { cn } from '@/lib/utils';

interface ThemeSettingsProps {
  onBack: () => void;
}

const PRESET_PRIMARY = [
  { name: 'Roxo', value: '260 80% 55%' },
  { name: 'Azul', value: '220 80% 55%' },
  { name: 'Verde', value: '160 80% 45%' },
  { name: 'Rosa', value: '330 80% 55%' },
];

const PRESET_CONTAINERS = [
  { name: 'Roxo Deep', value: '270 60% 8%' },
  { name: 'Preto Puro', value: '0 0% 0%' },
  { name: 'Azul Noite', value: '220 40% 10%' },
  { name: 'Cinza Escuro', value: '240 10% 12%' },
];

export const ThemeSettings = ({ onBack }: ThemeSettingsProps) => {
  const { account, setThemeColor, setContainerColor } = useBank();
  
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    } else { s = 0; }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      <div className="bg-gradient-primary p-6">
        <div className="max-w-md mx-auto">
          <button onClick={onBack} className="text-primary-foreground mb-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-primary-foreground text-2xl font-bold">Personalização</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8 space-y-8">
        {/* Seção Cor Primária */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="text-primary" size={20} />
            <h2 className="text-lg font-semibold">Cor dos Botões e Destaques</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {PRESET_PRIMARY.map((color) => (
              <button
                key={color.value}
                onClick={() => setThemeColor(color.value)}
                className={cn(
                  "p-3 rounded-xl border-2 flex items-center justify-between transition-all bg-card",
                  account.themeColor === color.value ? "border-primary" : "border-border"
                )}
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${color.value})` }} />
                <span className="text-xs font-medium">{color.name}</span>
                {account.themeColor === color.value && <Check size={14} className="text-primary" />}
              </button>
            ))}
          </div>
          <InputColor 
            label="Cor Primária Customizada" 
            onChange={(hex) => setThemeColor(hexToHsl(hex))} 
          />
        </section>

        {/* Seção Cor dos Containers */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layout className="text-primary" size={20} />
            <h2 className="text-lg font-semibold">Cor dos Containers e Fundo</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {PRESET_CONTAINERS.map((color) => (
              <button
                key={color.value}
                onClick={() => setContainerColor(color.value)}
                className={cn(
                  "p-3 rounded-xl border-2 flex items-center justify-between transition-all bg-card",
                  account.containerColor === color.value ? "border-primary" : "border-border"
                )}
              >
                <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: `hsl(${color.value})` }} />
                <span className="text-xs font-medium">{color.name}</span>
                {account.containerColor === color.value && <Check size={14} className="text-primary" />}
              </button>
            ))}
          </div>
          <InputColor 
            label="Cor de Fundo Customizada" 
            onChange={(hex) => setContainerColor(hexToHsl(hex))} 
          />
        </section>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => {
            setThemeColor('260 80% 55%');
            setContainerColor('270 60% 8%');
          }}
        >
          Restaurar Tudo para o Padrão
        </Button>
      </div>
    </div>
  );
};

const InputColor = ({ label, onChange }: { label: string, onChange: (hex: string) => void }) => (
  <Card className="p-4 flex items-center gap-4">
    <input
      type="color"
      onChange={(e) => onChange(e.target.value)}
      className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
    />
    <span className="text-sm font-medium">{label}</span>
  </Card>
);