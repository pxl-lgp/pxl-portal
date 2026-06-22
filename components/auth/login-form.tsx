"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PxlLogo } from "@/components/site/pxl-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login as loginCopy } from "@/lib/content";
import { login } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/errors";

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useMutation({
    mutationFn: () => login(email.trim().toLowerCase(), password),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(["auth", "me"], data.user);
      router.replace(data.user.role === "CLIENT" ? "/client/dashboard" : "/admin/dashboard");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 p-10 lg:flex">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-24 -top-24 size-96 animate-blob rounded-full bg-[#5ddafc]/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 size-96 animate-blob rounded-full bg-[#6e81ff]/10 blur-3xl [animation-delay:-8s]" />
        </div>

        <Link href="/" className="relative inline-block w-fit transition-transform hover:scale-105">
          <PxlLogo className="h-9" tagline />
        </Link>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight">{loginCopy.panelHeadline}</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">{loginCopy.panelBody}</p>
          <ul className="mt-8 space-y-3">
            {loginCopy.panelPoints.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          {loginCopy.securityNote}
        </p>
      </div>

      <div className="relative flex flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="lg:hidden" aria-label="PXL - back to home">
            <PxlLogo className="h-7" />
          </Link>
          <Button asChild variant="ghost" className="rounded-full text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to website
            </Link>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm animate-pop">
            <div className="mb-8 text-center">
              <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LockKeyhole className="size-6" />
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">{loginCopy.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{loginCopy.subheading}</p>
            </div>

            <Card>
              <CardContent className="pt-1">
                <form onSubmit={handleSubmit} className="grid gap-5">
                  {mutation.isError ? (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      {getApiErrorMessage(
                        mutation.error,
                        "Login failed. Check your email, password, and API connection.",
                      )}
                    </div>
                  ) : null}

                  <div className="grid gap-2">
                    <Label htmlFor="login-email">Email address</Label>
                    <Input
                      id="login-email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="pr-10"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox id="login-remember" />
                    <Label
                      htmlFor="login-remember"
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Keep me signed in on this device
                    </Label>
                  </div>

                  <Button type="submit" size="lg" disabled={mutation.isPending} className="rounded-full">
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      loginCopy.submitCta
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    {loginCopy.noAccountText}{" "}
                    <Link
                      href="/get-started"
                      className="font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      {loginCopy.noAccountCta}
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
