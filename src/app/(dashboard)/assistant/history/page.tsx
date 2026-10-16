import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { listConversations } from "@/features/assistant/api";
import { ConversationList } from "@/features/assistant/components/conversation-list";

export const metadata: Metadata = { title: "Chat history" };

export default async function ChatHistoryPage() {
  const conversations = await listConversations();

  return (
    <>
      <PageHeader
        title="Chat history"
        description="Your conversations with the assistant. Pick one to continue it."
        actions={
          <Button asChild>
            <Link href="/assistant">
              <Plus />
              New chat
            </Link>
          </Button>
        }
      />
      <ConversationList conversations={conversations.items} />
    </>
  );
}
