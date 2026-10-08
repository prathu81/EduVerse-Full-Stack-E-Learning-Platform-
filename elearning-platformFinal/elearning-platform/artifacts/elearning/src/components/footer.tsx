import { Link } from "wouter";
import { BookOpen, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-2 rounded-xl">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl">NexusLearn</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Empowering the next generation of leaders with world-class education, interactive live classes, and industry-recognized certifications.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/courses" className="hover:text-primary transition-colors">All Courses</Link></li>
              <li><Link href="/courses?category=Programming" className="hover:text-primary transition-colors">Programming</Link></li>
              <li><Link href="/courses?category=Design" className="hover:text-primary transition-colors">Design</Link></li>
              <li><Link href="/courses?category=Business" className="hover:text-primary transition-colors">Business</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
              <li><Link href="/register/student" className="hover:text-primary transition-colors">Become a Student</Link></li>
              <li><Link href="/register/admin" className="hover:text-primary transition-colors">Teach on Nexus</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NexusLearn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
