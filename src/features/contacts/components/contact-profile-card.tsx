import { Building2, Mail, Phone, Tag, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ImageUpload } from "@/components/shared/image-upload";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, personName } from "@/lib/format";
import { removeContactAvatar, uploadContactAvatar } from "../actions";
import type { Contact } from "../types";

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground">
      {icon}
      <div className="min-w-0 truncate">{children}</div>
    </div>
  );
}

export function ContactProfileCard({ contact }: { contact: Contact }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ImageUpload
          name={personName(contact)}
          src={contact.avatar_url}
          onUpload={uploadContactAvatar.bind(null, contact.id)}
          onRemove={removeContactAvatar.bind(null, contact.id)}
          className="mb-5"
        />
        <Row icon={<Mail />}>
          {contact.email ? (
            <a href={`mailto:${contact.email}`} className="hover:underline">
              {contact.email}
            </a>
          ) : (
            <span className="text-muted-foreground">No email</span>
          )}
        </Row>
        <Row icon={<Phone />}>
          {contact.phone ?? <span className="text-muted-foreground">No phone</span>}
        </Row>
        <Row icon={<Building2 />}>
          {contact.company ? (
            <Link href={`/companies/${contact.company.id}`} className="hover:underline">
              {contact.company.name}
            </Link>
          ) : (
            <span className="text-muted-foreground">No company</span>
          )}
        </Row>
        <Row icon={<UserRound />}>Owner: {contact.owner?.full_name ?? "—"}</Row>
        <Row icon={<Tag />}>
          {contact.tags.length > 0 ? (
            <span className="flex flex-wrap gap-1">
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </span>
          ) : (
            <span className="text-muted-foreground">No tags</span>
          )}
        </Row>
        <p className="pt-2 text-xs text-muted-foreground">
          Source: {contact.source} · Added {formatDate(contact.created_at)}
        </p>
      </CardContent>
    </Card>
  );
}
