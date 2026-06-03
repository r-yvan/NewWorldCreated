import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { TextField, SelectField } from "@/components/form/fields";
import { Label } from "@/components/ui/label";
import { ROLE_OPTIONS } from "@/constants/enums";
import { userService } from "@/services/user.service";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";
import { Role, type User } from "@/types/models";

const passwordRule = Yup.string()
  .min(8, "At least 8 characters")
  .matches(/[A-Z]/, "One uppercase letter")
  .matches(/[a-z]/, "One lowercase letter")
  .matches(/[0-9]/, "One number")
  .matches(/[^A-Za-z0-9]/, "One special character");

function buildSchema(isEdit: boolean) {
  return Yup.object({
    firstName: Yup.string().trim().required("First name is required"),
    lastName: Yup.string().trim().required("Last name is required"),
    email: Yup.string().email("Enter a valid email").required("Email is required"),
    role: Yup.string().required("Role is required"),
    password: isEdit ? Yup.string().notRequired() : passwordRule.required("Password is required"),
  });
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = !!user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title={isEdit ? "Edit user" : "Create user"}
          description={isEdit ? "Update account details and role." : "Add a new platform account."}
          onClose={() => onOpenChange(false)}
        />
        <Formik
          initialValues={{
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            email: user?.email ?? "",
            role: user?.role ?? Role.USER,
            password: "",
            isActive: user?.isActive ?? true,
          }}
          validationSchema={buildSchema(isEdit)}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if (isEdit) {
                await userService.update(user!.id, {
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: values.email,
                  role: values.role as Role,
                  isActive: values.isActive,
                });
                toast.success("User updated");
              } else {
                await userService.create({
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: values.email,
                  role: values.role as Role,
                  password: values.password,
                  isActive: values.isActive,
                });
                toast.success("User created");
              }
              onSaved();
              onOpenChange(false);
            } catch (err) {
              toast.error("Save failed", normalizeError(err).message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form>
              <DialogBody className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="First name" name="firstName" required />
                  <TextField label="Last name" name="lastName" required />
                </div>
                <TextField label="Email" name="email" type="email" required />
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Role" name="role" options={ROLE_OPTIONS} required />
                  {!isEdit && (
                    <TextField label="Password" name="password" type="password" required />
                  )}
                </div>
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={values.isActive}
                    onChange={(e) => setFieldValue("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
                  />
                  <Label className="cursor-pointer">Account is active</Label>
                </label>
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {isEdit ? "Save changes" : "Create user"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
