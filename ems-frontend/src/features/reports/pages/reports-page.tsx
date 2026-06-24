import { Download, FileText, Users, Clock, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

/* ── Export helpers ── */
function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function printPDF(title: string, headers: string[], rows: string[][]) {
  const tableRows = rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
  const html = `<!DOCTYPE html><html><head><title>${title}</title><style>
    body{font-family:sans-serif;padding:24px;color:#111}
    h2{margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{background:#4f46e5;color:#fff;padding:8px 12px;text-align:left}
    td{padding:8px 12px;border-bottom:1px solid #e5e7eb}
    tr:nth-child(even) td{background:#f9fafb}
    @media print{button{display:none}}
  </style></head><body>
    <h2>${title}</h2>
    <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${tableRows}</tbody></table>
    <script>window.onload=()=>window.print()<\/script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

/* ── Sample data per report ── */
const SAMPLE_DATA = {
  "Employee Report": {
    headers: ["Employee ID", "Name", "Department", "Designation", "Salary", "Status", "Joining Date"],
    rows: [
      ["EMP-0001", "System Administrator", "HR & Admin", "System Administrator", "150,000", "Active", "2020-01-01"],
      ["EMP-0002", "Tasnim Jahan",         "HR & Admin", "HR Manager",           "85,000",  "Active", "2021-03-15"],
      ["EMP-0003", "Rakibul Hasan",        "Engineering","Backend Engineer",      "86,500",  "Active", "2023-01-04"],
    ],
  },
  "Attendance Report": {
    headers: ["Employee", "Department", "Present", "Absent", "Late", "Half Day", "Rate"],
    rows: [
      ["System Administrator", "HR & Admin",  "22", "0", "1", "0", "95.7%"],
      ["Tasnim Jahan",         "HR & Admin",  "21", "1", "0", "1", "91.3%"],
      ["Rakibul Hasan",        "Engineering", "20", "2", "2", "0", "86.9%"],
    ],
  },
  "Payroll Report": {
    headers: ["Employee", "Basic Salary", "Allowances", "Deductions", "Net Pay", "Status", "Month"],
    rows: [
      ["System Administrator", "150,000", "20,000", "15,000", "155,000", "Paid", "June 2026"],
      ["Tasnim Jahan",         "85,000",  "12,000", "8,500",  "88,500",  "Paid", "June 2026"],
      ["Rakibul Hasan",        "86,500",  "10,000", "8,650",  "87,850",  "Paid", "June 2026"],
    ],
  },
  "Leave Report": {
    headers: ["Employee", "Leave Type", "From", "To", "Days", "Status"],
    rows: [
      ["Rakibul Hasan", "Sick Leave",   "2026-05-10", "2026-05-11", "2", "Approved"],
      ["Tasnim Jahan",  "Casual Leave", "2026-04-20", "2026-04-20", "1", "Approved"],
      ["Rakibul Hasan", "Earned Leave", "2026-06-01", "2026-06-05", "5", "Pending"],
    ],
  },
} as Record<string, { headers: string[]; rows: string[][] }>;

const REPORTS = [
  { title:"Employee Report",    description:"Full list with dept, salary, status, joining date.",  icon:Users,    tag:"HR"      },
  { title:"Attendance Report",  description:"Daily/monthly attendance summary with rate analysis.", icon:Clock,    tag:"Ops"     },
  { title:"Payroll Report",     description:"Salary breakdown, deductions, and net payout.",      icon:Wallet,   tag:"Finance" },
  { title:"Leave Report",       description:"Leave taken by type, department, and employee.",      icon:FileText, tag:"HR"      },
];

const payrollTrend = [
  { month:"Aug", amount:3640000 },{ month:"Sep", amount:3710000 },{ month:"Oct", amount:3750000 },
  { month:"Nov", amount:3790000 },{ month:"Dec", amount:3810000 },{ month:"Jan", amount:3840000 },
];
const deptHeadcount = [
  { dept:"Eng",  employees:168 },{ dept:"Sales", employees:96 },{ dept:"Mktg", employees:54 },
  { dept:"Ops",  employees:72  },{ dept:"HR",    employees:38 },{ dept:"Fin",  employees:19 },
];
const tooltipStyle = { borderRadius:"12px", border:"1px solid hsl(var(--border))", backgroundColor:"hsl(var(--card))", color:"hsl(var(--foreground))", fontSize:"12px" };
const axisStyle = { fontSize:12, fill:"hsl(var(--muted-foreground))" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="Generate and export HR reports across departments"
        breadcrumbs={[{ label: "Reports & Analytics" }]}
      />
      <div className="space-y-5">
        {/* Quick export cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {REPORTS.map((r) => {
            const Icon = r.icon;
            return (
              <Card key={r.title} className="group hover:shadow-elevated transition-shadow">
                <CardContent className="py-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{r.tag}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.description}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1"
                      onClick={() => {
                        const d = SAMPLE_DATA[r.title];
                        if (d) printPDF(r.title, d.headers, d.rows);
                      }}>
                      <Download className="h-3.5 w-3.5" />PDF
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1"
                      onClick={() => {
                        const d = SAMPLE_DATA[r.title];
                        if (d) downloadCSV([d.headers, ...d.rows], `${r.title.replace(/ /g, "_")}.csv`);
                      }}>
                      <Download className="h-3.5 w-3.5" />Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Trend</CardTitle>
              <CardDescription>Monthly net payroll over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={payrollTrend} margin={{ left:-20, right:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`৳${(v/100000).toFixed(0)}L`, "Payroll"]} />
                  <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2.5} dot={{ r:4, fill:"#4f46e5" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Headcount by Department</CardTitle>
              <CardDescription>Current employee distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={deptHeadcount} margin={{ left:-20, right:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="dept" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="employees" fill="#4f46e5" radius={[6,6,0,0]} maxBarSize={48} name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
