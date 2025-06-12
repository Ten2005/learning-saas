import { SERVICE_NAME } from "@/consts/common";

export default function Header() {
  return (
    <div className="bg-background border-b border-foreground/10 p-4 flex items-center relative z-50">
      <h1 className="text-xl font-bold">{SERVICE_NAME}</h1>
    </div>
  );
}
