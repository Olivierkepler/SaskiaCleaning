"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { MOTION_EASE } from "../constants";
import type { StandardPreviewImage } from "../types";
import { getStandardGalleryDimensions } from "../utils";

export type StandardGalleryImageCardProps = {
  img: StandardPreviewImage;
  variant?: "primary" | "addon";
};

export function StandardGalleryImageCard({
  img,
  variant = "primary",
}: StandardGalleryImageCardProps) {
  const { width, height } = getStandardGalleryDimensions(img);
  const hasCustomSize = img.width != null || img.height != null;

  const isAddon = variant === "addon";

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        scale: 0.92,
        y: 8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.92,
        y: -8,
      }}
      transition={{
        duration: 0.35,
        ease: MOTION_EASE,
      }}
      className="
        flex
        h-full
        w-full
        min-w-0
        items-center
        justify-center
        overflow-visible
      "
    >
      <motion.div
        layout
        className="relative flex items-center justify-center"
        style={
          isAddon
            ? {
                width: "100%",
                maxWidth: 130,
                aspectRatio: "1 / 1",
              }
            : hasCustomSize
              ? {
                  width,
                  height,
                  maxWidth: "100%",
                  maxHeight: "100%",
                }
              : {
                  width: "100%",
                  maxWidth: 320,
                  aspectRatio: "4 / 3",
                }
        }
      >
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes={
            isAddon
              ? "(min-width: 1024px) 130px, 25vw"
              : "(min-width: 1024px) 450px, 50vw"
          }
          className="object-contain"
        />
      </motion.div>
    </motion.div>
  );
}

export default StandardGalleryImageCard;