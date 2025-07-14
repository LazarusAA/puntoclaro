'use client'

import { Button } from '~/components/ui/button'
import { Share2 } from 'lucide-react'

// We can create a dedicated WhatsApp icon in icons.tsx later
// For now, a generic share icon is fine.

type ShareButtonProps = {
  shareText: string;
  shareUrl: string;
}

export function ShareButton({ shareText, shareUrl }: ShareButtonProps) {
  const handleShare = async () => {
    const fullShareText = `${shareText}\n\n${shareUrl}`;

    // Check if the Web Share API is available on the user's browser
    if (navigator.share) {
      try {
        // Use the native mobile share sheet
        await navigator.share({
          title: 'Cognition Path',
          text: shareText,
          url: shareUrl,
        });
        console.log('Content shared successfully!');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for desktop browsers: Open WhatsApp Web in a new tab
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Button variant="outline" onClick={handleShare}>
      <Share2 className="mr-2 h-4 w-4" />
      Compartir por WhatsApp
    </Button>
  );
} 