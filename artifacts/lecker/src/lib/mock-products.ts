export interface MockProductVariant {
  nameAr: string;
  price: number;
}

export interface MockProduct {
  id: string;
  name: string;
  nameAr: string;
  nameHe?: string | null;
  category: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  variants?: MockProductVariant[] | null;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  { id: 'mock-1',  nameAr: 'بانكيك سادة',      name: 'بانكيك سادة',      nameHe: 'פנקייק פשוט',      category: 'بانكيك',         price: 35, description: 'بانكيك طازج ناعم مع مربى',         imageUrl: null, isActive: true, sortOrder: 1,  variants: null },
  { id: 'mock-2',  nameAr: 'بانكيك نوتيلا',     name: 'بانكيك نوتيلا',     nameHe: 'פנקייק נוטלה',     category: 'بانكيك',         price: 42, description: 'بانكيك مع نوتيلا وموز',           imageUrl: null, isActive: true, sortOrder: 2,  variants: null },
  { id: 'mock-3',  nameAr: 'بانكيك توت',        name: 'بانكيك توت',        nameHe: 'פנקייק תות',       category: 'بانكيك',         price: 44, description: 'بانكيك مع توت طازج وكريمة',      imageUrl: null, isActive: true, sortOrder: 3,  variants: null },
  { id: 'mock-4',  nameAr: 'بانكيك موز وعسل',   name: 'بانكيك موز وعسل',   nameHe: 'פנקייק בננה ודבש', category: 'بانكيك',         price: 42, description: 'بانكيك مع موز وعسل طبيعي',       imageUrl: null, isActive: true, sortOrder: 4,  variants: null },
  { id: 'mock-5',  nameAr: 'بانكيك لوتس',       name: 'بانكيك لوتس',       nameHe: 'פנקייק לוטוס',    category: 'بانكيك',         price: 46, description: 'بانكيك مع كريمة لوتس',          imageUrl: null, isActive: true, sortOrder: 5,  variants: null },
  { id: 'mock-6',  nameAr: 'كريب سادة',         name: 'كريب سادة',         nameHe: 'קרפ פשוט',         category: 'كريب',           price: 32, description: 'كريب رفيع وناعم',               imageUrl: null, isActive: true, sortOrder: 10, variants: null },
  { id: 'mock-7',  nameAr: 'كريب نوتيلا موز',   name: 'كريب نوتيلا موز',   nameHe: 'קרפ נוטלה בננה',   category: 'كريب',           price: 38, description: 'كريب مع نوتيلا وموز',           imageUrl: null, isActive: true, sortOrder: 11, variants: null },
  { id: 'mock-8',  nameAr: 'كريب جبنة',         name: 'كريب جبنة',         nameHe: 'קרפ גבינה',        category: 'كريب',           price: 36, description: 'كريب مع جبنة كريمية',           imageUrl: null, isActive: true, sortOrder: 12, variants: null },
  { id: 'mock-9',  nameAr: 'كريب فراولة',       name: 'كريب فراولة',       nameHe: 'קרפ תות שדה',      category: 'كريب',           price: 40, description: 'كريب مع فراولة طازجة وكريمة',   imageUrl: null, isActive: true, sortOrder: 13, variants: null },
  { id: 'mock-10', nameAr: 'وافل سادة',         name: 'وافل سادة',         nameHe: 'וופל פשוט',        category: 'وافل',           price: 35, description: 'وافل هش من الخارج طري من الداخل', imageUrl: null, isActive: true, sortOrder: 20, variants: null },
  { id: 'mock-11', nameAr: 'وافل نوتيلا',       name: 'وافل نوتيلا',       nameHe: 'וופל נוטלה',       category: 'وافل',           price: 42, description: 'وافل مع نوتيلا وجوز',           imageUrl: null, isActive: true, sortOrder: 21, variants: null },
  { id: 'mock-12', nameAr: 'وافل آيس كريم',     name: 'وافل آيس كريم',     nameHe: 'וופל גלידה',       category: 'وافل',           price: 48, description: 'وافل مع كرتين آيس كريم',        imageUrl: null, isActive: true, sortOrder: 22, variants: null },
  { id: 'mock-13', nameAr: 'آيس كريم',          name: 'آيس كريم',          nameHe: 'גלידה',            category: 'بوظة',           price: 25, description: 'آيس كريم بنكهات متعددة',        imageUrl: null, isActive: true, sortOrder: 30, variants: [{ nameAr: 'كرتين', price: 25 }, { nameAr: '3 كرات', price: 35 }, { nameAr: '4 كرات', price: 44 }] },
  { id: 'mock-14', nameAr: 'بوظة سرسابيلا',     name: 'بوظة سرسابيلا',     nameHe: 'בוזה סרסביל',      category: 'بوظة',           price: 30, description: 'بوظة عربية أصيلة',             imageUrl: null, isActive: true, sortOrder: 31, variants: null },
  { id: 'mock-15', nameAr: 'قهوة عربية',        name: 'قهوة عربية',        nameHe: 'קפה ערבי',         category: 'مشروبات ساخنة', price: 18, description: 'قهوة عربية أصيلة بالهيل',       imageUrl: null, isActive: true, sortOrder: 40, variants: null },
  { id: 'mock-16', nameAr: 'كابتشينو',          name: 'كابتشينو',          nameHe: "קפוצ'ינו",          category: 'مشروبات ساخنة', price: 20, description: 'كابتشينو كريمي',               imageUrl: null, isActive: true, sortOrder: 41, variants: null },
  { id: 'mock-17', nameAr: 'شاي بالنعناع',      name: 'شاي بالنعناع',      nameHe: 'תה נענע',           category: 'مشروبات ساخنة', price: 15, description: 'شاي طازج بالنعناع',            imageUrl: null, isActive: true, sortOrder: 42, variants: null },
  { id: 'mock-18', nameAr: 'موكا شوكولاتة',     name: 'موكا شوكولاتة',     nameHe: 'מוקה שוקולד',      category: 'مشروبات ساخنة', price: 22, description: 'موكا شوكولاتة مع كريمة',        imageUrl: null, isActive: true, sortOrder: 43, variants: null },
  { id: 'mock-19', nameAr: 'عصير برتقال',       name: 'عصير برتقال',       nameHe: 'מיץ תפוזים',       category: 'مشروبات باردة', price: 20, description: 'عصير برتقال طازج',             imageUrl: null, isActive: true, sortOrder: 50, variants: null },
  { id: 'mock-20', nameAr: 'ليموناضة',          name: 'ليموناضة',          nameHe: 'לימונדה',           category: 'مشروبات باردة', price: 22, description: 'ليموناضة طازجة منعشة',          imageUrl: null, isActive: true, sortOrder: 51, variants: null },
  { id: 'mock-21', nameAr: 'فرابيه',            name: 'فرابيه',            nameHe: 'פרפה',              category: 'مشروبات باردة', price: 28, description: 'فرابيه باردة كريمية',           imageUrl: null, isActive: true, sortOrder: 52, variants: [{ nameAr: 'شوكولاتة', price: 28 }, { nameAr: 'كراميل', price: 28 }, { nameAr: 'فانيلا', price: 26 }] },
  { id: 'mock-22', nameAr: 'ميلك شيك',          name: 'ميلك شيك',          nameHe: 'מילקשייק',          category: 'مشروبات باردة', price: 32, description: 'ميلك شيك كريمي',               imageUrl: null, isActive: true, sortOrder: 53, variants: [{ nameAr: 'شوكولاتة', price: 32 }, { nameAr: 'فراولة', price: 32 }, { nameAr: 'فانيلا', price: 30 }] },
  { id: 'mock-23', nameAr: 'توست محشي',         name: 'توست محشي',         nameHe: 'טוסט ממולא',        category: 'أكل',            price: 25, description: 'توست محشي مشكّل',              imageUrl: null, isActive: true, sortOrder: 60, variants: null },
  { id: 'mock-24', nameAr: 'سندوتش دجاج',       name: 'سندوتش دجاج',       nameHe: 'כריך עוף',          category: 'أكل',            price: 38, description: 'سندوتش دجاج مشوي مع صوص',      imageUrl: null, isActive: true, sortOrder: 61, variants: null },
  { id: 'mock-25', nameAr: 'بيرا',              name: 'بيرا',              nameHe: 'בירה',              category: 'بيرا',           price: 25, description: 'بيرا باردة',                   imageUrl: null, isActive: true, sortOrder: 70, variants: [{ nameAr: 'كوب', price: 25 }, { nameAr: 'جمبو', price: 40 }] },
  { id: 'mock-26', nameAr: 'شيز كيك',           name: 'شيز كيك',           nameHe: 'עוגת גבינה',        category: 'حلويات خاصة',   price: 38, description: 'شيز كيك كريمي بالتوت',        imageUrl: null, isActive: true, sortOrder: 80, variants: null },
  { id: 'mock-27', nameAr: 'براونيز',           name: 'براونيز',           nameHe: 'בראוניס',           category: 'حلويات خاصة',   price: 32, description: 'براونيز شوكولاتة داكنة',       imageUrl: null, isActive: true, sortOrder: 81, variants: null },
  { id: 'mock-28', nameAr: 'كيك لوتس',          name: 'كيك لوتس',          nameHe: 'עוגת לוטוס',        category: 'حلويات خاصة',   price: 45, description: 'كيك لوتس كريمي مميز',          imageUrl: null, isActive: true, sortOrder: 82, variants: null },
];
