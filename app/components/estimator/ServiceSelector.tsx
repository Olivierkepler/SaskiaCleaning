"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import {
  SCROLL_VIEWPORT,
  staggerContainer,
  staggerItem,
} from "./constants";
import type { EstimatorService } from "./services";
import type { ServiceIndex } from "./types";

export type ServiceSelectorProps = {
  services: readonly EstimatorService[];
  selectedServiceIndex: ServiceIndex;
  onSelect: (index: ServiceIndex) => void;
};

export function ServiceSelector({
  services,
  selectedServiceIndex,
  onSelect,
}: ServiceSelectorProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={SCROLL_VIEWPORT}
      variants={staggerContainer}
      className="
        overflow-x-auto
        pb-7
        [-ms-overflow-style:none]
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      <div
        className="
          mx-auto
          flex
          w-max
          min-w-full
          snap-x
          snap-mandatory
          justify-start
          gap-5
          scroll-smooth
          px-2
          sm:gap-6
          sm:px-0
          lg:gap-7
        "
      >
        {services.map((service, index) => {
          const active = selectedServiceIndex === index;

          return (
            <motion.button
              key={service.label}
              type="button"
              variants={staggerItem}
              onClick={() => onSelect(index as ServiceIndex)}
              whileTap={{ scale: 0.985 }}
              aria-pressed={active}
              className={[
                `
                  group
                  flex
                  w-[124px]
                  shrink-0
                  snap-center
                  flex-col
                  items-center
                  justify-center
                  gap-4
                  rounded-[24px]
                  border-none
                  px-4
                  py-4
                  outline-none
                  transition-all
                  duration-300

                  focus-visible:ring-2
                  focus-visible:ring-sky-400
                  focus-visible:ring-offset-2
                `,
                active
                  ? `
                      bg-[#F5F7FA]
                      shadow-[2px_2px_7px_#E5EAF1,-2px_-2px_7px_rgba(255,255,255,0.97)]

                    `
                  : `
                      bg-transparent
                      hover:bg-[#ECF0F3]
                      hover:shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_rgba(255,255,255,0.9)]
                    `,
              ].join(" ")}
              style={{ cursor: "pointer" }}
            >
              {/* Image */}
              <div
                className="
                  flex
                  h-[50px]
                  w-full
                  items-center
                  justify-center
                "
              >
                <Image
                  src={service.image}
                  alt={service.label}
                  width={58}
                  height={58}
                  className="
                    object-contain
                    transition-transform
                    duration-300
                    group-hover:scale-105
                  "
                />
              </div>

              {/* Label */}
              <span
                className={[
                  `
                    text-center
                    text-[15px]
                    font-semibold
                    leading-tight
                    tracking-[-0.015em]
                    transition-colors
                    duration-200
                  `,
                  active
                    ? "text-sky-600"
                    : "text-slate-500 group-hover:text-slate-700",
                ].join(" ")}
              >
                {service.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default ServiceSelector;