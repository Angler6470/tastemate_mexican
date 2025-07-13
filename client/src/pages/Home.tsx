import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { PromoCarousel } from "@/components/PromoCarousel";
import { SpiceSlider } from "@/components/SpiceSlider";
import { FlavorPills } from "@/components/FlavorPills";
import { ChatInterface } from "@/components/ChatInterface";
import { RecommendationsList } from "@/components/RecommendationsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dice6 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ChatResponse } from "@shared/schema";

export default function Home() {
  const { language, t } = useLanguage();
  const [spiceLevel, setSpiceLevel] = useState(1);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const surpriseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/surprise", {
        spiceLevel,
        flavors: selectedFlavors,
        language,
      });
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      if (data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      }
    },
  });

  const handleSurpriseMe = () => {
    surpriseMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-neutral dark:bg-neutral-dark font-poppins transition-colors duration-300">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <PromoCarousel />
        
        <Card className="mb-8 ocean-card">
          <CardContent className="p-8">
            {/* Chatbot Intro Message */}
            <div className="text-center mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <p className="text-lg text-blue-800 dark:text-blue-200">
                  👋 {t("home.chatbotIntro")}
                </p>
              </div>
              
              {/* Text Input */}
              <div className="mb-6">
                <ChatInterface
                  spiceLevel={spiceLevel}
                  selectedFlavors={selectedFlavors}
                  onRecommendations={setRecommendations}
                />
              </div>
            </div>

            {/* Spiciness Meter */}
            <div className="mb-6">
              <SpiceSlider value={spiceLevel} onChange={setSpiceLevel} />
            </div>
            
            {/* Flavor Shortcut Buttons */}
            <div className="mb-6">
              <FlavorPills 
                selectedFlavors={selectedFlavors} 
                onChange={setSelectedFlavors} 
              />
            </div>
            
            {/* Input Row - Surprise Me and Send buttons */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleSurpriseMe}
                disabled={surpriseMutation.isPending}
                className="surprise-button px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                🎲 {t("home.surpriseMe")}{surpriseMutation.isPending && "..."}
              </Button>
            </div>
          </CardContent>
        </Card>

        <RecommendationsList recommendedIds={recommendations} />
      </main>
    </div>
  );
}
