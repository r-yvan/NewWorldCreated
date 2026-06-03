import { useNavigate } from "react-router-dom";
import { LogOut, UserCircle, ChevronDown } from "lucide-react";
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "@/components/ui/dropdown";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { initials } from "@/lib/utils";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out", "You have been logged out securely.");
    navigate("/login");
  };

  return (
    <Dropdown
      align="end"
      trigger={
        <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-accent">
          <Avatar initials={initials(user.firstName, user.lastName)} />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-tight">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs leading-tight text-muted-foreground">
              {user.email}
            </p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
        </button>
      }
    >
      <div className="px-3 py-2">
        <p className="text-sm font-medium">
          {user.firstName} {user.lastName}
        </p>
        <div className="mt-1.5">
          <RoleBadge role={user.role} />
        </div>
      </div>
      <DropdownSeparator />
      <DropdownLabel>Account</DropdownLabel>
      <DropdownItem onClick={() => navigate("/profile")}>
        <UserCircle className="h-4 w-4" />
        Profile & Settings
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem
        onClick={handleLogout}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </DropdownItem>
    </Dropdown>
  );
}
