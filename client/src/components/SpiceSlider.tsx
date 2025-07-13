import { useI18n } from "@/hooks/useI18n";

type SpiceSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function SpiceSlider({ value, onChange }: SpiceSliderProps) {
  const { t } = useI18n();

  // Helper function to get color classes for each spice level
  const getSpiceGlow = (level: number, current: number) => {
    if (current === 0 && level === 0) return 'text-blue-500';
    if (current < level) return 'text-gray-400';
    // Gradually increase from orange to red - only add glow to current level
    if (current === level) {
      switch (level) {
        case 1: return 'text-orange-400 spice-glow-1';
        case 2: return 'text-orange-500 spice-glow-2';
        case 3: return 'text-orange-600 spice-glow-3';
        case 4: return 'text-red-500 spice-glow-4';
        default: return 'text-red-500';
      }
    }
    // For completed levels (current > level), show solid color without glow
    switch (level) {
      case 1: return 'text-orange-400';
      case 2: return 'text-orange-500';
      case 3: return 'text-orange-600';
      case 4: return 'text-red-500';
      default: return 'text-red-500';
    }
  };

  return (
    <div className="spice-slider mb-8">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-left">
        {t("home.spiceLevel")}
      </h2>
      
      {/* Range slider for spice level, with dynamic color */}
      <input
        type="range"
        min="0"
        max="4"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`Set spice level to ${value === 0 ? 'mild' : value} out of 4`}
        className={`slider slider-color-${value} w-full mb-4`}
        style={{
          accentColor: [
            '#38bdf8', // blue for 0
            '#fdba74', // orange-300 for 1
            '#fb923c', // orange-400 for 2
            '#ea580c', // orange-600 for 3
            '#b91c1c'  // red-800 for 4
          ][value]
        }}
      />
      
      {/* Spice icons for each level */}
      <div className="flex justify-around items-center">
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`cursor-pointer text-2xl transition-all duration-300 ${getSpiceGlow(level, value)} ${value === level ? 'animate-wiggle' : ''}`}
            onClick={() => onChange(level)}
            role="button"
            tabIndex={0}
            aria-label={`Set spice level to ${level === 0 ? 'mild' : level} ${level === 0 ? '(snowflake)' : '(chili)'}`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange(level)}
          >
            {/* Snowflake for 0, chili for others */}
            {level === 0 ? '❄️' : '🌶️'}
          </span>
        ))}
      </div>
    </div>
  );
}
