import { QRTypeInfo } from '@/types/qr';

export const qrTypes: QRTypeInfo[] = [
  { id: 'website', label: 'Website', description: 'Link to any website URL', icon: 'Globe' },
  { id: 'pdf', label: 'PDF', description: 'Show a PDF', icon: 'FileText' },
  { id: 'links', label: 'List of Links', description: 'Share multiple links', icon: 'Link' },
  { id: 'vcard', label: 'vCard', description: 'Share a digital business card', icon: 'Contact' },
  { id: 'business', label: 'Business', description: 'Share business info', icon: 'Briefcase' },
  { id: 'video', label: 'Video', description: 'Show a video', icon: 'Play' },
  { id: 'images', label: 'Images', description: 'Share multiple images', icon: 'Image' },
  { id: 'facebook', label: 'Facebook', description: 'Share your Facebook page', icon: 'Facebook' },
  { id: 'instagram', label: 'Instagram', description: 'Share your Instagram', icon: 'Instagram' },
  { id: 'social', label: 'Social Media', description: 'Share social channels', icon: 'Share2' },
  { id: 'whatsapp', label: 'WhatsApp', description: 'Get WhatsApp messages', icon: 'MessageCircle' },
  { id: 'mp3', label: 'MP3', description: 'Share an audio file', icon: 'Music' },
  { id: 'menu', label: 'Menu', description: 'Create a restaurant menu', icon: 'UtensilsCrossed' },
  { id: 'apps', label: 'Apps', description: 'Redirect to an app store', icon: 'Smartphone' },
  { id: 'coupon', label: 'Coupon', description: 'Share a coupon', icon: 'Ticket' },
  { id: 'wifi', label: 'WiFi', description: 'Connect to a Wi-Fi network', icon: 'Wifi' },
  { id: 'text', label: 'Text', description: 'Share plain text', icon: 'Type' },
  { id: 'email', label: 'Email', description: 'Send an email', icon: 'Mail' },
];
