import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Button Component
function Button({ className, variant = "default", size = "default", children, ...props }: any) {
  const classes = cn(buttonVariants({ variant, size, className }));
  
  return React.createElement("button", {
    className: classes,
    ...props
  }, children);
}

// Card Components
function Card({ className, children, ...props }: any) {
  const classes = cn(
    "rounded-lg border bg-card text-card-foreground shadow-sm",
    className
  );
  
  return React.createElement("div", {
    className: classes,
    ...props
  }, children);
}

function CardHeader({ className, children, ...props }: any) {
  const classes = cn("flex flex-col space-y-1.5 p-6", className);
  
  return React.createElement("div", {
    className: classes,
    ...props
  }, children);
}

function CardTitle({ className, children, ...props }: any) {
  const classes = cn(
    "text-2xl font-semibold leading-none tracking-tight",
    className
  );
  
  return React.createElement("h3", {
    className: classes,
    ...props
  }, children);
}

function CardContent({ className, children, ...props }: any) {
  const classes = cn("p-6 pt-0", className);
  
  return React.createElement("div", {
    className: classes,
    ...props
  }, children);
}

// Input Component
function Input({ className, type = "text", ...props }: any) {
  const classes = cn(
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    className
  );
  
  return React.createElement("input", {
    type: type,
    className: classes,
    ...props
  });
}

// Textarea Component
function Textarea({ className, ...props }: any) {
  const classes = cn(
    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    className
  );
  
  return React.createElement("textarea", {
    className: classes,
    ...props
  });
}

// Label Component
function Label({ className, children, ...props }: any) {
  const classes = cn(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    className
  );
  
  return React.createElement("label", {
    className: classes,
    ...props
  }, children);
}

// Badge Component
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, children, ...props }: any) {
  const classes = cn(badgeVariants({ variant }), className);
  
  return React.createElement("div", {
    className: classes,
    ...props
  }, children);
}

export { Button, buttonVariants, Card, CardHeader, CardTitle, CardContent, Input, Textarea, Label, Badge, badgeVariants }
