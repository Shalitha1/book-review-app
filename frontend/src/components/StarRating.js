export default function StarRating({ value, onChange, label = "Rating" }) {
  return (
    <fieldset className="star-picker">
      <legend>{label}</legend>
      <div>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            className={star <= value ? "star-active" : ""}
            onClick={() => onChange(star)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            aria-pressed={star === value}
          >★</button>
        ))}
      </div>
    </fieldset>
  );
}
