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
import {
  EXTINGUISHER_SIZE_OPTIONS,
  EXTINGUISHER_STATUS_OPTIONS,
  EXTINGUISHER_TYPE_OPTIONS,
} from "@/constants/enums";
import {
  extinguisherService,
  type CreateExtinguisherPayload,
} from "@/services/extinguisher.service";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";
import { toDateInput } from "@/lib/utils";
import type {
  Extinguisher,
  ExtinguisherSize,
  ExtinguisherStatus,
  ExtinguisherType,
} from "@/types/models";

const schema = Yup.object({
  serialNumber: Yup.string().trim().required("Serial number is required"),
  location: Yup.string().trim().required("Location is required"),
  type: Yup.string().required("Type is required"),
  size: Yup.string().required("Size is required"),
  installationDate: Yup.date().required("Installation date is required"),
  expiryDate: Yup.date()
    .required("Expiry date is required")
    .min(Yup.ref("installationDate"), "Expiry must be after installation"),
});

export function ExtinguisherFormDialog({
  open,
  onOpenChange,
  extinguisher,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extinguisher?: Extinguisher | null;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = !!extinguisher;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title={isEdit ? "Edit extinguisher" : "Register extinguisher"}
          description={isEdit ? "Update the unit details." : "Add a new fire extinguisher to the registry."}
          onClose={() => onOpenChange(false)}
        />
        <Formik
          initialValues={{
            serialNumber: extinguisher?.serialNumber ?? "",
            location: extinguisher?.location ?? "",
            type: extinguisher?.type ?? "",
            size: extinguisher?.size ?? "",
            installationDate: toDateInput(extinguisher?.installationDate) || toDateInput(new Date()),
            expiryDate: toDateInput(extinguisher?.expiryDate),
            status: extinguisher?.status ?? "",
          }}
          validationSchema={schema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const payload: CreateExtinguisherPayload = {
                serialNumber: values.serialNumber,
                location: values.location,
                type: values.type as ExtinguisherType,
                size: values.size as ExtinguisherSize,
                installationDate: values.installationDate,
                expiryDate: values.expiryDate,
                ...(values.status ? { status: values.status as ExtinguisherStatus } : {}),
              };
              if (isEdit) {
                await extinguisherService.update(extinguisher!.id, payload);
                toast.success("Extinguisher updated");
              } else {
                await extinguisherService.create(payload);
                toast.success("Extinguisher registered");
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
          {({ isSubmitting }) => (
            <Form>
              <DialogBody className="space-y-4">
                <TextField label="Serial number" name="serialNumber" placeholder="FE-0001" required />
                <TextField label="Location" name="location" placeholder="Warehouse A - Floor 1" required />
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Type" name="type" options={EXTINGUISHER_TYPE_OPTIONS} placeholder="Select type" required />
                  <SelectField label="Size" name="size" options={EXTINGUISHER_SIZE_OPTIONS} placeholder="Select size" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Installation date" name="installationDate" type="date" required />
                  <TextField label="Expiry date" name="expiryDate" type="date" required />
                </div>
                {isEdit && (
                  <SelectField label="Status" name="status" options={EXTINGUISHER_STATUS_OPTIONS} placeholder="Auto" />
                )}
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {isEdit ? "Save changes" : "Register"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
