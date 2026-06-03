import { motion } from "framer-motion";
import { Flame, ShieldCheck, Activity, FileBarChart } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

const highlights = [
  { icon: ShieldCheck, title: "Compliance-ready", text: "Track inspections and audits with confidence." },
  { icon: Activity, title: "Real-time status", text: "Monitor extinguisher health across all sites." },
  { icon: FileBarChart, title: "Executive reports", text: "Export PDF & CSV analytics in one click." },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">TZW LTD</p>
            <p className="text-xs text-primary-foreground/70">
              Fire Extinguisher Management System
            </p>
          </div>
        </div>

        <div className="relative space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              Enterprise fire safety, managed end to end.
            </h2>
            <p className="max-w-md text-primary-foreground/70">
              Centralize extinguishers, inspections, maintenance and compliance
              reporting in one premium platform.
            </p>
          </div>
          <div className="space-y-4">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <h.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{h.title}</p>
                  <p className="text-sm text-primary-foreground/60">{h.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} TZW LTD. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold">TZW LTD</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
