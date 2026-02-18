import { useState, useEffect } from 'react';
import { QRCodeData } from '@/types/qr';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useQRCodes() {
  const [codes, setCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCodes = async () => {
    if (!user) {
      setCodes([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setCodes(data.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type as QRCodeData['type'],
        content: row.content as unknown as Record<string, string>,
        style: row.style as unknown as QRCodeData['style'],
        createdAt: row.created_at,
        paused: row.paused,
        fileUrl: row.file_url,
        fileUrls: row.file_urls,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, [user?.id]);

  const addCode = async (code: QRCodeData, file?: File, files?: File[]) => {
    if (!user) return false;
    let fileUrl: string | null = null;
    let fileUrls: string[] | null = null;

    // Upload single file
    if (file) {
      const path = `${code.id}/${file.name}`;
      const { error } = await supabase.storage.from('qr-files').upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('qr-files').getPublicUrl(path);
        fileUrl = urlData.publicUrl;
      }
    }

    // Upload multiple files (images)
    if (files && files.length > 0) {
      const urls: string[] = [];
      for (const f of files) {
        const path = `${code.id}/${f.name}`;
        const { error } = await supabase.storage.from('qr-files').upload(path, f);
        if (!error) {
          const { data: urlData } = supabase.storage.from('qr-files').getPublicUrl(path);
          urls.push(urlData.publicUrl);
        }
      }
      fileUrls = urls;
    }

    // Remove dataUrl fields from content before saving to DB
    const cleanContent = { ...code.content };
    delete cleanContent.fileDataUrl;
    delete cleanContent.fileDataUrls;

    const { error } = await supabase.from('qr_codes').insert([{
      id: code.id,
      name: code.name,
      type: code.type,
      content: cleanContent as any,
      style: code.style as any,
      paused: code.paused,
      file_url: fileUrl,
      file_urls: fileUrls,
      user_id: user.id,
    }]);

    if (!error) await fetchCodes();
    return !error;
  };

  const deleteCode = async (id: string) => {
    await supabase.from('qr_codes').delete().eq('id', id);
    await fetchCodes();
  };

  const togglePause = async (id: string) => {
    const code = codes.find(c => c.id === id);
    if (code) {
      await supabase.from('qr_codes').update({ paused: !code.paused }).eq('id', id);
      await fetchCodes();
    }
  };

  const updateCode = async (
    id: string,
    updates: { name?: string; content?: Record<string, string> },
    file?: File,
    files?: File[]
  ) => {
    const updateData: Record<string, any> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.content !== undefined) updateData.content = updates.content as any;

    // Upload new single file if provided
    if (file) {
      const path = `${id}/${file.name}`;
      const { error } = await supabase.storage.from('qr-files').upload(path, file, { upsert: true });
      if (!error) {
        const { data: urlData } = supabase.storage.from('qr-files').getPublicUrl(path);
        updateData.file_url = urlData.publicUrl;
      }
    }

    // Upload new multiple files if provided
    if (files && files.length > 0) {
      const urls: string[] = [];
      for (const f of files) {
        const path = `${id}/${f.name}`;
        const { error } = await supabase.storage.from('qr-files').upload(path, f, { upsert: true });
        if (!error) {
          const { data: urlData } = supabase.storage.from('qr-files').getPublicUrl(path);
          urls.push(urlData.publicUrl);
        }
      }
      updateData.file_urls = urls;
    }

    const { error } = await supabase.from('qr_codes').update(updateData).eq('id', id);
    if (!error) await fetchCodes();
    return !error;
  };

  return { codes, loading, addCode, deleteCode, togglePause, updateCode };
}
