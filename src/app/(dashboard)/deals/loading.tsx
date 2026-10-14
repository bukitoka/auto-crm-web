import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-8 w-72" />
      <div className="flex gap-4 overflow-hidden">
        {["a", "b", "c", "d", "e"].map((key) => (
          <Skeleton key={key} className="h-96 w-72 shrink-0 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
