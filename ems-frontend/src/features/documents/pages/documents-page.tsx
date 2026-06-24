import { useState, useRef } from "react";
import { Upload, Download, Trash2, FileText, FileImage, File, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate, formatFileSize } from "@/lib/utils";
import { useAllDocuments, useDeleteDocument, useUploadDocument, useEmployees } from "@/hooks";
import type { DocumentType } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  CONTRACT:    "Contract",
  NDA:         "NDA",
  CERTIFICATE: "Certificate",
  ID_PROOF:    "ID Proof",
  PAYSLIP:     "Payslip",
  OTHER:       "Other",
};

const TYPE_VARIANT: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  CONTRACT:    "default",
  NDA:         "default",
  CERTIFICATE: "success",
  ID_PROOF:    "warning",
  PAYSLIP:     "muted",
  OTHER:       "muted",
};

function FileIcon({ type }: { type: string }) {
  if (type === "ID_PROOF") return <FileImage className="h-5 w-5 text-warning" />;
  if (type === "CERTIFICATE" || type === "CONTRACT" || type === "NDA") return <FileText className="h-5 w-5 text-primary" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

export default function DocumentsPage() {
  const [search, setSearch]       = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver]   = useState(false);
  const [form, setForm]           = useState({ employeeId: "", type: "OTHER" });
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const { data: docs = [], isLoading } = useAllDocuments();
  const { data: empData }              = useEmployees({ limit: 100 });
  const employees                      = empData?.data ?? [];
  const deleteDoc                      = useDeleteDocument();
  const uploadDoc                      = useUploadDocument();

  const filtered = docs.filter((d) => {
    const empName = (d as any).employee ? `${(d as any).employee.firstName} ${(d as any).employee.lastName}` : "";
    return `${d.name} ${empName} ${d.type}`.toLowerCase().includes(search.toLowerCase());
  });

  function handleFileSelect(file: File) {
    setSelectedFile(file);
  }

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile || !form.employeeId) return;
    uploadDoc.mutate(
      { employeeId: form.employeeId, file: selectedFile, type: form.type, name: selectedFile.name },
      {
        onSuccess: () => {
          setUploadOpen(false);
          setSelectedFile(null);
          setForm({ employeeId: "", type: "OTHER" });
        },
      }
    );
  }

  return (
    <>
      <PageHeader
        title="Documents"
        description="Manage employee documents, contracts, and certificates"
        breadcrumbs={[{ label: "Documents" }]}
        actions={
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4" />Upload Document
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-5">
          {/* Search */}
          <div className="mb-5 relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, employee, type…"
              className="h-9 w-full rounded-xl border border-input bg-secondary/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[700px] text-sm text-left">
              <thead>
                <tr className="border-y border-border bg-muted/40">
                  {["Document", "Employee", "Type", "Size", "Uploaded", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-muted" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">No documents found</td></tr>
                ) : filtered.map((doc) => {
                  const emp = (doc as any).employee;
                  const empName = emp ? `${emp.firstName} ${emp.lastName}` : "—";
                  return (
                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <FileIcon type={doc.type} />
                          </div>
                          <p className="font-medium text-foreground truncate max-w-[220px]">{doc.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{empName}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={TYPE_VARIANT[doc.type] ?? "muted"}>{TYPE_LABELS[doc.type] ?? doc.type}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{doc.size ? formatFileSize(doc.size) : "—"}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{formatDate(doc.uploadedAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon-sm" title="Download" onClick={() => window.open(doc.url, "_blank")}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" title="Delete"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget({ id: doc.id, name: doc.name })}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <form onSubmit={handleUpload}>
            <div className="px-6 py-4 space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Drop file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 5MB</p>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
              </div>
              {selectedFile && (
                <p className="text-xs text-primary font-medium truncate">{selectedFile.name} ({formatFileSize(selectedFile.size)})</p>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Employee <span className="text-destructive">*</span></label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
                  required
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-colors"
                >
                  <option value="">Select employee…</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Document Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-colors"
                >
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button type="submit" loading={uploadDoc.isPending} disabled={!selectedFile || !form.employeeId}>
                Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>Delete Document</DialogTitle></DialogHeader>
          <div className="px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-medium text-foreground">"{deleteTarget?.name}"</span>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" loading={deleteDoc.isPending}
              onClick={() => deleteDoc.mutate(deleteTarget!.id, { onSuccess: () => setDeleteTarget(null) })}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
