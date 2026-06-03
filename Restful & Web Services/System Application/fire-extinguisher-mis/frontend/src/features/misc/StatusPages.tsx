import { Link } from "react-router-dom";
import { ShieldX, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

function StatusScreen({
  code,
  title,
  description,
  icon: Icon,
}: {
  code: string;
  title: string;
  description: string;
  icon: typeof ShieldX;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-muted-foreground">{code}</p>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="max-w-md text-muted-foreground">{description}</p>
      </div>
      <Link to="/dashboard" className={buttonVariants()}>
        Back to dashboard
      </Link>
    </div>
  );
}

export function UnauthorizedPage() {
  return (
    <StatusScreen
      code="403"
      title="Access denied"
      description="You don't have permission to view this page. Contact an administrator if you believe this is a mistake."
      icon={ShieldX}
    />
  );
}

export function NotFoundPage() {
  return (
    <StatusScreen
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      icon={Compass}
    />
  );
}
