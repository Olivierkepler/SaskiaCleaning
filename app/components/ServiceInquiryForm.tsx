"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  preferredContact: string;
  serviceType: string;
  squareFootage: string;
  bedrooms: string;
  bathrooms: string;
  accessNotes: string;
  productPreference: string;
  scentProfile: string;
  priorityAreas: string;
  allergyConcerns: string;
  pets: string;
  strictAvoidances: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

type ServiceInquiryFormProps = {
  onClose?: () => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ["Identity", "Residence", "Preferences", "Sensitivities", "Review"] as const;

// const IMAGES: string[] = [
//   "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
//   // "/images/familiy.jpg",
//   "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
//   "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
//   "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
//   "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&w=800&q=80",
// ];
const IMAGES: string[] = [
  "/images/family.jpg",      // fix typo: familiy → family
  "/images/residence.jpg",
  "/images/detergante.jpg",
  "/images/kit.png",
  "/images/cleaning4.jpg",
];

const INITIAL_DATA: FormData = {
  fullName: "", email: "", phone: "", preferredContact: "Email",
  serviceType: "Recurring Stewardship", squareFootage: "", bedrooms: "", bathrooms: "", accessNotes: "",
  productPreference: "Eco-Friendly / Non-Toxic", scentProfile: "Neutral / No Scent", priorityAreas: "",
  allergyConcerns: "No Known Sensitivities", pets: "No Pets", strictAvoidances: "",
};

// ─── Shared field components ──────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "block",
      fontSize: "9px",
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: "#A09890",
      fontWeight: 500,
      marginBottom: "8px",
    }}>
      {children}
    </span>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p style={{ fontSize: "11px", color: "#B03A2E", marginTop: "5px" }}>{msg}</p>;
}

const baseInputStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderRadius: 0,
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  fontWeight: 300,
  color: "#1A1A1A",
  padding: "10px 0",
  transition: "border-color 0.2s",
  WebkitAppearance: "none",
};

type InputProps = {
  label: string;
  name: keyof FormData;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};

function Input({ label, name, type = "text", placeholder, value, onChange, error }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <Label>{label}</Label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...baseInputStyle,
          borderBottom: `1px solid ${error ? "#B03A2E" : focused ? "#1A1A1A" : "#DDD9D5"}`,
        }}
      />
      <FieldError msg={error} />
    </div>
  );
}

type SelectProps = {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
};

function Select({ label, name, value, onChange, options }: SelectProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Label>{label}</Label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...baseInputStyle,
          borderBottom: `1px solid ${focused ? "#1A1A1A" : "#DDD9D5"}`,
          cursor: "pointer",
          paddingRight: "20px",
          appearance: "none",
          WebkitAppearance: "none",
        }}
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="#C5BFB9" strokeWidth="1.5"
        style={{ position: "absolute", right: 2, bottom: 12, pointerEvents: "none" }}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

type TextareaProps = {
  label: string;
  name: keyof FormData;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
};

function Textarea({ label, name, placeholder, value, onChange, error }: TextareaProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <Label>{label}</Label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={3}
        style={{
          ...baseInputStyle,
          borderBottom: `1px solid ${error ? "#B03A2E" : focused ? "#1A1A1A" : "#DDD9D5"}`,
          resize: "none",
          lineHeight: 1.65,
          minHeight: "72px",
        }}
      />
      <FieldError msg={error} />
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "28px 32px",
    }}>
      {children}
    </div>
  );
}

function Desc({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "13px", fontWeight: 300, color: "#8A8078", lineHeight: 1.75, marginBottom: "28px" }}>
      {children}
    </p>
  );
}

// ─── Step content ─────────────────────────────────────────────────────────────

type StepProps = {
  data: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: FormErrors;
};

function StepIdentity({ data, onChange, errors }: StepProps) {
  return (
    <>
      <Desc>
        We begin with you. Kindly share your details so your dedicated concierge may communicate with ease, discretion, and according to your preferred method.
      </Desc>
      <Grid>
        <Input label="Full Name" name="fullName" placeholder="Your name" value={data.fullName} onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void} error={errors.fullName} />
        <Input label="Email Address" name="email" type="email" placeholder="you@example.com" value={data.email} onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void} error={errors.email} />
        <Input label="Phone Number" name="phone" type="tel" placeholder="Preferred contact number" value={data.phone} onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void} error={errors.phone} />
        <Select label="Preferred Contact" name="preferredContact" value={data.preferredContact} onChange={onChange as (e: ChangeEvent<HTMLSelectElement>) => void} options={["Email", "Phone", "Text Message"]} />
      </Grid>
    </>
  );
}

