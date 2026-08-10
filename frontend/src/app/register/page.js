"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "../../services/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Use at least 8 characters for your password");
      return;
    }
    setSubmitting(true);
    try {
      await registerUser({ ...form, name: form.name.trim(), email: form.email.trim() });
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page auth-page-register">
      <div className="auth-visual">
        <Link href="/" className="brand auth-brand"><span className="brand-mark">L</span><span>Leaf <i>&</i> Letter</span></Link>
        <blockquote>“A reader lives a thousand lives before he dies.”<cite>— George R. R. Martin</cite></blockquote>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <span className="eyebrow">Join the community</span>
          <h1>Create your reader profile</h1>
          <p className="auth-subtitle">Save your voice in a community built around good books.</p>
          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="name">Full name</label>
            <input id="name" name="name" value={form.name} onChange={updateField} placeholder="Your name" autoComplete="name" minLength="2" required />
            <label className="field-label" htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" value={form.email} onChange={updateField} placeholder="reader@example.com" autoComplete="email" required />
            <label className="field-label" htmlFor="password">Password</label>
            <div className="password-field"><input id="password" name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={updateField} placeholder="At least 8 characters" autoComplete="new-password" minLength="8" required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button full-button" disabled={submitting}>{submitting ? "Creating account..." : "Create account"}</button>
          </form>
          <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
        </div>
      </div>
    </section>
  );
}
