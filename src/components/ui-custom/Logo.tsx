
import { cn } from "@/lib/utils";
import { Image } from "@/components/ui/image";

type LogoProps = {
  variant?: "default" | "sidebar" | "large";
};

const Logo = ({ variant = "default" }: LogoProps) => {
  return (
    <div
      className={cn(
        "font-bold text-foreground flex items-center",
        variant === "default" && "text-2xl",
        variant === "sidebar" && "text-xl",
        variant === "large" && "text-4xl"
      )}
    >
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/3282e950-f06b-4694-83e9-703c54578366.png" 
          alt="LuxFy Logo" 
          className={cn(
            "mr-1", // Reduced margin to bring logo closer to text
            variant === "default" && "h-16", // Increased from h-14
            variant === "sidebar" && "h-14", // Increased from h-12
            variant === "large" && "h-20"  // Increased from h-18
          )}
        />
      </div>
      {variant !== "sidebar" && (
        <span className="font-light">AgencIA</span>
      )}
    </div>
  );
};

export default Logo;
