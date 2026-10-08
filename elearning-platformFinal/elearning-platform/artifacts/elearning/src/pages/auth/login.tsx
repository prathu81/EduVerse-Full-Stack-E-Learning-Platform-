import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login: setAuthUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate: login, isPending } = useLogin({
    mutation: {
      onSuccess: (data) => {
        setAuthUser(data.user);
        toast({ title: "Welcome back!", description: data.message });
        setLocation(data.user.role === "admin" ? "/dashboard/admin" : "/dashboard/student");
      },
      onError: (error: any) => {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      },
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Abstract Background */}
      <img 
        src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-5 mix-blend-overlay"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border/50 p-8 md:p-10 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg mb-6 cursor-pointer hover:scale-105 transition-transform">
            <BookOpen className="w-7 h-7 text-white" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to continue your learning journey</p>
        </div>

        <form onSubmit={form.handleSubmit((data) => login({ data }))} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Email</label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              className="h-12 bg-background border-2 focus:ring-primary/20"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="h-12 bg-background border-2 focus:ring-primary/20"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25 rounded-xl mt-4"
          >
            {isPending ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Don't have an account?
          </p>
          <div className="flex items-center justify-center gap-4 text-sm font-medium">
            <Link href="/register/student" className="text-primary hover:underline">Register as Student</Link>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <Link href="/register/admin" className="text-muted-foreground hover:text-foreground transition-colors">Apply to Teach</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
