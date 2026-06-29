"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { Box, Card, Stack, Typography } from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import toast from "react-hot-toast";

import { useLoginMutation, useSignupMutation } from "@services/app/auth-api";
import { useAuth } from "@hooks/use-auth";
import { useThemePreset } from "@hooks/use-theme-preset";
import { paths } from "@root/path";
import { Button, RHFTextField } from "@components/index";

type Mode = "login" | "signup";

const loginSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});
const signupSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(6, "At least 6 characters").required("Password is required"),
});

export default function AuthForm({ mode }: { mode: Mode }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect");
  const { setCredentials } = useAuth();
  const { preset } = useThemePreset();

  const [login, { isLoading: loggingIn }] = useLoginMutation();
  const [signup, { isLoading: signingUp }] = useSignupMutation();

  const methods = useForm({
    resolver: yupResolver(isSignup ? signupSchema : loginSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: { name?: string; email: string; password: string }) => {
    try {
      const res = isSignup
        ? await signup({ name: values.name!, email: values.email, password: values.password }).unwrap()
        : await login({ email: values.email, password: values.password }).unwrap();

      const result = res.data;
      setCredentials(result);
      toast.success(isSignup ? "Account created" : "Welcome back");

      if (result.user.role === "admin") {
        router.push(paths.admin.dashboard);
      } else {
        router.push(redirect || paths.products.base);
      }
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ?? "Something went wrong";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  const busy = loggingIn || signingUp;
  const segBtn = (active: boolean) => ({
    flex: 1,
    py: 1,
    fontWeight: 600,
    fontSize: 13,
    borderRadius: "6px",
    textAlign: "center" as const,
    textDecoration: "none",
    color: active ? "primary.dark" : "text.secondary",
    bgcolor: active ? "background.paper" : "transparent",
    boxShadow: active ? "0 1px 2px rgba(16,24,40,.08)" : "none",
  });

  return (
    <Card sx={{ width: "100%", maxWidth: 860, overflow: "hidden" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, minHeight: 520 }}>
        {/* Art panel */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            p: 5,
            color: "#fff",
            background: `linear-gradient(150deg, ${preset.gradient[0]}, ${preset.gradient[1]})`,
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <StorefrontOutlinedIcon />
            <Typography fontWeight={800} fontFamily="Outfit, sans-serif">
              Aurora Market
            </Typography>
          </Stack>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: "#fff", lineHeight: 1.25 }}>
              Shop smarter.
              <br />
              Everything in one place.
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.8)", mt: 1.5 }}>
              Sign in to sync your cart across devices and track your orders end to end.
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Secure checkout · JWT auth · Your data stays yours
          </Typography>
        </Box>

        {/* Form panel */}
        <Box sx={{ p: { xs: 4, md: 5 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Box
            sx={{
              display: "flex",
              p: "3px",
              mb: 3,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Box component={Link} href={paths.auth.login} sx={segBtn(!isSignup)}>
              Sign in
            </Box>
            <Box component={Link} href={paths.auth.signup} sx={segBtn(isSignup)}>
              Create account
            </Box>
          </Box>

          <Typography variant="h5" fontWeight={700} mb={0.5}>
            {isSignup ? "Create your account" : "Welcome back"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {isSignup ? "Sign up to start shopping." : "Sign in to Aurora Market."}
          </Typography>

          <FormProvider {...methods}>
            <Box component="form" onSubmit={methods.handleSubmit(onSubmit)}>
              <Stack gap={2}>
                {isSignup && <RHFTextField name="name" label="Full name" />}
                <RHFTextField name="email" label="Email" />
                <RHFTextField name="password" label="Password" type="password" />
                <Button type="submit" variant="contained" fullWidth disabled={busy}>
                  {isSignup ? "Create account" : "Sign in"}
                </Button>
              </Stack>
            </Box>
          </FormProvider>

          <Typography variant="caption" color="text.secondary" mt={2} textAlign="center">
            Passwords hashed with bcrypt · validated client + server side
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
