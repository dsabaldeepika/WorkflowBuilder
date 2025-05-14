import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  activeStep?: number
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, orientation = "horizontal", activeStep = 0, ...props }, ref) => {
    const childrenArray = React.Children.toArray(props.children)
    
    const steps = childrenArray.map((step: any, index) => {
      return React.cloneElement(step, {
        index,
        activeStep,
        orientation,
        last: index + 1 === childrenArray.length,
        ...step.props,
      })
    })
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "vertical" ? "flex-col" : "flex-row",
          className
        )}
        {...props}
      >
        {steps}
      </div>
    )
  }
)
Stepper.displayName = "Stepper"

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number
  activeStep?: number
  orientation?: "horizontal" | "vertical"
  last?: boolean
  completed?: boolean
  label?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  optional?: React.ReactNode
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ className, index = 0, activeStep = 0, orientation = "horizontal", last = false, completed: completedProp, label, description, icon, optional, ...props }, ref) => {
    const completed = completedProp !== undefined ? completedProp : activeStep > index
    const active = activeStep === index
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "vertical" ? "flex-col" : "items-center",
          className
        )}
        {...props}
      >
        <div className="relative flex items-center justify-center">
          <div 
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 text-center font-semibold text-sm",
              completed ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-muted text-muted-foreground"
            )}
          >
            {completed ? (
              <Check className="h-5 w-5" />
            ) : (
              icon || index + 1
            )}
          </div>
          {!last && (
            <div
              className={cn(
                orientation === "horizontal" ? "ml-2 h-[1px] flex-1" : "mt-3 w-[1px] h-10",
                completed ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
        {(label || description) && (
          <div className={cn(
            "flex flex-col",
            orientation === "vertical" ? "ml-3 mb-8" : "mt-2"
          )}>
            <span className="text-sm font-medium">
              {label}
              {optional && (
                <span className="ml-1 text-xs text-muted-foreground">{optional}</span>
              )}
            </span>
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)
Step.displayName = "Step"

export { Stepper, Step }