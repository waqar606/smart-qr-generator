import { QRType } from '@/types/qr';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, FileText, Music, Film, ImageIcon, Plus, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const PAGE_THEMES = [
  { name: 'Blue & Green', primary: '#527AC9', secondary: '#7EC09F' },
  { name: 'Dark & Light', primary: '#2d2d2d', secondary: '#e0e0e0' },
  { name: 'Sky & Blue', primary: '#87CEEB', secondary: '#4A90D9' },
  { name: 'Purple & Black', primary: '#9b59b6', secondary: '#2c3e50' },
  { name: 'Teal & Dark', primary: '#5aaa95', secondary: '#1a1a2e' },
  { name: 'Gold & Black', primary: '#d4a843', secondary: '#2d2d2d' },
];

interface Props {
  type: QRType;
  content: Record<string, string>;
  onChange: (content: Record<string, string>) => void;
  name: string;
  onNameChange: (name: string) => void;
  onFileChange?: (file: File | null) => void;
  onFilesChange?: (files: File[]) => void;
}

export function AddContent({ type, content, onChange, name, onNameChange, onFileChange, onFilesChange }: Props) {
  const set = (key: string, val: string) => onChange({ ...content, [key]: val });
  const setMulti = (updates: Record<string, string>) => onChange({ ...content, ...updates });
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  // Generate preview URL from file data
  useEffect(() => {
    if (content.fileDataUrl) setFilePreview(content.fileDataUrl);
  }, [content.fileDataUrl]);

  useEffect(() => {
    if (content.fileDataUrls) {
      try { setFilePreviews(JSON.parse(content.fileDataUrls)); } catch { /* */ }
    }
  }, [content.fileDataUrls]);

  const handleFileSelect = (file: File, fileType: string) => {
    onFileChange?.(file);
    onChange({ ...content, fileName: file.name });
    if (fileType === 'video' || fileType === 'pdf' || fileType === 'mp3') {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    }
  };

  const handleRemoveFile = () => {
    onFileChange?.(null);
    setFilePreview(null);
    const newContent = { ...content };
    delete newContent.fileName;
    delete newContent.fileDataUrl;
    onChange(newContent);
  };

  const handleImagesSelect = (files: FileList) => {
    onFilesChange?.(Array.from(files));
    onChange({ ...content, fileCount: `${files.length} image(s)` });
    const urls = Array.from(files).map(f => URL.createObjectURL(f));
    setFilePreviews(urls);
  };

  const handleRemoveImage = (index: number) => {
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setFilePreviews(newPreviews);
    // Note: can't easily remove individual files from FileList, clear all if last one removed
    if (newPreviews.length === 0) {
      onFilesChange?.([]);
      const newContent = { ...content };
      delete newContent.fileCount;
      onChange(newContent);
    }
  };

  const isFileType = ['pdf', 'video', 'images', 'mp3', 'apps', 'social'].includes(type);

  const renderThemePicker = () => {
    if (!isFileType) return null;
    const selected = content.themePrimary || PAGE_THEMES[0].primary;
    return (
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div>
          <Label className="font-bold text-base">Design</Label>
          <p className="text-sm text-muted-foreground">Choose a color theme for your page.</p>
        </div>
        <p className="text-sm font-medium">Color palette</p>
        <div className="flex flex-wrap gap-3">
          {PAGE_THEMES.map((theme) => (
            <button
              key={theme.name}
              onClick={() => setMulti({ themePrimary: theme.primary, themeSecondary: theme.secondary })}
              className={`flex gap-0.5 rounded-lg overflow-hidden border-2 transition ${selected === theme.primary ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'}`}
            >
              <div className="w-8 h-10" style={{ backgroundColor: theme.primary }} />
              <div className="w-8 h-10" style={{ backgroundColor: theme.secondary }} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium">Primary color</p>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
              <input type="color" value={content.themePrimary || PAGE_THEMES[0].primary} onChange={e => set('themePrimary', e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
              <span className="text-sm font-mono">{content.themePrimary || PAGE_THEMES[0].primary}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium">Secondary color</p>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
              <input type="color" value={content.themeSecondary || PAGE_THEMES[0].secondary} onChange={e => set('themeSecondary', e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
              <span className="text-sm font-mono">{content.themeSecondary || PAGE_THEMES[0].secondary}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFields = () => {
    switch (type) {
      case 'website':
        return (
          <div className="space-y-2">
            <Label>Website URL *</Label>
            <Input placeholder="E.g. https://www.mywebsite.com/" value={content.url || ''} onChange={e => set('url', e.target.value)} />
          </div>
        );
      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Phone number *</Label>
              <Input placeholder="E.g. +1 234 567 8901" value={content.phone || ''} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Write your message" value={content.message || ''} onChange={e => set('message', e.target.value)} />
            </div>
          </div>
        );
      case 'wifi':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Network Name (SSID) *</Label>
              <Input placeholder="WiFi network name" value={content.ssid || ''} onChange={e => set('ssid', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="WiFi password" value={content.password || ''} onChange={e => set('password', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Encryption</Label>
              <select className="w-full border rounded-lg p-2 bg-card" value={content.encryption || 'WPA'} onChange={e => set('encryption', e.target.value)}>
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None</option>
              </select>
            </div>
          </div>
        );
      case 'email':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email address *</Label>
              <Input placeholder="email@example.com" value={content.email || ''} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Email subject" value={content.subject || ''} onChange={e => set('subject', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea placeholder="Email body" value={content.body || ''} onChange={e => set('body', e.target.value)} />
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-2">
            <Label>Text *</Label>
            <Textarea placeholder="Enter your text" rows={5} value={content.text || ''} onChange={e => set('text', e.target.value)} />
          </div>
        );
      case 'facebook':
        return (
          <div className="space-y-2">
            <Label>Facebook Page URL *</Label>
            <Input placeholder="E.g. https://www.facebook.com/yourpage" value={content.url || ''} onChange={e => set('url', e.target.value)} />
          </div>
        );
      case 'instagram':
        return (
          <div className="space-y-2">
            <Label>Username *</Label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <span className="px-3 py-2 bg-muted text-muted-foreground font-medium">@</span>
              <Input className="border-0 rounded-none" placeholder="Username" value={content.username || ''} onChange={e => set('username', e.target.value)} />
            </div>
          </div>
        );
      case 'apps':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>App Name *</Label>
              <Input placeholder="E.g. My App" value={content.appName || ''} onChange={e => set('appName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Developer / Company</Label>
              <Input placeholder="Name of app developer" value={content.developer || ''} onChange={e => set('developer', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input placeholder="E.g. https://www.myapp.com" value={content.website || ''} onChange={e => set('website', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Google Play Store Link</Label>
              <Input placeholder="https://play.google.com/store/apps/details?id=..." value={content.googlePlayUrl || ''} onChange={e => set('googlePlayUrl', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>App Store Link</Label>
              <Input placeholder="https://apps.apple.com/app/..." value={content.appStoreUrl || ''} onChange={e => set('appStoreUrl', e.target.value)} />
            </div>
          </div>
        );
      case 'social': {
        const SOCIAL_ICONS: Record<string, string> = {
          instagram: '<rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig)"/><defs><linearGradient id="ig" x1="0" y1="24" x2="24" y2="0"><stop stop-color="#feda75"/><stop offset=".3" stop-color="#fa7e1e"/><stop offset=".5" stop-color="#d62976"/><stop offset=".7" stop-color="#962fbf"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><circle cx="12" cy="12" r="5" stroke="white" stroke-width="2" fill="none"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/>',
          facebook: '<circle cx="12" cy="12" r="10" fill="#1877F2"/><path d="M16.5 12.5h-2.5v7h-3v-7h-2v-2.5h2v-1.5c0-2.2 1-3.5 3.5-3.5h2v2.5h-1.5c-.8 0-1 .3-1 1v1.5h2.5l-.5 2.5z" fill="white"/>',
          twitter: '<rect width="24" height="24" rx="12" fill="black"/><path d="M13.3 10.7L18.2 5h-1.2l-4.2 4.9L9.3 5H5l5.1 7.4L5 19h1.2l4.5-5.2L14.7 19H19l-5.7-8.3zm-1.6 1.8l-.5-.7L6.9 6h1.7l3.3 4.7.5.7 4.2 6h-1.7l-3.2-4.9z" fill="white"/>',
          linkedin: '<rect width="24" height="24" rx="12" fill="#0A66C2"/><path d="M8 10v7H5.5v-7H8zm-1.25-1.5a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zM19 17h-2.5v-3.5c0-1-.4-1.5-1.2-1.5-.9 0-1.3.6-1.3 1.5V17H11.5v-7H14v1s.7-1.2 2.2-1.2c1.5 0 2.8.9 2.8 3v4.2z" fill="white"/>',
          youtube: '<rect width="24" height="24" rx="12" fill="#FF0000"/><path d="M10 15.5v-7l6 3.5-6 3.5z" fill="white"/>',
          tiktok: '<rect width="24" height="24" rx="12" fill="black"/><path d="M16.5 6.5a3 3 0 002.5 2.5v2a5 5 0 01-2.5-.7v4.7a4 4 0 11-4-4v2a2 2 0 102 2V5h2v1.5z" fill="white"/>',
          whatsapp: '<circle cx="12" cy="12" r="10" fill="#25D366"/><path d="M8 15l.5 2L6 18l1-2.5-.5-1c-.3-.7-.5-1.5-.5-2.5a5 5 0 018.5-3.5A5 5 0 0117 12a5 5 0 01-5 5c-.8 0-1.6-.2-2.3-.5L8 15z" fill="white"/>',
          snapchat: '<circle cx="12" cy="12" r="10" fill="#FFFC00"/><path d="M12 6c2.5 0 3.5 2 3.5 4v1l1 .5c.3.1.5.4.5.7s-.2.5-.5.7l-1 .5v.5c0 .5.5 1 1.5 1.5v.5h-10v-.5c1-.5 1.5-1 1.5-1.5v-.5l-1-.5c-.3-.2-.5-.4-.5-.7s.2-.6.5-.7l1-.5v-1c0-2 1-4 3.5-4z" fill="black"/>',
        };

        const SOCIAL_PLATFORMS = [
          { id: 'instagram', label: 'Instagram', color: '#E4405F' },
          { id: 'facebook', label: 'Facebook', color: '#1877F2' },
          { id: 'twitter', label: 'X (Twitter)', color: '#000000' },
          { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
          { id: 'youtube', label: 'YouTube', color: '#FF0000' },
          { id: 'tiktok', label: 'TikTok', color: '#000000' },
          { id: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
          { id: 'snapchat', label: 'Snapchat', color: '#FFFC00' },
        ];

        let socialLinks: { platform: string; url: string; label: string }[] = [];
        try { socialLinks = JSON.parse(content.socialLinks || '[]'); } catch { /* */ }

        const addSocialLink = (platformId: string) => {
          const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
          if (!platform) return;
          const updated = [...socialLinks, { platform: platformId, url: '', label: `Follow me on ${platform.label}` }];
          set('socialLinks', JSON.stringify(updated));
        };

        const updateSocialLink = (index: number, field: string, value: string) => {
          const updated = [...socialLinks];
          (updated[index] as any)[field] = value;
          set('socialLinks', JSON.stringify(updated));
        };

        const removeSocialLink = (index: number) => {
          const updated = socialLinks.filter((_, i) => i !== index);
          set('socialLinks', JSON.stringify(updated));
        };

        const moveSocialLink = (index: number, direction: 'up' | 'down') => {
          const updated = [...socialLinks];
          const swapIndex = direction === 'up' ? index - 1 : index + 1;
          if (swapIndex < 0 || swapIndex >= updated.length) return;
          [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
          set('socialLinks', JSON.stringify(updated));
        };

        const usedPlatforms = socialLinks.map(l => l.platform);
        const availablePlatforms = SOCIAL_PLATFORMS.filter(p => !usedPlatforms.includes(p.id));

        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="font-bold text-base">Basic Information</Label>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="Your name or brand" value={content.socialTitle || ''} onChange={e => set('socialTitle', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="A short bio or description" rows={3} value={content.socialDescription || ''} onChange={e => set('socialDescription', e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-bold text-base">Image</Label>
              <div className="border-2 border-dashed border-primary/40 rounded-xl p-6 text-center">
                <p className="text-muted-foreground mb-3">Upload a profile image</p>
                <label className="inline-block cursor-pointer bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition">
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file, 'social');
                  }} />
                </label>
                <p className="text-xs text-muted-foreground mt-2">Maximum size: 10MB</p>
              </div>
              {content.fileName && (
                <div className="flex items-center gap-3 border rounded-xl p-3 bg-muted/30">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    {filePreview ? (
                      <img src={filePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 m-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{content.fileName}</p>
                  </div>
                  <button onClick={handleRemoveFile} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label className="font-bold text-base">Social Networks</Label>
              <p className="text-sm text-muted-foreground">Add social media links to your page.</p>
              
              {socialLinks.map((link, i) => (
                <div key={i} className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize text-sm">{SOCIAL_PLATFORMS.find(p => p.id === link.platform)?.label || link.platform}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveSocialLink(i, 'up')} className="p-1 rounded hover:bg-muted" disabled={i === 0}><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => moveSocialLink(i, 'down')} className="p-1 rounded hover:bg-muted" disabled={i === socialLinks.length - 1}><ChevronDown className="w-4 h-4" /></button>
                      <button onClick={() => removeSocialLink(i)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">URL / Username *</Label>
                      <Input placeholder="URL or username" value={link.url} onChange={e => updateSocialLink(i, 'url', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Text</Label>
                      <Input placeholder="Follow me" value={link.label} onChange={e => updateSocialLink(i, 'label', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}

              {availablePlatforms.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {availablePlatforms.map(p => {
                    const iconSvg = SOCIAL_ICONS[p.id] || '';
                    return (
                      <button key={p.id} onClick={() => addSocialLink(p.id)}
                        className="w-10 h-10 rounded-full hover:scale-110 transition-transform flex items-center justify-center overflow-hidden"
                        title={p.label}>
                        {iconSvg ? (
                          <svg viewBox="0 0 24 24" className="w-10 h-10" dangerouslySetInnerHTML={{ __html: iconSvg }} />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: p.color }}>
                            <span className="text-xs font-bold text-white">{p.label.charAt(0)}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      }
      case 'vcard':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>First Name *</Label><Input value={content.firstName || ''} onChange={e => set('firstName', e.target.value)} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={content.lastName || ''} onChange={e => set('lastName', e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Phone</Label><Input value={content.phone || ''} onChange={e => set('phone', e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={content.email || ''} onChange={e => set('email', e.target.value)} /></div>
            <div className="space-y-2"><Label>Organization</Label><Input value={content.org || ''} onChange={e => set('org', e.target.value)} /></div>
            <div className="space-y-2"><Label>Website</Label><Input value={content.website || ''} onChange={e => set('website', e.target.value)} /></div>
          </div>
        );
      case 'pdf':
      case 'mp3':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-primary/40 rounded-xl p-8 text-center">
              <p className="text-muted-foreground mb-3">Upload your {type === 'pdf' ? 'PDF' : 'audio'} file</p>
              <label className="inline-block cursor-pointer bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition">
                Upload {type.toUpperCase()}
                <input type="file" accept={type === 'pdf' ? '.pdf' : '.mp3,.wav,.ogg'} className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, type);
                }} />
              </label>
            </div>
            {content.fileName && (
              <div className="flex items-center gap-3 border rounded-xl p-3 bg-muted/30">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {type === 'pdf' ? <FileText className="w-6 h-6 text-primary" /> : <Music className="w-6 h-6 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{content.fileName}</p>
                  <p className="text-xs text-muted-foreground">{type.toUpperCase()} file</p>
                </div>
                <button onClick={handleRemoveFile} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input placeholder="https://www.youtube.com/watch..." value={content.url || ''} onChange={e => set('url', e.target.value)} />
            </div>
            <div className="border-2 border-dashed border-primary/40 rounded-xl p-8 text-center">
              <p className="text-muted-foreground mb-3">Or upload video(s) from your device</p>
              <label className="inline-block cursor-pointer bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition">
                Upload video(s)
                <input type="file" accept="video/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, 'video');
                }} />
              </label>
            </div>
            {content.fileName && filePreview && (
              <div className="flex items-center gap-3 border rounded-xl p-3 bg-muted/30">
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-black shrink-0">
                  <video src={filePreview} className="w-full h-full object-cover" muted />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{content.fileName}</p>
                  <p className="text-xs text-muted-foreground">Video file</p>
                </div>
                <button onClick={handleRemoveFile} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      case 'images':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-primary/40 rounded-xl p-8 text-center">
              <p className="text-muted-foreground mb-3">Upload your images</p>
              <label className="inline-block cursor-pointer bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition">
                Upload Images
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                  const files = e.target.files;
                  if (files) handleImagesSelect(files);
                }} />
              </label>
            </div>
            {filePreviews.length > 0 && (
              <div className="space-y-2">
                {filePreviews.map((url, i) => (
                  <div key={i} className="flex items-center gap-3 border rounded-xl p-3 bg-muted/30">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Image {i + 1}</p>
                    </div>
                    <button onClick={() => handleRemoveImage(i)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <Label>URL or Content *</Label>
            <Input placeholder="Enter URL or content" value={content.url || ''} onChange={e => set('url', e.target.value)} />
          </div>
        );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">2. Add content to your QR code</h2>
      <div className="space-y-6">
        <div className="bg-card border rounded-xl p-6">{renderFields()}</div>
        {renderThemePicker()}
        <div className="bg-card border rounded-xl p-6 space-y-2">
          <Label className="font-bold">Name of the QR Code</Label>
          <p className="text-sm text-muted-foreground">Give a name to your QR code.</p>
          <Input placeholder="E.g. My QR code" value={name} onChange={e => onNameChange(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
