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
import { INSPECTION_STATUS_OPTIONS } from "@/constants/enums";
import { inspectionService } from "@/services/inspection.service";
import { useExtinguisherOptions, useInspectorOptions } from "@/hooks/useOptions";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";
import { toDateInput } from "@/lib/utils";
import { Role, type Inspection, type InspectionStatus } from "@/types/models";

const createSchema = Yup.object({
  extinguisherId: Yup.string().required("Extinguisher is required"),
  scheduledDate: Yup.date().required("Date is required"),
  scheduledTime: Yup.string().required("Time is required"),
});

export function InspectionFormDialog({
  open,
  onOpenChange,
  inspection,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspection?: Inspection | null;
  onSaved: () => void;
}) {
  const toast = useToast();
  const { hasRole } = useAuth();
  const isAdmin = hasRole(Role.ADMIN);
  const isEdit = !!inspection;
  const { options: extinguisherOptions } = useExtinguisherOptions();
  const { options: inspectorOptions } = useInspectorOptions(isAdmin && open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title={isEdit ? "Update inspection" : "Schedule inspection"}
          description={isEdit ? "Modify schedule, status or assignment." : "Plan a new inspection for an extinguisher."}
          onClose={() => onOpenChange(false)}
        />
        <Formik
          initialValues={{
            extinguisherId: inspection?.extinguisherId ?? "",
            scheduledDate: toDateInput(inspection?.scheduledDate) || toDateInput(new Date()),
            scheduledTime: inspection?.scheduledTime ?? "09:00",
            inspectorId: inspection?.inspectorId ?? "",
            status: inspection?.status ?? "PENDING",
            notes: inspection?.notes ?? "",
          }}
          validationSchema={createSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if (isEdit) {
                await inspectionService.update(inspection!.id, {
                  scheduledDate: values.scheduledDate,
                  scheduledTime: values.scheduledTime,
                  status: values.status as InspectionStatus,
                  notes: values.notes || undefined,
                  inspectorId: isAdmin ? values.inspectorId || null : undefined,
                });
                toast.success("Inspection updated");
              } else {
                await inspectionService.create({
                  extinguisherId: values.extinguisherId,
                  scheduledDate: values.scheduledDate,
                  scheduledTime: values.scheduledTime,
                  notes: values.notes || undefined,
                  inspectorId: isAdmin && values.inspectorId ? values.inspectorId : undefined,
                });
                toast.success("Inspection scheduled");
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
                <SelectField
                  label="Extinguisher"
                  name="extinguisherId"
                  options={extinguisherOptions}
                  placeholder="Select extinguisher"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Date" name="scheduledDate" type="date" required />
                  <TextField label="Time" name="scheduledTime" type="time" required />
                </div>
                {isAdmin && (
                  <SelectField
                    label="Assign inspector"
                    name="inspectorId"
                    options={inspectorOptions}
                    placeholder="Unassigned"
                  />
                )}
                {isEdit && (
                  <SelectField label="Status" name="status" options={INSPECTION_STATUS_OPTIONS} required />
                )}
                <TextareaField label="Notes" name="notes" placeholder="Optional notes…" />
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {isEdit ? "Save changes" : "Schedule"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
