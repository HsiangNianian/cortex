// Seed script: generate bcrypt password hash for admin account creation.
//
// Usage:
//   node scripts/seed-admin.mjs
//
// It will prompt for username and password, then print the SQL INSERT statement.
import bcrypt from "bcryptjs"
import * as readline from "node:readline"

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function main() {
  const username = await ask("Username: ")
  if (!username) {
    console.error("Username is required")
    process.exit(1)
  }

  const password = await ask("Password: ")
  if (!password) {
    console.error("Password is required")
    process.exit(1)
  }

  const role = (await ask("Role (super_admin/reviewer) [super_admin]: ")) || "super_admin"
  if (role !== "super_admin" && role !== "reviewer") {
    console.error("Role must be 'super_admin' or 'reviewer'")
    process.exit(1)
  }

  const hash = await bcrypt.hash(password, 12)

  console.log("\n--- SQL to execute ---")
  console.log(
    `INSERT INTO admins (username, password_hash, role) VALUES ('${username}', '${hash}', '${role}');`
  )
  console.log("--- end ---\n")

  rl.close()
}

main()
