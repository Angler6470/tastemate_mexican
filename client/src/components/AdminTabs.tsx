import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit2, Trash2, Save, X, MessageCircle, Share2, Star, Check, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem, Promo, Theme, Flavor, Hotkey, Review, SocialShare, RestaurantSettings } from "@shared/schema";

export function AdminTabs() {
  const { token } = useAuth();
  const { language, t } = useLanguage();
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

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/admin/reviews"],
    meta: { headers },
  });

  const { data: socialShares = [] } = useQuery<SocialShare[]>({
    queryKey: ["/api/social-shares"],
  });

  const { data: restaurantSettings } = useQuery<RestaurantSettings>({
    queryKey: ["/api/restaurant-settings"],
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

  // Debounced update for restaurant settings
  const [settingsTimeoutId, setSettingsTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const updateRestaurantSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/restaurant-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update restaurant settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurant-settings"] });
      toast({ title: "Success", description: "Restaurant settings updated" });
    },
  });

  const debouncedUpdateSettings = useCallback((newSettings: any) => {
    if (settingsTimeoutId) {
      clearTimeout(settingsTimeoutId);
    }
    
    const timeoutId = setTimeout(() => {
      updateRestaurantSettingsMutation.mutate(newSettings);
    }, 800); // 800ms debounce
    
    setSettingsTimeoutId(timeoutId);
  }, [settingsTimeoutId, updateRestaurantSettingsMutation]);

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="menu">{t("admin.dashboard.tabs.menu")}</TabsTrigger>
            <TabsTrigger value="promos">{t("admin.dashboard.tabs.promos")}</TabsTrigger>
            <TabsTrigger value="themes">{t("admin.dashboard.tabs.themes")}</TabsTrigger>
            <TabsTrigger value="hotkeys">{t("admin.dashboard.tabs.hotkeys")}</TabsTrigger>
            <TabsTrigger value="reviews">
              <MessageCircle className="h-4 w-4 mr-1" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="h-4 w-4 mr-1" />
              Social
            </TabsTrigger>
            <TabsTrigger value="stats">{t("admin.dashboard.tabs.stats")}</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Restaurant Settings
              </h3>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-name">Restaurant Name</Label>
                    <Input
                      id="restaurant-name"
                      value={restaurantSettings?.restaurantName || ""}
                      onChange={(e) => {
                        const newSettings = { 
                          ...restaurantSettings, 
                          restaurantName: e.target.value 
                        };
                        debouncedUpdateSettings(newSettings);
                      }}
                      placeholder="Enter restaurant name"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This name will appear in social sharing messages and throughout the app.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-description">Description</Label>
                    <Textarea
                      id="restaurant-description"
                      value={restaurantSettings?.description || ""}
                      onChange={(e) => {
                        const newSettings = { 
                          ...restaurantSettings, 
                          description: e.target.value 
                        };
                        debouncedUpdateSettings(newSettings);
                      }}
                      placeholder="Enter restaurant description"
                      rows={3}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Optional description for your restaurant.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website-url">Website URL</Label>
                    <Input
                      id="website-url"
                      value={restaurantSettings?.websiteUrl || ""}
                      onChange={(e) => {
                        const newSettings = { 
                          ...restaurantSettings, 
                          websiteUrl: e.target.value 
                        };
                        debouncedUpdateSettings(newSettings);
                      }}
                      placeholder="https://your-restaurant.com"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Optional website URL for your restaurant.
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Social Sharing Preview</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="text-sm font-medium">Example sharing message:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        "Check out Spicy Tacos at {restaurantSettings?.restaurantName || 'TasteMate'}! 
                        Delicious tacos with the perfect amount of spice."
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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

          <TabsContent value="reviews" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Manage Reviews
              </h3>
              <Badge variant="secondary">
                {reviews.length} Total Reviews
              </Badge>
            </div>
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{review.userName}</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant={review.isApproved ? "default" : "secondary"}>
                            {review.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {review.comment}
                        </p>
                        <div className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()} • Menu Item: {review.menuItemId}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!review.isApproved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await fetch(`/api/admin/reviews/${review.id}/approve`, {
                                  method: 'POST',
                                  headers: { ...headers }
                                });
                                queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
                                toast({ title: 'Review approved successfully' });
                              } catch (error) {
                                toast({ title: 'Failed to approve review', variant: 'destructive' });
                              }
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this review?')) {
                              try {
                                await fetch(`/api/admin/reviews/${review.id}`, {
                                  method: 'DELETE',
                                  headers: { ...headers }
                                });
                                queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
                                toast({ title: 'Review deleted successfully' });
                              } catch (error) {
                                toast({ title: 'Failed to delete review', variant: 'destructive' });
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {reviews.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No reviews yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Social Sharing Analytics
              </h3>
              <Badge variant="secondary">
                {socialShares.reduce((total, share) => total + share.shareCount, 0)} Total Shares
              </Badge>
            </div>
            <div className="space-y-4">
              {socialShares.map((share) => (
                <Card key={share.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Share2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{share.platform}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Menu Item: {share.menuItemId}
                          </p>
                          <p className="text-xs text-gray-500">
                            Last shared: {new Date(share.lastSharedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{share.shareCount}</div>
                        <div className="text-sm text-gray-500">shares</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {socialShares.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No social shares yet</p>
                  </CardContent>
                </Card>
              )}
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
