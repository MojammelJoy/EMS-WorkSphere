import { useParams, useNavigate } from "react-router-dom";
import { useEmployee, useDocuments } from "@/hooks";
import { PageLoader } from "@/components/feedback/page-loader";
import { Download } from "lucide-react";
import { Pencil, Mail, Phone, MapPin, Calendar, Building2, Wallet, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/ui/avatar";
import { formatDate, formatCurrency } from "@/lib/utils";
import { EMPLOYEE_STATUS_LABELS } from "@/constants";
import type { EmployeeStatus } from "@/types";


const INFO_ROW = ({ icon: Icon, label, value }: { icon: React.FC<{ className?: string }>; label: string; value: string }) => (
  <div className="flex items-center gap-3 py-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

const safeDate = (d?: string | Date | null) => d ? formatDate(new Date(d)) : "—";

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: emp, isLoading }   = useEmployee(id!);
  const { data: docs = [] }        = useDocuments(id!);

  if (isLoading) return <PageLoader />;
  if (!emp) return null;

  return (
    <>
      <PageHeader
        title="Employee Profile"
        breadcrumbs={[{ label: "Employees", href: "/employees" }, { label: emp.name ?? "" }]}
        actions={<Button size="sm" onClick={() => navigate(`/employees/${id}/edit`)}><Pencil className="h-4 w-4" />Edit Employee</Button>}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <div className="relative h-28 bg-gradient-to-r from-primary to-primary/60 rounded-t-2xl" />
          <CardContent className="-mt-12 pb-6 flex flex-col items-center text-center">
            <UserAvatar name={emp.name} src={emp.avatar} size="xl" className="ring-4 ring-card" />
            <h3 className="mt-3 text-base font-semibold text-foreground">{emp.name}</h3>
            <p className="text-sm text-muted-foreground">{emp.designation}</p>
            <p className="text-xs text-muted-foreground">{emp.department.name}</p>
            <Badge variant="success" dot className="mt-3">{EMPLOYEE_STATUS_LABELS[emp.status]}</Badge>
            <p className="mt-2 text-xs text-muted-foreground">{emp.employeeId}</p>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          <Tabs defaultValue="personal">
            <TabsList>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                <CardContent className="divide-y divide-border">
                  <INFO_ROW icon={Mail}     label="Email"         value={emp.email} />
                  <INFO_ROW icon={Phone}    label="Phone"         value={emp.phone} />
                  <INFO_ROW icon={MapPin}   label="Address"       value={emp.address ?? "—"} />
                  <INFO_ROW icon={Calendar} label="Date of Birth" value={safeDate(emp.dateOfBirth)} />
                  <div className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">Blood Group</span>
                    <span className="font-medium text-foreground">{emp.bloodGroup}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">Gender</span>
                    <span className="font-medium text-foreground">{emp.gender}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">NID</span>
                    <span className="font-medium text-foreground">{emp.nid}</span>
                  </div>
                </CardContent>
              </Card>

              {emp.emergencyContact && (
                <Card className="mt-4">
                  <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
                  <CardContent className="divide-y divide-border">
                    <INFO_ROW icon={Phone} label={emp.emergencyContact.relation} value={emp.emergencyContact.name} />
                    <INFO_ROW icon={Phone} label="Phone" value={emp.emergencyContact.phone} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="employment">
              <Card>
                <CardHeader><CardTitle>Employment Information</CardTitle></CardHeader>
                <CardContent className="divide-y divide-border">
                  <INFO_ROW icon={Building2} label="Department"  value={emp.department.name} />
                  <INFO_ROW icon={FileText}  label="Designation" value={emp.designation} />
                  <INFO_ROW icon={Calendar}  label="Joined"      value={safeDate(emp.joiningDate)} />
                  <INFO_ROW icon={Wallet}    label="Monthly Salary" value={formatCurrency(emp.salary)} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
                <CardContent>
                  {docs.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center text-muted-foreground">
                      <FileText className="h-6 w-6 mb-2" />
                      <p className="text-sm">No documents uploaded yet</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {docs.map((doc) => (
                        <li key={doc.id} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.type}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon-sm" onClick={() => window.open(doc.url, "_blank")}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
