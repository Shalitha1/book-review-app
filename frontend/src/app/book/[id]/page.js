"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../../context/UserContext";
import {
  deleteReview,
  fetchBookDetails,
  fetchReviews,
  submitReview,
  updateReview,
} from "../../../services/api";
import StarRating from "../../../components/StarRating";
import { BookCover } from "../../page";

function ReviewCard({ review, canManage, onEdit, onDelete }) {
  return (
    <article className="review-card">
      <div className="review-card-head">
        <div className="reviewer">
          <span className="avatar avatar-large">{review.username?.charAt(0).toUpperCase()}</span>
          <div><strong>{review.username}</strong><span>{new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span></div>
        </div>
        <div className="review-rating" aria-label={`${review.rating} out of 5 stars`}>★ {Number(review.rating).toFixed(1)}</div>
      </div>
      <p>{review.comment}</p>
      {canManage && (
        <div className="review-actions">
          <button type="button" onClick={() => onEdit(review)}>Edit</button>
          <button type="button" className="danger-link" onClick={() => onDelete(review.id)}>Delete</button>
        </div>
      )}
    </article>
  );
}

export default function BookDetails() {
  const { id } = useParams();
  const { user, authReady } = useUser();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchBookDetails(id), fetchReviews(id)])
      .then(([bookData, reviewData]) => {
        setBook(bookData);
        setReviews(reviewData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const communityRating = useMemo(() => {
    if (!reviews.length) return Number(book?.rating || 0);
    return reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length;
  }, [book, reviews]);

  const resetForm = () => {
    setComment("");
    setRating(5);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editingId) {
        const data = await updateReview(editingId, { comment, rating });
        setReviews((current) => current.map((item) => item.id === editingId ? data.review : item));
      } else {
        const data = await submitReview({ bookId: id, comment, rating });
        setReviews((current) => [data.review, ...current]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (review) => {
    setEditingId(review.id);
    setComment(review.comment);
    setRating(Number(review.rating));
    document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    setError("");
    try {
      await deleteReview(reviewId);
      setReviews((current) => current.filter((review) => review.id !== reviewId));
      if (editingId === reviewId) resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="page-shell detail-loading"><div className="detail-cover-skeleton" /><div className="detail-copy-skeleton" /></div>;
  if (!book) return <div className="page-shell state-card error-state"><strong>Book unavailable</strong><span>{error || "This title could not be found."}</span><Link href="/">Return to the library</Link></div>;

  return (
    <>
      <section className="detail-hero">
        <div className="page-shell">
          <Link href="/" className="back-link">← Back to library</Link>
          <div className="detail-grid">
            <BookCover book={book} large />
            <div className="detail-copy">
              <span className="eyebrow">Reader favourite</span>
              <h1>{book.title}</h1>
              <p className="detail-author">by {book.author}</p>
              <div className="rating-summary">
                <strong>{communityRating.toFixed(1)}</strong>
                <div><span>★★★★★</span><small>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</small></div>
              </div>
              <p className="detail-intro">What makes a book memorable is the conversation it starts. Read what the community thinks, then add your own perspective.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell reviews-layout">
        <div>
          <div className="reviews-heading"><div><span className="eyebrow">From the community</span><h2>Reader reviews</h2></div><span>{reviews.length} total</span></div>
          {reviews.length ? reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              canManage={Boolean(user && Number(user.id) === Number(review.userId))}
              onEdit={startEditing}
              onDelete={handleDelete}
            />
          )) : <div className="state-card"><strong>Be the first to review</strong><span>Your perspective could help another reader choose their next book.</span></div>}
        </div>

        <aside className="review-panel" id="review-form">
          {!authReady ? <div className="form-skeleton" /> : user ? (
            <form onSubmit={handleSubmit}>
              <span className="eyebrow">{editingId ? "Refine your thoughts" : "Join the conversation"}</span>
              <h2>{editingId ? "Edit your review" : "Share your review"}</h2>
              <StarRating value={rating} onChange={setRating} />
              <label className="field-label" htmlFor="review">Your review</label>
              <textarea id="review" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What stayed with you?" minLength="3" maxLength="1500" required />
              <div className="form-meta"><span>{comment.length}/1500</span></div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-button full-button" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Publish review"}</button>
              {editingId && <button type="button" className="secondary-button full-button" onClick={resetForm}>Cancel editing</button>}
            </form>
          ) : (
            <div className="sign-in-prompt"><span className="prompt-icon">✦</span><h2>Have something to say?</h2><p>Sign in to share your review with the community.</p><Link href={`/login?next=/book/${id}`} className="primary-button full-button">Sign in to review</Link><Link href="/register" className="text-link">Create a free account</Link></div>
          )}
        </aside>
      </section>
    </>
  );
}
