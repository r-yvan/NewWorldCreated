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
import { TextField, SelectField, TextareaField } from "@/components/form/fields";
import { maintenanceService } from "@/services/maintenance.service";
import { useExtinguisherOptions, useInspectorOptions } from "@/hooks/useOptions";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";
import { toDateInput } from "@/lib/utils";
import { Role, type Maintenance } from "@/types/models";

const schema = Yup.object({
  extinguisherId: Yup.string().required("Extinguisher is required"),
  actionTaken: Yup.string().trim().required("Action taken is required"),
  conditionNotes: Yup.string().trim().required("Condition notes are required"),
  maintenanceDate: Yup.date().required("Date is required"),
});

export function MaintenanceFormDialog({
  open,
  onOpenChange,
  maintenance,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenance?: Maintenance | null;
  onSaved: () => void;
}) {
  const toast = useToast();
  const { hasRole } = useAuth();
  const isAdmin = hasRole(Role.ADMIN);
  const isEdit = !!maintenance;
  const { options: extinguisherOptions } = useExtinguisherOptions();
  const { options: inspectorOptions } = useInspectorOptions(isAdmin && open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title={isEdit ? "Update maintenance log" : "Log maintenance"}
          description={isEdit ? "Edit the maintenance record." : "Record maintenance performed on an extinguisher."}
          onClose={() => onOpenChange(false)}
        />
        <Formik
          initialValues={{
            extinguisherId: maintenance?.extinguisherId ?? "",
            actionTaken: maintenance?.actionTaken ?? "",
            conditionNotes: maintenance?.conditionNotes ?? "",
            maintenanceDate: toDateInput(maintenance?.maintenanceDate) || toDateInput(new Date()),
            inspectorId: maintenance?.inspectorId ?? "",
          }}
          validationSchema={schema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if (isEdit) {
                await maintenanceService.update(maintenance!.id, {
                  actionTaken: values.actionTaken,
                  conditionNotes: values.conditionNotes,
                  maintenanceDate: values.maintenanceDate,
                  inspectorId: isAdmin ? values.inspectorId || null : undefined,
                });
                toast.success("Maintenance updated");
              } else {
                await maintenanceService.create({
                  extinguisherId: values.extinguisherId,
                  actionTaken: values.actionTaken,
                  conditionNotes: values.conditionNotes,
                  maintenanceDate: values.maintenanceDate,
                  inspectorId: isAdmin && values.inspectorId ? values.inspectorId : undefined,
                });
                toast.success("Maintenance logged");
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
                {!isEdit && (
                  <SelectField
                    label="Extinguisher"
                    name="extinguisherId"
                    options={extinguisherOptions}
                    placeholder="Select extinguisher"
                    required
                  />
                )}
                <TextField label="Action taken" name="actionTaken" placeholder="Replaced pressure gauge" required />
                <TextareaField label="Condition notes" name="conditionNotes" placeholder="Unit in good condition…" required />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField label="Maintenance date" name="maintenanceDate" type="date" required />
                  {isAdmin && (
                    <SelectField label="Inspector" name="inspectorId" options={inspectorOptions} placeholder="Unassigned" />
                  )}
                </div>
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {isEdit ? "Save changes" : "Log maintenance"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
