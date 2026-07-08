import Image from "next/image";

import type { Photo } from "@/lib/photo-types";
import { cn } from "@/lib/utils";

type PhotoImageProps = {
  photo: Photo;
  variant?: "thumb" | "full";
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function PhotoImage({
  photo,
  variant = "thumb",
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: PhotoImageProps) {
  const src = variant === "thumb" ? photo.thumbnailSrc : photo.originalSrc;

  return (
    <Image
      src={src}
      alt={photo.title || photo.file}
      width={variant === "thumb" ? 640 : 2000}
      height={variant === "thumb" ? 640 : 1500}
      className={cn("h-full w-full object-cover", className)}
      loading={priority ? undefined : "lazy"}
      priority={priority}
      sizes={sizes}
    />
  );
}
