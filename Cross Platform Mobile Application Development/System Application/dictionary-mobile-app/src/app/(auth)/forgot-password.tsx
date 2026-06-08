import { IconMail } from "@tabler/icons-react-native";
import { Link, useRouter } from "expo-router";
import { Formik } from "formik";
import React from "react";
import { Pressable, View } from "react-native";

import { FormTextInput } from "@/components/forms/FormTextInput";
import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { AuthScaffold } from "@/features/auth/AuthScaffold";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { forgotPasswordSchema } from "@/lib/validation";

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const { success } = useNotifications();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <AuthScaffold
      title="Reset your password"
      subtitle="Enter your email and we'll send a reset token."
      footer={
        <View className="flex-row justify-center gap-1">
          <Typography variant="body">Remembered it?</Typography>
          <Link href="/login" asChild>
            <Pressable accessibilityRole="link">
              <Typography variant="label" className="text-violet-600 dark:text-violet-400">
                Back to sign in
              </Typography>
            </Pressable>
          </Link>
        </View>
      }
    >
      <Formik
        initialValues={{ email: "" }}
        validationSchema={forgotPasswordSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const token = await requestPasswordReset(values.email);
            success("Reset token sent", "Use the token on the next screen.");
            router.push({ pathname: "/reset-password", params: { email: values.email, token } });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View className="gap-4">
            <Alert
              variant="info"
              title="Demo flow"
              message="A reset token is generated locally and passed to the reset screen."
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
            <Button label="Send reset token" onPress={() => handleSubmit()} loading={isSubmitting} fullWidth />
          </View>
        )}
      </Formik>
    </AuthScaffold>
  );
}
