import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Utensils, Coffee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import type { MenuItem } from "@shared/schema";

export function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["/api/menuitems"],
  });

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Group menu items by category (debug logging)
  console.log('Menu items:', menuItems);
  const foodItems = menuItems.filter(item => 
    item.category === 'food' || 
    item.category === 'Main Course' || 
    item.category === 'Appetizer' || 
    item.category === 'Dessert'
  );
  const drinkItems = menuItems.filter(item => 
    item.category === 'drink' || 
    item.category === 'Beverage' || 
    item.category === 'Drinks'
  );

  return (
    <>
      {/* Backdrop overlay when menu is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating menu items */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-3 max-h-96 overflow-y-auto">
          {/* Food Section */}
          {foodItems.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <Utensils className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {language === 'es' ? 'Comida' : 'Food'}
                </span>
              </div>
              {foodItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow max-w-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {item.name[language]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {item.description[language]}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      ${item.price}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">🌶️</span>
                      <span className="text-xs text-gray-500">{item.spiceLevel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Drink Section */}
          {drinkItems.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <Coffee className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {language === 'es' ? 'Bebidas' : 'Drinks'}
                </span>
              </div>
              {drinkItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow max-w-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {item.name[language]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {item.description[language]}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      ${item.price}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">🌶️</span>
                      <span className="text-xs text-gray-500">{item.spiceLevel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main floating action button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleMenu}
          className="w-16 h-16 rounded-full bg-primary shadow-2xl hover:bg-primary/90 transition-all duration-300 hover:scale-105 active:scale-95"
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