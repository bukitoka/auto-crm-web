import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ImageUpload } from "@/components/shared/image-upload";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/features/auth/api";
import { ThemeSettings } from "@/features/settings/components/theme-settings";
import { removeMyAvatar, uploadMyAvatar } from "@/features/users/actions";
import { isAdmin, roleLabel } from "@/features/users/roles";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Settings" };

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <>
      <PageHeader title="Settings" description="Your profile and preferences." />
      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Ask an admin to change your name or role.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="font-medium">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <ImageUpload
              name={user.full_name}
              src={user.avatar_url}
              onUpload={uploadMyAvatar}
              onRemove={removeMyAvatar}
              className="mb-4"
            />
            <div className="divide-y">
              <Detail label="Role">
                <Badge variant={isAdmin(user) ? "default" : "secondary"} className="capitalize">
                  {roleLabel(user)}
                </Badge>
              </Detail>
              <Detail label="Status">{user.is_active ? "Active" : "Inactive"}</Detail>
              <Detail label="Member since">{formatDate(user.created_at)}</Detail>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose light, dark, or follow your system.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSettings />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
