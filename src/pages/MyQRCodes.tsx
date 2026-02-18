import { useState } from 'react';
import { useQRCodes } from '@/hooks/useQRCodes';
import { QRPreview, downloadQR } from '@/components/QRPreview';
import { encodeQRData } from '@/lib/qrDataEncoder';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Trash2, Download, Eye, Pause, Play, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function MyQRCodes() {
  const { codes, loading, deleteCode, togglePause } = useQRCodes();
  const [viewingId, setViewingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const viewing = codes.find(c => c.id === viewingId) || null;

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-10 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10">
      <h1 className="text-2xl font-bold mb-6">My QR Codes</h1>

      {codes.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No QR codes yet</p>
          <p className="text-sm mt-1">Create your first QR code to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {codes.map(code => {
            const data = encodeQRData(code.type, code.content, code.id);
            return (
              <div key={code.id} className={`bg-card border rounded-xl p-5 flex flex-col items-center gap-3 transition-opacity ${code.paused ? 'opacity-50' : ''}`}>
                <QRPreview data={data} style={code.style} size={150} />
                <div className="text-center">
                  <p className="font-semibold">{code.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{code.type} • {new Date(code.createdAt).toLocaleDateString()}</p>
                  {code.paused && <span className="text-xs text-destructive font-medium">Paused</span>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/edit/${code.id}`)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => setViewingId(code.id)}><Eye className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => downloadQR(data, code.style, code.name)}><Download className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { togglePause(code.id); toast.info(code.paused ? 'Resumed' : 'Paused'); }}>
                    {code.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => { deleteCode(code.id); toast.success('Deleted'); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={() => setViewingId(null)}>
        <DialogContent className="max-w-md flex flex-col items-center gap-4">
          {viewing && (
            <>
              <h2 className="text-xl font-bold">{viewing.name}</h2>
              <QRPreview data={encodeQRData(viewing.type, viewing.content, viewing.id)} style={viewing.style} size={300} />
              <Button onClick={() => downloadQR(encodeQRData(viewing.type, viewing.content, viewing.id), viewing.style, viewing.name)} className="gap-2">
                <Download className="w-4 h-4" /> Download
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
