import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Settings, HelpCircle, Palette } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { HelpDialog } from "./HelpDialog";

export function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { availableThemes, setTheme } = useTheme();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    {
      icon: Home,
      label: "Home",
      href: "/",
      onClick: () => setIsOpen(false),
    },
    ...(user ? [
      {
        icon: Settings,
        label: "Admin",
        href: "/admin/dashboard",
        onClick: () => setIsOpen(false),
      }
    ] : []),
  ];

  return (
    <>
      {/* Backdrop overlay when menu is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating menu items */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-3">
          {/* Help Dialog */}
          <div className="flex justify-end">
            <HelpDialog />
          </div>

          {/* Theme selector */}
          <div className="flex justify-end">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full p-2 shadow-xl border border-white/20">
              <div className="flex gap-2">
                {availableThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      setTheme(theme.name);
                      setIsOpen(false);
                    }}
                    className="w-8 h-8 rounded-full border-2 border-white/50 hover:border-white/80 transition-all duration-200 hover:scale-110"
                    style={{ backgroundColor: theme.colors.primary }}
                    title={theme.displayName.en}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Menu items */}
          {menuItems.map((item, index) => (
            <div key={index} className="flex justify-end">
              <Link href={item.href}>
                <Button
                  onClick={item.onClick}
                  className="w-14 h-14 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-xl border border-white/20 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
                  variant="ghost"
                >
                  <item.icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Main floating action button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleMenu}
          className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-md shadow-2xl border border-white/20 hover:bg-primary transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isOpen ? (
            <X className="h-8 w-8 text-white" />
          ) : (
            <Menu className="h-8 w-8 text-white" />
          )}
        </Button>
      </div>
    </>
  );
}