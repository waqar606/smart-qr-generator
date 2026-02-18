import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = ['Type of QR code', 'Content', 'QR design'];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const done = currentStep > stepNum;
        const active = currentStep === stepNum;
        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <div className="w-12 h-px bg-border" />}
            <div className={`flex items-center gap-1.5 text-sm font-medium ${
              done ? 'text-primary' : active ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                done ? 'bg-primary text-primary-foreground' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {done ? <Check className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span className="hidden sm:inline">{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
