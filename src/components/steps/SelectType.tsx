import { QRType } from '@/types/qr';
import { qrTypes } from '@/data/qrTypes';
import * as Icons from 'lucide-react';

interface Props {
  selected: QRType | null;
  onSelect: (type: QRType) => void;
}

export function SelectType({ selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">1. Select a type of QR code</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {qrTypes.map(t => {
          const Icon = (Icons as any)[t.icon] || Icons.QrCode;
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                isSelected ? 'border-primary bg-secondary shadow-md' : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <Icon className={`w-7 h-7 ${isSelected ? 'text-primary' : 'text-primary'}`} />
              <span className="font-semibold text-sm">{t.label}</span>
              <span className="text-xs text-muted-foreground text-center leading-tight">{t.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
