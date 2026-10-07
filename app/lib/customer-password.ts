import { hash, verify } from "@node-rs/argon2";

const ARGON2ID_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
};

// A valid fixed dummy hash keeps unknown-email and Google-only attempts on a
// password-verification path without retaining or exposing a usable password.
const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$IvUhYPg8gcGPOQPBjeMnOg$dQNQXfgUKTHhMjlFYuDM2ZlCxRetdgwmGb5i+5H6dpc";

export async function hashCustomerPassword(password: string): Promise<string> {
  return hash(password, ARGON2ID_OPTIONS);
}

export async function verifyCustomerPassword(
  password: string,
  passwordHash: string | null,
): Promise<boolean> {
  const hashToVerify = passwordHash ?? DUMMY_PASSWORD_HASH;
  let valid = false;

  try {
    valid = await verify(hashToVerify, password);
  } catch {
    valid = false;
  }

  return Boolean(passwordHash) && valid;
}

export const passwordHashParameters = Object.freeze({
  algorithm: "Argon2id" as const,
  memoryCostKiB: ARGON2ID_OPTIONS.memoryCost,
  timeCost: ARGON2ID_OPTIONS.timeCost,
  parallelism: ARGON2ID_OPTIONS.parallelism,
  outputLengthBytes: ARGON2ID_OPTIONS.outputLen,
});
