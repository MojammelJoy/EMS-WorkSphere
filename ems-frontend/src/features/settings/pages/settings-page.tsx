import { useState } from "react";
import { Moon, Sun, Monitor, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/hooks";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/types";

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.FC<{className?:string}> }[] = [
  { value:"light",  label:"Light",  icon:Sun     },
  { value:"dark",   label:"Dark",   icon:Moon    },
  { value:"system", label:"System", icon:Monitor },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [notifEmail, setNotifEmail]   = useState(true);
  const [notifLeave, setNotifLeave]   = useState(true);
  const [notifPayroll, setNotifPayroll] = useState(false);

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
                {user && <UserAvatar name={user.name} size="xl" />}
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP. Max 2MB.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Full Name" defaultValue={user?.name} />
                <Input label="Email Address" type="email" defaultValue={user?.email} disabled />
                <Input label="Job Title" placeholder="Your designation" />
                <Input label="Phone Number" placeholder="+880 1XXX-XXXXXX" />
              </div>
              <div className="flex justify-end"><Button><Save className="h-4 w-4" />Save Changes</Button></div>
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
                { label:"Email notifications",  desc:"Receive important updates via email.",       state:notifEmail,   set:setNotifEmail   },
                { label:"Leave alerts",          desc:"Get notified about leave requests.",        state:notifLeave,   set:setNotifLeave   },
                { label:"Payroll alerts",        desc:"Get notified when payslip is generated.",   state:notifPayroll, set:setNotifPayroll },
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
            <CardContent className="space-y-4">
              <Input label="Current Password"  type="password" placeholder="••••••••" />
              <Input label="New Password"       type="password" placeholder="••••••••" />
              <Input label="Confirm Password"   type="password" placeholder="••••••••" />
              <div className="flex justify-end"><Button>Update Password</Button></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
