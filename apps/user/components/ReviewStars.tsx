export function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className="text-accent" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-slate-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}
