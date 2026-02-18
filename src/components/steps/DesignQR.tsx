import { useState, useRef } from 'react';
import { QRStyleOptions } from '@/types/qr';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImagePlus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  style: QRStyleOptions;
  onChange: (style: QRStyleOptions) => void;
}

const dotsTypes = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
] as const;

const cornerSquareTypes = [
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Rounded' },
  { value: 'dot', label: 'Dot' },
] as const;

const cornerDotTypes = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
] as const;

export function DesignQR({ style, onChange }: Props) {
  const set = <K extends keyof QRStyleOptions>(key: K, val: QRStyleOptions[K]) =>
    onChange({ ...style, [key]: val });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setLogoError(true);
      toast.error('The maximum size allowed is 1 MB');
      e.target.value = '';
      return;
    }
    setLogoError(false);
    const reader = new FileReader();
    reader.onload = () => set('logoImage', reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeLogo = () => {
    set('logoImage', undefined);
    setLogoError(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">3. Design the QR</h2>
      <div className="space-y-5">
        {/* QR Code Pattern */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div>
            <Label className="font-bold text-base">QR Code Pattern</Label>
            <p className="text-sm text-muted-foreground">Choose a pattern and color</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dotsTypes.map(d => (
              <button key={d.value} onClick={() => set('dotsType', d.value)}
                className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all ${
                  style.dotsType === d.value ? 'border-primary bg-secondary font-semibold' : 'border-border hover:border-primary/40'
                }`}>{d.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Label>Color</Label>
            <input type="color" value={style.dotsColor} onChange={e => set('dotsColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
          </div>
        </div>

        {/* Corners */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div>
            <Label className="font-bold text-base">QR Code Corners</Label>
            <p className="text-sm text-muted-foreground">Select corner style</p>
          </div>
          <div>
            <Label className="text-sm">Outer corners</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {cornerSquareTypes.map(c => (
                <button key={c.value} onClick={() => set('cornersSquareType', c.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all ${
                    style.cornersSquareType === c.value ? 'border-primary bg-secondary font-semibold' : 'border-border hover:border-primary/40'
                  }`}>{c.label}</button>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Label>Color</Label>
              <input type="color" value={style.cornersSquareColor} onChange={e => set('cornersSquareColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
            </div>
          </div>
          <div>
            <Label className="text-sm">Inner corners</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {cornerDotTypes.map(c => (
                <button key={c.value} onClick={() => set('cornersDotType', c.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all ${
                    style.cornersDotType === c.value ? 'border-primary bg-secondary font-semibold' : 'border-border hover:border-primary/40'
                  }`}>{c.label}</button>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Label>Color</Label>
              <input type="color" value={style.cornersDotColor} onChange={e => set('cornersDotColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="bg-card border rounded-xl p-6 space-y-3">
          <Label className="font-bold text-base">Background Color</Label>
          <div className="flex items-center gap-3">
            <input type="color" value={style.backgroundColor} onChange={e => set('backgroundColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
            <span className="text-sm text-muted-foreground">{style.backgroundColor}</span>
          </div>
        </div>

        {/* Add Logo */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div>
            <Label className="font-bold text-base">Add Logo</Label>
            <p className="text-sm text-muted-foreground">Make your QR code unique by adding your logo or an image</p>
          </div>
          <p className="text-sm font-semibold">Upload your logo (Maximum size: 1 MB)</p>
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />

          {style.logoImage ? (
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-lg border overflow-hidden">
                <img src={style.logoImage} alt="Logo" className="w-full h-full object-cover" />
                <button onClick={() => logoInputRef.current?.click()}
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <Button variant="destructive" size="sm" onClick={removeLogo} className="gap-1.5">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          ) : (
            <button onClick={() => logoInputRef.current?.click()}
              className={`w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
                logoError ? 'border-destructive' : 'border-primary/40 hover:border-primary'
              }`}>
              <ImagePlus className="w-8 h-8 text-primary" />
            </button>
          )}
          {logoError && <p className="text-sm text-destructive font-medium">The maximum size allowed is 1 MB</p>}
        </div>
      </div>
    </div>
  );
}
