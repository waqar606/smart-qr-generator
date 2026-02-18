import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRType, QRStyleOptions, defaultStyle, QRCodeData } from '@/types/qr';
import { SelectType } from '@/components/steps/SelectType';
import { AddContent } from '@/components/steps/AddContent';
import { DesignQR } from '@/components/steps/DesignQR';
import { QRPreview } from '@/components/QRPreview';
import { PhoneMockup } from '@/components/PhoneMockup';
import { StepIndicator } from '@/components/StepIndicator';
import { encodeQRData } from '@/lib/qrDataEncoder';
import { useQRCodes } from '@/hooks/useQRCodes';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<QRType | null>(null);
  const [content, setContent] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [style, setStyle] = useState<QRStyleOptions>(defaultStyle);
  const { addCode } = useQRCodes();
  const navigate = useNavigate();
  const fileRef = useRef<File | null>(null);
  const filesRef = useRef<File[]>([]);

  const tempId = useState(() => crypto.randomUUID())[0];
  const qrData = selectedType ? encodeQRData(selectedType, content, tempId) : '';

  const handleNext = () => {
    if (step === 1 && !selectedType) { toast.error('Please select a QR type'); return; }
    if (step < 3) setStep(step + 1);
  };

  const handleContentChange = (newContent: Record<string, string>) => {
    setContent(newContent);
  };

  const handleFileChange = (file: File | null) => {
    fileRef.current = file;
  };

  const handleFilesChange = (files: File[]) => {
    filesRef.current = files;
  };

  const handleCreate = async () => {
    if (!selectedType) return;
    const code: QRCodeData = {
      id: tempId,
      name: name || 'Untitled QR Code',
      type: selectedType,
      content,
      style,
      createdAt: new Date().toISOString(),
      paused: false,
    };
    const success = await addCode(code, fileRef.current || undefined, filesRef.current.length > 0 ? filesRef.current : undefined);
    if (success) {
      toast.success('QR Code created!');
      navigate('/my-qr-codes');
    } else {
      toast.error('Failed to create QR code');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">QR</div>
          <span className="font-bold text-lg">QR Generator</span>
        </div>
        <StepIndicator currentStep={step} />
        <div className="w-24" />
      </header>

      <div className="flex-1 flex">
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 max-w-3xl">
          {step === 1 && <SelectType selected={selectedType} onSelect={t => { setSelectedType(t); setContent({}); fileRef.current = null; filesRef.current = []; }} />}
          {step === 2 && selectedType && (
            <AddContent
              type={selectedType}
              content={content}
              onChange={handleContentChange}
              name={name}
              onNameChange={setName}
              onFileChange={handleFileChange}
              onFilesChange={handleFilesChange}
            />
          )}
          {step === 3 && <DesignQR style={style} onChange={setStyle} />}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            ) : <div />}
            {step < 3 ? (
              <Button onClick={handleNext} className="gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} className="gap-2">
                Create <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="hidden lg:block w-[360px] border-l bg-muted/30 p-6">
          <PhoneMockup>
            {step >= 2 && qrData ? (
              <QRPreview data={qrData} style={style} size={200} />
            ) : (
              <div className="text-center p-6">
                <div className="w-40 h-40 mx-auto mb-4 border-2 border-dashed border-border rounded-xl flex items-center justify-center">
                  <span className="text-4xl">📱</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Select a type of QR code<br/>on the left</p>
              </div>
            )}
          </PhoneMockup>
        </div>
      </div>
    </div>
  );
};

export default Index;
