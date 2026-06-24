import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/feedback/page-loader";
import { GENDER_OPTIONS, BLOOD_GROUP_OPTIONS } from "@/constants";
import { useCreateEmployee, useUpdateEmployee, useEmployee, useDepartments } from "@/hooks";

const schema = z.object({
  name:              z.string().min(2, "Name is required"),
  email:             z.string().email("Enter a valid email"),
  phone:             z.string().min(10, "Enter a valid phone number"),
  gender:            z.enum(["MALE", "FEMALE", "OTHER"]),
  bloodGroup:        z.string().optional(),
  dateOfBirth:       z.string().optional(),
  designation:       z.string().min(2, "Designation is required"),
  departmentId:      z.string().min(1, "Department is required"),
  joiningDate:       z.string().min(1, "Joining date is required"),
  salary:            z.coerce.number().min(1, "Salary is required"),
  address:           z.string().optional(),
  nid:               z.string().optional(),
  emergencyName:     z.string().optional(),
  emergencyPhone:    z.string().optional(),
  emergencyRelation: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const SECTION = "mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2";

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = !!id;

  const { data: empData, isLoading: empLoading } = useEmployee(id ?? "");
  const { data: deptData }                        = useDepartments();
  const departments                               = deptData?.data ?? [];
  const create                                    = useCreateEmployee();
  const update                                    = useUpdateEmployee(id ?? "");

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "MALE" },
  });

  useEffect(() => {
    if (isEdit && empData) {
      reset({
        name:              empData.name,
        email:             empData.email,
        phone:             empData.phone,
        gender:            empData.gender as FormData["gender"],
        bloodGroup:        empData.bloodGroup ?? "",
        dateOfBirth:       empData.dateOfBirth ? String(empData.dateOfBirth).slice(0, 10) : "",
        designation:       empData.designation,
        departmentId:      empData.departmentId,
        joiningDate:       empData.joiningDate ? String(empData.joiningDate).slice(0, 10) : "",
        salary:            empData.salary,
        address:           empData.address ?? "",
        nid:               empData.nid ?? "",
        emergencyName:     empData.emergencyContact?.name ?? "",
        emergencyPhone:    empData.emergencyContact?.phone ?? "",
        emergencyRelation: empData.emergencyContact?.relation ?? "",
      });
    }
  }, [isEdit, empData, reset]);

  if (isEdit && empLoading) return <PageLoader />;

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name, email: data.email, phone: data.phone,
      gender: data.gender, bloodGroup: data.bloodGroup as FormData["bloodGroup"],
      dateOfBirth: data.dateOfBirth, designation: data.designation,
      departmentId: data.departmentId, joiningDate: data.joiningDate,
      salary: data.salary, address: data.address, nid: data.nid,
      emergencyContact: data.emergencyName
        ? { name: data.emergencyName, phone: data.emergencyPhone ?? "", relation: data.emergencyRelation ?? "" }
        : undefined,
    };

    if (isEdit) {
      update.mutate(payload, { onSuccess: () => navigate(`/employees/${id}`) });
    } else {
      create.mutate(payload, { onSuccess: () => navigate("/employees") });
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <>
      <PageHeader
        title={isEdit ? "Edit Employee" : "Add New Employee"}
        breadcrumbs={[{ label: "Employees", href: "/employees" }, { label: isEdit ? "Edit" : "New Employee" }]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Personal Info */}
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent>
            <div className={SECTION}>
              <Input {...register("name")}        label="Full Name *"      placeholder="Tanvir Ahmed"       error={errors.name?.message} />
              <Input {...register("email")}       label="Email Address *"  placeholder="tanvir@company.com" error={errors.email?.message} disabled={isEdit} />
              <Input {...register("phone")}       label="Phone Number *"   placeholder="+880 1XXX-XXXXXX"   error={errors.phone?.message} />
              <Input {...register("dateOfBirth")} label="Date of Birth"    type="date" />
            </div>
            <div className={SECTION}>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Gender *</label>
                <Select defaultValue={empData?.gender ?? "MALE"} onValueChange={(v) => setValue("gender", v as FormData["gender"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GENDER_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Blood Group</label>
                <Select defaultValue={empData?.bloodGroup ?? ""} onValueChange={(v) => setValue("bloodGroup", v)}>
                  <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                  <SelectContent>{BLOOD_GROUP_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Input {...register("nid")}     label="National ID (NID)" placeholder="XXXX-XXXX-XXXX" />
              <Input {...register("address")} label="Address"            placeholder="House, Road, City" />
            </div>
          </CardContent>
        </Card>

        {/* Employment */}
        <Card>
          <CardHeader><CardTitle>Employment Information</CardTitle></CardHeader>
          <CardContent>
            <div className={SECTION}>
              <Input {...register("designation")} label="Designation *" placeholder="Software Engineer" error={errors.designation?.message} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Department *</label>
                <Select defaultValue={empData?.departmentId ?? ""} onValueChange={(v) => setValue("departmentId", v)}>
                  <SelectTrigger error={errors.departmentId?.message}><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.departmentId && <p className="text-xs text-destructive">{errors.departmentId.message}</p>}
              </div>
              <Input {...register("joiningDate")} label="Joining Date *"    type="date"   error={errors.joiningDate?.message} />
              <Input {...register("salary")}      label="Monthly Salary (৳) *" type="number" placeholder="85000" error={errors.salary?.message} />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader><CardTitle>Emergency Contact <span className="text-sm font-normal text-muted-foreground">(optional)</span></CardTitle></CardHeader>
          <CardContent>
            <div className={SECTION}>
              <Input {...register("emergencyName")}     label="Contact Name"  placeholder="Father / Spouse Name" />
              <Input {...register("emergencyPhone")}    label="Contact Phone" placeholder="+880 1XXX-XXXXXX" />
              <Input {...register("emergencyRelation")} label="Relationship"  placeholder="Father, Mother, Spouse…" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(isEdit ? `/employees/${id}` : "/employees")}>Cancel</Button>
          <Button type="submit" loading={isPending}>{isEdit ? "Save Changes" : "Create Employee"}</Button>
        </div>
      </form>
    </>
  );
}