function StepResidence({ data, onChange, errors }: StepProps) {
  return (
    <>
      <Desc>
        A portrait of your home. Understanding the scale, layout, and access allows us to prepare a service approach that is seamless from arrival to completion.
      </Desc>
      <Grid>
        <Select label="Service Type" name="serviceType" value={data.serviceType} onChange={onChange as (e: ChangeEvent<HTMLSelectElement>) => void} options={["Recurring Stewardship", "Deep Restoration", "Move-In / Move-Out Care", "Special Event Recovery"]} />
        <Input label="Square Footage" name="squareFootage" placeholder="Approx. sq ft" value={data.squareFootage} onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void} error={errors.squareFootage} />
        <Input label="Bedrooms" name="bedrooms" placeholder="Number of bedrooms" value={data.bedrooms} onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void} error={errors.bedrooms} />
        <Input label="Bathrooms" name="bathrooms" placeholder="Number of bathrooms" value={data.bathrooms} onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void} error={errors.bathrooms} />
        <Textarea label="Access Notes" name="accessNotes" placeholder="Parking, gate code, doorman, elevator, private entrance…" value={data.accessNotes} onChange={onChange as (e: ChangeEvent<HTMLTextAreaElement>) => void} />
      </Grid>
    </>
  );
}

function StepPreferences({ data, onChange, errors }: StepProps) {
  return (
    <>
      <Desc>
        The atmosphere you wish to return to. Your preferences guide a space that feels considered, balanced, and distinctly yours.
      </Desc>
      <Grid>
        <Select label="Product Preference" name="productPreference" value={data.productPreference} onChange={onChange as (e: ChangeEvent<HTMLSelectElement>) => void} options={["Eco-Friendly / Non-Toxic", "Hypoallergenic", "Fragrance-Free", "Standard Products", "I Will Provide Products"]} />
        <Select label="Scent Profile" name="scentProfile" value={data.scentProfile} onChange={onChange as (e: ChangeEvent<HTMLSelectElement>) => void} options={["Neutral / No Scent", "Linen & White Tea", "Warm Amber", "Fresh Citrus", "Custom Profile"]} />
        <Textarea label="Priority Areas" name="priorityAreas" placeholder="Kitchen, primary suite, marble surfaces, guest areas…" value={data.priorityAreas} onChange={onChange as (e: ChangeEvent<HTMLTextAreaElement>) => void} error={errors.priorityAreas} />
      </Grid>
    </>
  );
}

function StepSensitivities({ data, onChange }: Omit<StepProps, "errors">) {
  return (
    <>
      <Desc>
        Care, without compromise. Please share any sensitivities or restrictions so we may safeguard your environment with the utmost attention and respect.
      </Desc>
      <Grid>
        <Select label="Allergy Concerns" name="allergyConcerns" value={data.allergyConcerns} onChange={onChange as (e: ChangeEvent<HTMLSelectElement>) => void} options={["No Known Sensitivities", "Fragrance Sensitivity", "Bleach Sensitivity", "Ammonia Sensitivity", "Multiple Sensitivities"]} />
        <Select label="Pets in Residence" name="pets" value={data.pets} onChange={onChange as (e: ChangeEvent<HTMLSelectElement>) => void} options={["No Pets", "Dog", "Cat", "Multiple Pets", "Other"]} />
        <Textarea label="Strict Avoidances" name="strictAvoidances" placeholder="Products, rooms, materials, surfaces, scents, or instructions to strictly avoid…" value={data.strictAvoidances} onChange={onChange as (e: ChangeEvent<HTMLTextAreaElement>) => void} />
      </Grid>
    </>
  );
}

type ReviewProps = {
  submitError: string;
  successMessage: string;
};

