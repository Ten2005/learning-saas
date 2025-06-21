interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function LoadingSpinner({
  size = "medium",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  const borderWidth = {
    small: "border-2",
    medium: "border-2",
    large: "border-4",
  };

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${borderWidth[size]} border-transparent border-b-blue-500 ${className}`}
    />
  );
}
