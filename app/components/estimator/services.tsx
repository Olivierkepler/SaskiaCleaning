import type { ReactNode } from "react";

import { K } from "./constants";

export type EstimatorService = {
  image: string;
  label: string;
  photo: string;
  headline: ReactNode;
  bookLabel: string;
};

export const SERVICES: readonly EstimatorService[] = [
  {
    image: "/images/standard/Designer(15).png",
    label: "Standard",
    photo: "/images/booking/Designer(9).png",
    headline: <>Find the right cleaner<br />from Boston's best<span style={{ color: K.blue }}>.</span></>,
    bookLabel: "Book now",
  },
  {
    image: "/images/deepclean/Designer(19).png",
    label: "Deep clean",
    photo: "/images/boston.jpg",
    headline: <>Book a deep clean<br />that actually goes deep<span style={{ color: K.blue }}>.</span></>,
    bookLabel: "Book deep clean",
  },
  {
    image: "/images/moveout/moveout.png",
    label: "Move-out",
    photo: "/images/boston.jpg",
    headline: <>Leave spotless.<br />Get your deposit back<span style={{ color: K.blue }}>.</span></>,
    bookLabel: "Book move-out clean",
  },
  {
    image: "/images/commercial/commercial.png",
    label: "Commercial",
    photo: "/images/boston.jpg",
    headline: <>Professional cleaning<br />for your business<span style={{ color: K.blue }}>.</span></>,
    bookLabel: "Book commercial clean",
  },
];
