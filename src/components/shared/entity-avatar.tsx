import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

type EntityAvatarProps = {
  name: string;
  /** Image URL from the API (`avatar_url` / `logo_url`); initials are shown without it. */
  src?: string | null;
  /** People are round; companies (logos) use a rounded square. */
  shape?: "circle" | "square";
  className?: string;
  fallbackClassName?: string;
};

/** Picture of a person or company, falling back to their initials. */
export function EntityAvatar({
  name,
  src,
  shape = "circle",
  className,
  fallbackClassName,
}: EntityAvatarProps) {
  const square = shape === "square";
  return (
    <Avatar title={name} className={cn(square && "rounded-md after:rounded-md", className)}>
      {src ? (
        <AvatarImage
          src={src}
          alt={name}
          className={cn(square && "rounded-md bg-white object-contain")}
        />
      ) : null}
      <AvatarFallback
        className={cn(
          "bg-secondary font-medium text-secondary-foreground",
          square && "rounded-md",
          fallbackClassName,
        )}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