function StepReview({ submitError, successMessage }: ReviewProps) {
  const items = [
    "Detailed residence profile received",
    "Refined service preferences recorded",
    "Sensitivities and considerations noted",
    "Concierge review required before confirmation",
  ];
  return (
    <>
      <Desc>
        Your request will be thoughtfully reviewed before confirmation. A concierge will follow up with availability, final details, and any necessary considerations.
      </Desc>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px" }}>
        {items.map((item) => (
          <div key={item} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            border: "1px solid #EDEAE6", background: "rgba(255,255,255,0.55)",
            padding: "14px 18px",
          }}>
            <span style={{ fontSize: "13px", fontWeight: 300, color: "#5A5048" }}>{item}</span>
            <span style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#A09890" }}>Included</span>
          </div>
        ))}
      </div>
      <div style={{ borderLeft: "2px solid #DDD9D5", paddingLeft: "18px" }}>
        <p style={{ fontSize: "9.5px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#A09890", marginBottom: "8px" }}>
          Confidentiality
        </p>
        <p style={{ fontSize: "13px", fontWeight: 300, color: "#7A7068", lineHeight: 1.7 }}>
          Discretion is fundamental to our service. All information shared is held in strict confidence and used solely to curate a service experience that reflects the standards of your home.
        </p>
      </div>
      {submitError && <p style={{ fontSize: "13px", color: "#B03A2E", marginTop: "16px" }}>{submitError}</p>}
      {successMessage && <p style={{ fontSize: "13px", color: "#2A6A3A", marginTop: "16px", fontWeight: 300 }}>{successMessage}</p>}
    </>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function ServiceInquiryForm({ onClose }: ServiceInquiryFormProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => { setImgLoaded(false); }, [step]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
    setSuccessMessage("");
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (step === 0) {
      if (!formData.fullName.trim()) e.fullName = "Full name is required.";
      if (!formData.email.trim()) e.email = "Email is required.";
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) e.email = "Enter a valid email address.";
      if (!formData.phone.trim()) e.phone = "Phone number is required.";
    }
    if (step === 1) {
      if (!formData.squareFootage.trim()) e.squareFootage = "Square footage is required.";
      if (!formData.bedrooms.trim()) e.bedrooms = "Bedrooms are required.";
      if (!formData.bathrooms.trim()) e.bathrooms = "Bathrooms are required.";
    }
    if (step === 2) {
      if (!formData.priorityAreas.trim()) e.priorityAreas = "Please enter at least one priority area.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validate()) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const prevStep = () => { setSubmitError(""); setSuccessMessage(""); setStep((s) => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");
    try {
      const res = await fetch("/api/service-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSuccessMessage("Your request has been received. A concierge will be in contact shortly to confirm the next steps.");
    } catch {
      setSubmitError("We were unable to complete your request at this time. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLast = step === STEPS.length - 1;

  const stepComponents: React.ReactNode[] = [
    <StepIdentity data={formData} onChange={handleChange} errors={errors} />,
    <StepResidence data={formData} onChange={handleChange} errors={errors} />,
    <StepPreferences data={formData} onChange={handleChange} errors={errors} />,
    <StepSensitivities data={formData} onChange={handleChange} />,
    <StepReview submitError={submitError} successMessage={successMessage} />,
  ];

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: "100vh",
      background: "#FAFAF8",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
        z-index: 100;
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .sif-btn-next:hover { background: #333 !important; }
        .sif-btn-back:hover { color: #1A1A1A !important; }
        .sif-step-enter { animation: sifSlideIn 0.32s cubic-bezier(0.19,1,0.22,1) both; }
        @keyframes sifSlideIn { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
        @media (max-width: 799px) { .sif-sidebar { display:none !important; } }
        @media (min-width: 800px) { .sif-mobile-bar { display:none !important; } .sif-main { padding: 52px 56px !important; min-height: 100vh; } }
        @media (max-width: 499px) { .sif-step-title { font-size: 34px !important; } .sif-main { padding: 28px 22px 40px !important; } }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: "1080px",
        background: "#FCFAF8",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 40px 100px -20px rgba(0,0,0,0.14)",
      }}>
        {/* Progress bar */}
        <div style={{
          position: "absolute", top: 0, left: 0,
          height: "2px", background: "#1A1A1A",
          width: `${((step + 1) / STEPS.length) * 100}%`,
          transition: "width 0.6s cubic-bezier(0.19,1,0.22,1)",
          zIndex: 10,
        }} />

        <div style={{ display: "flex" }}>

          {/* ── SIDEBAR ── */}
          <aside className="sif-sidebar" style={{
            width: "320px",
            minWidth: "320px",
            background: "#F5F1EC",
            padding: "48px 36px",
            display: "flex",
            flexDirection: "column",
          }}>
            <div>
              <p style={{ fontSize: "9px", letterSpacing: "0.5em", textTransform: "uppercase", color: "#9B9088", fontWeight: 500 }}>
                Private Concierge
              </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "46px", fontWeight: 300, fontStyle: "italic",
                color: "#1A1A1A", lineHeight: 1, marginTop: "18px",
              }}>
                Curated Care.
              </h2>
              <p style={{ fontSize: "13px", fontWeight: 300, lineHeight: 1.75, color: "#8A8078", marginTop: "14px" }}>
                A confidential introduction to your residence, preferences, sensitivities, and desired atmosphere—prepared with precision and quiet intention.
              </p>
              <div style={{ marginTop: "24px", overflow: "hidden", height: "180px" }}>
           
              <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
<Image
  key={step}
  src={IMAGES[step]}
  alt=""
  fill
  style={{ objectFit: "cover" }}
  onLoad={() => setImgLoaded(true)}
  className={`transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
/>
</div>
              </div>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "36px", display: "flex", flexDirection: "column", gap: "13px" }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                  <div style={{
                    width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0,
                    background: i <= step ? "#1A1A1A" : "#D5CECA",
                    transition: "background 0.3s",
                  }} />
                  <span style={{
                    fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase",
                    color: i === step ? "#1A1A1A" : "#B5ADA8",
                    fontWeight: i === step ? 500 : 400,
                    transition: "color 0.3s",
                  }}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

            {/* Mobile top bar */}
            <div className="sif-mobile-bar" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 22px 14px",
              background: "#F5F1EC",
              borderBottom: "1px solid #EDE8E3",
            }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic", fontSize: "20px", fontWeight: 300, color: "#1A1A1A",
              }}>
                Curated Care.
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {STEPS.map((_, i) => (
                  <div key={i} style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: i <= step ? "#1A1A1A" : "#D5CECA",
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
            </div>

            <div className="sif-main" style={{
              padding: "36px 28px 44px",
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}>
              {/* Step header */}
              <div style={{
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", marginBottom: "28px",
              }}>
                <div>
                  <p style={{ fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase", color: "#A09890", fontWeight: 500 }}>
                    Step {step + 1} of {STEPS.length}
                  </p>
                  <h3 className="sif-step-title" style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "40px", fontWeight: 400, color: "#1A1A1A",
                    lineHeight: 1.05, marginTop: "8px",
                  }}>
                    {STEPS[step]}
                  </h3>
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    type="button"
                    style={{
                      width: "38px", height: "38px", borderRadius: "50%",
                      border: "1px solid #DDD9D5", background: "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: "#A09890", flexShrink: 0,
                      marginTop: "4px",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Animated step body */}
              <div className="sif-step-enter" key={step} style={{ flex: 1 }}>
                {stepComponents[step]}
              </div>

              {/* Footer */}
              <div style={{
                marginTop: "40px", paddingTop: "28px",
                borderTop: "1px solid #EDEAE6",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: "16px",
                flexWrap: "wrap",
              }}>
                <button
                  className="sif-btn-back"
                  type="button"
                  onClick={prevStep}
                  disabled={step === 0 || isSubmitting}
                  style={{
                    background: "none", border: "none",
                    cursor: step === 0 ? "default" : "pointer",
                    display: "flex", alignItems: "center", gap: "10px",
                    fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
                    color: "#A09890", fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    padding: 0, opacity: step === 0 ? 0.3 : 1,
                    transition: "color 0.2s",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back
                </button>

                <button
                  className="sif-btn-next"
                  type="button"
                  onClick={isLast ? handleSubmit : nextStep}
                  disabled={isSubmitting}
                  style={{
                    background: "#1A1A1A", color: "#fff",
                    border: "none", cursor: "pointer",
                    padding: "16px 32px",
                    fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    display: "flex", alignItems: "center", gap: "12px",
                    transition: "background 0.25s",
                    opacity: isSubmitting ? 0.55 : 1,
                  }}
                >
                  {isLast ? (isSubmitting ? "Submitting…" : "Submit Inquiry") : "Continue"}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
