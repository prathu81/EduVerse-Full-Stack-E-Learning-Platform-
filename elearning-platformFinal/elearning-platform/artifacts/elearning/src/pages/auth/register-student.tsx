import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegisterStudent, useGetCourses } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password min 6 chars"),
  phone: z.string().min(10, "Phone number required"),
  parentPhone: z.string().min(10, "Parent phone required"),
  address: z.string().min(5, "Address required"),
  courseId: z.coerce.number().min(1, "Please select a course"),
  qualification: z.string().min(2, "Qualification required"),
  photoUrl: z.string().optional(),
});

export default function RegisterStudent() {
  const { login: setAuthUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: coursesData } = useGetCourses({ limit: 100 });

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "", email: "", password: "", phone: "", parentPhone: "", address: "", qualification: "", photoUrl: ""
    },
  });

  const { mutate: register, isPending } = useRegisterStudent({
    mutation: {
      onSuccess: (data) => {
        setAuthUser(data.user);
        toast({ title: "Registration Successful", description: data.message });
        setLocation("/dashboard/student");
      },
      onError: (error: any) => {
        toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
      },
    },
  });

  return (
    <div className="min-h-screen py-12 bg-background relative flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-card rounded-3xl shadow-xl border border-border p-8 md:p-10 relative z-10 my-8 mx-4"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-foreground">Join NexusLearn</h1>
          <p className="text-muted-foreground mt-2">Create your student account and start learning today.</p>
        </div>

        <form onSubmit={form.handleSubmit((data) => register({ data }))} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold">Full Name</label>
            <Input className="h-11 border-2 focus:ring-primary/20 bg-background" {...form.register("fullName")} />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-semibold">Email</label>
            <Input type="email" className="h-11 border-2 focus:ring-primary/20 bg-background" {...form.register("email")} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Password</label>
            <Input type="password" className="h-11 border-2 focus:ring-primary/20 bg-background" {...form.register("password")} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Phone Number</label>
            <Input type="tel" className="h-11 border-2 focus:ring-primary/20 bg-background" {...form.register("phone")} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Parent Phone</label>
            <Input type="tel" className="h-11 border-2 focus:ring-primary/20 bg-background" {...form.register("parentPhone")} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Qualification</label>
            <Input className="h-11 border-2 focus:ring-primary/20 bg-background" placeholder="e.g. High School, B.Sc" {...form.register("qualification")} />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold">Interested Course</label>
            <select 
              className="flex h-11 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register("courseId")}
            >
              <option value="">Select a course...</option>
              {coursesData?.courses?.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold">Address</label>
            <Input className="h-11 border-2 focus:ring-primary/20 bg-background" {...form.register("address")} />
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="md:col-span-2 h-12 text-base font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25 rounded-xl mt-4"
          >
            {isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
