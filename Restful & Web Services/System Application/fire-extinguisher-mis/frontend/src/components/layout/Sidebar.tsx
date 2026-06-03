import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, X } from "lucide-react";
import { NAV_ITEMS } from "@/constants/nav";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-accent"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <item.icon className="relative z-10 h-4.5 w-4.5" />
              <span className="relative z-10">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <Flame className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight">TZW LTD</p>
        <p className="text-[11px] text-muted-foreground">Fire Safety Platform</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <Brand />
      <NavContent />
      <div className="border-t border-border p-4">
        <p className="text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()} TZW LTD
        </p>
      </div>
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        onClick={onClose}
      />
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ type: "spring", duration: 0.4 }}
        className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card lg:hidden"
      >
        <div className="flex items-center justify-between border-b border-border pr-3">
          <Brand />
          <button
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavContent onNavigate={onClose} />
      </motion.aside>
    </>
  );
}
