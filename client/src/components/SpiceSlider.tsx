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
        <i className="fas fa-pepper-hot text-primary mr-2"></i>
        {t("home.spiceLevel")}
      </Label>
      
      <div className="relative">
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          max={5}
          min={0}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
          {spiciness.map((spice) => (
            <span key={spice._id} className="flex-1 text-center">
              {spice.emoji} {spice.translations[language]}
            </span>
          ))}
        </div>
      </div>
      
      {currentSpice && (
        <div className="text-center mt-2">
          <span className="text-primary font-semibold">
            {currentSpice.emoji} {currentSpice.translations[language]}
          </span>
        </div>
      )}
    </div>
  );
}
