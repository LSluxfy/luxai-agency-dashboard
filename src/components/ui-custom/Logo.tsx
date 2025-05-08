
import { cn } from "@/lib/utils";

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
      <span className="text-primary">Lux</span>
      <span className="text-luxai-blue-dark">Fy</span>
      {variant !== "sidebar" && (
        <span className="font-light ml-2">Agency</span>
      )}
    </div>
  );
};

export default Logo;
