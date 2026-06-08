import { IconMail, IconUser } from "@tabler/icons-react-native";
import { Link, useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

import { FormPasswordInput } from "@/components/forms/FormPasswordInput";
import { FormTextInput } from "@/components/forms/FormTextInput";
import { Select } from "@/components/forms/Select";
import { Stepper } from "@/components/forms/Stepper";
import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { AuthScaffold } from "@/features/auth/AuthScaffold";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { registerSchema } from "@/lib/validation";
import type { Role } from "@/types";

const STEPS = ["Account", "Security"];
const ROLE_OPTIONS = [
  { label: "Student", value: "student" },
  { label: "Examiner", value: "examiner" },
  { label: "Administrator", value: "admin" },
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const { success, error: notifyError } = useNotifications();
  const { colors } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <AuthScaffold
      title="Create your account"
      subtitle="Join LexiTech Dictionary in two quick steps."
      footer={
        <View className="flex-row justify-center gap-1">
          <Typography variant="body">Already registered?</Typography>
          <Link href="/login" asChild>
            <Pressable accessibilityRole="link">
              <Typography variant="label" className="text-violet-600 dark:text-violet-400">
                Sign in
              </Typography>
            </Pressable>
          </Link>
        </View>
      }
    >
      <Stepper steps={STEPS} current={step} />

      <Formik
        initialValues={{ name: "", email: "", role: "student" as Role, password: "", confirmPassword: "" }}
        validationSchema={registerSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setFormError(null);
          try {
            await register(values.name, values.email, values.password, values.role);
            success("Account created", "Welcome to LexiTech Dictionary!");
            router.replace("/search");
          } catch (e) {
            const message = e instanceof Error ? e.message : "Unable to register.";
            setFormError(message);
            notifyError("Registration failed", message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, validateField, values, errors, touched, isSubmitting, setFieldTouched }) => {
          const goNext = async () => {
            setFieldTouched("name", true);
            setFieldTouched("email", true);
            const nameErr = await validateField("name").catch(() => undefined);
            // Validate step-1 fields before advancing.
            if (!values.name || !values.email || errors.name || errors.email) {
              return;
            }
            void nameErr;
            setStep(1);
          };

          return (
            <View className="mt-6 gap-4">
              {formError ? <Alert variant="error" title="Registration error" message={formError} /> : null}

              {step === 0 ? (
                <>
                  <FormTextInput
                    label="Full name"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    error={errors.name}
                    touched={touched.name}
                    placeholder="Jane Doe"
                    leftIcon={<IconUser size={18} color={colors.icon} />}
                  />
                  <FormTextInput
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    error={errors.email}
                    touched={touched.email}
                    placeholder="you@lexitech.rw"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<IconMail size={18} color={colors.icon} />}
                  />
                  <Select
                    label="Role"
                    value={values.role}
                    options={ROLE_OPTIONS}
                    onChange={(v) => setFieldValue("role", v)}
                    error={touched.role ? errors.role : undefined}
                  />
                  <Button label="Continue" onPress={goNext} fullWidth />
                </>
              ) : (
                <>
                  <FormPasswordInput
                    label="Password"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    error={errors.password}
                    touched={touched.password}
                    placeholder="Create a strong password"
                  />
                  <FormPasswordInput
                    label="Confirm password"
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    error={errors.confirmPassword}
                    touched={touched.confirmPassword}
                    placeholder="Re-enter your password"
                  />
                  <View className="flex-row gap-3">
                    <Button label="Back" variant="outline" onPress={() => setStep(0)} className="flex-1" />
                    <Button
                      label="Create account"
                      onPress={() => handleSubmit()}
                      loading={isSubmitting}
                      className="flex-1"
                    />
                  </View>
                </>
              )}
            </View>
          );
        }}
      </Formik>
    </AuthScaffold>
  );
}
