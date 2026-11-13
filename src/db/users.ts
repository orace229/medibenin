import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName = 'MediSense User',
  role = 'patient',
  linkedPatientIds: string[] = []
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName,
        role,
        linkedPatientIds,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid));
    return rows[0] || null;
  } catch (error) {
    console.error('Database query failed in getUserByUid:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateUserRoleAndLanguage(uid: string, role?: string, preferredLanguage?: string) {
  try {
    const existing = await getUserByUid(uid);
    if (!existing) return null;
    const updated = await db
      .update(users)
      .set({
        role: role || existing.role,
        preferredLanguage: preferredLanguage || existing.preferredLanguage,
      })
      .where(eq(users.uid, uid))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateUserRoleAndLanguage:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
