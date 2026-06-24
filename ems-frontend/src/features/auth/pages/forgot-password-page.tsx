import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services";
import { toast } from "sonner";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => authService.forgotPassword(data),
    onSuccess: () => setSent(true),
    onError: () => toast.error("Failed to send reset link. Please try again."),
  });

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a password reset link to <span className="font-medium text-foreground">{getValues("email")}</span>
            </p>
          </div>
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Forgot password?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <Input {...register("email")} type="email" label="Email address" placeholder="you@company.com" startIcon={<Mail />} error={errors.email?.message} />
          <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>Send reset link</Button>
        </form>
        <Link to="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
