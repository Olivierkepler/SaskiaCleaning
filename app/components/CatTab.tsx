"use client";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { normalizeReferralCode, parseReferralCodeFromSearchParams } from "@/app/lib/referrals";
import {
  applyBookingPrefillOnce,
  formatSavedAddressForBooking,
  matchServiceAreaFromAddress,
  type BookingPrefill,
} from "@/app/lib/booking-prefill";
import { useLocale, useTranslations } from "next-intl";
import type {
  ReferralValidationState,
  ServiceIndex,
  StateKey,
} from "./estimator/types";
import {
  LOCATIONS,
  SCROLL_VIEWPORT,
  slideLeft,
} from "./estimator/constants";
import {
  buildCommercialGalleryImages,
  buildDeepCleanGalleryImages,
  buildMoveOutGalleryImages,
  buildStandardGalleryImages,
  formatBookingDateForApi,
  formatDate,
  getBookingRoomCounts,
} from "./estimator/utils";
import { BookingModal } from "./estimator/booking/BookingModal";
import { ServiceSelector } from "./estimator/ServiceSelector";
import { SERVICES } from "./estimator/services";
import { EstimatorSearchBar } from "./estimator/EstimatorSearchBar";
import { EstimateSummaryBar } from "./estimator/EstimateSummaryBar";
import { EstimatorSidebar } from "./estimator/EstimatorSidebar";
import { CustomizationPanel } from "./estimator/CustomizationPanel";
import { EstimatorHeader } from "./estimator/EstimatorHeader";
import { useEstimatorAvailability } from "./estimator/hooks/useEstimatorAvailability";
import { buildBookingPayload } from "./estimator/booking/bookingWorkflow";
import { useBookingSubmission } from "./estimator/hooks/useBookingSubmission";

