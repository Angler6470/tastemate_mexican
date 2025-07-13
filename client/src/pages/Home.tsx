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
  const [autoSubmitMessage, setAutoSubmitMessage] = useState<string>("");

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

  // Generate witty prompts for each flavor
  const generateFlavorPrompt = (flavorName: string, emoji: string) => {
    const prompts = {
      en: {
        spicy: [
          "🔥 I'm feeling like a fire-breathing dragon today! Show me something that'll make me breathe smoke!",
          "🌶️ My taste buds are begging for adventure! Hit me with your spiciest recommendations!",
          "🌋 I want food so hot, it needs its own warning label! What do you got?",
          "🔥 Let's turn up the heat! I'm ready to sweat for flavor!",
          "🌶️ I'm craving something that'll make my eyes water with joy! Bring on the burn!",
          "🔥 Fire me up! I want dishes that pack a serious punch!"
        ],
        sweet: [
          "🍯 My sweet tooth is calling! I need something that'll make me smile with every bite!",
          "🧁 I'm craving something sweeter than a summer sunset! What's your magic?",
          "🍭 Sugar rush incoming! Show me your most delightful treats!",
          "🍰 Life's too short for bitter! Give me pure sweetness!",
          "🍯 I'm having a sweet emergency! Show me your most heavenly desserts!",
          "🧁 My soul needs sugar! What's your most indulgent sweet creation?"
        ],
        salty: [
          "🧂 I'm feeling like the ocean today - salty and deep! What's on the menu?",
          "🥨 My cravings are as salty as my attitude! Feed my soul!",
          "🧀 I need something with enough salt to make me thirsty for more!",
          "🥓 Salty goodness is calling my name! What's your best shot?",
          "🧂 I'm craving that perfect salty satisfaction! What's your specialty?",
          "🥨 Salt is my love language! Show me your most savory treats!"
        ],
        sour: [
          "🍋 I want my face to pucker with pure joy! Hit me with that tang!",
          "🍏 Sour power activate! Show me something that'll make me wake up!",
          "🥒 I'm ready to embrace the pucker! What's your sourest delight?",
          "🍋 Tart and tangy is my jam! Give me that citrus kick!",
          "🍏 I'm craving that perfect sour shock! What's your most tart treat?",
          "🍋 Make my mouth water with your tangiest creations!"
        ],
        savory: [
          "🍄 I'm craving something rich and complex! Feed my sophisticated side!",
          "🥩 Umami is my love language! Show me your most savory creations!",
          "🧄 I want flavors that'll make me close my eyes and say 'mmm'!",
          "🍖 Savory satisfaction is what I need! What's your masterpiece?",
          "🍄 I'm hunting for deep, rich flavors! What's your most complex dish?",
          "🥩 Give me that perfect umami experience! What's your signature savory dish?"
        ],
        cheesy: [
          "🧀 I'm having a cheese emergency! Lactose tolerance is overrated!",
          "🍕 Cheese is my religion and I'm ready to worship! What's divine?",
          "🧀 I want so much cheese, I'll need a nap after! Bring it on!",
          "🥛 Dairy dreams are calling! Show me your cheesiest creations!",
          "🧀 I'm absolutely cheese-obsessed right now! What's your gooiest option?",
          "🍕 Cheese me up! I want something gloriously melted and divine!"
        ]
      },
      es: {
        spicy: [
          "🔥 ¡Soy un dragón escupefuego hoy! ¡Muéstrame algo que me haga echar humo!",
          "🌶️ ¡Mis papilas gustativas ruegan por aventura! ¡Dame tus recomendaciones más picantes!",
          "🌋 ¡Quiero comida tan picante que necesite su propia advertencia! ¿Qué tienes?",
          "🔥 ¡Subamos la temperatura! ¡Estoy listo para sudar por el sabor!",
          "🌶️ ¡Antojo algo que me haga llorar de felicidad! ¡Trae el picante!",
          "🔥 ¡Préndeme fuego! ¡Quiero platos que peguen duro!"
        ],
        sweet: [
          "🍯 ¡Mi diente dulce está gritando! ¡Necesito algo que me haga sonreír con cada bocado!",
          "🧁 ¡Antojo algo más dulce que un atardecer de verano! ¿Cuál es tu magia?",
          "🍭 ¡Subidón de azúcar en camino! ¡Muéstrame tus delicias más encantadoras!",
          "🍰 ¡La vida es muy corta para lo amargo! ¡Dame dulzura pura!",
          "🍯 ¡Tengo una emergencia dulce! ¡Muéstrame tus postres más celestiales!",
          "🧁 ¡Mi alma necesita azúcar! ¿Cuál es tu creación dulce más indulgente?"
        ],
        salty: [
          "🧂 ¡Me siento como el océano hoy - salado y profundo! ¿Qué hay en el menú?",
          "🥨 ¡Mis antojos están tan salados como mi actitud! ¡Alimenta mi alma!",
          "🧀 ¡Necesito algo con suficiente sal para darme sed de más!",
          "🥓 ¡La bondad salada está llamando mi nombre! ¿Cuál es tu mejor opción?",
          "🧂 ¡Antojo esa satisfacción salada perfecta! ¿Cuál es tu especialidad?",
          "🥨 ¡La sal es mi lenguaje del amor! ¡Muéstrame tus delicias más sabrosas!"
        ],
        sour: [
          "🍋 ¡Quiero que mi cara se frunza de pura alegría! ¡Dame ese sabor agrio!",
          "🍏 ¡Poder agrio, actívate! ¡Muéstrame algo que me despierte!",
          "🥒 ¡Estoy listo para abrazar el fruncimiento! ¿Cuál es tu delicia más agria?",
          "🍋 ¡Agrio y cítrico es mi pasión! ¡Dame esa patada cítrica!",
          "🍏 ¡Antojo ese shock agrio perfecto! ¿Cuál es tu delicia más ácida?",
          "🍋 ¡Haz que se me haga agua la boca con tus creaciones más cítricas!"
        ],
        savory: [
          "🍄 ¡Antojo algo rico y complejo! ¡Alimenta mi lado sofisticado!",
          "🥩 ¡Umami es mi lenguaje del amor! ¡Muéstrame tus creaciones más sabrosas!",
          "🧄 ¡Quiero sabores que me hagan cerrar los ojos y decir 'mmm'!",
          "🍖 ¡Satisfacción salada es lo que necesito! ¿Cuál es tu obra maestra?",
          "🍄 ¡Busco sabores profundos y ricos! ¿Cuál es tu plato más complejo?",
          "🥩 ¡Dame esa experiencia umami perfecta! ¿Cuál es tu plato salado insignia?"
        ],
        cheesy: [
          "🧀 ¡Tengo una emergencia de queso! ¡La intolerancia a la lactosa está sobrevalorada!",
          "🍕 ¡El queso es mi religión y estoy listo para adorar! ¿Qué es divino?",
          "🧀 ¡Quiero tanto queso que necesitaré una siesta después! ¡Vamos!",
          "🥛 ¡Los sueños lácteos están llamando! ¡Muéstrame tus creaciones más quesudas!",
          "🧀 ¡Estoy absolutamente obsesionado con el queso ahora! ¿Cuál es tu opción más pegajosa?",
          "🍕 ¡Lléname de queso! ¡Quiero algo gloriosamente derretido y divino!"
        ]
      }
    };

    const flavorKey = flavorName.toLowerCase();
    const langPrompts = prompts[language as keyof typeof prompts];
    const flavorPrompts = langPrompts[flavorKey as keyof typeof langPrompts];
    
    if (flavorPrompts) {
      return flavorPrompts[Math.floor(Math.random() * flavorPrompts.length)];
    }
    
    // Fallback prompt
    return language === "es" 
      ? `${emoji} ¡Estoy antojando algo ${flavorName}! ¿Qué me recomiendas?`
      : `${emoji} I'm craving something ${flavorName}! What do you recommend?`;
  };

  const handleFlavorShortcut = (flavor: any) => {
    const prompt = generateFlavorPrompt(flavor.name, flavor.emoji);
    setAutoSubmitMessage(prompt);
    // Clear after setting to allow re-triggering
    setTimeout(() => setAutoSubmitMessage(""), 100);
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
                  autoSubmitMessage={autoSubmitMessage}
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
                onShortcutClick={handleFlavorShortcut}
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
