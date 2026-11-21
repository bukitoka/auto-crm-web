import { Eye } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getConversation } from "@/features/assistant/api"
import { AssistantShell } from "@/features/assistant/components/assistant-shell"
import { ChatThread } from "@/features/assistant/components/chat-thread"
import { ConversationMenu } from "@/features/assistant/components/conversation-menu"
import { getCurrentUser } from "@/features/auth/api"
import { ApiError } from "@/lib/api-client"

async function loadConversation(id: string) {
  try {
    return await getConversation(id)
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) notFound()
    throw error
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/assistant/[id]">): Promise<Metadata> {
  const { id } = await params
  return { title: (await loadConversation(id)).title }
}

export default async function ConversationPage({ params }: PageProps<"/assistant/[id]">) {
  const { id } = await params
  const [conversation, user] = await Promise.all([loadConversation(id), getCurrentUser()])
  // The super admin can open any admin's chat but only read it.
  const readOnly = conversation.user_id !== user.id

  return (
    <AssistantShell>
      <ChatThread
        key={conversation.id}
        conversationId={conversation.id}
        initialMessages={conversation.messages}
        readOnly={readOnly}
        conversationHeader={
          <header className="flex h-10 shrink-0 items-center gap-2 border-b bg-card px-4">
            <h1 className="min-w-0 flex-1 truncate text-sm font-medium" title={conversation.title}>
              {conversation.title}
            </h1>
            {readOnly ? (
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                <Eye aria-hidden className="size-3.5" />
                Read only
              </span>
            ) : (
              <ConversationMenu conversation={conversation} />
            )}
          </header>
        }
      />
    </AssistantShell>
  )
}
