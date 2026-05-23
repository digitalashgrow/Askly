'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  username: string;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, profileUrl, username }) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    try {
      const svgElement = qrRef.current?.querySelector('svg');
      if (!svgElement) return;

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const context = canvas.getContext('2d');
        if (context) {
          // Draw premium background gradient
          const gradient = context.createLinearGradient(0, 0, 600, 600);
          gradient.addColorStop(0, '#8b5cf6');
          gradient.addColorStop(0.5, '#ec4899');
          gradient.addColorStop(1, '#06b6d4');
          context.fillStyle = gradient;
          context.fillRect(0, 0, 600, 600);

          // Draw white card in center
          context.fillStyle = '#ffffff';
          // Rounded corners for center card
          const rectX = 50;
          const rectY = 50;
          const rectWidth = 500;
          const rectHeight = 500;
          const cornerRadius = 32;
          context.beginPath();
          context.moveTo(rectX + cornerRadius, rectY);
          context.lineTo(rectX + rectWidth - cornerRadius, rectY);
          context.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + cornerRadius);
          context.lineTo(rectX + rectWidth, rectY + rectHeight - cornerRadius);
          context.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - cornerRadius, rectY + rectHeight);
          context.lineTo(rectX + cornerRadius, rectY + rectHeight);
          context.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - cornerRadius);
          context.lineTo(rectX, rectY + cornerRadius);
          context.quadraticCurveTo(rectX, rectY, rectX + cornerRadius, rectY);
          context.closePath();
          context.fill();

          // Draw "Askly QR" label top
          context.fillStyle = '#0f172a';
          context.font = 'bold 24px var(--font-sans), sans-serif';
          context.textAlign = 'center';
          context.fillText(`Scan to ask @${username}`, 300, 110);

          // Draw QR Code onto Canvas
          const qrImage = new Image();
          qrImage.onload = () => {
            context.drawImage(qrImage, 125, 150, 350, 350);
            
            // Trigger download
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `askly_${username}_qr.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            toast.success('QR Code card downloaded! 🚀');
          };
          qrImage.src = blobURL;
        }
      };
      image.src = blobURL;
    } catch (err) {
      console.error(err);
      toast.error('Failed to download QR code.');
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center p-3">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/10 dark:bg-violet-500/20 text-xs font-semibold text-violet-600 dark:text-violet-400 mb-4">
          <Sparkles size={12} />
          Your Unique QR Code
        </div>

        <h3 className="text-xl font-bold tracking-tight font-display mb-2">
          Share Your Profile
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Followers can scan this QR code to visit your anonymous messaging page instantly.
        </p>

        {/* QR Code container with gradient outline */}
        <div className="p-1 rounded-[32px] premium-gradient shadow-lg mb-6 shadow-purple-500/10 scale-100 hover:scale-102 transition-transform duration-300">
          <div ref={qrRef} className="p-5 rounded-[28px] bg-white flex items-center justify-center">
            <QRCodeSVG
              value={profileUrl}
              size={180}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="M"
              includeMargin={false}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5">
          <Button
            variant="premium"
            onClick={handleDownload}
            leftIcon={<Download size={16} />}
            className="w-full"
          >
            Download QR Card
          </Button>
          <Button
            variant="glass"
            onClick={() => {
              navigator.clipboard.writeText(profileUrl);
              toast.success('Link copied to clipboard!');
            }}
            leftIcon={<Share2 size={16} />}
            className="w-full"
          >
            Copy Public Link
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default QRModal;
