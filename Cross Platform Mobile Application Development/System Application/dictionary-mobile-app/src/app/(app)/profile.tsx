import {
  IconCheck,
  IconLock,
  IconLogout,
  IconMail,
  IconUser,
} from "@tabler/icons-react-native";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import { View } from "react-native";

import { FileUpload } from "@/components/forms/FileUpload";
import { FormTextInput } from "@/components/forms/FormTextInput";
import { AppCard } from "@/components/ui/AppCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Divider } from "@/components/ui/Divider";
import { Typography } from "@/components/ui/Typography";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { ScreenContainer } from "@/components/navigation/ScreenContainer";
import { TopNavBar } from "@/components/navigation/TopNavBar";
import { ALL_PERMISSIONS, ROLE_LABELS } from "@/constants/rbac";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { profileSchema } from "@/lib/validation";

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const { can } = usePermissions();
  const { success } = useNotifications();
  const { colors } = useTheme();
  const router = useRouter();
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!user) return null;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <TopNavBar title="My Profile" />
      <ScreenContainer>
        <ScreenHeader title="My Profile" breadcrumbs={["Home", "Profile"]} />

        <View className="gap-4">
          {/* Identity card */}
          <AppCard className="items-center gap-3">
            <Avatar name={user.name} color={user.avatarColor} size={80} />
            <View className="items-center">
              <Typography variant="title">{user.name}</Typography>
              <Typography variant="body">{user.email}</Typography>
            </View>
            <Badge
              label={ROLE_LABELS[user.role]}
              tone="accent"
              className="self-center"
            />
            <FileUpload
              label="Profile photo"
              hint="Tap to upload a new photo (simulated)"
              sampleFileName="avatar.png"
            />
          </AppCard>

          {/* Editable details */}
          <AppCard className="gap-4">
            <Typography variant="subheading">Account details</Typography>
            <Formik
              initialValues={{ name: user.name, email: user.email }}
              validationSchema={profileSchema}
              enableReinitialize
              onSubmit={async (values, { setSubmitting }) => {
                await updateProfile(values);
                success("Profile updated", "Your details have been saved.");
                setSubmitting(false);
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting,
                dirty,
              }) => (
                <View className="gap-4">
                  <FormTextInput
                    label="Full name"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    error={errors.name}
                    touched={touched.name}
                    leftIcon={<IconUser size={18} color={colors.icon} />}
                  />
                  <FormTextInput
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    error={errors.email}
                    touched={touched.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<IconMail size={18} color={colors.icon} />}
                  />
                  <Button
                    label="Save changes"
                    onPress={() => handleSubmit()}
                    loading={isSubmitting}
                    disabled={!dirty}
                    fullWidth
                  />
                </View>
              )}
            </Formik>
          </AppCard>

          {/* Role & permissions (RBAC visibility) */}
          <AppCard className="gap-3">
            <View className="flex-row items-center gap-2">
              <IconLock size={18} color={colors.icon} />
              <Typography variant="subheading">Role & permissions</Typography>
            </View>
            <Typography variant="caption">
              Your access is determined by the {ROLE_LABELS[user.role]} role.
            </Typography>
            <Divider />
            <View className="gap-2">
              {ALL_PERMISSIONS.map((perm) => {
                const allowed = can(perm);
                return (
                  <View
                    key={perm}
                    className="flex-row items-center justify-between"
                  >
                    <Typography
                      variant="body"
                      className={allowed ? "text-gray-900 dark:text-white" : ""}
                    >
                      {perm}
                    </Typography>
                    {allowed ? (
                      <Badge
                        label="Allowed"
                        tone="success"
                        icon={<IconCheck size={12} color={colors.accent} />}
                      />
                    ) : (
                      <Badge label="Restricted" tone="neutral" />
                    )}
                  </View>
                );
              })}
            </View>
          </AppCard>

          <Button
            label="Log out"
            variant="danger"
            icon={<IconLogout size={18} color="#fff" />}
            onPress={() => setConfirmLogout(true)}
            fullWidth
          />
        </View>
      </ScreenContainer>

      <ConfirmDialog
        visible={confirmLogout}
        title="Log out"
        message="Are you sure you want to log out of LexiTech Dictionary?"
        confirmLabel="Log out"
        destructive
        onCancel={() => setConfirmLogout(false)}
        onConfirm={async () => {
          setConfirmLogout(false);
          await logout();
          success("Signed out", "You have been logged out.");
          router.replace("/login");
        }}
      />
    </View>
  );
}
