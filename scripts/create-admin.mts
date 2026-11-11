/**
 * Creates an admin login, or resets the password if the email already exists.
 *   npm run create-admin
 */
import { existsSync } from "node:fs";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { text } from "node:stream/consumers";

if (existsSync(".env")) process.loadEnvFile(".env");

const { db } = await import("../src/lib/db");
const { hashPassword, MIN_PASSWORD_LENGTH } = await import("../src/lib/auth/password");

// When input is piped (e.g. on a server without a terminal), read the answers line by line.
const pipedLines = stdin.isTTY ? null : (await text(stdin)).split(/\r?\n/);

async function ask(question: string): Promise<string> {
  if (pipedLines) return (pipedLines.shift() ?? "").trim();
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

/** Reads a line without echoing it, so the password doesn't appear on screen. */
function askHidden(question: string): Promise<string> {
  if (pipedLines) return Promise.resolve(pipedLines.shift() ?? "");
  return new Promise((resolve, reject) => {
    let value = "";
    const finish = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
    };
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") return finish(), resolve(value);
        if (char === "\u0003") return finish(), reject(new Error("Cancelled"));
        value = char === "\u007f" || char === "\b" ? value.slice(0, -1) : value + char;
      }
    };
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();
    stdin.on("data", onData);
  });
}

async function main() {
  const name = await ask("Name: ");
  const email = (await ask("Email: ")).toLowerCase();
  const password = await askHidden(`Password (at least ${MIN_PASSWORD_LENGTH} characters): `);
  const confirm = await askHidden("Repeat password: ");

  if (!name || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a name and a valid email.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`The password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (password !== confirm) throw new Error("The passwords don't match.");

  const passwordHash = await hashPassword(password);
  const existing = await db.admin.findUnique({ where: { email } });
  if (existing) {
    await db.admin.update({ where: { email }, data: { name, passwordHash } });
    // Log out everywhere after a password reset.
    await db.session.deleteMany({ where: { adminId: existing.id } });
    console.log(`Updated the password for ${email}.`);
  } else {
    await db.admin.create({ data: { name, email, passwordHash } });
    console.log(`Created admin ${email}. Log in at /admin/login.`);
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
