import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, MessageCircle, Thermometer, Shuffle, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function HelpDialog() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <MessageCircle className="h-6 w-6 text-primary" />,
      title: t('help.chatbot.title') || 'AI Chatbot',
      description: t('help.chatbot.description') || 'Chat with our AI to get personalized food recommendations based on your preferences and cravings.',
    },
    {
      icon: <Thermometer className="h-6 w-6 text-red-500" />,
      title: t('help.spiciness.title') || 'Spiciness Meter',
      description: t('help.spiciness.description') || 'Adjust the spice level slider to match your heat tolerance from mild to extra spicy.',
    },
    {
      icon: <Shuffle className="h-6 w-6 text-green-500" />,
      title: t('help.surprise.title') || 'Surprise Me Button',
      description: t('help.surprise.description') || 'Get a random food recommendation when you\'re feeling adventurous and can\'t decide.',
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: t('help.shortcuts.title') || 'Flavor Shortcuts',
      description: t('help.shortcuts.description') || 'Quick flavor buttons that instantly generate recommendations for specific tastes like spicy, sweet, or savory.',
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {t('help.title') || 'How to Use TasteMate'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            {t('help.footer') || 'Combine these features for the best experience - set your spice level, choose flavors, then chat with our AI for perfect recommendations!'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}