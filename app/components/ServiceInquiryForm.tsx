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

const errorStyles = "mt-2 text-xs text-red-500";

const steps = [
  "Identity",
  "Residence",
  "Preferences",
  "Sensitivities",
  "Review",
];

const stepImages = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  "https://images.unsplash.com/photo-1613545325278-f24b0cae1224",
];

export default function ServiceInquiryForm({ onClose }: ServiceInquiryFormProps) {
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    preferredContact: "Email",
    serviceType: "Recurring Stewardship",
    squareFootage: "",
    bedrooms: "",
    bathrooms: "",
    accessNotes: "",
    productPreference: "Eco-Friendly / Non-Toxic",
    scentProfile: "Neutral / No Scent",
    priorityAreas: "",
    allergyConcerns: "No Known Sensitivities",
    pets: "No Pets",
    strictAvoidances: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSubmitError("");
    setSuccessMessage("");
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required.";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Enter a valid email address.";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required.";
      }
    }

    if (step === 1) {
      if (!formData.squareFootage.trim()) {
        newErrors.squareFootage = "Square footage is required.";
      }

      if (!formData.bedrooms.trim()) {
        newErrors.bedrooms = "Bedrooms are required.";
      }

      if (!formData.bathrooms.trim()) {
        newErrors.bathrooms = "Bathrooms are required.";
      }
    }

    if (step === 2) {
      if (!formData.priorityAreas.trim()) {
        newErrors.priorityAreas = "Please enter at least one priority area.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setSubmitError("");
    setSuccessMessage("");
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateStep()) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      // Replace this with your real API call.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage(
        "Your request has been received. A concierge will be in contact shortly to confirm the next steps."
      );
    } catch {
      setSubmitError(
        "We were unable to complete your request at this time. Please try again, or allow us to assist you directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 18 }}
      transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
      className="relative w-full max-w-7xl overflow-hidden border border-stone-100 bg-[#FCFAF8] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.18)]"
    >
      <div
        className="absolute left-0 top-0 h-1 bg-stone-900 transition-all duration-700"
        style={{ width: `${((step + 1) / steps.length) * 100}%` }}
      />

      <div className="grid md:grid-cols-[0.85fr_1.15fr]">
        <aside className="hidden md:flex flex-row justify-between border-r border-stone-100 bg-[#F5F1EC] p-10">
         

          <div>
            <span className="text-[9px] tracking-[0.5em] uppercase text-stone-400 font-bold">
              Private Concierge
            </span>

            <h2 className="mt-6 font-serif text-5xl leading-none italic tracking-tight">
              Curated  Care.
            </h2>

            <p className="mt-6 text-sm font-light leading-relaxed text-stone-500">
              A confidential introduction to your residence, preferences,
              sensitivities, and desired atmosphere—prepared with precision,
              discretion, and quiet intention.
            </p>

            <div className="mt-10 rounded-md overflow-hidden shadow-md">
  <AnimatePresence mode="wait">
    <motion.img
      key={step}
      src={`${stepImages[step]}?auto=format&fit=crop&w=700&q=80`}
      alt={`${steps[step]} luxury residence`}
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      className="w-full h-40 object-cover"
    />
  </AnimatePresence>
</div>
    
          </div>


          <div className="space-y-4 flex flex-col items-start mt-auto">
            {steps.map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full transition ${
                    index <= step ? "bg-stone-900" : "bg-stone-300"
                  }`}
                />
                <span
                  className={`text-[10px] uppercase tracking-[0.25em] text-left ${
                    index === step ? "text-stone-900" : "text-stone-400"
                  }`}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
    
          <div className="flex justify-center items-center py-10">
            <div className="relative w-[75%] h-[65%] aspect-[3/4] overflow-hidden shadow-xl">
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

          <form onSubmit={handleSubmit}>
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
                      We begin with you. Kindly share your details so your
                      dedicated concierge may communicate with ease, discretion,
                      and according to your preferred method.
                    </p>

                    <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
                      <div className="relative">
                        <label className={labelStyles}>Full Name</label>
                        <input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={inputStyles}
                          placeholder="Your name"
                        />
                        {errors.fullName && (
                          <p className={errorStyles}>{errors.fullName}</p>
                        )}
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Email Address</label>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={inputStyles}
                          placeholder="you@example.com"
                        />
                        {errors.email && (
                          <p className={errorStyles}>{errors.email}</p>
                        )}
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Phone Number</label>
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={inputStyles}
                          placeholder="Preferred contact number"
                        />
                        {errors.phone && (
                          <p className={errorStyles}>{errors.phone}</p>
                        )}
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Preferred Contact</label>
                        <select
                          name="preferredContact"
                          value={formData.preferredContact}
                          onChange={handleChange}
                          className={`${inputStyles} appearance-none cursor-pointer`}
                        >
                          <option>Email</option>
                          <option>Phone</option>
                          <option>Text Message</option>
                        </select>
                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute bottom-3 right-0 text-stone-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-10">
                    <p className="text-sm font-light leading-relaxed text-stone-500">
                      A portrait of your home. Understanding the scale, layout,
                      and access of your residence allows us to prepare a service
                      approach that is seamless from arrival to completion.
                    </p>

                    <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
                      <div className="relative">
                        <label className={labelStyles}>Service Type</label>
                        <select
                          name="serviceType"
                          value={formData.serviceType}
                          onChange={handleChange}
                          className={`${inputStyles} appearance-none cursor-pointer`}
                        >
                          <option>Recurring Stewardship</option>
                          <option>Deep Restoration</option>
                          <option>Move-In / Move-Out Care</option>
                          <option>Special Event Recovery</option>
                        </select>
                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute bottom-3 right-0 text-stone-300"
                        />
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Square Footage</label>
                        <input
                          name="squareFootage"
                          value={formData.squareFootage}
                          onChange={handleChange}
                          className={inputStyles}
                          placeholder="Approx. sq ft"
                        />
                        {errors.squareFootage && (
                          <p className={errorStyles}>{errors.squareFootage}</p>
                        )}
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Bedrooms</label>
                        <input
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleChange}
                          className={inputStyles}
                          placeholder="Number of bedrooms"
                        />
                        {errors.bedrooms && (
                          <p className={errorStyles}>{errors.bedrooms}</p>
                        )}
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Bathrooms</label>
                        <input
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleChange}
                          className={inputStyles}
                          placeholder="Number of bathrooms"
                        />
                        {errors.bathrooms && (
                          <p className={errorStyles}>{errors.bathrooms}</p>
                        )}
                      </div>

                      <div className="relative md:col-span-2">
                        <label className={labelStyles}>Access Notes</label>
                        <textarea
                          name="accessNotes"
                          value={formData.accessNotes}
                          onChange={handleChange}
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
                      The atmosphere you wish to return to. From product
                      selections to scent and finishing touches, your preferences
                      guide a space that feels considered, balanced, and
                      distinctly yours.
                    </p>

                    <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
                      <div className="relative">
                        <label className={labelStyles}>Product Preference</label>
                        <select
                          name="productPreference"
                          value={formData.productPreference}
                          onChange={handleChange}
                          className={`${inputStyles} appearance-none cursor-pointer`}
                        >
                          <option>Eco-Friendly / Non-Toxic</option>
                          <option>Hypoallergenic</option>
                          <option>Fragrance-Free</option>
                          <option>Standard Products</option>
                          <option>I Will Provide Products</option>
                        </select>
                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute bottom-3 right-0 text-stone-300"
                        />
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Scent Profile</label>
                        <select
                          name="scentProfile"
                          value={formData.scentProfile}
                          onChange={handleChange}
                          className={`${inputStyles} appearance-none cursor-pointer`}
                        >
                          <option>Neutral / No Scent</option>
                          <option>Linen & White Tea</option>
                          <option>Warm Amber</option>
                          <option>Fresh Citrus</option>
                          <option>Custom Profile</option>
                        </select>
                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute bottom-3 right-0 text-stone-300"
                        />
                      </div>

                      <div className="relative md:col-span-2">
                        <label className={labelStyles}>Priority Areas</label>
                        <textarea
                          name="priorityAreas"
                          value={formData.priorityAreas}
                          onChange={handleChange}
                          className={`${inputStyles} min-h-24 resize-none`}
                          placeholder="Kitchen, primary suite, marble surfaces, guest areas, laundry room..."
                        />
                        {errors.priorityAreas && (
                          <p className={errorStyles}>{errors.priorityAreas}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-10">
                    <p className="text-sm font-light leading-relaxed text-stone-500">
                      Care, without compromise. Please share any sensitivities,
                      conditions, or restrictions so we may safeguard your
                      environment with the utmost attention and respect.
                    </p>

                    <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
                      <div className="relative">
                        <label className={labelStyles}>Allergy Concerns</label>
                        <select
                          name="allergyConcerns"
                          value={formData.allergyConcerns}
                          onChange={handleChange}
                          className={`${inputStyles} appearance-none cursor-pointer`}
                        >
                          <option>No Known Sensitivities</option>
                          <option>Fragrance Sensitivity</option>
                          <option>Bleach Sensitivity</option>
                          <option>Ammonia Sensitivity</option>
                          <option>Multiple Sensitivities</option>
                        </select>
                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute bottom-3 right-0 text-stone-300"
                        />
                      </div>

                      <div className="relative">
                        <label className={labelStyles}>Pets in Residence</label>
                        <select
                          name="pets"
                          value={formData.pets}
                          onChange={handleChange}
                          className={`${inputStyles} appearance-none cursor-pointer`}
                        >
                          <option>No Pets</option>
                          <option>Dog</option>
                          <option>Cat</option>
                          <option>Multiple Pets</option>
                          <option>Other</option>
                        </select>
                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute bottom-3 right-0 text-stone-300"
                        />
                      </div>

                      <div className="relative md:col-span-2">
                        <label className={labelStyles}>Strict Avoidances</label>
                        <textarea
                          name="strictAvoidances"
                          value={formData.strictAvoidances}
                          onChange={handleChange}
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
                      Your request will be thoughtfully reviewed before
                      confirmation. A concierge will follow up with availability,
                      final details, and any necessary considerations.
                    </p>

                    <div className="grid gap-4">
                      {[
                        "Detailed residence profile received",
                        "Refined service preferences recorded",
                        "Sensitivities and considerations noted",
                        "Concierge review required before confirmation",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between border border-stone-100 bg-white/40 px-5 py-4"
                        >
                          <span className="text-sm font-light text-stone-600">
                            {item}
                          </span>
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
                        Discretion is fundamental to our service. All information
                        shared is held in strict confidence and used solely to
                        curate a service experience that reflects the standards
                        of your home.
                      </p>
                    </div>

                    {submitError && (
                      <p className="text-sm text-red-500">{submitError}</p>
                    )}

                    {successMessage && (
                      <p className="text-sm text-green-600">{successMessage}</p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex flex-col-reverse gap-4 border-t border-stone-100 pt-8 md:flex-row md:items-center md:justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0 || isSubmitting}
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
                  disabled={isSubmitting}
                  className="group relative bg-[#1A1A1A] px-10 py-4 text-[10px] font-bold uppercase tracking-[0.35em] text-white overflow-hidden disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-4 transition-all group-hover:gap-6">
                    {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                    <ArrowRight size={14} />
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