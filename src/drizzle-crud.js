import { eq } from 'drizzle-orm';
import { db, pool } from './db/db.js';
import { demoUsers } from './db/schema.js';

async function main() {
  try {
    console.log('Performing CRUD operations...');

    // CREATE
    const [newUser] = await db
      .insert(demoUsers)
      .values({ name: 'Admin User', email: `admin+${Date.now()}@example.com` })
      .returning();

    if (!newUser) throw new Error('Failed to create user');
    console.log('✅ CREATE:', newUser);

    // READ
    const found = await db.select().from(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log('✅ READ:', found[0]);

    // UPDATE
    const [updated] = await db
      .update(demoUsers)
      .set({ name: 'Super Admin' })
      .where(eq(demoUsers.id, newUser.id))
      .returning();

    if (!updated) throw new Error('Failed to update');
    console.log('✅ UPDATE:', updated);

    // DELETE
    await db.delete(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log('✅ DELETE: deleted');

    console.log('\nCRUD operations completed successfully.');
  } catch (err) {
    console.error('❌ Error performing CRUD:', err);
    process.exitCode = 1;
  } finally {
    if (pool) {
      await pool.end();
      console.log('Database pool closed.');
    }
  }
}

main();
