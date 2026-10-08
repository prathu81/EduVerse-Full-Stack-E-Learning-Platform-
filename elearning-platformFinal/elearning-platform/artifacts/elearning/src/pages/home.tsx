import { Link, useLocation } from "wouter";
import { useGetCourses } from "@workspace/api-client-react";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Target, Award, Search, Sparkles } from "lucide-react";
import { useState } from "react";

const CATEGORIES = ["Programming", "Design", "Business", "Marketing", "Data Science"];

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useGetCourses({ limit: 6 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero background" 
            className="w-full h-full object-cover opacity-15 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>The #1 Platform for Modern Learning</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-foreground mb-6 leading-tight">
              Master Your Future with <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                World-Class Education
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students learning cutting-edge skills from industry experts through interactive courses, live classes, and hands-on projects.
            </p>

            <form onSubmit={handleSearch} className="w-full max-w-xl relative flex items-center mb-12">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <input 
                type="text"
                placeholder="What do you want to learn today?"
                className="w-full h-14 pl-12 pr-32 rounded-full border-2 border-border/50 bg-background/80 backdrop-blur-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground shadow-xl shadow-black/5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit"
                className="absolute right-1.5 h-11 rounded-full px-6 bg-primary hover:bg-primary/90"
              >
                Search
              </Button>
            </form>

            <div className="flex flex-wrap justify-center gap-3">
              <span className="text-sm font-medium text-muted-foreground py-2">Popular:</span>
              {CATEGORIES.slice(0, 4).map(cat => (
                <Link key={cat} href={`/courses?category=${cat}`}>
                  <Badge variant="outline" className="px-4 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-sm">
                    {cat}
                  </Badge>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-card relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "100+ Expert Courses", desc: "Learn from industry leaders with up-to-date, comprehensive curricula." },
              { icon: Target, title: "Interactive Live Classes", desc: "Engage directly with instructors in real-time Zoom sessions." },
              { icon: Award, title: "Verified Certificates", desc: "Earn certificates upon completion to showcase your new skills." }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-background rounded-3xl p-8 border border-border/50 shadow-lg shadow-black/5 flex flex-col items-center text-center hover:shadow-xl hover:border-primary/20 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <feat.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-display mb-3">{feat.title}</h3>
                <p className="text-muted-foreground">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Featured Courses</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">Start your learning journey with our highest-rated programs.</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" className="hidden md:flex items-center gap-2 rounded-full group">
                View All Courses <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data?.courses?.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center md:hidden">
            <Link href="/courses">
              <Button className="w-full rounded-xl" size="lg">Explore All Courses</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Temporary Badge component inline to satisfy Home page if not exported correctly globally
function Badge({ children, className, variant = "default", ...props }: any) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants: any = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };
  return <div className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</div>;
}
