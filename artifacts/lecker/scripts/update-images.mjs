/**
 * update-images.mjs
 * Adds image URLs to all products in Firestore.
 * Usage: node artifacts/lecker/scripts/update-images.mjs
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

const CATEGORY_IMAGES = {
  "بانكيك": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80",
  "كريب":   "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=500&q=80",
  "وافل":   "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&q=80",
  "بوظة":   "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&q=80",
  "مشروبات ساخنة": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80",
  "مشروبات باردة": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80",
  "أكل":    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80",
  "بيرا":   "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&q=80",
  "حلويات خاصة": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
};

const PRODUCT_IMAGES = {
  "بانكيك سادة":    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80",
  "بانكيك نوتيلا":  "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=500&q=80",
  "بانكيك توت":     "https://images.unsplash.com/photo-1484723091739-30990ca0b8b4?w=500&q=80",
  "بانكيك موز وعسل":"https://images.unsplash.com/photo-1590080876351-41475f0a9b24?w=500&q=80",
  "بانكيك لوتس":    "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=500&q=80",
  "كريب سادة":      "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=500&q=80",
  "كريب نوتيلا موز":"https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&q=80",
  "كريب جبنة":      "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=500&q=80",
  "كريب فراولة":    "https://images.unsplash.com/photo-1464219222984-216ebffaaf85?w=500&q=80",
  "وافل سادة":      "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&q=80",
  "وافل نوتيلا":    "https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?w=500&q=80",
  "وافل آيس كريم":  "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=500&q=80",
  "آيس كريم":       "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&q=80",
  "بوظة سرسابيلا":  "https://images.unsplash.com/photo-1516559228935-0871f41e1523?w=500&q=80",
  "قهوة عربية":     "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80",
  "كابتشينو":       "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80",
  "شاي بالنعناع":   "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80",
  "موكا شوكولاتة":  "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80",
  "عصير برتقال":    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80",
  "ليموناضة":       "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=500&q=80",
  "فرابيه":         "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&q=80",
  "ميلك شيك":       "https://images.unsplash.com/photo-1572490122747-3e9d6391c98b?w=500&q=80",
  "توست محشي":      "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80",
  "سندوتش دجاج":    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80",
  "بيرا":           "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&q=80",
  "شيز كيك":        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
  "براونيز":        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80",
  "كيك لوتس":       "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500&q=80",
};

async function updateImages() {
  console.log("🔍 Fetching products from Firestore...");

  const col = collection(db, "products");
  const snap = await getDocs(query(col, orderBy("sortOrder", "asc")));

  if (snap.empty) {
    console.log("❌ No products found. Run seed-products.mjs first.");
    process.exit(1);
  }

  console.log(`⏳ Updating ${snap.size} products with images...\n`);

  let updated = 0;
  let skipped = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const nameAr = data.nameAr || "";
    const category = data.category || "";

    const imageUrl = PRODUCT_IMAGES[nameAr] || CATEGORY_IMAGES[category] || null;

    if (!imageUrl) {
      console.log(`   ⚠️  No image found for: ${nameAr}`);
      skipped++;
      continue;
    }

    await updateDoc(docSnap.ref, { imageUrl });
    console.log(`   ✓ ${nameAr}`);
    updated++;
  }

  console.log(`\n✅ Done! Updated: ${updated} | Skipped: ${skipped}`);
  process.exit(0);
}

updateImages().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
