import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Suspense } from "react";

export default function AdminLoginPage() {
  return (
    <div className="page-shell py-16">
      <Suspense fallback={null}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
