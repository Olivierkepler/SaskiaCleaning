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
      className="overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto flex w-max min-w-full snap-x snap-mandatory justify-start gap-8 scroll-smooth px-2 sm:px-0">
        {services.map((service, index) => {
          const active = selectedServiceIndex === index;

          return (
            <motion.button
              key={service.label}
              type="button"
              variants={staggerItem}
              onClick={() => onSelect(index as ServiceIndex)}
              whileTap={{ scale: 0.98 }}
              className="group flex w-[96px] shrink-0 snap-center flex-col items-center gap-3.5 border-none bg-transparent p-0"
              style={{ cursor: "pointer" }}
            >
              <div
                className={[
                  "grid h-24 w-24 place-items-center rounded-3xl  transition-all duration-200",
                  active ? "bg-sky-50 shadow-sm" : " bg-white ",
                ].join(" ")}
              >
                <Image
                  src={service.image}
                  alt={service.label}
                  width={52}
                  height={52}
                  className="transition-transform duration-200 group-hover:scale-105"
                  style={{ objectFit: "contain" }}
                />
              </div>

              <span
                className={[
                  "text-center text-sm font-semibold leading-tight transition-colors duration-200",
                  active
                    ? "text-sky-600"
                    : "text-slate-500 group-hover:text-slate-600",
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
