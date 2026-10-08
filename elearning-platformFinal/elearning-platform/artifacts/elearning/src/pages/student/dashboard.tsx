import { useAuth } from "@/hooks/use-auth";
import { useGetStudentDashboard, useGetStudentEnrollments, useGetLiveClasses, useJoinLiveClass } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { BookOpen, Video, Award, Bell, ArrowRight, PlayCircle, Clock, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function StudentDashboard() {
  const { user, isAuthenticated, isStudent } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated || !isStudent) {
    setLocation("/login");
    return null;
  }

  const { data: dash, isLoading: isDashLoading } = useGetStudentDashboard();
  const { data: enrolls, isLoading: isEnrollLoading } = useGetStudentEnrollments();
  const { data: classes, isLoading: isClassesLoading } = useGetLiveClasses();
  
  const { mutate: joinClass } = useJoinLiveClass({
    mutation: {
      onSuccess: (res) => {
        window.open(res.zoomLink, "_blank");
      }
    }
  });

  if (isDashLoading || isEnrollLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-muted-foreground mt-2 text-lg">Pick up where you left off and keep growing.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: BookOpen, label: "Enrolled", val: dash?.enrolledCourses || 0, color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: CheckCircle, label: "Completed", val: dash?.completedCourses || 0, color: "text-green-500", bg: "bg-green-500/10" },
            { icon: Video, label: "Upcoming Classes", val: dash?.upcomingClasses || 0, color: "text-purple-500", bg: "bg-purple-500/10" },
            { icon: Award, label: "Avg Progress", val: `${Math.round(dash?.averageProgress || 0)}%`, color: "text-orange-500", bg: "bg-orange-500/10" },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold font-display">{stat.val}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Courses */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold">My Learning</h2>
                <Link href="/courses" className="text-primary text-sm font-medium hover:underline">Browse More</Link>
              </div>
              
              <div className="space-y-4">
                {enrolls?.enrollments.length === 0 ? (
                  <div className="bg-card p-12 text-center border-2 border-dashed border-border rounded-3xl">
                    <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">You aren't enrolled in any courses</h3>
                    <Button onClick={() => setLocation("/courses")} className="mt-4">Explore Courses</Button>
                  </div>
                ) : (
                  enrolls?.enrollments.map((enrollment, i) => (
                    <motion.div 
                      key={enrollment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card rounded-2xl p-4 md:p-6 border border-border shadow-sm flex flex-col md:flex-row gap-6 items-center hover:border-primary/30 transition-colors group"
                    >
                      <div className="w-full md:w-48 aspect-video rounded-lg overflow-hidden bg-muted shrink-0">
                        {enrollment.imageUrl ? (
                          <img src={enrollment.imageUrl} className="w-full h-full object-cover" alt={enrollment.courseTitle}/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <BookOpen className="w-8 h-8 text-primary" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow w-full">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{enrollment.courseTitle}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Instructor: {enrollment.instructorName}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-primary">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2 bg-muted [&>div]:bg-primary" />
                        </div>
                      </div>

                      <div className="w-full md:w-auto shrink-0 flex flex-col gap-2">
                        <Button className="w-full md:w-32 rounded-xl" onClick={() => setLocation(`/dashboard/student/course/${enrollment.courseId}`)}>
                          {enrollment.progress === 0 ? "Start" : "Continue"}
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar: Live Classes & Activity */}
          <div className="space-y-8">
            <section className="bg-card rounded-3xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> Upcoming Live Classes
              </h2>
              
              <div className="space-y-4">
                {classes?.liveClasses.filter(c => c.status !== 'completed').length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming classes scheduled.</p>
                ) : (
                  classes?.liveClasses.filter(c => c.status !== 'completed').map((lc) => (
                    <div key={lc.id} className="p-4 rounded-2xl bg-background border border-border group">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm leading-tight">{lc.title}</h4>
                        {lc.status === 'live' ? (
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                          </span>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{lc.courseTitle}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" /> 
                          {format(new Date(lc.scheduledAt), 'MMM d, h:mm a')}
                        </div>
                        <Button 
                          size="sm" 
                          variant={lc.status === 'live' ? "default" : "secondary"}
                          className="h-8 rounded-lg text-xs"
                          disabled={lc.status === 'upcoming'}
                          onClick={() => joinClass({ id: lc.id })}
                        >
                          Join {lc.status === 'live' && 'Now'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-card rounded-3xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" /> Recent Activity
              </h2>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {dash?.recentActivity.map((act, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-background bg-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-background border border-border/50 text-sm">
                      <p className="font-medium">{act.description}</p>
                      <time className="text-xs text-muted-foreground block mt-1">{format(new Date(act.timestamp), 'MMM d, h:mm a')}</time>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
