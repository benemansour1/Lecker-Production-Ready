/**
 * reset-menu.mjs
 * Deletes ALL current products and seeds the original full menu with local images + Hebrew names.
 * Usage: node artifacts/lecker/scripts/reset-menu.mjs
 */

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
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

// ─── المنيو الكامل ─────────────────────────────────────────────────────────────
const PRODUCTS = [

  // ══════════════════ بانكيك ══════════════════
  {
    nameAr: "بانكيك نوتيلا",        nameHe: "פנקייק נוטלה",
    category: "بانكيك", price: 42,
    description: "بانكيك مع نوتيلا وموز",
    imageUrl: "products/pancake_nutella.jpg",
    isActive: true, sortOrder: 10, variants: [],
  },
  {
    nameAr: "بانكيك لوتس",          nameHe: "פנקייק לוטוס",
    category: "بانكيك", price: 46,
    description: "بانكيك مع كريمة لوتس",
    imageUrl: "products/pancake_lotus.jpg",
    isActive: true, sortOrder: 11, variants: [],
  },
  {
    nameAr: "بانكيك كيندر",         nameHe: "פנקייק קינדר",
    category: "بانكيك", price: 46,
    description: "بانكيك مع شوكولاتة كيندر",
    imageUrl: "products/pancake_kinder.jpg",
    isActive: true, sortOrder: 12, variants: [],
  },
  {
    nameAr: "بانكيك روشيه",         nameHe: "פנקייק רושה",
    category: "بانكيك", price: 46,
    description: "بانكيك مع شوكولاتة روشيه",
    imageUrl: "products/pancake_rocher.jpg",
    isActive: true, sortOrder: 13, variants: [],
  },
  {
    nameAr: "بانكيك سنيكرز",        nameHe: "פנקייק סניקרס",
    category: "بانكيك", price: 46,
    description: "بانكيك مع حلوى سنيكرز",
    imageUrl: "products/pancake_snicker.jpg",
    isActive: true, sortOrder: 14, variants: [],
  },
  {
    nameAr: "بانكيك ميكوبيليت",     nameHe: "פנקייק מיקופלט",
    category: "بانكيك", price: 46,
    description: "بانكيك مع شوكولاتة ميكوبيليت",
    imageUrl: "products/pancake_mikopelet.jpg",
    isActive: true, sortOrder: 15, variants: [],
  },

  // ══════════════════ كريب ══════════════════
  {
    nameAr: "كريب نوتيلا",          nameHe: "קרפ נוטלה",
    category: "كريب", price: 38,
    description: "كريب مع نوتيلا",
    imageUrl: "products/crepe_nutella.jpg",
    isActive: true, sortOrder: 20, variants: [],
  },
  {
    nameAr: "كريب لوتس",            nameHe: "קרפ לוטוס",
    category: "كريب", price: 42,
    description: "كريب مع كريمة لوتس",
    imageUrl: "products/crepe_lotus.jpg",
    isActive: true, sortOrder: 21, variants: [],
  },
  {
    nameAr: "كريب كيندر",           nameHe: "קרפ קינדר",
    category: "كريب", price: 42,
    description: "كريب مع شوكولاتة كيندر",
    imageUrl: "products/crepe_kinder.jpg",
    isActive: true, sortOrder: 22, variants: [],
  },
  {
    nameAr: "كريب سنيكرز",          nameHe: "קרפ סניקרס",
    category: "كريب", price: 42,
    description: "كريب مع حلوى سنيكرز",
    imageUrl: "products/crepe_snicker.jpg",
    isActive: true, sortOrder: 23, variants: [],
  },

  // ══════════════════ وافل ══════════════════
  {
    nameAr: "وافل",                 nameHe: "וופל",
    category: "وافل", price: 38,
    description: "وافل هش مع توبينغ مختار",
    imageUrl: "products/waffle.jpg",
    isActive: true, sortOrder: 30, variants: [],
  },
  {
    nameAr: "وافل دبل",             nameHe: "וופל דאבל",
    category: "وافل", price: 52,
    description: "وافل مضاعف مع توبينغ مختار",
    imageUrl: "products/waffle_double.jpg",
    isActive: true, sortOrder: 31, variants: [],
  },

  // ══════════════════ بوظة ══════════════════
  {
    nameAr: "بوظة أمريكية",         nameHe: "גלידה אמריקאית",
    category: "بوظة", price: 28,
    description: "جيلاتو أمريكي بنكهات متعددة",
    imageUrl: "products/gelida_american.jpg",
    isActive: true, sortOrder: 40,
    variants: [
      { nameAr: "كرة واحدة",  price: 14 },
      { nameAr: "كرتين",      price: 24 },
      { nameAr: "3 كرات",     price: 34 },
    ],
  },
  {
    nameAr: "بوظة إيطالية",         nameHe: "גלידה איטלקית",
    category: "بوظة", price: 30,
    description: "جيلاتو إيطالي كريمي بنكهات راقية",
    imageUrl: "products/gelida_italian.jpg",
    isActive: true, sortOrder: 41,
    variants: [
      { nameAr: "كرة واحدة",  price: 16 },
      { nameAr: "كرتين",      price: 28 },
      { nameAr: "3 كرات",     price: 38 },
    ],
  },

  // ══════════════════ مشروبات ساخنة ══════════════════
  {
    nameAr: "إسبريسو",              nameHe: "אספרסו",
    category: "مشروبات ساخنة", price: 10,
    description: "إسبريسو إيطالي أصيل",
    imageUrl: "products/espresso.jpg",
    isActive: true, sortOrder: 50, variants: [],
  },
  {
    nameAr: "هافوك",                nameHe: "הפוך",
    category: "مشروبات ساخنة", price: 16,
    description: "كافيه لاتيه مقلوب كريمي",
    imageUrl: "products/hafuch.png",
    isActive: true, sortOrder: 51, variants: [],
  },
  {
    nameAr: "نيسبريسو",             nameHe: "נספרסו",
    category: "مشروبات ساخنة", price: 14,
    description: "قهوة نيسبريسو مميزة",
    imageUrl: "products/nespresso.png",
    isActive: true, sortOrder: 52, variants: [],
  },
  {
    nameAr: "شاي",                  nameHe: "תה",
    category: "مشروبات ساخنة", price: 12,
    description: "شاي طازج بالنكهة المفضلة",
    imageUrl: "products/tea.png",
    isActive: true, sortOrder: 53, variants: [],
  },

  // ══════════════════ عصائر ══════════════════
  {
    nameAr: "عصير برتقال طبيعي",    nameHe: "מיץ תפוזים טבעי",
    category: "عصائر", price: 22,
    description: "عصير برتقال طازج معصور أمامك",
    imageUrl: "products/juice_orange_natural.jpg",
    isActive: true, sortOrder: 60, variants: [],
  },
  {
    nameAr: "عصير رمان",            nameHe: "מיץ רימון",
    category: "عصائر", price: 24,
    description: "عصير رمان طازج",
    imageUrl: "products/juice_rimon.jpg",
    isActive: true, sortOrder: 61, variants: [],
  },
  {
    nameAr: "عصير جزر",             nameHe: "מיץ גזר",
    category: "عصائر", price: 20,
    description: "عصير جزر طازج",
    imageUrl: "products/juice_carrot.jpg",
    isActive: true, sortOrder: 62, variants: [],
  },
  {
    nameAr: "عصير تفاح",            nameHe: "מיץ תפוח",
    category: "عصائر", price: 20,
    description: "عصير تفاح طازج",
    imageUrl: "products/juice_apple.jpg",
    isActive: true, sortOrder: 63, variants: [],
  },
  {
    nameAr: "عصير جريب فروت",       nameHe: "מיץ אשכולית",
    category: "عصائر", price: 22,
    description: "عصير جريب فروت طازج منعش",
    imageUrl: "products/grapefruit.png",
    isActive: true, sortOrder: 64, variants: [],
  },
  {
    nameAr: "فراولة موز",           nameHe: "תות בננה",
    category: "عصائر", price: 26,
    description: "سموذي فراولة وموز طازج",
    imageUrl: "products/strawberry_banana.jpg",
    isActive: true, sortOrder: 65, variants: [],
  },
  {
    nameAr: "عصير عنب",             nameHe: "מיץ ענבים",
    category: "عصائر", price: 22,
    description: "عصير عنب طازج",
    imageUrl: "products/grape.png",
    isActive: true, sortOrder: 66, variants: [],
  },

  // ══════════════════ مشروبات باردة ══════════════════
  {
    nameAr: "كولا",                 nameHe: "קולה",
    category: "مشروبات باردة", price: 12,
    description: "كوكاكولا مثلجة",
    imageUrl: "products/cola.webp",
    isActive: true, sortOrder: 70, variants: [],
  },
  {
    nameAr: "كولا زيرو",            nameHe: "קולה זירו",
    category: "مشروبات باردة", price: 12,
    description: "كوكاكولا زيرو بدون سكر",
    imageUrl: "products/cola_zero.png",
    isActive: true, sortOrder: 71, variants: [],
  },
  {
    nameAr: "سبرايت",               nameHe: "ספרייט",
    category: "مشروبات باردة", price: 12,
    description: "سبرايت مثلج",
    imageUrl: "products/sprite.png",
    isActive: true, sortOrder: 72, variants: [],
  },
  {
    nameAr: "صودا",                 nameHe: "סודה",
    category: "مشروبات باردة", price: 10,
    description: "مياه غازية",
    imageUrl: "products/soda.webp",
    isActive: true, sortOrder: 73, variants: [],
  },
  {
    nameAr: "مياه",                 nameHe: "מים",
    category: "مشروبات باردة", price: 8,
    description: "مياه معدنية",
    imageUrl: "products/water.jpg",
    isActive: true, sortOrder: 74, variants: [],
  },
  {
    nameAr: "تبوزينا",              nameHe: "תפוזינה",
    category: "مشروبات باردة", price: 12,
    description: "عصير برتقال معبأ",
    imageUrl: "products/orange.webp",
    isActive: true, sortOrder: 75, variants: [],
  },
  {
    nameAr: "بيزوز",               nameHe: "פיזוז",
    category: "مشروبات باردة", price: 12,
    description: "مشروب فاكهة غازي",
    imageUrl: "products/pizuz.jpg",
    isActive: true, sortOrder: 76, variants: [],
  },

  // ══════════════════ بيرا ══════════════════
  {
    nameAr: "كارلسبرغ",            nameHe: "קרלסברג",
    category: "بيرا", price: 28,
    description: "بيرة كارلسبرغ الدنماركية",
    imageUrl: "products/carlsberg.jpg",
    isActive: true, sortOrder: 80, variants: [],
  },
  {
    nameAr: "كورونا",              nameHe: "קורונה",
    category: "بيرا", price: 30,
    description: "بيرة كورونا المكسيكية",
    imageUrl: "products/corona.jpg",
    isActive: true, sortOrder: 81, variants: [],
  },
  {
    nameAr: "ستيلا",               nameHe: "סטלה",
    category: "بيرا", price: 28,
    description: "بيرة ستيلا أرتوا البلجيكية",
    imageUrl: "products/stella.jpg",
    isActive: true, sortOrder: 82, variants: [],
  },
  {
    nameAr: "توبورغ",              nameHe: "טוברג",
    category: "بيرا", price: 26,
    description: "بيرة توبورغ الدنماركية",
    imageUrl: "products/tuborg.jpg",
    isActive: true, sortOrder: 83, variants: [],
  },
  {
    nameAr: "باولانر",             nameHe: "פאולנר",
    category: "بيرا", price: 32,
    description: "بيرة باولانر الألمانية",
    imageUrl: "products/paulaner.jpg",
    isActive: true, sortOrder: 84, variants: [],
  },
  {
    nameAr: "واينشتفان",           nameHe: "וינשטפן",
    category: "بيرا", price: 32,
    description: "بيرة ألمانية مميزة",
    imageUrl: "products/weinst.jpg",
    isActive: true, sortOrder: 85, variants: [],
  },
  {
    nameAr: "XL",                  nameHe: "XL",
    category: "بيرا", price: 24,
    description: "بيرة XL",
    imageUrl: "products/xl.gif",
    isActive: true, sortOrder: 86, variants: [],
  },
  {
    nameAr: "بلو",                 nameHe: "בלו",
    category: "بيرا", price: 24,
    description: "بيرة بلو المحلية",
    imageUrl: "products/blu.webp",
    isActive: true, sortOrder: 87, variants: [],
  },

  // ══════════════════ أكل ══════════════════
  {
    nameAr: "شنيتزل",              nameHe: "שניצל",
    category: "أكل", price: 55,
    description: "شنيتزل دجاج مقرمش",
    imageUrl: "products/shnizel.jpg",
    isActive: true, sortOrder: 90, variants: [],
  },
  {
    nameAr: "انتريكوت",            nameHe: "אנטריקוט",
    category: "أكل", price: 75,
    description: "انتريكوت مشوي طازج",
    imageUrl: "products/antricot.jpg",
    isActive: true, sortOrder: 91, variants: [],
  },
  {
    nameAr: "هوت دوج",             nameHe: "הוט דוג",
    category: "أكل", price: 38,
    description: "هوت دوج مع صوص",
    imageUrl: "products/hot_dog.jpg",
    isActive: true, sortOrder: 92, variants: [],
  },
  {
    nameAr: "توست",                nameHe: "טוסט",
    category: "أكل", price: 32,
    description: "توست محشي مشكّل",
    imageUrl: "products/toast.jpg",
    isActive: true, sortOrder: 93, variants: [],
  },
  {
    nameAr: "بيغيل توست",          nameHe: "בייגל טוסט",
    category: "أكل", price: 36,
    description: "بيغيل توست بالجبنة",
    imageUrl: "products/bagel_toast.jpg",
    isActive: true, sortOrder: 94, variants: [],
  },
  {
    nameAr: "تورتيا",              nameHe: "טורטייה",
    category: "أكل", price: 42,
    description: "تورتيا محشية",
    imageUrl: "products/tortia.jpg",
    isActive: true, sortOrder: 95, variants: [],
  },
  {
    nameAr: "شيبس",                nameHe: "צ'יפס",
    category: "أكل", price: 22,
    description: "بطاطس مقلية مقرمشة",
    imageUrl: "products/chips.jpg",
    isActive: true, sortOrder: 96, variants: [],
  },
  {
    nameAr: "فوندو",               nameHe: "פונדו",
    category: "أكل", price: 58,
    description: "فوندو شوكولاتة للمشاركة",
    imageUrl: "products/fondue.jpg",
    isActive: true, sortOrder: 97, variants: [],
  },

  // ══════════════════ حلويات خاصة ══════════════════
  {
    nameAr: "تشوروس",              nameHe: "צ'ורוס",
    category: "حلويات خاصة", price: 35,
    description: "تشوروس إسباني مع صوص شوكولاتة",
    imageUrl: "products/churros.jpg",
    isActive: true, sortOrder: 100, variants: [],
  },
  {
    nameAr: "فشفش",               nameHe: "פשפש",
    category: "حلويات خاصة", price: 30,
    description: "حلوى فشفش مميزة",
    imageUrl: "products/fashafesh.jpg",
    isActive: true, sortOrder: 101, variants: [],
  },
];

async function resetMenu() {
  console.log("🗑️  Deleting all existing products...");
  const col = collection(db, "products");
  const existing = await getDocs(col);
  for (const d of existing.docs) {
    await deleteDoc(d.ref);
  }
  console.log(`   Deleted ${existing.size} products.\n`);

  console.log(`⏳ Seeding ${PRODUCTS.length} products with original images...\n`);
  for (const p of PRODUCTS) {
    await addDoc(col, { ...p, name: p.nameAr, createdAt: serverTimestamp() });
    process.stdout.write(`   ✓ ${p.nameAr} (${p.category})\n`);
  }

  console.log(`\n✅ Done! ${PRODUCTS.length} products added to Firestore.`);
  process.exit(0);
}

resetMenu().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
