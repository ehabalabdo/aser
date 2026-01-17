import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20",
            secondary: "bg-secondary text-white hover:bg-green-700 shadow-lg shadow-secondary/20",
            outline: "border-2 border-primary text-primary hover:bg-primary/5",
            ghost: "hover:bg-gray-100 text-gray-700",
            danger: "bg-red-600 text-white hover:bg-red-700 shadow-md",
            link: "text-primary underline-offset-4 hover:underline",
        };

        const sizes = {
            default: "h-11 px-6 py-2",
            sm: "h-9 px-4 text-xs",
            lg: "h-14 px-8 text-lg font-bold",
            icon: "h-11 w-11 p-0",
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
