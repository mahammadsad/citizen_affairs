import type { Locale } from '../i18n';

export const REGIONS = [
  { id: 'andhra-pradesh', en: 'Andhra Pradesh', bn: 'অন্ধ্রপ্রদেশ', hi: 'आंध्र प्रदेश' },
  { id: 'arunachal-pradesh', en: 'Arunachal Pradesh', bn: 'অরুণাচল প্রদেশ', hi: 'अरुणाचल प्रदेश' },
  { id: 'assam', en: 'Assam', bn: 'অসম', hi: 'असम' },
  { id: 'bihar', en: 'Bihar', bn: 'বিহার', hi: 'बिहार' },
  { id: 'chhattisgarh', en: 'Chhattisgarh', bn: 'ছত্তিশগড়', hi: 'छत्तीसगढ़' },
  { id: 'goa', en: 'Goa', bn: 'গোয়া', hi: 'गोवा' },
  { id: 'gujarat', en: 'Gujarat', bn: 'গুজরাট', hi: 'गुजरात' },
  { id: 'haryana', en: 'Haryana', bn: 'হরিয়ানা', hi: 'हरियाणा' },
  { id: 'himachal-pradesh', en: 'Himachal Pradesh', bn: 'হিমাচল প্রদেশ', hi: 'हिमाचल प्रदेश' },
  { id: 'jharkhand', en: 'Jharkhand', bn: 'ঝাড়খণ্ড', hi: 'झारखंड' },
  { id: 'karnataka', en: 'Karnataka', bn: 'কর্ণাটক', hi: 'कर्नाटक' },
  { id: 'kerala', en: 'Kerala', bn: 'কেরালা', hi: 'केरल' },
  { id: 'madhya-pradesh', en: 'Madhya Pradesh', bn: 'মধ্যপ্রদেশ', hi: 'मध्य प्रदेश' },
  { id: 'maharashtra', en: 'Maharashtra', bn: 'মহারাষ্ট্র', hi: 'महाराष्ट्र' },
  { id: 'manipur', en: 'Manipur', bn: 'মণিপুর', hi: 'मणिपुर' },
  { id: 'meghalaya', en: 'Meghalaya', bn: 'মেঘালয়', hi: 'मेघालय' },
  { id: 'mizoram', en: 'Mizoram', bn: 'মিজোরাম', hi: 'मिज़ोरम' },
  { id: 'nagaland', en: 'Nagaland', bn: 'নাগাল্যান্ড', hi: 'नागालैंड' },
  { id: 'odisha', en: 'Odisha', bn: 'ওডিশা', hi: 'ओडिशा' },
  { id: 'punjab', en: 'Punjab', bn: 'পাঞ্জাব', hi: 'पंजाब' },
  { id: 'rajasthan', en: 'Rajasthan', bn: 'রাজস্থান', hi: 'राजस्थान' },
  { id: 'sikkim', en: 'Sikkim', bn: 'সিকিম', hi: 'सिक्किम' },
  { id: 'tamil-nadu', en: 'Tamil Nadu', bn: 'তামিলনাড়ু', hi: 'तमिलनाडु' },
  { id: 'telangana', en: 'Telangana', bn: 'তেলেঙ্গানা', hi: 'तेलंगाना' },
  { id: 'tripura', en: 'Tripura', bn: 'ত্রিপুরা', hi: 'त्रिपुरा' },
  { id: 'uttar-pradesh', en: 'Uttar Pradesh', bn: 'উত্তরপ্রদেশ', hi: 'उत्तर प्रदेश' },
  { id: 'uttarakhand', en: 'Uttarakhand', bn: 'উত্তরাখণ্ড', hi: 'उत्तराखंड' },
  { id: 'west-bengal', en: 'West Bengal', bn: 'পশ্চিমবঙ্গ', hi: 'पश्चिम बंगाल' },
  { id: 'andaman-and-nicobar-islands', en: 'Andaman and Nicobar Islands', bn: 'আন্দামান ও নিকোবর দ্বীপপুঞ্জ', hi: 'अंडमान और निकोबार द्वीपसमूह' },
  { id: 'chandigarh', en: 'Chandigarh', bn: 'চণ্ডীগড়', hi: 'चंडीगढ़' },
  { id: 'dadra-and-nagar-haveli-and-daman-and-diu', en: 'Dadra and Nagar Haveli and Daman and Diu', bn: 'দাদরা ও নগর হাভেলি এবং দমন ও দিউ', hi: 'दादरा और नगर हवेली और दमन और दीव' },
  { id: 'delhi', en: 'Delhi', bn: 'দিল্লি', hi: 'दिल्ली' },
  { id: 'jammu-and-kashmir', en: 'Jammu and Kashmir', bn: 'জম্মু ও কাশ্মীর', hi: 'जम्मू और कश्मीर' },
  { id: 'ladakh', en: 'Ladakh', bn: 'লাদাখ', hi: 'लद्दाख' },
  { id: 'lakshadweep', en: 'Lakshadweep', bn: 'লক্ষদ্বীপ', hi: 'लक्षद्वीप' },
  { id: 'puducherry', en: 'Puducherry', bn: 'পুদুচেরি', hi: 'पुदुचेरी' }
] as const;

export type RegionId = (typeof REGIONS)[number]['id'];
export const REGION_IDS = REGIONS.map((region) => region.id) as [RegionId, ...RegionId[]];

export function regionName(id: string | undefined, locale: Locale) {
  if (!id) return '';
  const region = REGIONS.find((item) => item.id === id);
  return region?.[locale] || region?.en || id;
}

export function normalizeRegionLabel(value: string | undefined) {
  return value?.trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '';
}
