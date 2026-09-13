import Link from "next/link";

export default function NotFound() {
  return (
    <div className="nb-card bg-cyan p-8 text-center">
      <p className="font-display text-5xl uppercase">404</p>
      <p className="mt-2 font-semibold">That page got garbage-collected.</p>
      <Link href="/" className="nb-btn mt-5 inline-block bg-white px-4 py-2">
        Back to the board
      </Link>
    </div>
  );
}
