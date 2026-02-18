export type QRType = 
  | 'website' | 'pdf' | 'links' | 'vcard' 
  | 'business' | 'video' | 'images' | 'facebook'
  | 'instagram' | 'social' | 'whatsapp' | 'mp3'
  | 'menu' | 'apps' | 'coupon' | 'wifi' | 'text' | 'email';

export interface QRTypeInfo {
  id: QRType;
  label: string;
  description: string;
  icon: string;
}

export interface QRCodeData {
  id: string;
  name: string;
  type: QRType;
  content: Record<string, string>;
  style: QRStyleOptions;
  createdAt: string;
  paused: boolean;
}

export interface QRStyleOptions {
  dotsColor: string;
  dotsType: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';
  cornersSquareColor: string;
  cornersSquareType: 'square' | 'extra-rounded' | 'dot';
  cornersDotColor: string;
  cornersDotType: 'square' | 'dot';
  backgroundColor: string;
  logoImage?: string;
}

export const defaultStyle: QRStyleOptions = {
  dotsColor: '#000000',
  dotsType: 'square',
  cornersSquareColor: '#000000',
  cornersSquareType: 'square',
  cornersDotColor: '#000000',
  cornersDotType: 'square',
  backgroundColor: '#ffffff',
};
