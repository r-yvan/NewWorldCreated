import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Save, KeyRound, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleBadge } from "@/components/common/StatusBadge";
import { TextField } from "@/components/form/fields";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";
import { formatDate, initials } from "@/lib/utils";

const profileSchema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
});

const passwordRule = Yup.string()
  .min(8, "At least 8 characters")
  .matches(/[A-Z]/, "One uppercase letter")
  .matches(/[a-z]/, "One lowercase letter")
  .matches(/[0-9]/, "One number")
  .matches(/[^A-Za-z0-9]/, "One special character")
  .required("New password is required");

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: passwordRule,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function ProfilePage() {
  const { user, setUser, refreshUser } = useAuth();
  const toast = useToast();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile & Settings" description="Manage your account details and security." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <Avatar initials={initials(user.firstName, user.lastName)} className="h-20 w-20 text-2xl" />
            <div>
              <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <RoleBadge role={user.role} />
            <div className="mt-2 w-full space-y-1 border-t border-border pt-4 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{user.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Personal information</CardTitle>
              </div>
              <CardDescription>Update your name and email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <Formik
                initialValues={{ firstName: user.firstName, lastName: user.lastName, email: user.email }}
                validationSchema={profileSchema}
                enableReinitialize
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const updated = await userService.updateProfile(values);
                    setUser(updated);
                    toast.success("Profile updated");
                  } catch (err) {
                    toast.error("Update failed", normalizeError(err).message);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <TextField label="First name" name="firstName" required />
                      <TextField label="Last name" name="lastName" required />
                    </div>
                    <TextField label="Email" name="email" type="email" required />
                    <Button type="submit" loading={isSubmitting}>
                      <Save className="h-4 w-4" /> Save changes
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Change password</CardTitle>
              </div>
              <CardDescription>Use a strong password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <Formik
                initialValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
                validationSchema={passwordSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                  try {
                    await userService.changePassword(values.currentPassword, values.newPassword);
                    toast.success("Password changed");
                    resetForm();
                    await refreshUser();
                  } catch (err) {
                    toast.error("Change failed", normalizeError(err).message);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <TextField label="Current password" name="currentPassword" type="password" autoComplete="current-password" required />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <TextField label="New password" name="newPassword" type="password" autoComplete="new-password" required />
                      <TextField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" required />
                    </div>
                    <Button type="submit" loading={isSubmitting}>
                      <KeyRound className="h-4 w-4" /> Update password
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
