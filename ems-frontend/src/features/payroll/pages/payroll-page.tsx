import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download, FileText, TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { PAYROLL_STATUS_LABELS } from "@/constants";
import { payrollService } from "@/services";
import { usePayrollList } from "@/hooks";
import { toast } from "sonner";
import type { PayrollStatus } from "@/types";

const STATUS_VARIANT: Record<PayrollStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  DRAFT:     "muted",
  PROCESSED: "warning",
  PAID:      "success",
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CUR_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => String(CUR_YEAR - i));


export default function PayrollPage() {
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear]   = useState(String(new Date().getFullYear()));
  const [selectedPayroll, setSelectedPayroll] = useState<any | null>(null);
  const [processOpen, setProcessOpen] = useState(false);
  const [processMonth, setProcessMonth] = useState(String(new Date().getMonth() + 1));
  const [processYear, setProcessYear]   = useState(String(new Date().getFullYear()));

  const processPayroll = useMutation({
    mutationFn: () => payrollService.process(Number(processMonth), Number(processYear)),
    onSuccess: () => {
      toast.success(`Payroll processed for ${MONTHS[Number(processMonth) - 1]} ${processYear}`);
      setProcessOpen(false);
    },
    onError: () => toast.error("Failed to process payroll. Please try again."),
  });

  const { data: payrollData, isLoading } = usePayrollList({ month: Number(month), year: Number(year) });
  const payrolls = payrollData?.data ?? [];

  const totalNet        = payrolls.reduce((s, p) => s + Number(p.netSalary), 0);
  const totalGross      = payrolls.reduce((s, p) => s + Number(p.grossSalary), 0);
  const totalDeductions = payrolls.reduce((s, p) => s + Number(p.totalDeductions), 0);

  return (
    <>
      <PageHeader
        title="Payroll"
        description="Manage monthly payroll, salary breakdowns, and payslips"
        breadcrumbs={[{ label: "Payroll" }]}
        actions={<Button size="sm" onClick={() => setProcessOpen(true)}><FileText className="h-4 w-4" />Process Payroll</Button>}
      />

      <div className="space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Net Payroll</p>
                <p className="text-xl font-semibold text-foreground mt-0.5">{formatCurrency(totalNet)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Gross</p>
                <p className="text-xl font-semibold text-foreground mt-0.5">{formatCurrency(totalGross)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Deductions</p>
                <p className="text-xl font-semibold text-foreground mt-0.5">{formatCurrency(totalDeductions)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters + table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Payroll Records</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full min-w-[860px] text-sm text-left">
                <thead>
                  <tr className="border-y border-border bg-muted/40">
                    {["Employee","Gross Salary","Deductions","Net Salary","Status",""].map((h) => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-muted" /></td></tr>
                  )) : payrolls.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">No payroll records for {MONTHS[Number(month)-1]} {year}. Click "Process Payroll" to generate.</td></tr>
                  ) : payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={p.employee.name} size="sm" />
                          <div>
                            <p className="font-medium text-foreground">{p.employee.name}</p>
                            <p className="text-xs text-muted-foreground">{p.employee.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-foreground">{formatCurrency(Number(p.grossSalary))}</td>
                      <td className="px-5 py-3.5 text-destructive font-medium">-{formatCurrency(Number(p.totalDeductions))}</td>
                      <td className="px-5 py-3.5 font-semibold text-success">{formatCurrency(Number(p.netSalary))}</td>
                      <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[p.status]} dot>{PAYROLL_STATUS_LABELS[p.status]}</Badge></td>
                      <td className="px-5 py-3.5">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedPayroll(p)}>
                          <FileText className="h-4 w-4" /> Payslip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Payroll Dialog */}
      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Process Payroll</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-warning/10 border border-warning/20 p-3">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <p className="text-sm text-warning">This will calculate and process payroll for all active employees for the selected period.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Month</label>
                <Select value={processMonth} onValueChange={setProcessMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Year</label>
                <Select value={processYear} onValueChange={setProcessYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessOpen(false)}>Cancel</Button>
            <Button loading={processPayroll.isPending} onClick={() => processPayroll.mutate()}>
              Confirm & Process
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payslip Modal */}
      {selectedPayroll && (
        <Dialog open={!!selectedPayroll} onOpenChange={() => setSelectedPayroll(null)}>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>Payslip — {MONTHS[selectedPayroll.month - 1]} {selectedPayroll.year}</DialogTitle>
            </DialogHeader>
            <div className="px-6 py-4 space-y-5">
              {/* Employee info */}
              <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-4">
                <UserAvatar name={selectedPayroll.employee.name} size="lg" />
                <div>
                  <p className="font-semibold text-foreground">{selectedPayroll.employee.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPayroll.employee.designation}</p>
                  <p className="text-xs text-muted-foreground">{selectedPayroll.employee.employeeId} · {selectedPayroll.employee.department.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Earnings</p>
                  <div className="space-y-2">
                    {[
                      ["Basic Salary",      Number(selectedPayroll.basicSalary)],
                      ["House Rent",        Number(selectedPayroll.houseRent)],
                      ["Medical Allowance", Number(selectedPayroll.medicalAllowance)],
                      ["Transport",         Number(selectedPayroll.transport)],
                      ...(Number(selectedPayroll.bonus)          > 0 ? [["Bonus",    Number(selectedPayroll.bonus)]]          : []),
                      ...(Number(selectedPayroll.overtimeAmount) > 0 ? [["Overtime", Number(selectedPayroll.overtimeAmount)]] : []),
                    ].map(([label, amount]) => (
                      <div key={label as string} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label as string}</span>
                        <span className="font-medium text-foreground">{formatCurrency(amount as number)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 flex items-center justify-between text-sm font-semibold">
                      <span>Gross Salary</span>
                      <span className="text-foreground">{formatCurrency(Number(selectedPayroll.grossSalary))}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Deductions</p>
                  <div className="space-y-2">
                    {[
                      ["Income Tax",     Number(selectedPayroll.taxDeduction)],
                      ["Provident Fund", Number(selectedPayroll.providentFund)],
                      ...(Number(selectedPayroll.loanDeduction)   > 0 ? [["Loan",   Number(selectedPayroll.loanDeduction)]]   : []),
                      ...(Number(selectedPayroll.otherDeductions) > 0 ? [["Others", Number(selectedPayroll.otherDeductions)]] : []),
                    ].map(([label, amount]) => (
                      <div key={label as string} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label as string}</span>
                        <span className="font-medium text-destructive">-{formatCurrency(amount as number)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 flex items-center justify-between text-sm font-semibold">
                      <span>Total Deductions</span>
                      <span className="text-destructive">-{formatCurrency(Number(selectedPayroll.totalDeductions))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net */}
              <div className="rounded-xl bg-success/10 border border-success/20 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-success">Net Salary</p>
                  <p className="text-2xl font-bold text-success mt-0.5">{formatCurrency(Number(selectedPayroll.netSalary))}</p>
                </div>
                <Button size="sm" onClick={() => setSelectedPayroll(null)}>
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
