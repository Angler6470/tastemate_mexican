import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login, isLoading } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: t("common.error"),
        description: "Username and password are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(username, password);
      toast({
        title: t("common.success"),
        description: "Login successful",
      });
      setLocation("/admin/dashboard");
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral dark:bg-neutral-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            <Lock className="h-6 w-6 text-primary mx-auto mb-2" />
            {t("admin.login.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder={t("admin.login.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <Input
              type="password"
              placeholder={t("admin.login.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  {t("admin.login.loginButton")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
