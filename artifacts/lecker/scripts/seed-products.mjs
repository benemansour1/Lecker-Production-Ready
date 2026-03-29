/**
 * seed-products.mjs
 * Run once to populate Firestore with the initial product catalog.
 * Usage: node artifacts/lecker/scripts/seed-products.mjs
 */

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
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

const PRODUCTS = [
  { nameAr: "بانكيك سادة",      category: "بانكيك",         price: 35, description: "بانكيك طازج ناعم مع مربى",           imageUrl: null, isActive: true, sortOrder: 1,  variants: null },
  { nameAr: "بانكيك نوتيلا",     category: "بانكيك",         price: 42, description: "بانكيك مع نوتيلا وموز",             imageUrl: null, isActive: true, sortOrder: 2,  variants: null },
  { nameAr: "بانكيك توت",        category: "بانكيك",         price: 44, description: "بانكيك مع توت طازج وكريمة",        imageUrl: null, isActive: true, sortOrder: 3,  variants: null },
  { nameAr: "بانكيك موز وعسل",   category: "بانكيك",         price: 42, description: "بانكيك مع موز وعسل طبيعي",         imageUrl: null, isActive: true, sortOrder: 4,  variants: null },
  { nameAr: "بانكيك لوتس",       category: "بانكيك",         price: 46, description: "بانكيك مع كريمة لوتس",            imageUrl: null, isActive: true, sortOrder: 5,  variants: null },
  { nameAr: "كريب سادة",         category: "كريب",           price: 32, description: "كريب رفيع وناعم",                 imageUrl: null, isActive: true, sortOrder: 10, variants: null },
  { nameAr: "كريب نوتيلا موز",   category: "كريب",           price: 38, description: "كريب مع نوتيلا وموز",             imageUrl: null, isActive: true, sortOrder: 11, variants: null },
  { nameAr: "كريب جبنة",         category: "كريب",           price: 36, description: "كريب مع جبنة كريمية",             imageUrl: null, isActive: true, sortOrder: 12, variants: null },
  { nameAr: "كريب فراولة",       category: "كريب",           price: 40, description: "كريب مع فراولة طازجة وكريمة",     imageUrl: null, isActive: true, sortOrder: 13, variants: null },
  { nameAr: "وافل سادة",         category: "وافل",           price: 35, description: "وافل هش من الخارج طري من الداخل", imageUrl: null, isActive: true, sortOrder: 20, variants: null },
  { nameAr: "وافل نوتيلا",       category: "وافل",           price: 42, description: "وافل مع نوتيلا وجوز",             imageUrl: null, isActive: true, sortOrder: 21, variants: null },
  { nameAr: "وافل آيس كريم",     category: "وافل",           price: 48, description: "وافل مع كرتين آيس كريم",          imageUrl: null, isActive: true, sortOrder: 22, variants: null },
  { nameAr: "آيس كريم",          category: "بوظة",           price: 25, description: "آيس كريم بنكهات متعددة",          imageUrl: null, isActive: true, sortOrder: 30, variants: [{ nameAr: "كرتين", price: 25 }, { nameAr: "3 كرات", price: 35 }, { nameAr: "4 كرات", price: 44 }] },
  { nameAr: "بوظة سرسابيلا",     category: "بوظة",           price: 30, description: "بوظة عربية أصيلة",               imageUrl: null, isActive: true, sortOrder: 31, variants: null },
  { nameAr: "قهوة عربية",        category: "مشروبات ساخنة", price: 18, description: "قهوة عربية أصيلة بالهيل",         imageUrl: null, isActive: true, sortOrder: 40, variants: null },
  { nameAr: "كابتشينو",          category: "مشروبات ساخنة", price: 20, description: "كابتشينو كريمي",                 imageUrl: null, isActive: true, sortOrder: 41, variants: null },
  { nameAr: "شاي بالنعناع",      category: "مشروبات ساخنة", price: 15, description: "شاي طازج بالنعناع",              imageUrl: null, isActive: true, sortOrder: 42, variants: null },
  { nameAr: "موكا شوكولاتة",     category: "مشروبات ساخنة", price: 22, description: "موكا شوكولاتة مع كريمة",          imageUrl: null, isActive: true, sortOrder: 43, variants: null },
  { nameAr: "عصير برتقال",       category: "مشروبات باردة", price: 20, description: "عصير برتقال طازج",               imageUrl: null, isActive: true, sortOrder: 50, variants: null },
  { nameAr: "ليموناضة",          category: "مشروبات باردة", price: 22, description: "ليموناضة طازجة منعشة",            imageUrl: null, isActive: true, sortOrder: 51, variants: null },
  { nameAr: "فرابيه",            category: "مشروبات باردة", price: 28, description: "فرابيه باردة كريمية",             imageUrl: null, isActive: true, sortOrder: 52, variants: [{ nameAr: "شوكولاتة", price: 28 }, { nameAr: "كراميل", price: 28 }, { nameAr: "فانيلا", price: 26 }] },
  { nameAr: "ميلك شيك",          category: "مشروبات باردة", price: 32, description: "ميلك شيك كريمي",                 imageUrl: null, isActive: true, sortOrder: 53, variants: [{ nameAr: "شوكولاتة", price: 32 }, { nameAr: "فراولة", price: 32 }, { nameAr: "فانيلا", price: 30 }] },
  { nameAr: "توست محشي",         category: "أكل",            price: 25, description: "توست محشي مشكّل",               imageUrl: null, isActive: true, sortOrder: 60, variants: null },
  { nameAr: "سندوتش دجاج",       category: "أكل",            price: 38, description: "سندوتش دجاج مشوي مع صوص",        imageUrl: null, isActive: true, sortOrder: 61, variants: null },
  { nameAr: "بيرا",              category: "بيرا",           price: 25, description: "بيرا باردة",                     imageUrl: null, isActive: true, sortOrder: 70, variants: [{ nameAr: "كوب", price: 25 }, { nameAr: "جمبو", price: 40 }] },
  { nameAr: "شيز كيك",           category: "حلويات خاصة",   price: 38, description: "شيز كيك كريمي بالتوت",           imageUrl: null, isActive: true, sortOrder: 80, variants: null },
  { nameAr: "براونيز",           category: "حلويات خاصة",   price: 32, description: "براونيز شوكولاتة داكنة",          imageUrl: null, isActive: true, sortOrder: 81, variants: null },
  { nameAr: "كيك لوتس",          category: "حلويات خاصة",   price: 45, description: "كيك لوتس كريمي مميز",            imageUrl: null, isActive: true, sortOrder: 82, variants: null },
];

async function seed() {
  console.log("🔍 Checking Firestore products collection...");

  const col = collection(db, "products");
  const snap = await getDocs(query(col, orderBy("sortOrder", "asc")));

  if (snap.size > 0) {
    console.log(`✅ Firestore already has ${snap.size} products. Skipping seed.`);
    console.log("   To re-seed, delete all documents in the 'products' collection first.");
    process.exit(0);
  }

  console.log(`⏳ Seeding ${PRODUCTS.length} products into Firestore...`);

  for (const product of PRODUCTS) {
    await addDoc(col, {
      ...product,
      name: product.nameAr,
      createdAt: serverTimestamp(),
    });
    process.stdout.write(`   ✓ ${product.nameAr}\n`);
  }

  console.log(`\n✅ Done! ${PRODUCTS.length} products added to Firestore.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
