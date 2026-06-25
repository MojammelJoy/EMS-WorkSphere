import { useState, useRef } from "react";
import { Moon, Sun, Monitor, Save, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth.store";
import { useTheme, useUpdateEmployee, useChangePassword } from "@/hooks";
import { employeeService } from "@/services";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/types";

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.FC<{className?:string}> }[] = [
  { value:"light",  label:"Light",  icon:Sun     },
  { value:"dark",   label:"Dark",   icon:Moon    },
  { value:"system", label:"System", icon:Monitor },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme }  = useTheme();
  const fileInputRef         = useRef<HTMLInputElement>(null);

  const [notifEmail,   setNotifEmail]   = useState(true);
  const [notifLeave,   setNotifLeave]   = useState(true);
  const [notifPayroll, setNotifPayroll] = useState(false);
  const [uploading,    setUploading]    = useState(false);

  const [profileForm, setProfileForm] = useState({
    name:  user?.name  ?? "",
    phone: "",
    designation: "",
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  const updateEmployee  = useUpdateEmployee(user?.employeeId ?? "");
  const changePassword  = useChangePassword();

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.employeeId) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("File too large. Max 2MB."); return; }

    setUploading(true);
    try {
      const result = await employeeService.uploadAvatar(user.employeeId, file);
      updateUser({ avatar: result.avatar });
      toast.success("Photo updated!");
    } catch {
      toast.error("Failed to upload photo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.employeeId) { toast.error("No employee profile linked."); return; }
    updateEmployee.mutate({ name: profileForm.name });
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) return;
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("Passwords do not match."); return;
    }
    changePassword.mutate(pwForm, {
      onSuccess: () => setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }),
    });
  }

  return (
    <>
      <PageHeader title="Settings" description="Manage your account, preferences, and notifications" breadcrumbs={[{ label:"Settings" }]} />
      <Tabs defaultValue="profile">
        <TabsList className="mb-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile Information</CardTitle><CardDescription>Update your name, email, and personal details.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <UserAvatar name={user?.name ?? ""} src={user?.avatar} size="xl" />
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    loading={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP. Max 2MB.</p>
                </div>
              </div>
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  />
                  <Input label="Email Address" type="email" value={user?.email ?? ""} disabled />
                  <Input
                    label="Job Title"
                    placeholder="Your designation"
                    value={profileForm.designation}
                    onChange={(e) => setProfileForm((p) => ({ ...p, designation: e.target.value }))}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="+880 1XXX-XXXXXX"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit" loading={updateEmployee.isPending}>
                    <Save className="h-4 w-4" />Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Choose how WorkSphere looks on your screen.</CardDescription></CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-foreground mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-3 max-w-xs">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors",
                      theme === value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Manage how you receive notifications.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label:"Email notifications", desc:"Receive important updates via email.",     state:notifEmail,   set:setNotifEmail   },
                { label:"Leave alerts",         desc:"Get notified about leave requests.",      state:notifLeave,   set:setNotifLeave   },
                { label:"Payroll alerts",       desc:"Get notified when payslip is generated.", state:notifPayroll, set:setNotifPayroll },
              ].map(({ label, desc, state, set }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <button
                    onClick={() => set(!state)}
                    className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", state ? "bg-primary" : "bg-muted")}
                  >
                    <span className={cn("pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", state ? "translate-x-4" : "translate-x-0")} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle><CardDescription>Keep your account secure with a strong password.</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                />
                <div className="flex justify-end">
                  <Button type="submit" loading={changePassword.isPending}>Update Password</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
