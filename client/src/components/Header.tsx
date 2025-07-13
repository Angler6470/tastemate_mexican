import { useState } from "react";
import { Link } from "wouter";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Palette, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoPath from "@assets/logo_1752417164635.png";

export function Header() {
  const { language, changeLanguage, t } = useI18n();
  const { isDarkMode, toggleDarkMode, availableThemes, setTheme, currentTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center flex-1">
            <img 
              src={logoPath} 
              alt="TasteMate Logo" 
              className="h-12 w-auto transition-transform duration-300 hover:animate-spin-slow cursor-pointer"
            />
          </Link>

          {/* Controls */}
          <div className="flex items-center space-x-4">
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
