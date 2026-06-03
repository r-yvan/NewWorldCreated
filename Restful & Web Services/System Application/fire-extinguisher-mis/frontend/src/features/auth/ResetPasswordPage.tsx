import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ArrowLeft } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { TextField } from "@/components/form/fields";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";

const passwordRule = Yup.string()
  .min(8, "At least 8 characters")
  .matches(/[A-Z]/, "One uppercase letter")
  .matches(/[a-z]/, "One lowercase letter")
  .matches(/[0-9]/, "One number")
  .matches(/[^A-Za-z0-9]/, "One special character")
  .required("Password is required");

const schema = Yup.object({
  token: Yup.string().required("Reset token is required"),
  newPassword: passwordRule,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const toast = useToast();
  const navigate = useNavigate();

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new, strong password for your account.">
      <Formik
        initialValues={{ token: params.get("token") ?? "", newPassword: "", confirmPassword: "" }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await authService.resetPassword(values.token, values.newPassword);
            toast.success("Password updated", "You can now sign in with your new password.");
            navigate("/login", { replace: true });
          } catch (err) {
            toast.error("Reset failed", normalizeError(err).message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <TextField label="Reset token" name="token" placeholder="Paste your reset token" required />
            <TextField label="New password" name="newPassword" type="password" placeholder="••••••••" autoComplete="new-password" required />
            <TextField label="Confirm password" name="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" required />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Reset password
            </Button>
            <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
