import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode, availableThemes, setTheme, currentTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDarkMode}
        className="p-2 rounded-full"
      >
        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2 rounded-full">
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {availableThemes.map((theme) => (
            <DropdownMenuItem
              key={theme._id}
              onClick={() => setTheme(theme.name)}
              className={currentTheme === theme.name ? "bg-primary/10" : ""}
            >
              <span
                className="inline-block w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: theme.colors.primary }}
              ></span>
              {t(`themes.${theme.name}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
