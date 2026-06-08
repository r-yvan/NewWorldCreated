import { IconEye, IconEyeOff, IconLock } from "@tabler/icons-react-native";
import React, { useState } from "react";

import { FormTextInput, FormTextInputProps } from "@/components/forms/FormTextInput";
import { IconButton } from "@/components/ui/IconButton";
import { useTheme } from "@/contexts/ThemeContext";

export type FormPasswordInputProps = Omit<FormTextInputProps, "secureTextEntry" | "rightSlot" | "leftIcon">;

/** Password field with a show/hide toggle. */
export function FormPasswordInput(props: FormPasswordInputProps) {
  const [hidden, setHidden] = useState(true);
  const { colors } = useTheme();

  return (
    <FormTextInput
      {...props}
      secureTextEntry={hidden}
      autoCapitalize="none"
      autoCorrect={false}
      leftIcon={<IconLock size={18} color={colors.icon} />}
      rightSlot={
        <IconButton
          accessibilityLabel={hidden ? "Show password" : "Hide password"}
          onPress={() => setHidden((v) => !v)}
          className="h-8 w-8"
        >
          {hidden ? <IconEye size={18} color={colors.icon} /> : <IconEyeOff size={18} color={colors.icon} />}
        </IconButton>
      }
    />
  );
}
