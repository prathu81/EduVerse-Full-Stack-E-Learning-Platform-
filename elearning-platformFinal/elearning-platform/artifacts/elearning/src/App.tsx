import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

import Home from "@/pages/home";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import Login from "@/pages/auth/login";
import RegisterStudent from "@/pages/auth/register-student";
import RegisterAdmin from "@/pages/auth/register-admin";
import StudentDashboard from "@/pages/student/dashboard";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow flex flex-col relative">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/courses" component={Courses} />
          <Route path="/courses/:id" component={CourseDetail} />
          <Route path="/login" component={Login} />
          <Route path="/register/student" component={RegisterStudent} />
          <Route path="/register/admin" component={RegisterAdmin} />
          <Route path="/dashboard/student" component={StudentDashboard} />
          <Route path="/dashboard/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
