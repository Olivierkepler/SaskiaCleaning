"use client";

import { AnimatePresence, motion } from "framer-motion";

import { MOTION_EASE } from "../constants";
import type { StandardPreviewImage } from "../types";
import { StandardGalleryImageCard } from "./StandardGalleryImageCard";

export type DynamicServiceGalleryProps = {
  galleryKey: string;
  images: StandardPreviewImage[];
  isDefaultOnly: boolean;
  layoutVariant?: "public" | "account";
};

export function DynamicServiceGallery({
  galleryKey,
  images,
  isDefaultOnly,
  layoutVariant = "public",
}: DynamicServiceGalleryProps) {
  const [primaryImage, ...addonImages] = images;

  if (!primaryImage) {
    return null;
  }

  const hasFourAddonImages = addonImages.length === 4;

  return (
    <motion.div
      key={galleryKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.3,
        ease: MOTION_EASE,
      }}
      className="
        flex
        h-full
        min-h-0
        w-full
        flex-1
      "
    >
      {isDefaultOnly ? (
        /*
         * Default state
         * Keep the service image centered in the right panel.
         */
        <div
          className="
            flex
            h-full
            w-full
            items-center
            justify-center
          "
        >
          <AnimatePresence mode="popLayout">
            <StandardGalleryImageCard
              key={primaryImage.src}
              img={primaryImage}
              variant="primary"
            />
          </AnimatePresence>
        </div>
      ) : (
        /*
         * Customized state
         * Start from the top instead of vertically centering
         * the image collection.
         */
        <div
          className={`
            mx-auto flex h-full w-full max-w-[980px] flex-col items-center justify-start
            ${layoutVariant === "account" ? "px-3 pb-6 pt-6 lg:px-3 lg:pt-8" : "px-6 pb-8 pt-8 lg:px-8 lg:pt-10"}
          `}
        >
          {/* Main service image */}
          <motion.div
            layout
            className="
              flex
              w-full
              items-center
              justify-center
            "
          >
            <div
              className="
                flex
                h-[220px]
                w-full
                items-center
                justify-center
                lg:h-[250px]
                xl:h-[270px]
              "
            >
              <AnimatePresence mode="popLayout">
                <StandardGalleryImageCard
                  key={primaryImage.src}
                  img={primaryImage}
                  variant="primary"
                />
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Selected add-ons */}
          {addonImages.length > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: MOTION_EASE,
              }}
              className="
                mt-5
                flex
                w-full
                items-start
                justify-center
              "
            >
              <div
                className={
                  layoutVariant === "account"
                    ? `grid w-full min-w-0 ${
                        addonImages.length === 1 ? "grid-cols-1" : "grid-cols-2"
                      } items-start justify-items-center gap-3 lg:gap-4`
                    : `w-full items-start justify-center ${hasFourAddonImages ? "grid grid-cols-4 gap-3 xl:gap-4" : "flex flex-row flex-wrap gap-x-5 gap-y-5 lg:flex-nowrap lg:gap-x-6 xl:gap-x-8"}`
                }
              >
                <AnimatePresence mode="popLayout">
                  {addonImages.map((img, index) => (
                    <motion.div
                      key={img.src}
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
                        duration: 0.3,
                        ease: MOTION_EASE,
                      }}
                      className={
                        layoutVariant === "account"
                          ? `flex min-w-0 w-full items-center justify-center ${
                              addonImages.length > 1 &&
                              addonImages.length % 2 === 1 &&
                              index === addonImages.length - 1
                                ? "col-span-2 max-w-[150px] justify-self-center"
                                : ""
                            }`
                          : hasFourAddonImages
                            ? "flex min-w-0 w-full items-center justify-center"
                            : "flex min-w-[120px] max-w-[180px] flex-1 items-start justify-center"
                      }
                    >
                      <StandardGalleryImageCard
                        img={img}
                        variant="addon"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default DynamicServiceGallery;
