import { useAuth } from "@/hooks/use-auth";
import { useGetAdminDashboard, useGetAdminStudents, useGetCourses, useCreateCourse, useCreateLiveClass } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Users, BookOpen, Video, Award, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const courseSchema = z.object({
  title: z.string().min(2, "Required"),
  instructorName: z.string().min(2, "Required"),
  category: z.string().min(2, "Required"),
  description: z.string().min(10, "Required"),
  price: z.coerce.number().min(0, "Must be positive"),
  duration: z.string().min(2, "Required"),
  syllabus: z.string().min(5, "Required"),
  imageUrl: z.string().optional()
});

const liveClassSchema = z.object({
  courseId: z.coerce.number().min(1, "Select course"),
  title: z.string().min(2, "Required"),
  zoomLink: z.string().url("Must be valid URL"),
  scheduledAt: z.string(),
  duration: z.coerce.number().min(10, "Required (mins)"),
});

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [liveClassDialogOpen, setLiveClassDialogOpen] = useState(false);

  if (!isAuthenticated || !isAdmin) {
    setLocation("/login");
    return null;
  }

  const { data: dash } = useGetAdminDashboard();
  const { data: students } = useGetAdminStudents();
  const { data: coursesData, refetch: refetchCourses } = useGetCourses({ limit: 100 });

  const { mutate: createCourse, isPending: isCreatingCourse } = useCreateCourse({
    mutation: {
      onSuccess: () => {
        toast({ title: "Course Created" });
        setCourseDialogOpen(false);
        refetchCourses();
      },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  });

  const { mutate: createClass, isPending: isCreatingClass } = useCreateLiveClass({
    mutation: {
      onSuccess: () => {
        toast({ title: "Live Class Scheduled" });
        setLiveClassDialogOpen(false);
      },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  });

  const courseForm = useForm<z.infer<typeof courseSchema>>({ resolver: zodResolver(courseSchema) });
  const liveClassForm = useForm<z.infer<typeof liveClassSchema>>({ resolver: zodResolver(liveClassSchema) });

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <div className="w-full md:w-64 bg-card border-r border-border shrink-0 md:min-h-screen p-4 flex flex-col">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-3">Admin Panel</h2>
        <div className="space-y-1 flex-grow">
          {[
            { id: "overview", icon: Award, label: "Overview" },
            { id: "students", icon: Users, label: "Students" },
            { id: "courses", icon: BookOpen, label: "Courses" },
            { id: "live", icon: Video, label: "Live Classes" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-6 md:p-10 overflow-auto">
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-display font-bold text-foreground">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Total Students", val: dash?.totalStudents || 0, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Total Courses", val: dash?.totalCourses || 0, color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "Enrollments", val: dash?.totalEnrollments || 0, color: "text-green-500", bg: "bg-green-500/10" },
                { label: "Upcoming Classes", val: dash?.upcomingLiveClasses || 0, color: "text-orange-500", bg: "bg-orange-500/10" },
              ].map((stat, i) => (
                <div key={i} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-3xl font-bold font-display">{stat.val}</h3>
                  <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4 font-display">Recent Enrollments</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Student Name</th>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3 rounded-r-lg">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dash?.recentEnrollments.map((en, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-4 font-medium text-foreground">{en.studentName}</td>
                        <td className="px-4 py-4 text-muted-foreground">{en.courseTitle}</td>
                        <td className="px-4 py-4 text-muted-foreground">{format(new Date(en.enrolledAt), 'MMM d, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-display font-bold">Course Management</h1>
              
              <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary gap-2"><Plus className="w-4 h-4"/> Create Course</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-display">Create New Course</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={courseForm.handleSubmit(data => createCourse({ data }))} className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1 col-span-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input {...courseForm.register("title")} className="bg-background"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Instructor</label>
                      <Input {...courseForm.register("instructorName")} className="bg-background"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Category</label>
                      <Input {...courseForm.register("category")} className="bg-background"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Price ($)</label>
                      <Input type="number" step="0.01" {...courseForm.register("price")} className="bg-background"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Duration (e.g. 10 Weeks)</label>
                      <Input {...courseForm.register("duration")} className="bg-background"/>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-sm font-medium">Image URL</label>
                      <Input {...courseForm.register("imageUrl")} className="bg-background" placeholder="https://..."/>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea {...courseForm.register("description")} className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-sm font-medium">Syllabus (Newline separated)</label>
                      <textarea {...courseForm.register("syllabus")} className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
                    </div>
                    <div className="col-span-2 flex justify-end gap-3 mt-4">
                      <Button type="button" variant="outline" onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isCreatingCourse}>{isCreatingCourse ? "Creating..." : "Create Course"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Enrolled</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coursesData?.courses?.map(course => (
                    <tr key={course.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-4 font-medium">{course.title}</td>
                      <td className="px-4 py-4"><span className="px-2 py-1 bg-secondary/10 text-secondary rounded-full text-xs">{course.category}</span></td>
                      <td className="px-4 py-4">${course.price}</td>
                      <td className="px-4 py-4">{course.enrollmentCount}</td>
                      <td className="px-4 py-4 text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500"><Edit className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="w-4 h-4"/></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Similar tabs for Students and Live Classes would follow here */}
        {(activeTab === "students" || activeTab === "live") && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-2xl">
            <h2 className="text-xl font-bold mb-2">Tab Under Construction</h2>
            <p className="text-muted-foreground">Admin functions for {activeTab} will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
