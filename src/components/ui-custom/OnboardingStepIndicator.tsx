
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

type OnboardingStepIndicatorProps = {
  steps: string[];
  currentStep: number;
  className?: string;
};

const OnboardingStepIndicator = ({ 
  steps, 
  currentStep, 
  className 
}: OnboardingStepIndicatorProps) => {
  return (
    <div className={cn("flex justify-center mt-8 mb-4 px-4", className)}>
      <div className="flex items-center max-w-3xl w-full">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-1">
              {/* Step circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm transition-colors duration-300",
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                    ? "bg-primary border-4 border-accent-foreground text-primary-foreground"
                    : "bg-secondary text-secondary-foreground border border-muted"
                )}
              >
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              
              {/* Step label */}
              <span
                className={cn(
                  "text-xs mt-2 text-center",
                  index <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] flex-1 mx-2",
                  index < currentStep
                    ? "bg-primary"
                    : "bg-border"
                )}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingStepIndicator;
