import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem, Promo, Theme, Flavor, Hotkey } from "@shared/schema";

export function AdminTabs() {
  const { token } = useAuth();
  const { language, t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<any>(null);

  const headers = { Authorization: `Bearer ${token}` };

  // Queries
  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["/api/menuitems"],
  });

  const { data: promos = [] } = useQuery<Promo[]>({
    queryKey: ["/api/promos"],
  });

  const { data: themes = [] } = useQuery<Theme[]>({
    queryKey: ["/api/themes"],
  });

  const { data: flavors = [] } = useQuery<Flavor[]>({
    queryKey: ["/api/flavors"],
  });

  const { data: hotkeys = [] } = useQuery<Hotkey[]>({
    queryKey: ["/api/hotkeys"],
  });

  // Mutations
  const createMenuItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/menuitems", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create menu item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menuitems"] });
      setNewItem(null);
      toast({ title: t("common.success"), description: "Menu item created" });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/menuitems/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update menu item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menuitems"] });
      setEditingItem(null);
      toast({ title: t("common.success"), description: "Menu item updated" });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/menuitems/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!response.ok) throw new Error("Failed to delete menu item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menuitems"] });
      toast({ title: t("common.success"), description: "Menu item deleted" });
    },
  });

  const handleCreateMenuItem = () => {
    setNewItem({
      name: { en: "", es: "" },
      description: { en: "", es: "" },
      price: 0,
      imageUrl: "",
      spiceLevel: 0,
      flavors: [],
      category: "",
      ingredients: [],
      rating: 0,
    });
  };

  const handleSaveNewMenuItem = () => {
    if (newItem) {
      createMenuItemMutation.mutate(newItem);
    }
  };

  const handleUpdateMenuItem = (id: string, data: any) => {
    updateMenuItemMutation.mutate({ id, data });
  };

  const handleDeleteMenuItem = (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteMenuItemMutation.mutate(id);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="menu">{t("admin.dashboard.tabs.menu")}</TabsTrigger>
            <TabsTrigger value="promos">{t("admin.dashboard.tabs.promos")}</TabsTrigger>
            <TabsTrigger value="themes">{t("admin.dashboard.tabs.themes")}</TabsTrigger>
            <TabsTrigger value="hotkeys">{t("admin.dashboard.tabs.hotkeys")}</TabsTrigger>
            <TabsTrigger value="stats">{t("admin.dashboard.tabs.stats")}</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Manage Menu Items
              </h3>
              <Button onClick={handleCreateMenuItem} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("admin.dashboard.actions.add")}
              </Button>
            </div>

            {newItem && (
              <Card className="border-2 border-dashed border-primary/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="name-en">Name (English)</Label>
                      <Input
                        id="name-en"
                        value={newItem.name.en}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            name: { ...newItem.name, en: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="name-es">Name (Spanish)</Label>
                      <Input
                        id="name-es"
                        value={newItem.name.es}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            name: { ...newItem.name, es: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) =>
                          setNewItem({ ...newItem, price: parseFloat(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={newItem.imageUrl}
                        onChange={(e) =>
                          setNewItem({ ...newItem, imageUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveNewMenuItem}
                      disabled={createMenuItemMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {t("admin.dashboard.actions.save")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setNewItem(null)}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      {t("admin.dashboard.actions.cancel")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {menuItems.map((item) => (
                <Card key={item._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name[language]}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <i className="fas fa-utensils text-gray-400"></i>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">
                            {item.name[language]}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.description[language]}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-primary font-semibold">
                              ${item.price.toFixed(2)}
                            </span>
                            <Badge variant="secondary">
                              Spice: {item.spiceLevel}/5
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem(item._id)}
                          className="flex items-center gap-1"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMenuItem(item._id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="promos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Manage Promotions
              </h3>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("admin.dashboard.actions.add")}
              </Button>
            </div>
            <div className="space-y-4">
              {promos.map((promo) => (
                <Card key={promo._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                          <img
                            src={promo.imageUrl}
                            alt={promo.title[language]}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">
                            {promo.title[language]}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {promo.description[language]}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="themes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Manage Themes
              </h3>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("admin.dashboard.actions.add")}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((theme) => (
                <Card key={theme._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {theme.displayName[language]}
                      </h4>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {Object.entries(theme.colors).map(([key, color]) => (
                        <div
                          key={key}
                          className="w-8 h-8 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={key}
                        ></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hotkeys" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Manage Hotkeys
              </h3>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("admin.dashboard.actions.add")}
              </Button>
            </div>
            <div className="space-y-4">
              {hotkeys.map((hotkey) => (
                <Card key={hotkey._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white">
                          {hotkey.key}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {hotkey.description[language]}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Chatbot Statistics
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">1,234</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Conversations
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">567</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Recommendations Made
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">89%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    User Satisfaction
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
