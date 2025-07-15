import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Palette, Settings } from "lucide-react";
import { HelpDialog } from "./HelpDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoPath from "@assets/logo_1752432788529.png";
import { useState, useEffect } from "react";

export function Header() {
  const { language, changeLanguage, t } = useLanguage();
  const { isDarkMode, toggleDarkMode, availableThemes, setTheme, currentTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const shouldBlur = scrollTop > 20;
      console.log('Scroll:', scrollTop, 'Should blur:', shouldBlur);
      setIsScrolled(shouldBlur);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-2xl' 
          : 'bg-white dark:bg-gray-800 shadow-lg'
      }`}
      style={isScrolled ? { backdropFilter: 'blur(1px)' } : {}}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left spacer */}
          <div className="flex-1"></div>
          
          {/* Centered Logo */}
          <Link href="/" className="flex items-center justify-center">
            <img 
              src={logoPath} 
              alt="TasteMate - A Flavor Companion" 
              className="h-32 w-auto transition-transform duration-500 hover:scale-110 hover:animate-spin cursor-pointer"
              style={{ animationDuration: '0.5s' }}
            />
          </Link>

          {/* Right Controls */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            {/* Language Toggle */}
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

            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2 rounded-full"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* Theme Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 rounded-full">
                    <Palette className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availableThemes.map((theme) => (
                    <DropdownMenuItem
                      key={theme.id}
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

              {/* Help Dialog */}
              <HelpDialog />
            </div>

            {/* Admin Access */}
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="p-2 rounded-full">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}