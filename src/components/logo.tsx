import { cn } from "@/lib/utils";

const ChickenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18.15 10.5c-1.2-3.15-3.2-5.4-5.65-6.3-1.65-.6-3.35-.6-5 0-2.5 1-4.5 3.15-5.65 6.3C1.25 12.1 1.05 14.15 2 16c.8 1.55 2.2 2.7 3.95 3.25 2.5.8 5.15.3 7.25-1.15" />
      <path d="M14.5 9.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z" />
      <path d="M19.5 14.5c0-3.3-2.7-6-6-6" />
      <path d="M13.5 14.5c0 1.65 1.35 3 3 3s3-1.35 3-3" />
      <path d="M14 22s-1-2-1-3.5 1-2.5 3-2.5" />
    </svg>
  );

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ChickenIcon className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold text-foreground">CluckHub</h1>
    </div>
  );
}
