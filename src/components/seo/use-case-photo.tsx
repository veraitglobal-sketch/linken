import Image from "next/image";
import { cn } from "@/lib/cn";
import type { UseCasePhoto } from "@/features/seo/use-cases/photos";

export function UseCasePhotoFrame({
  photo,
  className,
  priority,
}: {
  photo: UseCasePhoto;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-hero", className)}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        quality={75}
        priority={priority}
        className={cn("object-cover", photo.focus ?? "object-center")}
        sizes="(max-width: 1100px) 100vw, 1100px"
      />
    </div>
  );
}
