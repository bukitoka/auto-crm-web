import type { Metadata } from "next"
import type { ReactNode } from "react"
import { ImageUpload } from "@/components/shared/image-upload"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/features/auth/api"
import { PasswordForm, ProfileForm } from "@/features/settings/components/account-forms"
import { ThemeSettings } from "@/features/settings/components/theme-settings"
import { WorkspaceSync } from "@/features/settings/components/workspace-sync"
import { removeMyAvatar, uploadMyAvatar } from "@/features/users/actions"
import { isSuperAdmin, roleLabel } from "@/features/users/roles"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = { title: "Settings" }

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  )
}

export default async function SettingsPage({ searchParams }: PageProps<"/settings">) {
  const user = await getCurrentUser()

  return (
    <>
      <PageHeader title="Settings" description="Your profile and preferences." />
      <div className="grid max-w-5xl items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your name and profile photo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload
              name={user.full_name}
              src={user.avatar_url}
              onUpload={uploadMyAvatar}
              onRemove={removeMyAvatar}
            />
            <ProfileForm key={user.full_name} name={user.full_name} email={user.email} />
            <div className="divide-y border-t pt-2">
              <Detail label="Role">
                <Badge variant={isSuperAdmin(user) ? "default" : "secondary"}>
                  {roleLabel(user)}
                </Badge>
              </Detail>
              <Detail label="Status">{user.is_active ? "Active" : "Inactive"}</Detail>
              <Detail label="Member since">{formatDate(user.created_at)}</Detail>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeSettings />
            </CardContent>
          </Card>
          {!isSuperAdmin(user) ? <WorkspaceSync params={await searchParams} /> : null}
        </div>
      </div>
    </>
  )
}
