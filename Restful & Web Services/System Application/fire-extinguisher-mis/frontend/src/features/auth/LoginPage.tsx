import { Link, useLocation, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { AuthLayout } from "./AuthLayout";
import { TextField } from "@/components/form/fields";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";

const schema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const demoAccounts = [
  { label: "Admin", email: "admin@fems.com", password: "Admin@123" },
  { label: "Inspector", email: "inspector@fems.com", password: "Inspector@123" },
  { label: "User", email: "user@fems.com", password: "User@123" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your FEMS account to continue.">
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const user = await login(values);
            toast.success("Signed in", `Welcome back, ${user.firstName}!`);
            navigate(from, { replace: true });
          } catch (err) {
            toast.error("Sign in failed", normalizeError(err).message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, setValues }) => (
          <Form className="space-y-4">
            <TextField label="Email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
            <div className="space-y-1.5">
              <TextField label="Password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sign in
            </Button>

            <div className="space-y-2 rounded-lg border border-dashed border-border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">Quick demo sign-in</p>
              <div className="grid grid-cols-3 gap-2">
                {demoAccounts.map((acc) => (
                  <Button
                    key={acc.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValues({ email: acc.email, password: acc.password })}
                  >
                    {acc.label}
                  </Button>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-foreground hover:underline">
                Create one
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
