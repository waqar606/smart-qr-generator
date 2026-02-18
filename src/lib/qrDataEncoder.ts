import { QRType } from '@/types/qr';

export function encodeQRData(type: QRType, content: Record<string, string>, id?: string): string {
  // All types with an ID route through /view/:id for scan tracking
  if (id) {
    const base = window.location.origin;
    return `${base}/view/${id}`;
  }

  // Fallback for preview (no ID yet)
  return getTargetUrl(type, content);
}

/** Build the actual target URL/data for a given QR type + content */
export function getTargetUrl(type: QRType, content: Record<string, string>): string {
  switch (type) {
    case 'website':
      return content.url || 'https://example.com';
    case 'whatsapp':
      return `https://wa.me/${(content.phone || '').replace(/\D/g, '')}${content.message ? `?text=${encodeURIComponent(content.message)}` : ''}`;
    case 'wifi':
      return `WIFI:T:${content.encryption || 'WPA'};S:${content.ssid || ''};P:${content.password || ''};;`;
    case 'email':
      return `mailto:${content.email || ''}?subject=${encodeURIComponent(content.subject || '')}&body=${encodeURIComponent(content.body || '')}`;
    case 'text':
      return content.text || '';
    case 'vcard':
      return `BEGIN:VCARD\nVERSION:3.0\nN:${content.lastName || ''};${content.firstName || ''}\nFN:${content.firstName || ''} ${content.lastName || ''}\nTEL:${content.phone || ''}\nEMAIL:${content.email || ''}\nORG:${content.org || ''}\nURL:${content.website || ''}\nEND:VCARD`;
    case 'facebook':
      return content.url || 'https://facebook.com';
    case 'instagram':
      return `https://instagram.com/${(content.username || '').replace(/^@/, '')}`;
    case 'apps':
      return content.googlePlayUrl || content.appStoreUrl || content.website || 'https://example.com';
    case 'social':
      return 'https://example.com'; // social always renders inline via /view/:id
    default:
      return content.url || content.text || content.fileName || 'https://example.com';
  }
}
