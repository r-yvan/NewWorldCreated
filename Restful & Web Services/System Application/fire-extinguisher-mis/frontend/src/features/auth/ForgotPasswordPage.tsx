import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { TextField } from "@/components/form/fields";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";

const schema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
});

export default function ForgotPasswordPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="If an account exists, a reset link has been issued.">
        <div className="space-y-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
            <MailCheck className="h-6 w-6 text-success" />
          </div>
          <p className="text-sm text-muted-foreground">
            We&apos;ve generated a password reset token. In production this is sent
            by email; for this environment you can continue directly below.
          </p>
          {devToken && (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">Reset token (dev)</p>
              <p className="mt-1 break-all font-mono text-xs text-foreground">{devToken}</p>
            </div>
          )}
          <Button
            className="w-full"
            onClick={() =>
              navigate(devToken ? `/reset-password?token=${devToken}` : "/reset-password")
            }
          >
            Continue to reset password
          </Button>
          <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we'll send reset instructions.">
      <Formik
        initialValues={{ email: "" }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const res = await authService.forgotPassword(values.email);
            setDevToken(res.resetToken ?? null);
            setSent(true);
          } catch (err) {
            toast.error("Request failed", normalizeError(err).message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <TextField label="Email" name="email" type="email" placeholder="you@company.com" required />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Send reset instructions
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
