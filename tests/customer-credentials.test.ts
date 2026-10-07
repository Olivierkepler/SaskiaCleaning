import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  authenticateCredentialInput,
  credentialsSchema,
  credentialsTokenIdentity,
  isUniqueConstraintViolation,
  PRIVACY_DOCUMENT_VERSION,
  registerCustomer,
  registrationSchema,
  resolveGoogleIdentity,
  TERMS_DOCUMENT_VERSION,
  type RegistrationRepository,
} from "../app/lib/customer-credentials-pure";
import {
  hashCustomerPassword,
  passwordHashParameters,
  verifyCustomerPassword,
} from "../app/lib/customer-password";
import { isGoogleEmailVerified, normalizeCustomerEmail } from "../app/lib/customer-auth-pure";

const validRegistration = {
  firstName: "  Ada ",
  lastName: " Lovelace  ",
  email: " ADA@Example.COM ",
  password: "a long passphrase for Saskia",
  confirmPassword: "a long passphrase for Saskia",
  acceptTerms: true,
  acceptPrivacy: true,
};

function fakeRepository() {
  const customers = new Map<string, { id: string; hash: string; name: string; emailVerified: null }>();
  let nextId = 1;
  const repository: RegistrationRepository = {
    async createCustomerWithCredentials(input) {
      if (customers.has(input.email)) {
        throw Object.assign(new Error("duplicate"), { code: "23505" });
      }
      const row = {
        id: `customer-${nextId++}`,
        hash: input.passwordHash,
        name: input.name,
        emailVerified: null,
      };
      customers.set(input.email, row);
      return { id: row.id, email: input.email, name: input.name, image: null };
    },
  };
  return { repository, customers };
}

describe("registration validation", () => {
  it("accepts valid registration, passphrases, and normalized names/email", () => {
    const parsed = registrationSchema.parse(validRegistration);
    assert.equal(parsed.firstName, "Ada");
    assert.equal(parsed.lastName, "Lovelace");
    assert.equal(parsed.email, "ada@example.com");
    assert.equal(parsed.password, validRegistration.password);
  });

  it("rejects invalid email", () => {
    assert.equal(registrationSchema.safeParse({ ...validRegistration, email: "bad" }).success, false);
  });

  it("enforces 15 through 128 characters without composition rules", () => {
    assert.equal(registrationSchema.safeParse({ ...validRegistration, password: "short", confirmPassword: "short" }).success, false);
    assert.equal(registrationSchema.safeParse({ ...validRegistration, password: "x".repeat(129), confirmPassword: "x".repeat(129) }).success, false);
    const passphrase = "many ordinary words make a strong passphrase";
    assert.equal(registrationSchema.safeParse({ ...validRegistration, password: passphrase, confirmPassword: passphrase }).success, true);
  });

  it("rejects mismatch, unknown fields, missing consent, and untrusted identity fields", () => {
    assert.equal(registrationSchema.safeParse({ ...validRegistration, confirmPassword: "different password" }).success, false);
    assert.equal(registrationSchema.safeParse({ ...validRegistration, surprise: "x" }).success, false);
    assert.equal(registrationSchema.safeParse({ ...validRegistration, acceptTerms: false }).success, false);
    assert.equal(registrationSchema.safeParse({ ...validRegistration, acceptPrivacy: false }).success, false);
    for (const key of ["customerId", "role", "admin", "emailVerified", "termsVersion", "privacyVersion"]) {
      assert.equal(registrationSchema.safeParse({ ...validRegistration, [key]: "attacker-value" }).success, false);
    }
  });
});

