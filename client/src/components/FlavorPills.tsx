import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

import type { Flavor } from "@shared/schema";

type FlavorPillsProps = {
  selectedFlavors: string[];
  onChange: (flavors: string[]) => void;
  onShortcutClick?: (flavor: Flavor) => void;
};

export function FlavorPills({ selectedFlavors, onChange, onShortcutClick }: FlavorPillsProps) {
  const { language, t } = useLanguage();
  
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

  const handleFlavorClick = (flavor: Flavor) => {
    if (onShortcutClick) {
      onShortcutClick(flavor);
    } else {
      toggleFlavor(flavor.id);
    }
  };

  return (
    <div className="mb-8">
      <div className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
        ❤️ {t("home.flavorPreferences")}
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {flavors.map((flavor) => (
          <Button
            key={flavor.id}
            variant="outline"
            size="sm"
            className={`
              px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:brightness-110
              bg-primary/10 hover:bg-primary/20 border-none
              ${selectedFlavors.includes(flavor.id) ? 'bg-primary/30 text-primary-foreground' : 'text-primary'}
            `}
            onClick={() => handleFlavorClick(flavor)}
          >
            <span className="mr-2">{flavor.emoji}</span>
            {flavor.translations[language] || flavor.name}
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
