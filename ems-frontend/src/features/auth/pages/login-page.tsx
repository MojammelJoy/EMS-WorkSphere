import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

const DEMO_USERS = [
  { label: "Admin",    email: "admin@company.com", password: "password123" },
  { label: "HR",       email: "hr@company.com",    password: "password123" },
  { label: "Employee", email: "emp@company.com",   password: "password123" },
];

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const login = useLogin();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  function fillDemo(email: string, password: string) {
    setValue("email", email, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden lg:flex w-[46%] flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold">N</div>
          <div>
            <p className="font-semibold text-base">WorkSphere</p>
            <p className="text-xs text-white/60">Enterprise Suite</p>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Streamline your<br />workforce management
          </h1>
          <p className="mt-4 text-lg text-white/70 leading-relaxed max-w-md">
            The enterprise-grade HR platform trusted by 2,000+ companies worldwide.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[{ n: "10K+", l: "Employees" }, { n: "500+", l: "Companies" }, { n: "99.9%", l: "Uptime" }].map(({ n, l }) => (
              <div key={l}>
                <p className="text-2xl font-bold">{n}</p>
                <p className="text-sm text-white/60 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} WorkSphere. All rights reserved.</p>
      </div>

      {/* Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">N</div>
            <span className="font-semibold text-foreground">WorkSphere</span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
            <Input
              {...register("email")}
              type="email"
              label="Email address"
              placeholder="admin@company.com"
              startIcon={<Mail />}
              error={errors.email?.message}
              autoComplete="email"
            />
            <Input
              {...register("password")}
              type={showPw ? "text" : "password"}
              label="Password"
              placeholder="••••••••"
              startIcon={<Lock />}
              endIcon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="hover:text-foreground">
                  {showPw ? <EyeOff /> : <Eye />}
                </button>
              }
              error={errors.password?.message}
              autoComplete="current-password"
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                <input type="checkbox" className="rounded border-input" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline text-sm font-medium">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={login.isPending}>
              Sign in
            </Button>
          </form>

          <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground">Demo credentials</p>
            <div className="flex gap-2">
              {DEMO_USERS.map(({ label, email, password }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => fillDemo(email, password)}
                  className="flex-1 rounded-lg border border-border bg-background py-1.5 text-xs font-medium text-foreground hover:bg-accent hover:border-primary/40 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
