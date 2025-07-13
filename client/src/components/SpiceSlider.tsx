import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/hooks/useI18n";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { Spiciness } from "@shared/schema";

type SpiceSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function SpiceSlider({ value, onChange }: SpiceSliderProps) {
  const { language, t } = useI18n();
  
  const { data: spiciness = [] } = useQuery<Spiciness[]>({
    queryKey: ["/api/spiciness"],
  });

  const currentSpice = spiciness.find(s => s.level === value);

  return (
    <div className="mb-8">
      <Label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
        🌶️ {t("home.spiceLevel")}
      </Label>
      
      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
        {/* Horizontal spice level buttons */}
        <div className="flex justify-between items-center mb-4">
          {spiciness.map((spice) => (
            <button
              key={spice._id}
              onClick={() => onChange(spice.level)}
              className={`
                flex flex-col items-center p-3 rounded-lg transition-all duration-300 cursor-pointer
                ${value === spice.level 
                  ? 'bg-primary text-white shadow-lg shadow-primary/50 scale-105' 
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105'
                }
              `}
            >
              <span className="text-2xl mb-1">{spice.emoji}</span>
              <span className="text-xs font-medium text-center whitespace-nowrap">
                {spice.translations[language]}
              </span>
            </button>
          ))}
        </div>
        
        {/* Visual progress bar */}
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 via-yellow-400 via-orange-400 to-red-600 transition-all duration-300"
            style={{ width: `${(value / 5) * 100}%` }}
          />
        </div>
        
        {/* Current selection display */}
        {currentSpice && (
          <div className="text-center mt-4">
            <span className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold">
              {currentSpice.emoji} {currentSpice.translations[language]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