function getBookingRequirementsMessage(
  hasLocation: boolean,
  hasDate: boolean,
  hasTime: boolean,
): string {
  const missing: string[] = [];
  if (!hasLocation) missing.push("a location");
  if (!hasDate) missing.push("a date");
  if (!hasTime) missing.push("an available time");
  if (missing.length === 0) return "";
  if (missing.length === 1) return `Please select ${missing[0]}.`;
  if (missing.length === 2) return `Please select ${missing[0]} and ${missing[1]}.`;
  return `Please select ${missing.slice(0, -1).join(", ")}, and ${missing[missing.length - 1]}.`;
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function CleaningEstimator({
bookingPrefill = null,
}: {
  bookingPrefill?: BookingPrefill | null;
} = {}) {
  const t = useTranslations("booking");
  const tEstimate = useTranslations("estimate");
  const locale = useLocale();
  const [serviceIdx, setServiceIdx] = useState<ServiceIndex>(0);
  const [prices, setPrices] = useState({ low: 144, mid: 180, high: 216 });
  const [locState, setLocState] = useState<StateKey>("MA");
  const [locCity, setLocCity] = useState("");
  const [locOpen, setLocOpen] = useState(false);
// Track explicit location selection for validation and date-driven expansion.
  const [locConfirmed, setLocConfirmed] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const svc = SERVICES[serviceIdx];
  const rootRef = useRef<HTMLElement>(null);
// Drives the shake animation + inline error state on required booking fields.
  const [locError, setLocError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [requiredFieldsMessage, setRequiredFieldsMessage] = useState("");
  const [frequency, setFrequency] = useState("One-time");
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [standardBedIdx, setStandardBedIdx] = useState(1);
  const [standardBathIdx, setStandardBathIdx] = useState(0);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [locationMode, setLocationMode] = useState<"saved" | "manual">("manual");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const prefillAppliedRef = useRef(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralValidation, setReferralValidation] =
    useState<ReferralValidationState>({ status: "idle" });
  const [referralLinkCode, setReferralLinkCode] = useState<string | null>(null);
  const urlPrefilledReferralCode = useRef<string | null>(null);
  const [standardSelectedAddons, setStandardSelectedAddons] = useState<Set<string>>(new Set());
  const applyPrefillSnapshot = useCallback(
    (force = false) => {
      if (!force && prefillAppliedRef.current) return;
      if (!bookingPrefill) {
        if (force) {
          setContactName("");
          setContactEmail("");
          setContactMobile("");
          setLocationMode("manual");
          setSelectedAddressId(null);
        }
        prefillAppliedRef.current = true;
        return;
      }
      const result = applyBookingPrefillOnce({
        alreadyApplied: false,
        prefill: bookingPrefill,
      });
      setContactName(result.contact.name);
      setContactEmail(result.contact.email);
      setContactMobile(result.contact.phone);
      setLocationMode(result.locationMode);
      setSelectedAddressId(result.selectedAddressId);
      prefillAppliedRef.current = true;
    },
    [bookingPrefill],
  );
  useEffect(() => {
    applyPrefillSnapshot(false);
  }, [applyPrefillSnapshot]);
  const handleSelectSavedAddress = useCallback(
    (addressId: string) => {
      const address = bookingPrefill?.savedAddresses.find((a) => a.id === addressId);
      setLocationMode("saved");
      setSelectedAddressId(addressId);
      if (address) {
        const matched = matchServiceAreaFromAddress(address, LOCATIONS);
        if (matched) {
          setLocCity(matched.city);
          setLocState(matched.state as StateKey);
          setLocConfirmed(true);
        }
      }
    },
    [bookingPrefill],
  );
  const handleSelectManualLocation = useCallback(() => {
    setLocationMode("manual");
    setSelectedAddressId(null);
  }, []);
  const bookingLocationSummary = useMemo(() => {
    if (!locConfirmed) return "";
    if (locationMode === "saved" && selectedAddressId && bookingPrefill) {
      const address = bookingPrefill.savedAddresses.find(
        (entry) => entry.id === selectedAddressId,
      );
      if (address) return formatSavedAddressForBooking(address);
    }
    return `${locCity}, ${locState}`;
  }, [
    locationMode,
    selectedAddressId,
      bookingPrefill,
    locConfirmed,
    locCity,
    locState,
  ]);
  const emailReadOnly = Boolean(bookingPrefill?.email);
  const selectedDateOnly = useMemo(
    () => (date ? formatBookingDateForApi(date) ?? null : null),
    [date],
  );
  const availabilityRoomCounts = getBookingRoomCounts(
    serviceIdx,
    standardBedIdx,
    standardBathIdx,
  );
  const {
    availableSlots,
    slotsLoading,
    slotsError,
    estimatedDurationMinutes,
    slotRefreshMessage,
    bookingTime,
    bookingTimeLabel,
    selectTime: selectBookingTime,
    clearSelectedTime,
    refreshAvailability,
  } = useEstimatorAvailability({
    selectedDateOnly,
    serviceLabel: svc.label,
    ...availabilityRoomCounts,
  });
  const handleStandardAddonsChange = useCallback((addons: Set<string>) => {
    setStandardSelectedAddons(new Set(addons));
  }, []);
  const [deepCleanSelectedAddons, setDeepCleanSelectedAddons] = useState<Set<string>>(new Set());
  const handleDeepCleanAddonsChange = useCallback((addons: Set<string>) => {
    setDeepCleanSelectedAddons(new Set(addons));
  }, []);
  const standardGalleryImages = useMemo(
    () => buildStandardGalleryImages(standardSelectedAddons),
    [standardSelectedAddons],
  );
  const isDefaultGalleryOnly = standardGalleryImages.length === 1;
  const deepCleanGalleryImages = useMemo(
    () => buildDeepCleanGalleryImages(deepCleanSelectedAddons),
    [deepCleanSelectedAddons],
  );
  const isDeepCleanDefaultGalleryOnly = deepCleanGalleryImages.length === 1;
  const [moveOutSelectedAddons, setMoveOutSelectedAddons] = useState<Set<string>>(new Set());
  const handleMoveOutAddonsChange = useCallback((addons: Set<string>) => {
    setMoveOutSelectedAddons(new Set(addons));
  }, []);
  const moveOutGalleryImages = useMemo(
    () => buildMoveOutGalleryImages(moveOutSelectedAddons),
    [moveOutSelectedAddons],
  );
  const isMoveOutDefaultGalleryOnly = moveOutGalleryImages.length === 1;
  const [commercialSelectedAddons, setCommercialSelectedAddons] = useState<Set<string>>(new Set());
  const handleCommercialAddonsChange = useCallback((addons: Set<string>) => {
    setCommercialSelectedAddons(new Set(addons));
  }, []);
  const commercialGalleryImages = useMemo(
    () => buildCommercialGalleryImages(commercialSelectedAddons),
    [commercialSelectedAddons],
  );
  const isCommercialDefaultGalleryOnly = commercialGalleryImages.length === 1;
  const activeGallery = useMemo(() => {
    const galleries = [
      { galleryKey: "standard-gallery", images: standardGalleryImages, isDefaultOnly: isDefaultGalleryOnly },
      { galleryKey: "deep-clean-gallery", images: deepCleanGalleryImages, isDefaultOnly: isDeepCleanDefaultGalleryOnly },
      { galleryKey: "move-out-gallery", images: moveOutGalleryImages, isDefaultOnly: isMoveOutDefaultGalleryOnly },
      { galleryKey: "commercial-gallery", images: commercialGalleryImages, isDefaultOnly: isCommercialDefaultGalleryOnly },
    ];
    return galleries[serviceIdx]!;
  }, [
    serviceIdx,
    standardGalleryImages,
    isDefaultGalleryOnly,
    deepCleanGalleryImages,
    isDeepCleanDefaultGalleryOnly,
    moveOutGalleryImages,
    isMoveOutDefaultGalleryOnly,
    commercialGalleryImages,
    isCommercialDefaultGalleryOnly,
  ]);
  const mobileSearchSummary = `${locConfirmed ? `${locCity}, ${locState}` : "Select location"} · ${date ? formatDate(date, locale) : t("selectDate")} · ${optionsOpen ? t("detailsOpen") : t("customize")}`;
  useEffect(() => {
    const prefilledReferralCode = parseReferralCodeFromSearchParams(
      window.location.search,
    );
    if (!prefilledReferralCode) return;
    urlPrefilledReferralCode.current = prefilledReferralCode;
    setReferralLinkCode(prefilledReferralCode);
    setReferralCode(prefilledReferralCode);
  }, []);
  useEffect(() => {
    const trimmed = referralCode.trim();
    if (!trimmed) {
      setReferralValidation({ status: "idle" });
      return;
    }
    const normalizedCode = normalizeReferralCode(referralCode);
    if (!normalizedCode) {
      setReferralValidation({ status: "idle" });
      return;
    }
    setReferralValidation({ status: "checking" });
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/referral-codes/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode: normalizedCode }),
        });
        const data = (await response.json()) as {
          valid?: boolean;
          code?: string;
          friendDiscountAmount?: number;
        };
        if (!response.ok) {
          setReferralValidation({ status: "idle" });
          return;
        }
        if (data.valid && data.code && data.friendDiscountAmount != null) {
          setReferralValidation({
            status: "valid",
            code: data.code,
            friendDiscountAmount: data.friendDiscountAmount,
          });
          return;
        }
        setReferralValidation({ status: "invalid" });
      } catch {
        setReferralValidation({ status: "idle" });
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [referralCode]);
  const {
    bookingStatus,
    bookingErrorMessage,
    referralCodeError,
    submitBooking,
    resetSubmission,
    clearReferralCodeError,
  } = useBookingSubmission({
    createPayload: () =>
      buildBookingPayload({
        contactName,
        contactEmail,
        contactMobile,
        contactNotes,
        serviceIndex: serviceIdx,
        serviceLabel: svc.label,
        frequency,
        bookingLocationSummary,
        date,
        bookingTime,
        standardBedIndex: standardBedIdx,
        standardBathIndex: standardBathIdx,
        standardSelectedAddons,
        deepCleanSelectedAddons,
        moveOutSelectedAddons,
        commercialSelectedAddons,
        prices,
        referralCode,
        locationMode,
        selectedAddressId,
      }),
onSuccess: ({ clearReferralCodeError: clearSubmissionReferralError }) => {
      setContactNotes("");
      setReferralCode(urlPrefilledReferralCode.current ?? "");
      clearSubmissionReferralError();
      clearSelectedTime();
// Re-apply initial profile snapshot for a subsequent booking — never
// mutate saved profile/addresses from this submit.
      prefillAppliedRef.current = false;
      applyPrefillSnapshot(true);
      void refreshAvailability();
    },
onConflict: () => {
      clearSelectedTime();
      void refreshAvailability();
    },
  });
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setLocOpen(false);
        setDateOpen(false);
      }
    }
