import { useState } from "react";
import { Plus, Check, X, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/ui/avatar";
import { formatDate, timeAgo } from "@/lib/utils";
import { LEAVE_TYPE_OPTIONS, LEAVE_STATUS_LABELS, LEAVE_TYPE_LABELS } from "@/constants";
import { useApproveLeave, useRejectLeave, useLeaveRequests, useApplyLeave } from "@/hooks";
import type { LeaveStatus, LeaveType } from "@/types";

const STATUS_VARIANT: Record<LeaveStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  PENDING:   "warning",
  APPROVED:  "success",
  REJECTED:  "destructive",
  CANCELLED: "muted",
};

const MOCK_LEAVES = [
  { id: "1", employee: { id: "1", name: "Farhana Akter", designation: "Product Designer", avatar: undefined, department: { id:"1", name:"Engineering", code:"ENG", employeeCount:0, createdAt:"" } }, leaveType: "CASUAL" as LeaveType, startDate: "2025-01-25", endDate: "2025-01-27", days: 3, reason: "Family function in hometown.", status: "PENDING"  as LeaveStatus, appliedAt: new Date(Date.now() - 3 * 3600000).toISOString(), updatedAt: new Date().toISOString() },
  { id: "2", employee: { id: "2", name: "Rakibul Hasan", designation: "Backend Engineer", avatar: undefined, department: { id:"1", name:"Engineering", code:"ENG", employeeCount:0, createdAt:"" } }, leaveType: "SICK"   as LeaveType, startDate: "2025-01-20", endDate: "2025-01-21", days: 2, reason: "Medical emergency.",         status: "APPROVED" as LeaveStatus, appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
  { id: "3", employee: { id: "3", name: "Tasnim Jahan",  designation: "HR Partner",       avatar: undefined, department: { id:"5", name:"HR & Admin",  code:"HR",  employeeCount:0, createdAt:"" } }, leaveType: "EARNED" as LeaveType, startDate: "2025-01-28", endDate: "2025-02-01", days: 5, reason: "Annual vacation.",            status: "PENDING"  as LeaveStatus, appliedAt: new Date(Date.now() - 86400000).toISOString(),   updatedAt: new Date().toISOString() },
];

const BALANCE = [
  { type: "Casual",  total: 12, used: 5,  remaining: 7  },
  { type: "Sick",    total: 14, used: 3,  remaining: 11 },
  { type: "Earned",  total: 20, used: 8,  remaining: 12 },
  { type: "Unpaid",  total: 30, used: 1,  remaining: 29 },
];

const schema = z.object({
  leaveType:  z.string().min(1, "Select leave type"),
  startDate:  z.string().min(1, "Select start date"),
  endDate:    z.string().min(1, "Select end date"),
  reason:     z.string().min(10, "Reason must be at least 10 characters"),
});
type FormData = z.infer<typeof schema>;

export default function LeavePage() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const approve  = useApproveLeave();
  const reject   = useRejectLeave();
  const applyLeave = useApplyLeave();
  const { data, isLoading } = useLeaveRequests(activeTab !== "all" ? { status: activeTab.toUpperCase() } : undefined);
  const leaves = data?.data ?? [];

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  function handleApprove(id: string) { approve.mutate(id); }

  function openReject(id: string) { setRejectTarget(id); setRejectReason(""); setRejectError(""); }

  function handleReject() {
    if (!rejectReason.trim()) { setRejectError("Rejection reason is required"); return; }
    reject.mutate({ id: rejectTarget!, reason: rejectReason }, { onSuccess: () => setRejectTarget(null) });
  }

  const onSubmit = (data: FormData) => {
    applyLeave.mutate(data as import("@/types").ApplyLeavePayload, { onSuccess: () => { setOpen(false); reset(); } });
  };

  return (
    <>
      <PageHeader
        title="Leave Management"
        description="Apply for leave, track requests, and view your leave balance"
        breadcrumbs={[{ label: "Leave Management" }]}
        actions={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Apply Leave</Button>}
      />

      <div className="space-y-5">
        {/* Leave balance cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BALANCE.map((b) => (
            <Card key={b.type}>
              <CardContent className="py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{b.type}</p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-2xl font-semibold text-foreground">{b.remaining}</p>
                  <p className="text-xs text-muted-foreground mb-1">/{b.total}</p>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${((b.total - b.used) / b.total) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{b.used} used</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Requests */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>
          </div>

          {["all", "pending", "approved"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
                ) : leaves.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">No leave requests found</div>
                ) : leaves
                  .map((leave) => (
                    <Card key={leave.id}>
                      <CardContent className="py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3">
                            <UserAvatar name={leave.employee.name} size="sm" className="mt-0.5 shrink-0" />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-foreground">{leave.employee.name}</p>
                                <Badge variant={STATUS_VARIANT[leave.status]} dot>{LEAVE_STATUS_LABELS[leave.status]}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{leave.employee.designation} · {leave.employee.department.name}</p>
                              <div className="mt-2 flex items-center gap-3 text-sm">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                  {LEAVE_TYPE_LABELS[leave.leaveType]}
                                </span>
                                <span className="text-muted-foreground">{formatDate(leave.startDate)} → {formatDate(leave.endDate)}</span>
                                <span className="font-medium text-foreground">{leave.days} day{leave.days > 1 ? "s" : ""}</span>
                              </div>
                              <p className="mt-1.5 text-sm text-muted-foreground">"{leave.reason}"</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:shrink-0">
                            <p className="text-xs text-muted-foreground hidden sm:block">{timeAgo(leave.appliedAt)}</p>
                            {leave.status === "PENDING" && (
                              <>
                                <Button size="sm" variant="success" className="gap-1.5" loading={approve.isPending} onClick={() => handleApprove(leave.id)}>
                                  <Check className="h-3.5 w-3.5" />Approve
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10" onClick={() => openReject(leave.id)}>
                                  <X className="h-3.5 w-3.5" />Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Timeline dots */}
                        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-border">
                          {[
                            { label: "Applied",  done: true  },
                            { label: "Reviewed", done: leave.status !== "PENDING" },
                            { label: "Decision", done: leave.status === "APPROVED" || leave.status === "REJECTED" },
                          ].map((step, i, arr) => (
                            <div key={step.label} className="flex items-center gap-2 text-xs">
                              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${step.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                {step.done ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              </span>
                              <span className={step.done ? "text-foreground font-medium" : "text-muted-foreground"}>{step.label}</span>
                              {i < arr.length - 1 && <span className="mx-1 h-px w-8 bg-border" />}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>Reject Leave Request</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-3">
            <p className="text-sm text-muted-foreground">Provide a reason for rejecting this leave request. The employee will be notified.</p>
            <div>
              <textarea
                rows={3}
                placeholder="e.g. Insufficient leave balance, critical project deadline…"
                value={rejectReason}
                onChange={(e) => { setRejectReason(e.target.value); setRejectError(""); }}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              {rejectError && <p className="mt-1 text-xs text-destructive">{rejectError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="destructive" loading={reject.isPending} onClick={handleReject}>Reject Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Leave Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Leave Type *</label>
              <Select onValueChange={(v) => setValue("leaveType", v)}>
                <SelectTrigger error={errors.leaveType?.message}><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{LEAVE_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
              {errors.leaveType && <p className="mt-1 text-xs text-destructive">{errors.leaveType.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input {...register("startDate")} label="Start Date *" type="date" error={errors.startDate?.message} />
              <Input {...register("endDate")}   label="End Date *"   type="date" error={errors.endDate?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Reason *</label>
              <textarea
                {...register("reason")}
                rows={3}
                placeholder="Briefly describe the reason for your leave…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              {errors.reason && <p className="mt-1 text-xs text-destructive">{errors.reason.message}</p>}
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={applyLeave.isPending}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
