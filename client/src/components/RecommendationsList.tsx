import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { ReviewSystem } from "@/components/ReviewSystem";
import { SocialSharing } from "@/components/SocialSharing";
import type { MenuItem } from "@shared/schema";

type RecommendationsListProps = {
  recommendedIds: string[];
};

export function RecommendationsList({ recommendedIds }: RecommendationsListProps) {
  const { language, t } = useLanguage();
  
  const { data: allMenuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["/api/menuitems"],
  });

  const recommendedItems = allMenuItems.filter(item => 
    recommendedIds.includes(item.id)
  );

  if (recommendedItems.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          <i className="fas fa-star text-accent mr-2"></i>
          {t("home.recommendationsTitle")}
        </h3>
        
        <div className="grid grid-cols-1 gap-8">
          {recommendedItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <img
                      src={item.imageUrl}
                      alt={item.name[language]}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                      {item.name[language]}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {item.description[language]}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.flavors.slice(0, 5).map((flavorId) => (
                        <Badge key={flavorId} variant="secondary" className="text-xs">
                          {flavorId}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-semibold text-2xl">
                        ${item.price.toFixed(2)}
                      </span>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-1 text-lg text-gray-600 dark:text-gray-400">
                          {item.rating ? item.rating.toFixed(1) : '4.5'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Social Sharing Section */}
                <div className="mb-6">
                  <SocialSharing 
                    menuItemId={item.id}
                    itemName={item.name[language]}
                    itemDescription={item.description[language]}
                  />
                </div>
                
                {/* Review System Section */}
                <ReviewSystem menuItemId={item.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