// Use "click" instead of "mousedown" so this fires in the same phase as
// the row/day onClick handlers inside the dropdowns. Mixing mousedown
// (here) with click (selection rows) created a race where the outside
// handler could interfere before the selection click ever registered,
// which is what made city/date selection appear to do nothing.
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);
  function handleLocField() {
    setDateOpen(false);
    setLocOpen((value) => !value);
  }
  function handleDateField() {
    setLocOpen(false);
    setDateOpen((value) => !value);
  }
  function handleCustomizeClick() {
    setLocError(false);
    setDateError(false);
    setRequiredFieldsMessage("");
    setLocOpen(false);
    setDateOpen(false);
    setOptionsOpen((value) => !value);
  }
  function handleCitySelect(city: string, state: StateKey) {
    setLocCity(city);
    setLocState(state);
    setLocOpen(false);
    setDateOpen(false);
    setLocConfirmed(true);
    setLocationMode("manual");
    setSelectedAddressId(null);
    setLocError(false);
    if (requiredFieldsMessage) {
      setRequiredFieldsMessage(
        getBookingRequirementsMessage(true, Boolean(date), Boolean(bookingTime)),
      );
      setDateError(!date);
    }
  }
  function handleDateSelect(d: Date) {
    setDate(d);
    setLocOpen(false);
    setDateOpen(false);
    setDateError(false);
    clearSelectedTime();
    if (requiredFieldsMessage) {
      setRequiredFieldsMessage(
        getBookingRequirementsMessage(locConfirmed, true, false),
      );
      setLocError(!locConfirmed);
    }
// Automatically open Customize once both required fields are valid.
    if (locConfirmed) {
      setLocError(false);
      if (!requiredFieldsMessage) setRequiredFieldsMessage("");
      setOptionsOpen(true);
    }
  }
  function handleBookingTimeSelect(time: string) {
    selectBookingTime(time);
    if (requiredFieldsMessage) {
      setRequiredFieldsMessage(
        getBookingRequirementsMessage(locConfirmed, Boolean(date), true),
      );
      setLocError(!locConfirmed);
      setDateError(!date);
    } else {
      setRequiredFieldsMessage("");
    }
  }
  function openBookingForm() {
    const hasLocation = locConfirmed && Boolean(locCity);
    const hasDate = Boolean(date);
    const hasTime = Boolean(bookingTime);
    const requirementMessage = getBookingRequirementsMessage(
      hasLocation,
      hasDate,
      hasTime,
    );
    if (requirementMessage) {
      setLocOpen(false);
      setDateOpen(false);
      setLocError(!hasLocation);
      setDateError(!hasDate);
      setShakeKey((value) => value + 1);
      setRequiredFieldsMessage(requirementMessage);
      setMobileSearchOpen(true);
      requestAnimationFrame(() => {
        document.getElementById("booking-requirements")?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      });
      return;
    }
    setLocError(false);
    setDateError(false);
    setRequiredFieldsMessage("");
    setBookingFormOpen(true);
    resetSubmission();
    clearReferralCodeError();
  }
  function closeBookingForm() {
    if (bookingStatus === "loading") return;
    setBookingFormOpen(false);
    resetSubmission();
    setReferralCode(urlPrefilledReferralCode.current ?? "");
    clearReferralCodeError();
  }
  function handleReferralCodeChange(value: string) {
    setReferralCode(value);
    if (referralCodeError) {
      clearReferralCodeError();
    }
  }
  const summaryExtras =
    serviceIdx === 0
      ? Array.from(standardSelectedAddons)
      : serviceIdx === 1
        ? Array.from(deepCleanSelectedAddons)
        : serviceIdx === 2
          ? Array.from(moveOutSelectedAddons)
          : Array.from(commercialSelectedAddons);
  function handleChatbotEstimateClick() {
    window.dispatchEvent(
      new CustomEvent("open-chatbot", {
        detail: {
          service: svc.label,
          location: locConfirmed ? `${locCity}, ${locState}` : undefined,
          date: date ? formatDate(date, locale) : undefined,
          frequency,
          extras: summaryExtras,
          estimateLow: prices.low,
          estimateMid: prices.mid,
          estimateHigh: prices.high,
        },
      }),
    );
  }
  const referralDiscountAmount =
    referralValidation.status === "valid"
      ? referralValidation.friendDiscountAmount
      : 0;
  const estimatedTotalAfterDiscount = Math.max(0, prices.mid - referralDiscountAmount);
  const isLinkReferralCodeActive =
    referralLinkCode != null &&
    referralCode.trim() !== "" &&
    normalizeReferralCode(referralCode) === referralLinkCode;
  const showReferralLinkSuccessBanner =
    isLinkReferralCodeActive && referralValidation.status === "valid";
  const showReferralLinkWarningBanner =
    isLinkReferralCodeActive && referralValidation.status === "invalid";
  return (
    <motion.section
id="quote"
ref={rootRef}
initial={{ opacity: 0, y: 70 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, amount: 0.25 }}
transition={{ duration: 0.7, ease: "easeOut" }}
className="overflow-x-hidden bg-white"
    >
      <EstimatorHeader
showReferralSuccess={showReferralLinkSuccessBanner}
showReferralWarning={showReferralLinkWarningBanner}
successfulReferralCode={
          referralValidation.status === "valid" ? referralValidation.code : ""
        }
referralDiscountAmount={referralDiscountAmount}
warningReferralCode={referralLinkCode}
      />
      <div
      className="
        mx-auto
        grid
        w-full
        max-w-[1440px]
        grid-cols-1
        items-center
        justify-center
        gap-8
        px-4
        py-12
        sm:px-6
        sm:py-16
        lg:grid-cols-[minmax(0,1.25fr)_minmax(420px,0.95fr)]
        lg:items-start
        lg:gap-10
        lg:px-8
        lg:py-12
        xl:grid-cols-[minmax(0,1.18fr)_minmax(500px,1fr)]
        xl:gap-14
        2xl:max-w-[1480px]
      "
    >
        {/* Left Column */}
        <div className="min-w-0 w-full">
          {/* Tabs */}
          <ServiceSelector
services={SERVICES}
selectedServiceIndex={serviceIdx}
onSelect={setServiceIdx}
          />
          {/* Main Card */}
          <motion.div
initial="hidden"
whileInView="visible"
viewport={SCROLL_VIEWPORT}
variants={slideLeft}
className="relative z-[1] overflow-visible rounded-[24px] border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(12,26,46,.04),0_18px_55px_rgba(12,26,46,.08)]"
          >
            {/* Search Bar */}
            <EstimatorSearchBar
locationState={locState}
locationCity={locCity}
locationOpen={locOpen}
locationConfirmed={locConfirmed}
locationError={locError}
selectedDate={date}
dateOpen={dateOpen}
dateError={dateError}
shakeKey={shakeKey}
optionsOpen={optionsOpen}
mobileSearchOpen={mobileSearchOpen}
mobileSearchSummary={mobileSearchSummary}
requiredFieldsMessage={requiredFieldsMessage}
estimatedDurationMinutes={estimatedDurationMinutes}
slotRefreshMessage={slotRefreshMessage}
slotsLoading={slotsLoading}
slotsError={slotsError}
availableSlots={availableSlots}
bookingTime={bookingTime}
dateLabel={t("date")}
dateValue={date ? formatDate(date, locale) : t("selectDate")}
customizeLabel={t("customize")}
selectTimeLabel={t("selectATime")}
loadingSlotsLabel={t("loadingSlots")}
noTimesLabel={t("noTimes")}
onToggleMobileSearch={() =>
                setMobileSearchOpen((value) => !value)
              }
onLocationFieldClick={handleLocField}
onDateFieldClick={handleDateField}
onCustomizeClick={handleCustomizeClick}
onLocationStateChange={setLocState}
onCitySelect={handleCitySelect}
onDateSelect={handleDateSelect}
onBookingTimeSelect={handleBookingTimeSelect}
            />
            {/* Active Panel: hidden by default, opened from the Options button */}
            <CustomizationPanel
selectedServiceIndex={serviceIdx}
optionsOpen={optionsOpen}
title={t("customizeYourClean")}
onPrice={setPrices}
frequency={frequency}
onFrequencyChange={setFrequency}
standardSelectedAddons={standardSelectedAddons}
onStandardSelectedAddonsChange={handleStandardAddonsChange}
standardBedIndex={standardBedIdx}
standardBathIndex={standardBathIdx}
onStandardBedIndexChange={setStandardBedIdx}
onStandardBathIndexChange={setStandardBathIdx}
deepCleanSelectedAddons={deepCleanSelectedAddons}
onDeepCleanSelectedAddonsChange={handleDeepCleanAddonsChange}
moveOutSelectedAddons={moveOutSelectedAddons}
onMoveOutSelectedAddonsChange={handleMoveOutAddonsChange}
commercialSelectedAddons={commercialSelectedAddons}
onCommercialSelectedAddonsChange={handleCommercialAddonsChange}
            />
            {/* Price Strip */}
            <EstimateSummaryBar
prices={prices}
locale={locale}
estimateRangeLabel={t("estimateRange")}
lowLabel={t("low")}
midLabel={t("mid")}
highLabel={t("high")}
chatbotLabel="Chat with our Assistant"
optionsOpen={optionsOpen}
bookLabel={svc.bookLabel}
onChatbotClick={handleChatbotEstimateClick}
onBookNow={openBookingForm}
            />
          </motion.div>
        </div>
        {/* right side */}
        <EstimatorSidebar
optionsOpen={optionsOpen}
serviceLabel={svc.label}
frequency={frequency}
          location={locConfirmed ? bookingLocationSummary : "Select location"}
date={date}
extras={summaryExtras}
prices={prices}
locale={locale}
estimateLabel={tEstimate("estimate")}
lowLabel={t("low")}
midLabel={t("mid")}
highLabel={t("high")}
galleryKey={activeGallery.galleryKey}
galleryImages={activeGallery.images}
isDefaultGalleryOnly={activeGallery.isDefaultOnly}
        />
      </div>
      <BookingModal
open={bookingFormOpen}
svc={svc}
bookingStatus={bookingStatus}
bookingErrorMessage={bookingErrorMessage}
contactName={contactName}
contactEmail={contactEmail}
contactMobile={contactMobile}
contactNotes={contactNotes}
referralCode={referralCode}
referralCodeError={referralCodeError}
referralValidation={referralValidation}
referralDiscountAmount={referralDiscountAmount}
estimatedTotalAfterDiscount={estimatedTotalAfterDiscount}
prices={prices}
locationSummary={bookingLocationSummary}
bookingPrefill={bookingPrefill}
locationMode={locationMode}
selectedAddressId={selectedAddressId}
emailReadOnly={emailReadOnly}
bookingTime={bookingTime}
bookingTimeLabel={bookingTimeLabel}
onClose={closeBookingForm}
onSubmit={submitBooking}
onNameChange={setContactName}
onEmailChange={setContactEmail}
onMobileChange={setContactMobile}
onNotesChange={setContactNotes}
onReferralCodeChange={handleReferralCodeChange}
onSelectSavedAddress={handleSelectSavedAddress}
onSelectManualLocation={handleSelectManualLocation}
      />
    </motion.section>
  );
}
