import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import React from "react";
import { View } from "react-native";

import { FormPasswordInput } from "@/components/forms/FormPasswordInput";
import { FormTextInput } from "@/components/forms/FormTextInput";
import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/ui/Button";
import { AuthScaffold } from "@/features/auth/AuthScaffold";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { resetPasswordSchema } from "@/lib/validation";

export default function ResetPasswordScreen() {
  const { resetPassword } = useAuth();
  const { success } = useNotifications();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const email = params.email ?? "";

  return (
    <AuthScaffold title="Set a new password" subtitle="Enter the reset token and choose a new password.">
      <Formik
        initialValues={{ token: params.token ?? "", password: "", confirmPassword: "" }}
        validationSchema={resetPasswordSchema}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await resetPassword(email, values.token, values.password);
            success("Password updated", "You can now sign in with your new password.");
            router.replace("/login");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View className="gap-4">
            {email ? <Alert variant="info" title="Resetting for" message={email} /> : null}
            <FormTextInput
              label="Reset token"
              value={values.token}
              onChangeText={handleChange("token")}
              onBlur={handleBlur("token")}
              error={errors.token}
              touched={touched.token}
              placeholder="Paste your reset token"
              autoCapitalize="none"
            />
            <FormPasswordInput
              label="New password"
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
            <Button label="Update password" onPress={() => handleSubmit()} loading={isSubmitting} fullWidth />
          </View>
        )}
      </Formik>
    </AuthScaffold>
  );
}
