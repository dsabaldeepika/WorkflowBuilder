import { db } from "../server/db";
import { users } from "../shared/schema";
import { hashPassword } from "../server/auth/auth.service"; // Adjust path as needed

const testUsers = [
  { email: "test@gmail.com", username: "test", role: "user" },
  { email: "admin@gmail.com", username: "admin", role: "admin" },
  { email: "demo@gmail.com", username: "demo", role: "user" },
];

const password = "test";

async function seedTestUsers() {
  const hashed = await hashPassword(password);

  for (const user of testUsers) {
    await db
      .insert(users)
      .values({
        ...user,
        password: hashed,
        firstName: user.username,
        lastName: "Test",
        profileImageUrl: null,
      })
      .onConflictDoNothing(); // Avoid duplicate errors
    console.log(`Seeded user: ${user.email}`);
  }
  process.exit(0);
}

seedTestUsers().catch((err) => {
  console.error("Error seeding test users:", err);
  process.exit(1);
});
