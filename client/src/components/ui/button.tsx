import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    // Base button classes
    let buttonClasses = 'btn';
    
    // Add variant classes
    if (variant === 'outline') {
      buttonClasses += ' btn-secondary';
    } else if (variant === 'ghost') {
      buttonClasses += ' btn-ghost';
    } else if (variant === 'secondary') {
      buttonClasses += ' btn-secondary';
    } else if (variant === 'destructive') {
      buttonClasses += ' btn-primary';
    } else {
      buttonClasses += ' btn-primary';
    }
    
    // Add size classes
    if (size === 'sm') {
      buttonClasses += ' text-sm px-3 py-1';
    } else if (size === 'lg') {
      buttonClasses += ' text-lg px-6 py-3';
    } else if (size === 'icon') {
      buttonClasses += ' w-10 h-10 p-2';
    }
    
    // Combine with any additional className
    const finalClasses = `${buttonClasses} ${className}`.trim();

    return (
      <button
        className={finalClasses}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button } 