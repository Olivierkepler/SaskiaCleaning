import { z } from "zod";

export const TERMS_DOCUMENT_VERSION = "2026-06-04";
export const PRIVACY_DOCUMENT_VERSION = "2026-06-04";

const emailSchema = z
  .string()
  .trim()
  .min(1)
  .max(254)
  .email()
  .transform((value) => value.toLowerCase());

export const customerPasswordSchema = z.string().min(15).max(128);

export const registrationSchema = z
  .object({
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().min(1).max(60),
    email: emailSchema,
    password: customerPasswordSchema,
    confirmPassword: z.string().min(1).max(128),
    acceptTerms: z.literal(true),
    acceptPrivacy: z.literal(true),
  })
  .strict()
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const credentialsSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(128),
  })
  .strict();

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type CredentialsInput = z.infer<typeof credentialsSchema>;

export type NewCustomerIdentity = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

export type RegistrationRepository = {
  createCustomerWithCredentials(input: {
    email: string;
    name: string;
    passwordHash: string;
    termsVersion: string;
    privacyVersion: string;
  }): Promise<NewCustomerIdentity>;
};

export type PasswordHasher = {
  hash(password: string): Promise<string>;
};

export async function registerCustomer(
  rawInput: unknown,
  repository: RegistrationRepository,
  passwordHasher: PasswordHasher,
): Promise<NewCustomerIdentity> {
  const input = registrationSchema.parse(rawInput);
  const passwordHash = await passwordHasher.hash(input.password);
  const name = `${input.firstName} ${input.lastName}`;

  return repository.createCustomerWithCredentials({
    email: input.email,
    name,
    passwordHash,
    termsVersion: TERMS_DOCUMENT_VERSION,
    privacyVersion: PRIVACY_DOCUMENT_VERSION,
  });
}

export type GoogleIdentityResolution =
  | { kind: "provider"; customerId: string }
  | { kind: "email"; customerId: string }
  | { kind: "create" }
  | { kind: "reject_password_customer" };

export function resolveGoogleIdentity(input: {
  providerCustomerId: string | null;
  emailCustomerId: string | null;
  emailCustomerHasPassword: boolean;
}): GoogleIdentityResolution {
  if (input.providerCustomerId) {
    return { kind: "provider", customerId: input.providerCustomerId };
  }
  if (input.emailCustomerId && input.emailCustomerHasPassword) {
    return { kind: "reject_password_customer" };
  }
  if (input.emailCustomerId) {
    return { kind: "email", customerId: input.emailCustomerId };
  }
  return { kind: "create" };
}

export function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

export type CredentialRecord = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  passwordHash: string | null;
  emailVerifiedAt: Date | string | null;
  authVersion: number;
};

export async function authenticateCredentialInput(
  rawCredentials: unknown,
  findByEmail: (normalizedEmail: string) => Promise<CredentialRecord | null>,
  verifyPassword: (password: string, hash: string | null) => Promise<boolean>,
): Promise<Omit<CredentialRecord, "passwordHash"> | null> {
  const parsed = credentialsSchema.safeParse(rawCredentials);
  if (!parsed.success) return null;

  const record = await findByEmail(parsed.data.email);
  const valid = await verifyPassword(
    parsed.data.password,
    record?.passwordHash ?? null,
  );
  if (!record || !record.passwordHash || !valid) return null;

  return {
    id: record.id,
    email: record.email,
    name: record.name,
    image: record.image,
    emailVerifiedAt: record.emailVerifiedAt ?? null,
    authVersion: record.authVersion,
  };
}

export function credentialsTokenIdentity(user: {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  authVersion?: number;
}) {
  return {
    customerId: user.id,
    email: user.email ?? undefined,
    name: user.name ?? null,
    picture: user.image ?? null,
    authMethod: "credentials" as const,
    authVersion: user.authVersion,
  };
}

export function googleTokenIdentity() {
  return { authMethod: "google" as const };
}

export type CustomerAuthMethod = "google" | "credentials";

export function hasValidCustomerSessionProvenance(input: {
  customerId: unknown;
  authMethod: unknown;
  authVersion?: unknown;
  currentAuthVersion?: unknown;
}): boolean {
  if (typeof input.customerId !== "string" || input.customerId.length === 0) return false;
  if (input.authMethod === "google") return true;
  if (input.authMethod !== "credentials") return false;
  return Number.isSafeInteger(input.authVersion) &&
    Number.isSafeInteger(input.currentAuthVersion) &&
    input.authVersion === input.currentAuthVersion;
}

export function customerIdForSession(input: {
  customerId?: unknown;
  authMethod?: unknown;
  authVersion?: unknown;
}): string {
  if (typeof input.customerId !== "string" || !input.customerId) return "";
  if (input.authMethod === "google") return input.customerId;
  if (input.authMethod === "credentials" && Number.isSafeInteger(input.authVersion)) {
    return input.customerId;
  }
  return "";
}
