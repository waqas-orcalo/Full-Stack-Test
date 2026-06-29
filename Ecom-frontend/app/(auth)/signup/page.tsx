import { Suspense } from "react";
import { AuthForm } from "@sections/auth";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
