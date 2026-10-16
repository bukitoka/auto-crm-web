import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { ParamSelect } from "@/components/shared/param-select";
import { SearchInput } from "@/components/shared/search-input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listConversations } from "@/features/assistant/api";
import { ConversationsAdminTable } from "@/features/assistant/components/conversations-admin-table";
import { getCurrentUser } from "@/features/auth/api";
import { listUserOptions } from "@/features/users/api";
import { isAdmin } from "@/features/users/roles";
import { getListParams, getParam } from "@/lib/search-params";

export const metadata: Metadata = { title: "AI chats" };

export default async function AiChatsPage({ searchParams }: PageProps<"/ai-chats">) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admins only"
        description="Ask a workspace admin to manage AI chat history."
      />
    );
  }

  const params = await searchParams;
  const archived = getParam(params, "status") === "archived";
  const { page, size, search } = getListParams(params);
  const [conversations, users] = await Promise.all([
    listConversations({
      scope: "all",
      archived,
      search,
      user_id: getParam(params, "user"),
      page,
      size,
    }),
    listUserOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="AI chats"
        description="Everyone's conversations with the assistant. Archive old ones or delete what you don't need."
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Tabs value={archived ? "archived" : "active"}>
          <TabsList>
            <TabsTrigger value="active" asChild>
              <Link href="/ai-chats">Active</Link>
            </TabsTrigger>
            <TabsTrigger value="archived" asChild>
              <Link href="/ai-chats?status=archived">Archived</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
          <SearchInput placeholder="Search chat titles…" />
          <ParamSelect
            param="user"
            allLabel="All users"
            options={users.map((u) => ({ value: u.id, label: u.full_name }))}
          />
        </div>
      </div>
      <ConversationsAdminTable
        key={`${archived}-${page}`}
        conversations={conversations.items}
        archived={archived}
      />
      <PaginationBar
        pathname="/ai-chats"
        searchParams={params}
        page={conversations.page}
        size={conversations.size}
        total={conversations.total}
      />
    </>
  );
}