describe("registration service", () => {
  it("normalizes email/names and passes only a hash plus server-owned legal versions", async () => {
    const received: unknown[] = [];
    const repo: RegistrationRepository = {
      async createCustomerWithCredentials(input) {
        received.push(input);
        return { id: "customer-1", email: input.email, name: input.name, image: null };
      },
    };
    const result = await registerCustomer(validRegistration, repo, {
      async hash(password) { return `argon2id:${password.length}`; },
    });
    assert.equal(result.email, "ada@example.com");
    assert.deepEqual(received[0], {
      email: "ada@example.com",
      name: "Ada Lovelace",
      passwordHash: "argon2id:28",
      termsVersion: TERMS_DOCUMENT_VERSION,
      privacyVersion: PRIVACY_DOCUMENT_VERSION,
    });
  });

  it("prevents duplicate password or Google-only email creation", async () => {
    const { repository, customers } = fakeRepository();
    customers.set("ada@example.com", { id: "google-only", hash: "", name: "Ada", emailVerified: null });
    await assert.rejects(
      registerCustomer(validRegistration, repository, { async hash() { return "hash"; } }),
      (error: unknown) => isUniqueConstraintViolation(error),
    );
  });

  it("allows only one of concurrent duplicate registrations in an atomic repository", async () => {
    const { repository, customers } = fakeRepository();
    const results = await Promise.allSettled([
      registerCustomer(validRegistration, repository, { async hash() { return "hash-a"; } }),
      registerCustomer(validRegistration, repository, { async hash() { return "hash-b"; } }),
    ]);
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(results.filter((result) => result.status === "rejected").length, 1);
    assert.equal(customers.size, 1);
  });

  it("stores an Argon2id hash rather than plaintext and leaves verification state unset", async () => {
    const { repository, customers } = fakeRepository();
    const customer = await registerCustomer(validRegistration, repository, {
      hash: hashCustomerPassword,
    });
    const row = customers.get(customer.email)!;
    assert.match(row.hash, /^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    assert.notEqual(row.hash, validRegistration.password);
    assert.equal(row.emailVerified, null);
    assert.equal(await verifyCustomerPassword(validRegistration.password, row.hash), true);
    assert.equal(await verifyCustomerPassword("wrong password value", row.hash), false);
    assert.deepEqual(passwordHashParameters, {
      algorithm: "Argon2id",
      memoryCostKiB: 19456,
      timeCost: 2,
      parallelism: 1,
      outputLengthBytes: 32,
    });
  });
});

describe("Credentials authentication", () => {
  const customer = {
    id: "customer-a",
    email: "ada@example.com",
    name: "Ada Lovelace",
    image: null,
    passwordHash: "stored-hash",
    emailVerifiedAt: null,
  };

  it("normalizes email and returns safe customer identity on correct password", async () => {
    let lookedUpEmail = "";
    const result = await authenticateCredentialInput(
      { email: " ADA@EXAMPLE.COM ", password: "correct horse battery staple" },
      async (email) => { lookedUpEmail = email; return customer; },
      async (password, hash) => password === "correct horse battery staple" && hash === "stored-hash",
    );
    assert.equal(lookedUpEmail, "ada@example.com");
    assert.deepEqual(result, { id: "customer-a", email: "ada@example.com", name: "Ada Lovelace", image: null, emailVerifiedAt: null });
    assert.equal("passwordHash" in (result ?? {}), false);
  });

  it("uses indistinguishable null failures for wrong password, unknown email, and Google-only account", async () => {
    const verifyCalls: Array<string | null> = [];
    const verifier = async (_password: string, hash: string | null) => {
      verifyCalls.push(hash);
      return false;
    };
    const wrongPassword = await authenticateCredentialInput(
      { email: customer.email, password: "wrong password" }, async () => customer, verifier,
    );
    const unknownEmail = await authenticateCredentialInput(
      { email: "unknown@example.com", password: "wrong password" }, async () => null, verifier,
    );
    const googleOnly = await authenticateCredentialInput(
      { email: "google@example.com", password: "wrong password" },
      async () => ({ ...customer, passwordHash: null }), verifier,
    );
    assert.equal(wrongPassword, null);
    assert.equal(unknownEmail, null);
    assert.equal(googleOnly, null);
    assert.deepEqual(verifyCalls, ["stored-hash", null, null]);
  });

  it("exposes verification state only after the password has been proven", async () => {
    const unverified = await authenticateCredentialInput(
      { email: customer.email, password: "correct horse battery staple" },
      async () => ({ ...customer, emailVerifiedAt: null }),
      async (password, hash) => password === "correct horse battery staple" && hash === "stored-hash",
    );
    const wrongPassword = await authenticateCredentialInput(
      { email: customer.email, password: "wrong password" },
      async () => ({ ...customer, emailVerifiedAt: null }),
      async () => false,
    );
    const verified = await authenticateCredentialInput(
      { email: customer.email, password: "correct horse battery staple" },
      async () => ({ ...customer, emailVerifiedAt: "2026-10-07T12:00:00.000Z" }),
      async (password, hash) => password === "correct horse battery staple" && hash === "stored-hash",
    );

    assert.equal(unverified?.emailVerifiedAt, null);
    assert.equal(wrongPassword, null);
    assert.equal(verified?.emailVerifiedAt, "2026-10-07T12:00:00.000Z");
  });

  it("rejects unknown credential properties and malformed values", () => {
    assert.equal(credentialsSchema.safeParse({ email: "ada@example.com", password: "secret", customerId: "customer-b" }).success, false);
    assert.equal(credentialsSchema.safeParse({ email: "bad", password: "secret" }).success, false);
  });

  it("maps Credentials identity into existing JWT fields without credentials", () => {
    const identity = credentialsTokenIdentity({
      id: "customer-a",
      email: "ada@example.com",
      name: "Ada Lovelace",
      image: null,
      password: "never included",
      passwordHash: "never included",
    } as { id: string; email?: string | null; name?: string | null; image?: string | null });
    assert.deepEqual(identity, {
      customerId: "customer-a",
      email: "ada@example.com",
      name: "Ada Lovelace",
      picture: null,
    });
    assert.equal("password" in identity, false);
    assert.equal("passwordHash" in identity, false);
  });
});

describe("Google OAuth regression protection", () => {
  it("continues accepting verified Google email and rejecting unverified email", () => {
    assert.equal(isGoogleEmailVerified({ email: "ada@example.com", email_verified: true }), true);
    assert.equal(isGoogleEmailVerified({ email: "ada@example.com", email_verified: false }), false);
  });

  it("keeps an existing Google provider identity attached to its original customer", () => {
    assert.deepEqual(resolveGoogleIdentity({
      providerCustomerId: "customer-original",
      emailCustomerId: "different-email-match",
      emailCustomerHasPassword: true,
    }), { kind: "provider", customerId: "customer-original" });
  });

  it("allows email fallback for an existing Google-only customer", () => {
    assert.deepEqual(resolveGoogleIdentity({
      providerCustomerId: null,
      emailCustomerId: "google-customer",
      emailCustomerHasPassword: false,
    }), { kind: "email", customerId: "google-customer" });
  });

  it("rejects email-only association with a password customer and creates no merge", () => {
    assert.deepEqual(resolveGoogleIdentity({
      providerCustomerId: null,
      emailCustomerId: "password-customer",
      emailCustomerHasPassword: true,
    }), { kind: "reject_password_customer" });
  });

  it("keeps new Google customer creation when there is no email match", () => {
    assert.deepEqual(resolveGoogleIdentity({
      providerCustomerId: null,
      emailCustomerId: null,
      emailCustomerHasPassword: false,
    }), { kind: "create" });
  });

  it("retains the project's email normalization convention", () => {
    assert.equal(normalizeCustomerEmail(" ADA@EXAMPLE.COM "), "ada@example.com");
  });
});
