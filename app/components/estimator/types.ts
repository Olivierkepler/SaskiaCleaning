export type StateKey = "MA" | "RI";

export type PriceRange = {
  low: number;
  mid: number;
  high: number;
};

export type ServiceIndex = 0 | 1 | 2 | 3;

export type BookingSubmitStatus = "idle" | "loading" | "success" | "error";

export type ReferralValidationState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid"; code: string; friendDiscountAmount: number }
  | { status: "invalid" };

export type PricedAddon<L extends string = string> = {
  label: L;
  price: number;
  image: string;
};

export type StandardAddonLabel =
  | "Inside fridge"
  | "Inside oven"
  | "Laundry fold"
  | "Windows";

export type DeepCleanAddonLabel =
  | "Wall Trim"
  | "Inside cabinets"
  | "Wall scrub"
  | "Carpet steam";

export type MoveOutAddonLabel =
  | "Carpet steam"
  | "Patch & paint"
  | "Window wash"
  | "Garage clean";

export type CommercialAddonLabel =
  | "Floor wax"
  | "Pressure wash"
  | "Window ext."
  | "Sanitize";

export type StandardPreviewImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};
