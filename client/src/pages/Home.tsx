import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useI18n } from "@/hooks/useI18n";
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
  const { language, t } = useI18n();
  const [spiceLevel, setSpiceLevel] = useState(2);
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
        
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                <i className="fas fa-magic mr-2 text-primary"></i>
                {t("home.title")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {t("home.subtitle")}
              </p>
            </div>

            <SpiceSlider value={spiceLevel} onChange={setSpiceLevel} />
            
            <FlavorPills 
              selectedFlavors={selectedFlavors} 
              onChange={setSelectedFlavors} 
            />
            
            <ChatInterface
              spiceLevel={spiceLevel}
              selectedFlavors={selectedFlavors}
              onRecommendations={setRecommendations}
            />
            
            <div className="text-center">
              <Button
                onClick={handleSurpriseMe}
                disabled={surpriseMutation.isPending}
                className="surprise-button px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(45deg, #FFD23F, #FB8500)',
                }}
              >
                🎲 {t("home.surpriseMe")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <RecommendationsList recommendedIds={recommendations} />
      </main>
    </div>
  );
}
