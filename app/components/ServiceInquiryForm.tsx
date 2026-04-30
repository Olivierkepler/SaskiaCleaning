"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown, X } from "lucide-react";

type ServiceInquiryFormProps = {
  onClose?: () => void;
};

const inputStyles =
  "w-full border-b border-stone-200 bg-transparent pt-6 pb-2 text-sm outline-none transition-all focus:border-stone-900 placeholder:text-stone-300 font-light";

const labelStyles =
  "absolute top-0 left-0 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium pointer-events-none";

const steps = [
  "Identity",
  "Residence",
  "Preferences",
  "Sensitivities",
  "Review",
];
const stepImages = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", // Identity
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0", // Residence
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952", // Preferences
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511", // Sensitivities
    "https://images.unsplash.com/photo-1613545325278-f24b0cae1224", // Review
  ];


  

export default function ServiceInquiryForm({ onClose }: ServiceInquiryFormProps) {
  const [step, setStep] = useState(0);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 18 }}
      transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
      className="relative w-full max-w-4xl overflow-hidden border border-stone-100 bg-[#FCFAF8] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.18)]"
    >
      <div className="absolute left-0 top-0 h-1 bg-stone-900 transition-all duration-700" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />

      <div className="grid md:grid-cols-[0.85fr_1.15fr]">
      <aside className="hidden md:flex flex-col justify-between border-r border-stone-100 bg-[#F5F1EC] p-10">

{/* Top Content */}
<div>
  <span className="text-[9px] tracking-[0.5em] uppercase text-stone-400 font-bold">
    Private Concierge
  </span>

  <h2 className="mt-6 font-serif text-5xl leading-none italic tracking-tight">
    Establish <br /> Care.
  </h2>

  <p className="mt-6 text-sm font-light leading-relaxed text-stone-500">
    A discreet intake designed to understand your residence, preferences,
    sensitivities, and desired atmosphere.
  </p>
</div>

{/* Center Image (KEY CHANGE) */}
<div className="flex justify-center items-center py-10">
  <div className="relative w-[75%] aspect-[3/4] overflow-hidden shadow-xl">
    
    <AnimatePresence mode="wait">
      <motion.img
        key={step}
        src={`${stepImages[step]}?q=80&w=1200`}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        className="absolute inset-0 w-full h-full object-cover"
        alt=""
      />
    </AnimatePresence>

  </div>
</div>

{/* Step Indicators */}
<div className="space-y-4">
  {steps.map((item, index) => (
    <div key={item} className="flex items-center gap-3">
      <div
        className={`h-2 w-2 rounded-full transition ${
          index <= step ? "bg-stone-900" : "bg-stone-300"
        }`}
      />
      <span
        className={`text-[10px] uppercase tracking-[0.25em] ${
          index === step ? "text-stone-900" : "text-stone-400"
        }`}
      >
        {item}
      </span>
    </div>
  ))}
</div>

