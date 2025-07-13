import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Flavor } from "@shared/schema";

type FlavorPillsProps = {
  selectedFlavors: string[];
  onChange: (flavors: string[]) => void;
};

export function FlavorPills({ selectedFlavors, onChange }: FlavorPillsProps) {
  const { language, t } = useI18n();
  
  const { data: flavors = [] } = useQuery<Flavor[]>({
    queryKey: ["/api/flavors"],
  });

  const toggleFlavor = (flavorId: string) => {
    if (selectedFlavors.includes(flavorId)) {
      onChange(selectedFlavors.filter(f => f !== flavorId));
    } else {
      onChange([...selectedFlavors, flavorId]);
    }
  };

  return (
    <div className="mb-8">
      <Label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
        <i className="fas fa-heart text-primary mr-2"></i>
        {t("home.flavorPreferences")}
      </Label>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {flavors.map((flavor) => (
          <Button
            key={flavor._id}
            variant={selectedFlavors.includes(flavor._id) ? "default" : "outline"}
            size="sm"
            className="flavor-pill px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
            onClick={() => toggleFlavor(flavor._id)}
          >
            {flavor.emoji} {flavor.translations[language]}
          </Button>
        ))}
      </div>
    </div>
  );
}
