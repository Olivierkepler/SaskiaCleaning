"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { MOTION_EASE } from "../constants";
import type { StandardPreviewImage } from "../types";
import { getStandardGalleryDimensions } from "../utils";

export type StandardGalleryImageCardProps = {
  img: StandardPreviewImage;
};

export function StandardGalleryImageCard({
  img,
}: StandardGalleryImageCardProps) {
  const { width, height } = getStandardGalleryDimensions(img);
  const hasCustomSize = img.width != null || img.height != null;

  // The Standard bedroom asset has extra transparent visual weight
  // on one side, so compensate slightly to make the rendered subject
  // appear centered in the gallery.
  const isStandardBedroom =
    img.src === "/images/standard/roomandbedroom.png";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{
        duration: 0.35,
        ease: MOTION_EASE,
      }}
      className="flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div
        className="relative max-w-full"
        style={
          hasCustomSize
            ? {
                width,
                height,
                transform: isStandardBedroom
                  ? "translateX(8%)"
                  : undefined,
              }
            : {
                width: "100%",
                maxWidth: 260,
                aspectRatio: "4 / 3",
              }
        }
      >
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(min-width: 1024px) 450px, 50vw"
          className="object-contain"
        />
      </div>
    </motion.div>
  );
}

export default StandardGalleryImageCard;