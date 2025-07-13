import React from 'react';
import { Share2, Facebook, Twitter, Instagram, MessageCircle, Copy } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SocialShare {
  id: string;
  menuItemId: string;
  platform: string;
  shareCount: number;
  lastSharedAt: string;
}

interface SocialSharingProps {
  menuItemId: string;
  itemName: string;
  itemDescription: string;
}

export function SocialSharing({ menuItemId, itemName, itemDescription }: SocialSharingProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch social shares for this menu item
  const { data: shares = [] } = useQuery({
    queryKey: ['/api/social-shares/menuitem', menuItemId],
    queryFn: async () => {
      const response = await fetch(`/api/social-shares/menuitem/${menuItemId}`);
      if (!response.ok) throw new Error('Failed to fetch social shares');
      return response.json();
    }
  });

  // Increment share count mutation
  const incrementShareMutation = useMutation({
    mutationFn: async (platform: string) => {
      return await apiRequest('/api/social-shares/increment', {
        method: 'POST',
        body: JSON.stringify({ menuItemId, platform }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-shares/menuitem', menuItemId] });
      toast({
        title: t('shared'),
        description: t('sharedSuccessfully'),
      });
    },
    onError: () => {
      toast({
        title: t('error'),
        description: t('shareError'),
        variant: 'destructive',
      });
    }
  });

  const getShareCount = (platform: string) => {
    const share = shares.find((s: SocialShare) => s.platform === platform);
    return share ? share.shareCount : 0;
  };

  const handleShare = async (platform: string) => {
    const shareText = `${t('checkOut')} ${itemName} - ${itemDescription}`;
    const shareUrl = window.location.href;
    
    // Increment share count
    incrementShareMutation.mutate(platform);
    
    // Handle different platforms
    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL, so we copy to clipboard
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: t('copiedToClipboard'),
          description: t('pasteInInstagram'),
        });
        break;
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'copy':
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: t('copiedToClipboard'),
          description: t('linkCopied'),
        });
        break;
    }
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      platform: 'facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      count: getShareCount('facebook')
    },
    {
      name: 'Twitter',
      platform: 'twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
      count: getShareCount('twitter')
    },
    {
      name: 'Instagram',
      platform: 'instagram',
      icon: Instagram,
      color: 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white',
      count: getShareCount('instagram')
    },
    {
      name: 'WhatsApp',
      platform: 'whatsapp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700 text-white',
      count: getShareCount('whatsapp')
    },
    {
      name: t('copyLink'),
      platform: 'copy',
      icon: Copy,
      color: 'bg-gray-600 hover:bg-gray-700 text-white',
      count: getShareCount('copy')
    }
  ];

  const totalShares = shares.reduce((sum: number, share: SocialShare) => sum + share.shareCount, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          {t('shareThisItem')}
          {totalShares > 0 && (
            <Badge variant="secondary" className="ml-2">
              {totalShares} {t('shares')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {socialPlatforms.map((platform) => (
            <Button
              key={platform.platform}
              onClick={() => handleShare(platform.platform)}
              className={`flex flex-col items-center gap-2 h-auto py-3 px-2 ${platform.color}`}
              disabled={incrementShareMutation.isPending}
            >
              <platform.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{platform.name}</span>
              {platform.count > 0 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {platform.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        
        {totalShares > 0 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {t('totalShares')}: {totalShares}
          </div>
        )}
      </CardContent>
    </Card>
  );
}