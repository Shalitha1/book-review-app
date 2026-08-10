"use client";

import Link from "next/link";
import { useUser } from "../context/UserContext";

export default function Navbar() {
  const { user, authReady, logout } = useUser();

  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Primary navigation">
        <Link href="/" className="brand" aria-label="Leaf and Letter home">
          <span className="brand-mark" aria-hidden="true">L</span>
          <span>Leaf <i>&</i> Letter</span>
        </Link>

        <div className="nav-links">
          <Link href="/">Library</Link>
          {!authReady ? (
            <span className="nav-placeholder" />
          ) : user ? (
            <>
              <span className="user-chip">
                <span className="avatar">{user.name?.charAt(0).toUpperCase()}</span>
                <span>{user.name}</span>
              </span>
              <button type="button" className="text-button" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
              <Link href="/register" className="nav-cta">Join the club</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
