import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
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
    recommendedIds.includes(item._id)
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedItems.map((item) => (
            <Card key={item._id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <img
                  src={item.imageUrl}
                  alt={item.name[language]}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {item.name[language]}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {item.description[language]}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.flavors.slice(0, 3).map((flavorId) => (
                    <Badge key={flavorId} variant="secondary" className="text-xs">
                      {flavorId}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-primary font-semibold text-lg">
                    ${item.price.toFixed(2)}
                  </span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                      {item.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
