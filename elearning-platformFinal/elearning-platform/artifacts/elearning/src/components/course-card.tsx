import { Link } from "wouter";
import { Course } from "@workspace/api-client-react";
import { Users, Star, Clock, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`} className="group block h-full">
      <div className="h-full bg-card rounded-2xl overflow-hidden border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 flex flex-col group-hover:-translate-y-1">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {course.imageUrl ? (
            <img 
              src={course.imageUrl} 
              alt={course.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <>
              {/* placeholder course abstract learning visual */}
              <img 
                src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80`}
                alt="Course placeholder"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-md hover:bg-background border-none font-medium">
              {course.category}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div className="flex items-center gap-2 text-white font-medium">
              <PlayCircle className="w-5 h-5" /> View Details
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-2 text-xs font-medium text-primary">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{course.instructorName}</span>
          </div>
          
          <h3 className="font-display font-bold text-lg text-foreground leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
            {course.description}
          </p>

          <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.duration}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {course.enrollmentCount}
              </div>
            </div>
            <div className="font-bold text-foreground text-lg">
              ${course.price.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
