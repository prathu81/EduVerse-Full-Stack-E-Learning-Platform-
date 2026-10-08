import { useLocation, useSearch } from "wouter";
import { useGetCourses } from "@workspace/api-client-react";
import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CATEGORIES = ["All", "Programming", "Design", "Business", "Marketing", "Data Science", "Language", "Personal Development"];

export default function Courses() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [, setLocation] = useLocation();

  // Debounce search input for seamless typing without spamming API
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category && category !== "All") params.set("category", category);
    setLocation(`/courses?${params.toString()}`, { replace: true });
  }, [debouncedSearch, category, setLocation]);

  const { data, isLoading } = useGetCourses({
    search: debouncedSearch || undefined,
    category: category !== "All" ? category : undefined,
    limit: 50,
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Banner */}
      <div className="bg-card border-b border-border py-12 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent blur-3xl rounded-full"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Explore Courses</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">Discover hundreds of courses taught by top instructors. Find the perfect fit for your learning goals.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0 space-y-8">
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-foreground">
              <Search className="w-4 h-4" /> Search
            </h3>
            <Input 
              placeholder="Search courses..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-foreground">
              <Filter className="w-4 h-4" /> Categories
            </h3>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    category === cat 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-[400px] bg-card border border-border/50 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : data?.courses?.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">No courses found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm font-medium text-muted-foreground">
                Showing {data?.courses?.length || 0} results
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data?.courses?.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                  >
                    <CourseCard course={course} />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