</aside>

        <div className="p-8 md:p-12">
          <div className="mb-10 flex items-start justify-between gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-stone-400 font-semibold">
                Step {step + 1} of {steps.length}
              </span>
              <h3 className="mt-3 font-serif text-4xl tracking-tight">
                {steps[step]}
              </h3>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-400 transition hover:border-stone-900 hover:text-stone-900"
              >
                <X size={16} strokeWidth={1.2} />
              </button>
            )}
          </div>

          <form>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                className="min-h-[360px]"
              >
                {step === 0 && (
                  <div className="space-y-10">
                    <p className="text-sm font-light leading-relaxed text-stone-500">
                      Let us begin with who we are caring for.
                    </p>

                    <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
                      <div className="relative">
                        <label className={labelStyles}>Full Name</label>
                        <input className={inputStyles} placeholder="Your name" />
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Email Address</label>
                        <input type="email" className={inputStyles} placeholder="you@example.com" />
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Phone Number</label>
                        <input className={inputStyles} placeholder="Preferred contact number" />
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Preferred Contact</label>
                        <select className={`${inputStyles} appearance-none cursor-pointer`}>
                          <option>Email</option>
                          <option>Phone</option>
                          <option>Text Message</option>
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute bottom-3 right-0 text-stone-300" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-10">
                    <p className="text-sm font-light leading-relaxed text-stone-500">
                      Tell us about the residence and the level of care required.
                    </p>

                    <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
                      <div className="relative">
                        <label className={labelStyles}>Service Type</label>
                        <select className={`${inputStyles} appearance-none cursor-pointer`}>
                          <option>Recurring Stewardship</option>
                          <option>Deep Restoration</option>
                          <option>Move-In / Move-Out Care</option>
                          <option>Special Event Recovery</option>
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute bottom-3 right-0 text-stone-300" />
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Square Footage</label>
                        <input className={inputStyles} placeholder="Approx. sq ft" />
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Bedrooms</label>
                        <input className={inputStyles} placeholder="Number of bedrooms" />
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Bathrooms</label>
                        <input className={inputStyles} placeholder="Number of bathrooms" />
                      </div>

                      <div className="relative md:col-span-2">
                        <label className={labelStyles}>Access Notes</label>
                        <textarea
                          className={`${inputStyles} min-h-24 resize-none`}
                          placeholder="Parking, gate code, doorman, pets, elevator, private entrance..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-10">
                    <p className="text-sm font-light leading-relaxed text-stone-500">
                      Define the atmosphere, product preferences, and finishing details.
                    </p>

                    <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
                      <div className="relative">
                        <label className={labelStyles}>Product Preference</label>
                        <select className={`${inputStyles} appearance-none cursor-pointer`}>
                          <option>Eco-Friendly / Non-Toxic</option>
                          <option>Hypoallergenic</option>
                          <option>Fragrance-Free</option>
                          <option>Standard Products</option>
                          <option>I Will Provide Products</option>
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute bottom-3 right-0 text-stone-300" />
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Scent Profile</label>
                        <select className={`${inputStyles} appearance-none cursor-pointer`}>
                          <option>Neutral / No Scent</option>
                          <option>Linen & White Tea</option>
                          <option>Warm Amber</option>
                          <option>Fresh Citrus</option>
                          <option>Custom Profile</option>
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute bottom-3 right-0 text-stone-300" />
                      </div>

                      <div className="relative md:col-span-2">
                        <label className={labelStyles}>Priority Areas</label>
                        <textarea
                          className={`${inputStyles} min-h-24 resize-none`}
                          placeholder="Kitchen, primary suite, marble surfaces, guest areas, laundry room..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-10">
                    <p className="text-sm font-light leading-relaxed text-stone-500">
                      Help us protect your household from products, materials, or
                      conditions that should be avoided.
                    </p>

                    <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
                      <div className="relative">
                        <label className={labelStyles}>Allergy Concerns</label>
                        <select className={`${inputStyles} appearance-none cursor-pointer`}>
                          <option>No Known Sensitivities</option>
                          <option>Fragrance Sensitivity</option>
                          <option>Bleach Sensitivity</option>
                          <option>Ammonia Sensitivity</option>
                          <option>Multiple Sensitivities</option>
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute bottom-3 right-0 text-stone-300" />
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Pets in Residence</label>
                        <select className={`${inputStyles} appearance-none cursor-pointer`}>
                          <option>No Pets</option>
                          <option>Dog</option>
                          <option>Cat</option>
                          <option>Multiple Pets</option>
                          <option>Other</option>
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute bottom-3 right-0 text-stone-300" />
                      </div>

                      <div className="relative md:col-span-2">
                        <label className={labelStyles}>Strict Avoidances</label>
                        <textarea
                          className={`${inputStyles} min-h-28 resize-none`}
                          placeholder="Products, rooms, materials, surfaces, scents, or instructions we should strictly avoid..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <p className="text-sm font-light leading-relaxed text-stone-500">
                      Your request will be reviewed privately before confirmation.
                      A concierge will follow up with availability and final details.
                    </p>

                    <div className="grid gap-4">
                      {[
                        "Residence profile received",
                        "Care preferences recorded",
                        "Sensitivities and avoidances noted",
                        "Concierge review required before confirmation",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between border border-stone-100 bg-white/40 px-5 py-4"
                        >
                          <span className="text-sm font-light text-stone-600">{item}</span>
                          <span className="text-[10px] uppercase tracking-widest text-stone-400">
                            Included
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-l border-stone-300 pl-5">
                      <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                        Confidentiality
                      </p>
                      <p className="mt-2 text-sm font-light leading-relaxed text-stone-500">
                        All household notes are handled with discretion and used only
                        to prepare the appropriate service experience.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex flex-col-reverse gap-4 border-t border-stone-100 pt-8 md:flex-row md:items-center md:justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.3em] text-stone-400 transition hover:text-stone-900 disabled:opacity-30 disabled:hover:text-stone-400"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="group relative bg-[#1A1A1A] px-10 py-4 text-[10px] font-bold uppercase tracking-[0.35em] text-white overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-4 transition-all group-hover:gap-6">
                    Continue <ArrowRight size={14} />
                  </span>
                  <div className="absolute inset-0 translate-y-full bg-stone-800 transition-transform duration-500 group-hover:translate-y-0" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="group relative bg-[#1A1A1A] px-10 py-4 text-[10px] font-bold uppercase tracking-[0.35em] text-white overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-4 transition-all group-hover:gap-6">
                    Submit Inquiry <ArrowRight size={14} />
                  </span>
                  <div className="absolute inset-0 translate-y-full bg-stone-800 transition-transform duration-500 group-hover:translate-y-0" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}