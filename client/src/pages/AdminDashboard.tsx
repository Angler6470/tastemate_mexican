import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { AdminTabs } from "@/components/AdminTabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral dark:bg-neutral-dark">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                <BarChart3 className="h-6 w-6 text-primary mr-2 inline" />
                {t("admin.dashboard.title")}
              </CardTitle>
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("admin.login.logout")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome back, {user.username}!
            </p>
          </CardContent>
        </Card>

        <AdminTabs />
      </main>
    </div>
  );
}
