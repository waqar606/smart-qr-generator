import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { QRStyleOptions, defaultStyle } from '@/types/qr';

interface QRPreviewProps {
  data: string;
  style?: QRStyleOptions;
  size?: number;
}

export function QRPreview({ data, style = defaultStyle, size = 250 }: QRPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    qrRef.current = new QRCodeStyling({
      width: size,
      height: size,
      data: data || 'https://example.com',
      dotsOptions: { color: style.dotsColor, type: style.dotsType },
      cornersSquareOptions: { color: style.cornersSquareColor, type: style.cornersSquareType },
      cornersDotOptions: { color: style.cornersDotColor, type: style.cornersDotType },
      backgroundOptions: { color: style.backgroundColor },
      qrOptions: { errorCorrectionLevel: 'H' },
      ...(style.logoImage ? { image: style.logoImage, imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.4 } } : {}),
    });
    if (ref.current) {
      ref.current.innerHTML = '';
      qrRef.current.append(ref.current);
    }
  }, []);

  useEffect(() => {
    qrRef.current?.update({
      data: data || 'https://example.com',
      dotsOptions: { color: style.dotsColor, type: style.dotsType },
      cornersSquareOptions: { color: style.cornersSquareColor, type: style.cornersSquareType },
      cornersDotOptions: { color: style.cornersDotColor, type: style.cornersDotType },
      backgroundOptions: { color: style.backgroundColor },
      ...(style.logoImage ? { image: style.logoImage, imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.4 } } : { image: '' }),
    });
  }, [data, style]);

  return <div ref={ref} className="flex items-center justify-center" />;
}

export function downloadQR(data: string, style: QRStyleOptions, name: string) {
  const qr = new QRCodeStyling({
    width: 1000,
    height: 1000,
    data: data || 'https://example.com',
    dotsOptions: { color: style.dotsColor, type: style.dotsType },
    cornersSquareOptions: { color: style.cornersSquareColor, type: style.cornersSquareType },
    cornersDotOptions: { color: style.cornersDotColor, type: style.cornersDotType },
    backgroundOptions: { color: style.backgroundColor },
    qrOptions: { errorCorrectionLevel: 'H' },
    ...(style.logoImage ? { image: style.logoImage, imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.4 } } : {}),
  });
  qr.download({ name, extension: 'png' });
}
