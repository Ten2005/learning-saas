export default function Button({
  children,
  variant = "primary",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "outlineSecondary";
  onClick?: (e: React.FormEvent) => void;
}) {
  const primaryClasses =
    "bg-foreground/70 text-background px-4 py-2 rounded text-center w-fit shadow-md shadow-foreground/20 hover:shadow-foreground/40 hover:bg-foreground hover:text-background/70 active:shadow-foreground/40 active:bg-foreground active:text-background/70 transition-colors duration-300";

  const outlineClasses =
    "text-foreground/80 hover:text-foreground underline underline-offset-4 transition-colors duration-300";

  const outlineSecondaryClasses =
    "text-foreground/60 hover:text-foreground/80 text-sm underline underline-offset-4 transition-colors duration-300";
  return <button onClick={onClick} className={`${variant === "primary" ? primaryClasses : ""} ${variant === "outline" ? outlineClasses : ""} ${variant === "outlineSecondary" ? outlineSecondaryClasses : ""}`}>{children}</button>;
}