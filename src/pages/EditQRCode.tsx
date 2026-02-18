import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeData } from '@/types/qr';
import { AddContent } from '@/components/steps/AddContent';
import { QRPreview } from '@/components/QRPreview';
import { PhoneMockup } from '@/components/PhoneMockup';
import { encodeQRData } from '@/lib/qrDataEncoder';
import { useQRCodes } from '@/hooks/useQRCodes';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function EditQRCode() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { codes, loading, updateCode } = useQRCodes();
  const [content, setContent] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [initialized, setInitialized] = useState(false);
  const fileRef = useRef<File | null>(null);
  const filesRef = useRef<File[]>([]);

  const code = codes.find(c => c.id === id);

  useEffect(() => {
    if (code && !initialized) {
      setContent(code.content);
      setName(code.name);
      setInitialized(true);
    }
  }, [code, initialized]);

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-10 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!code) {
    return (
      <div className="flex-1 p-6 lg:p-10 flex items-center justify-center">
        <p className="text-muted-foreground">QR code not found</p>
      </div>
    );
  }

  const qrData = encodeQRData(code.type, content, code.id);

  const handleSave = async () => {
    const cleanContent = { ...content };
    delete cleanContent.fileDataUrl;
    delete cleanContent.fileDataUrls;

    const success = await updateCode(
      code.id,
      { name: name || 'Untitled QR Code', content: cleanContent },
      fileRef.current || undefined,
      filesRef.current.length > 0 ? filesRef.current : undefined
    );
    if (success) {
      toast.success('QR Code updated!');
      navigate('/my-qr-codes');
    } else {
      toast.error('Failed to update QR code');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="border-b bg-card px-6 py-3 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/my-qr-codes')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">QR</div>
          <span className="font-bold text-lg">Edit QR Content</span>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 max-w-3xl">
          <AddContent
            type={code.type}
            content={content}
            onChange={setContent}
            name={name}
            onNameChange={setName}
            onFileChange={(file) => { fileRef.current = file; }}
            onFilesChange={(files) => { filesRef.current = files; }}
          />

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => navigate('/my-qr-codes')} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </div>

        <div className="hidden lg:block w-[360px] border-l bg-muted/30 p-6">
          <PhoneMockup>
            <QRPreview data={qrData} style={code.style} size={200} />
          </PhoneMockup>
        </div>
      </div>
    </div>
  );
}
