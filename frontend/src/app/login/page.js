"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { loginUser } from "../../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useUser();
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await loginUser({ email: email.trim(), password });
      login(data.token, data.user);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-visual">
        <Link href="/" className="brand auth-brand"><span className="brand-mark">L</span><span>Leaf <i>&</i> Letter</span></Link>
        <blockquote>“Reading is an exercise in empathy; an exercise in walking in someone else&apos;s shoes for a while.”<cite>— Malorie Blackman</cite></blockquote>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <span className="eyebrow">Welcome back</span>
          <h1>Continue your reading journey</h1>
          <p className="auth-subtitle">Sign in to publish and manage your reviews.</p>
          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">Email address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="reader@example.com" autoComplete="email" required />
            <label className="field-label" htmlFor="password">Password</label>
            <div className="password-field"><input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button full-button" disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}</button>
          </form>
          <p className="auth-switch">New to Leaf & Letter? <Link href="/register">Create an account</Link></p>
        </div>
      </div>
    </section>
  );
}
