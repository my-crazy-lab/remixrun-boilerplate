function verifyDotEnv(): {
  URI_APP: string;
  URI_BE: string;
  MAIL_URL: string;
  PLAIN_TEXT: string;
  SALT_ROUND: string;
  MAIL_FROM: string;
  DOMAIN_BTASKEE_BE: string;
} {
  const env: any = process.env;

  if (!env.URI_APP) {
    throw new Error(
      "Missing URI_APP in .env\nUse the URI_APP to connect App database",
    );
  }
  if (!env.URI_BE) {
    throw new Error(
      "Missing URI_APP in .env\nUse the URI_BE to connect Backend database",
    );
  }
  if (!env.MAIL_URL) {
    throw new Error("Missing MAIL_URL in .env\nUse the MAIL_URL to send smtp");
  }
  if (!env.PLAIN_TEXT) {
    throw new Error(
      "Missing PLAIN_TEXT in .env\nUse the PLAIN_TEXT to hash password",
    );
  }
  if (!env.SALT_ROUND) {
    throw new Error(
      "Missing SALT_ROUND in .env\nUse the SALT_ROUND to set the cost factor when hash password",
    );
  }
  if (!env.MAIL_FROM) {
    throw new Error(
      "Missing MAIL_FORM in .env\nUse the MAIL_FORM to set host email sending authentication code.",
    );
  }
  if (!env.DOMAIN_BTASKEE_BE) {
    throw new Error("Missing DOMAIN_BTASKEE_BE  .env");
  }

  return env;
}
const dotenv = verifyDotEnv();

export { dotenv };
