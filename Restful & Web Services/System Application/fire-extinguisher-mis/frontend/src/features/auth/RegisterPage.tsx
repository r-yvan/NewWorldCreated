import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { AuthLayout } from "./AuthLayout";
import { TextField } from "@/components/form/fields";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";

// Mirrors backend strong-password policy.
const passwordRule = Yup.string()
  .min(8, "At least 8 characters")
  .matches(/[A-Z]/, "One uppercase letter")
  .matches(/[a-z]/, "One lowercase letter")
  .matches(/[0-9]/, "One number")
  .matches(/[^A-Za-z0-9]/, "One special character")
  .required("Password is required");

const schema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: passwordRule,
});

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  return (
    <AuthLayout title="Create your account" subtitle="Get started with the FEMS platform in seconds.">
      <Formik
        initialValues={{ firstName: "", lastName: "", email: "", password: "" }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const user = await register(values);
            toast.success("Account created", `Welcome, ${user.firstName}!`);
            navigate("/dashboard", { replace: true });
          } catch (err) {
            toast.error("Registration failed", normalizeError(err).message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="First name" name="firstName" placeholder="John" required />
              <TextField label="Last name" name="lastName" placeholder="Doe" required />
            </div>
            <TextField label="Email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
            <TextField label="Password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" required />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create account
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
