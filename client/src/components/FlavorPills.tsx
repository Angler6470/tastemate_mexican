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
        ❤️ {t("home.flavorPreferences")}
      </Label>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {flavors.map((flavor) => (
          <Button
            key={flavor._id}
            variant={selectedFlavors.includes(flavor._id) ? "default" : "outline"}
            size="sm"
            className={`
              flavor-pill px-4 py-2 rounded-full transition-all duration-300 hover:scale-105
              ${selectedFlavors.includes(flavor._id) 
                ? 'bg-primary text-white shadow-lg shadow-primary/30 animate-pulse' 
                : 'hover:bg-primary/10 hover:border-primary/50'
              }
            `}
            onClick={() => toggleFlavor(flavor._id)}
          >
            <span className="mr-2">{flavor.emoji}</span>
            {flavor.translations[language]}
            {flavor.hotkey && (
              <span className="ml-2 text-xs opacity-60">
                ({flavor.hotkey})
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
