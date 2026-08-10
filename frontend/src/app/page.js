"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchBooks } from "../services/api";

const palettes = [
  ["#173f35", "#d7a95b"],
  ["#4d243d", "#e6b8a2"],
  ["#243b53", "#9fb3c8"],
  ["#6b4226", "#e6ccb2"],
  ["#2f4858", "#b8d8d8"],
];

function BookCover({ book, large = false }) {
  const palette = palettes[(Number(book.id) - 1) % palettes.length];
  return (
    <div
      className={`book-cover${large ? " book-cover-large" : ""}`}
      style={{ "--cover": palette[0], "--accent": palette[1] }}
      aria-hidden="true"
    >
      <span className="cover-kicker">A reader&apos;s pick</span>
      <strong>{book.title}</strong>
      <span className="cover-author">{book.author}</span>
    </div>
  );
}

export { BookCover };

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    fetchBooks()
      .then(setBooks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleBooks = useMemo(() => {
    const term = query.trim().toLowerCase();
    return books
      .filter((book) =>
        (!term || `${book.title} ${book.author}`.toLowerCase().includes(term)) &&
        Number(book.rating) >= minRating
      )
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "rating") return Number(b.rating) - Number(a.rating);
        return Number(a.id) - Number(b.id);
      });
  }, [books, query, sort, minRating]);

  return (
    <>
      <section className="hero">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="page-shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Your next great read starts here</span>
            <h1>Books stay with us.<br /><em>Share why.</em></h1>
            <p>Explore a thoughtful shelf of developer classics, discover what fellow readers loved, and leave a note for the next curious mind.</p>
            <a href="#library" className="primary-button">Browse the library <span>↓</span></a>
          </div>
          <div className="hero-stack" aria-hidden="true">
            {books.slice(0, 3).map((book, index) => (
              <div className={`stack-book stack-book-${index + 1}`} key={book.id}>
                <BookCover book={book} large />
              </div>
            ))}
            {books.length === 0 && <div className="stack-placeholder">Leaf<br />& Letter</div>}
            <div className="reader-note">“A room without books is like a body without a soul.”</div>
          </div>
        </div>
      </section>

      <section id="library" className="library-section page-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Curated for curious minds</span>
            <h2>Explore the shelf</h2>
          </div>
          <p>{books.length} titles selected for readers who love to learn.</p>
        </div>

        <div className="library-tools">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Search by title or author</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title or author..." />
          </label>
          <label>
            <span className="sr-only">Minimum rating</span>
            <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
              <option value="0">All ratings</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Sort books</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="rating">Highest rated</option>
              <option value="title">Title A–Z</option>
            </select>
          </label>
        </div>

        {error ? (
          <div className="state-card error-state"><strong>We couldn&apos;t open the library.</strong><span>{error}</span></div>
        ) : loading ? (
          <div className="book-grid" aria-label="Loading books">
            {[1, 2, 3].map((item) => <div key={item} className="book-card skeleton-card" />)}
          </div>
        ) : visibleBooks.length === 0 ? (
          <div className="state-card"><strong>No matching books</strong><span>Try a different title, author, or rating.</span></div>
        ) : (
          <div className="book-grid">
            {visibleBooks.map((book) => (
              <Link key={book.id} href={`/book/${book.id}`} className="book-card">
                <BookCover book={book} />
                <div className="book-card-copy">
                  <div className="rating-row"><span>★</span> {Number(book.rating).toFixed(1)}</div>
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <span className="card-link">Read reviews <b>→</b></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="site-footer"><div className="page-shell">Leaf & Letter <span>Thoughtful reads. Honest reviews.</span></div></footer>
    </>
  );
}
