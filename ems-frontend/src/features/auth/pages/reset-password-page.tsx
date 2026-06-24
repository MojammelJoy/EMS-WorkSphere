import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services";
import { toast } from "sonner";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => authService.resetPassword({ token, ...data }),
    onSuccess: () => { toast.success("Password reset! Please sign in."); navigate("/login"); },
    onError: () => toast.error("Invalid or expired reset link."),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Reset password</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter your new password below.</p>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <Input {...register("password")} type="password" label="New password" placeholder="••••••••" startIcon={<Lock />} error={errors.password?.message} />
          <Input {...register("confirmPassword")} type="password" label="Confirm password" placeholder="••••••••" startIcon={<Lock />} error={errors.confirmPassword?.message} />
          <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>Reset password</Button>
        </form>
        <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground">Back to sign in</Link>
      </div>
    </div>
  );
}
