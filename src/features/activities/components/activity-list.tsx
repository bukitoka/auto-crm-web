import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { formatRelative, personName } from "@/lib/format";
import { deleteActivity } from "../actions";
import type { Activity } from "../types";
import { ActivityIcon } from "./activity-icon";

type ActivityListProps = {
  activities: Activity[];
  /** Show links to the related contact/deal (dashboard), hide on detail pages. */
  showLinks?: boolean;
  canDelete?: boolean;
};

/** Vertical timeline of activities. */
export function ActivityList({
  activities,
  showLinks = false,
  canDelete = false,
}: ActivityListProps) {
  if (activities.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-4 before:w-px before:bg-border">
      {activities.map((activity) => (
        <li key={activity.id} className="relative flex gap-3">
          <ActivityIcon type={activity.type} />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 text-sm">
                <span className="font-medium capitalize">{activity.type}</span>
                {activity.subject ? <span> · {activity.subject}</span> : null}
                {showLinks && activity.contact ? (
                  <Link
                    href={`/contacts/${activity.contact.id}`}
                    className="ml-1 text-muted-foreground hover:underline"
                  >
                    with {personName(activity.contact)}
                  </Link>
                ) : null}
              </div>
              {canDelete ? (
                <ConfirmDeleteButton
                  title="Delete activity?"
                  action={deleteActivity.bind(null, activity.id, {
                    contactId: activity.contact_id,
                    dealId: activity.deal_id,
                  })}
                />
              ) : null}
            </div>
            {activity.body ? (
              <p className="text-sm whitespace-pre-line text-muted-foreground">{activity.body}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              {formatRelative(activity.occurred_at)}
              {activity.created_by ? ` · ${activity.created_by.full_name}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
