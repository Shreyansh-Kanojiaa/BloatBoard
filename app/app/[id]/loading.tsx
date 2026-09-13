import { DetailSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl">
      <DetailSkeleton />
    </div>
  );
}
