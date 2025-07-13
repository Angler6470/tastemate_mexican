import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { language, changeLanguage } = useI18n();

  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full p-1">
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        className="rounded-full p-2 h-8 w-8"
        onClick={() => changeLanguage("en")}
      >
        🇺🇸
      </Button>
      <Button
        variant={language === "es" ? "default" : "ghost"}
        size="sm"
        className="rounded-full p-2 h-8 w-8"
        onClick={() => changeLanguage("es")}
      >
        🇲🇽
      </Button>
    </div>
  );
}
