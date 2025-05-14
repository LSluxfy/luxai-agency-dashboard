
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
            "mr-2",
            variant === "default" && "h-11",
            variant === "sidebar" && "h-10",
            variant === "large" && "h-14"
          )}
        />
      </div>
      {variant !== "sidebar" && (
        <span className="font-light ml-2">AgencIA</span>
      )}
    </div>
  );
};

export default Logo;
