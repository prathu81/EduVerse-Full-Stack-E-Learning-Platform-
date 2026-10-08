import { useParams, Link, useLocation } from "wouter";
import { useGetCourse, useEnrollCourse, useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, Star, BookOpen, CheckCircle, ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function CourseDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isStudent } = useAuth();
  const courseId = parseInt(id || "0", 10);
  
  const { data: course, isLoading, refetch } = useGetCourse(courseId, {
    query: { enabled: courseId > 0 }
  });

  const { mutate: enroll, isPending: isEnrolling } = useEnrollCourse({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Successfully enrolled!",
          description: "You can now access the course materials.",
        });
        refetch();
      },
      onError: (err: any) => {
        toast({
          title: "Enrollment failed",
          description: err.message || "An error occurred.",
          variant: "destructive"
        });
      }
    }
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    if (!isStudent) {
      toast({
        title: "Students Only",
        description: "Only student accounts can enroll in courses.",
        variant: "destructive"
      });
      return;
    }
    enroll({ id: courseId });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Banner */}
      <div className="bg-card border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {course.imageUrl ? (
            <img src={course.imageUrl} alt="" className="w-full h-full object-cover blur-sm" />
          ) : (
            <div className="w-full h-full bg-primary/20"></div>
          )}
        </div>
        
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold mb-6 border border-primary/20">
                {course.category}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-foreground mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                    {course.instructorName.charAt(0)}
                  </div>
                  <span className="text-foreground">{course.instructorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> {course.duration}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> {course.enrollmentCount} enrolled
                </div>
              </div>
            </div>

            {/* Sticky Action Card */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/10 border border-border"
              >
                <div className="aspect-[16/9] w-full bg-muted rounded-xl overflow-hidden mb-6 relative">
                  {course.imageUrl ? (
                    <img src={course.imageUrl} className="w-full h-full object-cover" alt={course.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-card">
                       <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                
                <div className="text-4xl font-bold font-display mb-6 text-foreground">
                  ${course.price.toFixed(2)}
                </div>

                {course.isEnrolled ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 p-4 bg-green-500/10 text-green-600 rounded-xl font-bold">
                      <CheckCircle className="w-5 h-5" /> You are enrolled
                    </div>
                    <Button 
                      className="w-full h-12 text-lg rounded-xl"
                      onClick={() => setLocation(`/dashboard/student`)}
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? "Enrolling..." : "Enroll Now"}
                  </Button>
                )}

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <ShieldAlert className="w-4 h-4 text-green-500" /> Full lifetime access
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 text-primary" /> Comprehensive syllabus
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl ml-0 lg:ml-auto mr-auto lg:mr-[33%]">
        <h2 className="text-3xl font-display font-bold mb-8">Course Syllabus</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none bg-card p-8 md:p-12 rounded-3xl border border-border/50 shadow-sm">
          {course.syllabus.split('\n').map((line, i) => (
            <p key={i} className="mb-4 text-muted-foreground">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
