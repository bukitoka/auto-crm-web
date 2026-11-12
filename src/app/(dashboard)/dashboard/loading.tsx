import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {["a", "b", "c", "d"].map((key) => (
          <Skeleton key={key} className="h-40 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {["a", "b", "c", "d"].map((key) => (
          <Skeleton key={key} className="h-80 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
