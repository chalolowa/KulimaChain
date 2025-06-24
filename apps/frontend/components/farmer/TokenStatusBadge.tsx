import { cn } from "@/lib/utils";

type Status = "available" | "pending" | "sold" | "rejected";

interface StatusConfig {
  label: string;
  class: string;
}

const statusConfig: Record<Status, StatusConfig> = {
  available: {
    label: "Available",
    class: "bg-green-100 text-green-800"
  },
  pending: {
    label: "Pending",
    class: "bg-yellow-100 text-yellow-800"
  },
  sold: {
    label: "Sold",
    class: "bg-blue-100 text-blue-800"
  },
  rejected: {
    label: "Rejected",
    class: "bg-red-100 text-red-800"
  }
};

export default function TokenStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as Status] || statusConfig.pending;

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-medium",
      config.class
    )}>
      {config.label}
    </span>
  );
}