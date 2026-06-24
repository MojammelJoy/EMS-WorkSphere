import { useState } from "react";
import { Plus, Users, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/ui/avatar";
import { useCreateDepartment, useDepartments } from "@/hooks";

const DEPT_COLORS = ["bg-violet-50 text-violet-600 dark:bg-violet-900/20","bg-blue-50 text-blue-600 dark:bg-blue-900/20","bg-rose-50 text-rose-600 dark:bg-rose-900/20","bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20","bg-amber-50 text-amber-600 dark:bg-amber-900/20","bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20"];

export default function DepartmentsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createDept = useCreateDepartment();
  const { data, isLoading } = useDepartments();
  const depts = data?.data ?? [];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "code" ? value.toUpperCase() : value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim())       errs.name = "Department name is required";
    if (!form.code.trim())       errs.code = "Department code is required";
    else if (form.code.length > 6) errs.code = "Code must be 6 characters or less";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    createDept.mutate(
      { name: form.name.trim(), code: form.code.trim(), description: form.description.trim() },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ name: "", code: "", description: "" });
        },
      }
    );
  }

  return (
    <>
      <PageHeader
        title="Departments"
        description={`${data?.meta?.total ?? depts.length} departments · ${depts.reduce((s, d) => s + (d.employeeCount ?? 0), 0)} total employees`}
        breadcrumbs={[{ label: "Departments" }]}
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />Add Department
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}><CardContent className="py-5"><div className="h-24 animate-pulse rounded-xl bg-muted" /></CardContent></Card>
        )) : depts.map((dept, i) => (
          <Card key={dept.id} className="group hover:shadow-elevated transition-shadow">
            <CardContent className="py-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold ${DEPT_COLORS[i % DEPT_COLORS.length]}`}>
                  {dept.code}
                </div>
                <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-semibold text-foreground">{dept.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{dept.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {dept.manager ? <><UserAvatar name={dept.manager.name} size="xs" /><span className="text-xs text-muted-foreground">{dept.manager.name}</span></> : <span className="text-xs text-muted-foreground">No manager</span>}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {dept.employeeCount} employees
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Department Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 px-6 py-4">
              <Input
                label="Department Name"
                name="name"
                placeholder="e.g. Engineering"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
              />
              <Input
                label="Department Code"
                name="code"
                placeholder="e.g. ENG"
                value={form.code}
                onChange={handleChange}
                error={errors.code}
                maxLength={6}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief description of this department…"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={createDept.isPending}>Create Department</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
