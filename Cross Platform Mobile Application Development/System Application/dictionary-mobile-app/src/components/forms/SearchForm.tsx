import { IconSearch } from "@tabler/icons-react-native";
import { Formik } from "formik";
import React from "react";
import { View } from "react-native";

import { FormTextInput } from "@/components/forms/FormTextInput";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { searchSchema } from "@/lib/validation";

export interface SearchFormProps {
  initialValue?: string;
  loading?: boolean;
  onSearch: (word: string) => void;
}

/**
 * Formik + Yup powered search form. Validates a non-empty word, disables the
 * button while loading, and never submits when invalid.
 */
export function SearchForm({ initialValue = "", loading = false, onSearch }: SearchFormProps) {
  const { colors } = useTheme();

  return (
    <Formik
      initialValues={{ word: initialValue }}
      validationSchema={searchSchema}
      enableReinitialize
      onSubmit={(values) => onSearch(values.word.trim())}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View className="gap-3">
          <FormTextInput
            value={values.word}
            onChangeText={handleChange("word")}
            onBlur={handleBlur("word")}
            error={errors.word}
            touched={touched.word}
            placeholder="Search any English word…"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            editable={!loading}
            onSubmitEditing={() => handleSubmit()}
            leftIcon={<IconSearch size={18} color={colors.icon} />}
          />
          <Button
            label="Search"
            onPress={() => handleSubmit()}
            loading={loading}
            disabled={loading}
            fullWidth
            icon={<IconSearch size={18} color={colors.background} />}
            accessibilityLabel="Search for word"
          />
        </View>
      )}
    </Formik>
  );
}
