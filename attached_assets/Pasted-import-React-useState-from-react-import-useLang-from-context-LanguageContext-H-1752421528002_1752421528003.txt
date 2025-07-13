import React, { useState } from "react";
import { useLang } from '../context/LanguageContext';

// Helper to get color classes for each spice level
const getSpiceGlow = (level, current) => {
  if (current === 0 && level === 0) return 'text-blue-500';
  if (current < level) return 'text-gray-400';
  // Gradually increase from orange to red
  switch (level) {
    case 1: return 'text-orange-400 spice-glow-1';
    case 2: return 'text-orange-500 spice-glow-2';
    case 3: return 'text-orange-600 spice-glow-3';
    case 4: return 'text-red-500 spice-glow-4';
    default: return 'text-red-500';
  }
};

// SpiceSlider component: lets users select their preferred spice level
export default function SpiceSlider() {
  // State for the current spice level
  const [spiceLevel, setSpiceLevel] = useState(0);
  const { t } = useLang();

  // Handles user clicking on a spice level
  const handleSpiceClick = (level) => {
    setSpiceLevel(level);
    console.log(`Selected spice level: ${level}`);
  };

  return (
    <div className="spice-slider">
      <h2>{t('spicePrompt')}</h2>
      {/* Range slider for spice level, with dynamic color */}
      <input
        type="range"
        min="0"
        max="4"
        value={spiceLevel}
        onChange={(e) => handleSpiceClick(Number(e.target.value))}
        aria-label={`Set spice level to ${spiceLevel === 0 ? 'mild' : spiceLevel} out of 4`}
        className={`slider slider-color-${spiceLevel}`}
        style={{
          // fallback for browsers that don't support custom classes
          accentColor: [
            '#38bdf8', // blue for 0
            '#fdba74', // orange-300 for 1
            '#fb923c', // orange-400 for 2
            '#ea580c', // orange-600 for 3
            '#b91c1c'  // red-800 for 4
          ][spiceLevel]
        }}
      />
      {/* Spice icons for each level */}
      <div className="flex justify-around items-center">
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`cursor-pointer ${getSpiceGlow(level, spiceLevel)} ${spiceLevel === level ? 'animate-wiggle' : ''}`}
            onClick={() => handleSpiceClick(level)}
            role="button"
            tabIndex={0}
            aria-label={`Set spice level to ${level === 0 ? 'mild' : level} ${level === 0 ? '(snowflake)' : '(chili)'}`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSpiceClick(level)}
          >
            {/* Snowflake for 0, chili for others */}
            {level === 0 ? '❄️' : '🌶️'}
          </span>
        ))}
      </div>
    </div>
  );
}