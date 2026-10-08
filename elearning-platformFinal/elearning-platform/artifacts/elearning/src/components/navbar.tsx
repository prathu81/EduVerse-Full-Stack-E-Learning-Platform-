import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLogout } from "@workspace/api-client-react";
import { LogOut, BookOpen, LayoutDashboard, UserCircle, Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout: clearAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { mutate: performLogout, isPending: isLoggingOut } = useLogout({
    mutation: {
      onSuccess: () => {
        clearAuth();
        setLocation("/");
      }
    }
  });

  const handleLogout = () => {
    performLogout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-lg shadow-primary/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            NexusLearn
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/courses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Explore Courses
          </Link>
          
          <div className="h-4 w-px bg-border"></div>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link 
                href={isAdmin ? "/dashboard/admin" : "/dashboard/student"}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold leading-none">{user?.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} disabled={isLoggingOut} className="rounded-full">
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setLocation("/login")}>
                Sign In
              </Button>
              <Button 
                onClick={() => setLocation("/register/student")}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20 rounded-full px-6"
              >
                Get Started
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="p-4 flex flex-col gap-4">
              <Link href="/courses" className="p-2 text-sm font-medium block rounded-lg hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                Explore Courses
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href={isAdmin ? "/dashboard/admin" : "/dashboard/student"} className="p-2 text-sm font-medium block rounded-lg hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Button variant="destructive" className="w-full justify-start" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Button variant="outline" className="w-full" onClick={() => { setLocation("/login"); setMobileMenuOpen(false); }}>Sign In</Button>
                  <Button className="w-full bg-primary" onClick={() => { setLocation("/register/student"); setMobileMenuOpen(false); }}>Get Started</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
