"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Eye, EyeOff, LogIn } from "lucide-react";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
          next: nextPath,
        }),
      });
      const body = (await response.json()) as { error?: string; redirectTo?: string };
      if (!response.ok || !body.redirectTo) {
        throw new Error(body.error ?? "Không thể đăng nhập.");
      }
      router.replace(body.redirectTo);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể đăng nhập.");
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand"><Coffee size={24} /><span>Coffee Garden</span></div>
        <p className="login-eyebrow">STAFF WORKSPACE</p>
        <h1>Chào mừng bạn trở lại.</h1>
        <p className="login-copy">Đăng nhập để vận hành quán và theo dõi order trong ngày.</p>
        <form onSubmit={submit} className="login-form">
          <label>
            Tài khoản
            <input name="username" autoComplete="username" autoFocus required />
          </label>
          <label>
            Mật khẩu
            <span className="password-field">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" className="button login-submit" disabled={busy}>
            <LogIn size={17} />{busy ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>
        <p className="login-help">Tài khoản nội bộ dành cho chủ quán và khu vực bếp.</p>
      </section>
    </main>
  );
}
