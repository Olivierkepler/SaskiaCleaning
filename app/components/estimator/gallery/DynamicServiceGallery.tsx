"use client";

import { AnimatePresence, motion } from "framer-motion";

import { MOTION_EASE } from "../constants";
import type { StandardPreviewImage } from "../types";
import { StandardGalleryImageCard } from "./StandardGalleryImageCard";

export type DynamicServiceGalleryProps = {
  galleryKey: string;
  images: StandardPreviewImage[];
  isDefaultOnly: boolean;
};

export function DynamicServiceGallery({
  galleryKey,
  images,
  isDefaultOnly,
}: DynamicServiceGalleryProps) {
  return (
    <motion.div
      key={galleryKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: MOTION_EASE }}
      className={`flex min-h-0 flex-1 flex-col ${
        isDefaultOnly ? "justify-center" : "justify-start"
      }`}
    >
      <div
        className={
          isDefaultOnly
            ? "mx-auto flex w-full max-w-[320px] flex-col gap-3"
            : "grid w-full grid-cols-2 items-start gap-x-6 gap-y-5 overflow-y-auto pr-1"
        }
      >
        <AnimatePresence mode="popLayout">
          {images.map((img) => (
            <StandardGalleryImageCard key={img.src} img={img} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default DynamicServiceGallery;
