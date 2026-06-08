import { IconMail } from "@tabler/icons-react-native";
import { Link, useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

import { FormPasswordInput } from "@/components/forms/FormPasswordInput";
import { FormTextInput } from "@/components/forms/FormTextInput";
import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { AuthScaffold } from "@/features/auth/AuthScaffold";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { DEMO_CREDENTIALS } from "@/services/auth.service";
import { loginSchema } from "@/lib/validation";

export default function LoginScreen() {
  const { login } = useAuth();
  const { success, error: notifyError } = useNotifications();
  const { colors } = useTheme();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Sign in to continue to your dictionary workspace."
      footer={
        <View className="flex-row justify-center gap-1">
          <Typography variant="body">Don&apos;t have an account?</Typography>
          <Link href="/register" asChild>
            <Pressable accessibilityRole="link">
              <Typography
                variant="label"
                className="text-violet-600 dark:text-violet-400"
              >
                Create one
              </Typography>
            </Pressable>
          </Link>
        </View>
      }
    >
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setFormError(null);
          try {
            await login(values.email, values.password);
            success("Signed in", "Welcome back to LexiTech Dictionary.");
            router.replace("/search");
          } catch (e) {
            const message =
              e instanceof Error ? e.message : "Unable to sign in.";
            setFormError(message);
            notifyError("Sign in failed", message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setValues,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <View className="gap-4">
            {formError ? (
              <Alert
                variant="error"
                title="Authentication error"
                message={formError}
              />
            ) : null}

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
              autoComplete="email"
              leftIcon={<IconMail size={18} color={colors.icon} />}
            />

            <FormPasswordInput
              label="Password"
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              error={errors.password}
              touched={touched.password}
              placeholder="Your password"
            />

            <Link href="/forgot-password" asChild>
              <Pressable accessibilityRole="link" className="self-end">
                <Typography
                  variant="label"
                  className="text-violet-600 dark:text-violet-400"
                >
                  Forgot password?
                </Typography>
              </Pressable>
            </Link>

            <Button
              label="Sign in"
              onPress={() => handleSubmit()}
              loading={isSubmitting}
              fullWidth
            />

            <View className="gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <Typography variant="caption" className="uppercase tracking-wide">
                Demo accounts (password: {DEMO_CREDENTIALS.password})
              </Typography>
              {DEMO_CREDENTIALS.accounts.map((acc) => (
                <Pressable
                  key={acc.email}
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${acc.role} demo account`}
                  onPress={() =>
                    setValues({
                      email: acc.email,
                      password: DEMO_CREDENTIALS.password,
                    })
                  }
                  className="flex-row items-center justify-between rounded-lg px-2 py-1.5 active:bg-gray-100 dark:active:bg-gray-800"
                >
                  <Typography
                    variant="body"
                    className="text-gray-900 dark:text-white"
                  >
                    {acc.email}
                  </Typography>
                  <Typography variant="caption" className="capitalize">
                    {acc.role}
                  </Typography>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </Formik>
    </AuthScaffold>
  );
}
