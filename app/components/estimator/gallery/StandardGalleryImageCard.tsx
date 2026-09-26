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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ duration: 0.35, ease: MOTION_EASE }}
      className="flex items-center justify-center overflow-hidden"
    >
      <div
        className="relative max-w-full"
        style={
          hasCustomSize
            ? {
                width,
                height,
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
          sizes="(min-width: 1024px) 240px, 50vw"
          className="object-contain"
        />
      </div>
    </motion.div>
  );
}

export default StandardGalleryImageCard;
