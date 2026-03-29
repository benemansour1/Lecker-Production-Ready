/**
 * fix-categories.mjs
 * - XL, بلو → مشروبات باردة
 * - بيزوز → بوظة  (nameHe: פיזוז)
 * - كل عصائر → مشروبات باردة
 * - حذف فئة عصائر من جميع المنتجات
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyAUgsWBuHxqq4GUOZjLPaqjGXLI4rrn0fQ",
  authDomain: "lecker-4ec6f.firebaseapp.com",
  projectId: "lecker-4ec6f",
});
const db = getFirestore(app);

async function fixCategories() {
  const snap = await getDocs(collection(db, "products"));
  let updated = 0;

  for (const d of snap.docs) {
    const data = d.data();
    const updates = {};

    // XL و بلو → مشروبات باردة
    if (data.nameAr === "XL" || data.nameAr === "بلو") {
      updates.category = "مشروبات باردة";
    }

    // بيزوز → بوظة + Hebrew name
    if (data.nameAr === "بيزوز") {
      updates.category = "بوظة";
      updates.nameHe = "פיזוז";
    }

    // كل عصائر → مشروبات باردة
    if (data.category === "عصائر") {
      updates.category = "مشروبات باردة";
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, "products", d.id), updates);
      console.log(`✓ ${data.nameAr} → ${updates.category ?? data.category}`);
      updated++;
    }
  }

  console.log(`\n✅ Updated ${updated} products.`);
  process.exit(0);
}

fixCategories().catch(e => { console.error(e.message); process.exit(1); });
