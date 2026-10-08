import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegisterAdmin } from "@workspace/api-client-react";
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
  qualification: z.string().min(2, "Qualification required"),
  experience: z.string().min(2, "Experience required"),
  address: z.string().min(5, "Address required"),
});

export default function RegisterAdmin() {
  const { login: setAuthUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "", email: "", password: "", phone: "", qualification: "", experience: "", address: ""
    },
  });

  const { mutate: register, isPending } = useRegisterAdmin({
    mutation: {
      onSuccess: (data) => {
        setAuthUser(data.user);
        toast({ title: "Registration Successful", description: data.message });
        setLocation("/dashboard/admin");
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
          <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-bold mb-4 border border-accent/20">
            Instructor / Admin Portal
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Teach on NexusLearn</h1>
          <p className="text-muted-foreground mt-2">Apply to become an instructor or administrator.</p>
        </div>

        <form onSubmit={form.handleSubmit((data) => register({ data }))} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold">Full Name</label>
            <Input className="h-11 border-2 focus:ring-accent/20 bg-background" {...form.register("fullName")} />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-semibold">Email</label>
            <Input type="email" className="h-11 border-2 focus:ring-accent/20 bg-background" {...form.register("email")} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Password</label>
            <Input type="password" className="h-11 border-2 focus:ring-accent/20 bg-background" {...form.register("password")} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Phone Number</label>
            <Input type="tel" className="h-11 border-2 focus:ring-accent/20 bg-background" {...form.register("phone")} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Qualification</label>
            <Input className="h-11 border-2 focus:ring-accent/20 bg-background" placeholder="e.g. Ph.D, Industry Expert" {...form.register("qualification")} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Years of Experience</label>
            <Input className="h-11 border-2 focus:ring-accent/20 bg-background" placeholder="e.g. 5 Years in Tech" {...form.register("experience")} />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold">Address</label>
            <Input className="h-11 border-2 focus:ring-accent/20 bg-background" {...form.register("address")} />
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="md:col-span-2 h-12 text-base font-bold bg-gradient-to-r from-accent to-primary hover:opacity-90 shadow-lg shadow-accent/25 rounded-xl mt-4"
          >
            {isPending ? "Submitting Application..." : "Submit Application"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already an instructor? <Link href="/login" className="text-accent font-medium hover:underline">Log in here</Link>
        </p>
      </motion.div>
    </div>
  );
}
