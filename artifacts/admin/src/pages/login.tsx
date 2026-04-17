import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingBag, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useAdminLogin } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setToken } from "@/lib/api-secure";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const login = useAdminLogin();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast({ title: "Required Fields", description: "Please enter both username and password", variant: "destructive" });
      return;
    }

    login.mutate({ username: username.trim(), password }, {
      onSuccess: (data) => {
        if (data.success && data.token) {
          // Use secure session storage instead of localStorage
          setToken(data.token, 24 * 60 * 60 * 1000); // 24 hour session
          toast({ title: "Welcome back", description: "Successfully logged into admin panel." });
          setLocation("/dashboard");
        }
      },
      onError: (err) => {
        toast({ 
          title: "Access Denied", 
          description: err.message, 
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/login-bg.png`} 
          alt="Background" 
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 z-10">
        <div className="bg-card rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/5 border border-border/50 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              <img
                src={`${import.meta.env.BASE_URL}images/logo.svg`}
                alt="AJKMart"
                style={{ height: 90, width: "auto", maxWidth: 280, objectFit: "contain" }}
              />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">AJKMart Admin</h1>
            <p className="text-muted-foreground mt-2 font-medium">Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  placeholder="Enter username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-11 h-14 rounded-xl border-2 bg-background/50 focus:bg-background transition-colors text-base"
                  autoComplete="username"
                  autoFocus
                  disabled={login.isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-12 h-14 rounded-xl border-2 bg-background/50 focus:bg-background transition-colors text-base"
                  autoComplete="current-password"
                  disabled={login.isPending}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={login.isPending || !username.trim() || !password}
              className="w-full h-14 rounded-xl text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all mt-2"
            >
              {login.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-8">
          AJKMart Admin © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
