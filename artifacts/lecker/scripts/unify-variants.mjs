/**
 * unify-variants.mjs
 * Changes variants: null → variants: [] in all Firestore product documents.
 * Usage: node artifacts/lecker/scripts/unify-variants.mjs
 */

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUgsWBuHxqq4GUOZjLPaqjGXLI4rrn0fQ",
  authDomain: "lecker-4ec6f.firebaseapp.com",
  projectId: "lecker-4ec6f",
  storageBucket: "lecker-4ec6f.firebasestorage.app",
  messagingSenderId: "967568033913",
  appId: "1:967568033913:web:25598e28e276412478aca8",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function unifyVariants() {
  console.log("🔍 Fetching all products from Firestore...");

  const col = collection(db, "products");
  const snap = await getDocs(query(col, orderBy("sortOrder", "asc")));

  if (snap.empty) {
    console.log("❌ No products found.");
    process.exit(1);
  }

  let updated = 0;
  let alreadyOk = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const currentVariants = data.variants;

    if (currentVariants === null || currentVariants === undefined) {
      await updateDoc(docSnap.ref, { variants: [] });
      console.log(`   ✓ ${data.nameAr} → variants: []`);
      updated++;
    } else {
      alreadyOk++;
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   Updated: ${updated} (null → [])`);
  console.log(`   Already OK: ${alreadyOk} (had array)`);
  process.exit(0);
}

unifyVariants().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
