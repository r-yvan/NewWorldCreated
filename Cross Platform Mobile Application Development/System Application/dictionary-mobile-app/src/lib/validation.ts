import * as Yup from "yup";

/** Centralized Yup schemas reused across every form. */

export const searchSchema = Yup.object({
  word: Yup.string().trim().required("Please enter a word to search."),
});

export const loginSchema = Yup.object({
  email: Yup.string().trim().email("Enter a valid email address.").required("Email is required."),
  password: Yup.string().min(6, "Password must be at least 6 characters.").required("Password is required."),
});

export const registerSchema = Yup.object({
  name: Yup.string().trim().min(2, "Name is too short.").required("Full name is required."),
  email: Yup.string().trim().email("Enter a valid email address.").required("Email is required."),
  role: Yup.string().oneOf(["student", "examiner", "admin"], "Select a role.").required("Role is required."),
  password: Yup.string()
    .min(8, "Use at least 8 characters.")
    .matches(/[A-Z]/, "Include an uppercase letter.")
    .matches(/[0-9]/, "Include a number.")
    .required("Password is required."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match.")
    .required("Confirm your password."),
});

export const forgotPasswordSchema = Yup.object({
  email: Yup.string().trim().email("Enter a valid email address.").required("Email is required."),
});

export const resetPasswordSchema = Yup.object({
  token: Yup.string().trim().required("Enter the reset token."),
  password: Yup.string()
    .min(8, "Use at least 8 characters.")
    .matches(/[A-Z]/, "Include an uppercase letter.")
    .matches(/[0-9]/, "Include a number.")
    .required("Password is required."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match.")
    .required("Confirm your password."),
});

export const profileSchema = Yup.object({
  name: Yup.string().trim().min(2, "Name is too short.").required("Full name is required."),
  email: Yup.string().trim().email("Enter a valid email address.").required("Email is required."),
});
