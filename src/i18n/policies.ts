import type { Locale } from './index';

export type PolicyId = 'privacy' | 'terms' | 'disclaimer';
type PolicySection = readonly [heading: string, body: string];

export function policyCopy(locale: Locale, brandName: string, contactEmail: string): Record<PolicyId, readonly PolicySection[]> {
  const copy = {
    en: {
      privacy: [
        ['Information we collect', 'This is currently a static website. It does not operate an account system or store visitor profiles. Language, theme, filter and saved-article preferences may be stored on your device.'],
        ['Analytics and advertising', 'Tracking analytics and advertising are disabled by default. This policy will be updated before either is activated.'],
        ['External services', 'Telegram, WhatsApp and linked government portals apply their own privacy policies when you visit them.'],
        ['Contact', contactEmail ? `For a privacy question, contact us at ${contactEmail}.` : 'Direct contact is temporarily unavailable. A brand-only contact route will be published when it is ready.']
      ],
      terms: [
        ['Informational purpose', 'Content is provided to make public information easier to understand. It is not legal, financial or official government advice.'],
        ['Final authority', 'The original notification, order or government portal is the final authority. Always check it before applying or making a payment.'],
        ['Acceptable use', 'Do not reproduce the site in a misleading way, impersonate a government body or use its content for fraud.']
      ],
      disclaimer: [
        ['Independent platform', `${brandName} is an independent information platform. It is not a government department and does not issue official approvals.`],
        ['Accuracy and corrections', 'We aim to verify dates, amounts, eligibility and links. Government information can change, and corrections are added when identified.'],
        ['External links', 'We link to original sources for convenience but do not control the availability or security of external websites.']
      ]
    },
    bn: {
      privacy: [
        ['আমরা যে তথ্য সংরক্ষণ করি', 'এটি বর্তমানে একটি স্থির ওয়েবসাইট। এখানে কোনো অ্যাকাউন্ট ব্যবস্থা নেই এবং দর্শনার্থীর প্রোফাইল সংরক্ষণ করা হয় না। ভাষা, থিম, ফিল্টার ও সংরক্ষিত নিবন্ধের পছন্দ আপনার ডিভাইসে রাখা হতে পারে।'],
        ['বিশ্লেষণ ও বিজ্ঞাপন', 'দর্শনার্থী বিশ্লেষণ ও বিজ্ঞাপন সাধারণভাবে বন্ধ রয়েছে। এগুলো চালু করার আগে এই নীতি সংশোধন করা হবে।'],
        ['বাহ্যিক পরিষেবা', 'Telegram, WhatsApp ও সংযুক্ত সরকারি পোর্টালে গেলে সংশ্লিষ্ট পরিষেবার নিজস্ব গোপনীয়তা নীতি প্রযোজ্য হবে।'],
        ['যোগাযোগ', contactEmail ? `গোপনীয়তা সংক্রান্ত প্রশ্নে ${contactEmail}-এ যোগাযোগ করুন।` : 'সরাসরি যোগাযোগ সাময়িকভাবে বন্ধ। ব্র্যান্ডের নিজস্ব যোগাযোগের ব্যবস্থা প্রস্তুত হলে প্রকাশ করা হবে।']
      ],
      terms: [
        ['তথ্য প্রদানের উদ্দেশ্য', 'জনসাধারণের তথ্য সহজে বোঝানোর জন্য বিষয়বস্তু প্রকাশ করা হয়। এটি আইনি, আর্থিক বা সরকারি পরামর্শ নয়।'],
        ['চূড়ান্ত কর্তৃপক্ষ', 'মূল বিজ্ঞপ্তি, আদেশ বা সরকারি পোর্টালই চূড়ান্ত কর্তৃপক্ষ। আবেদন বা অর্থ প্রদান করার আগে অবশ্যই মূল সূত্র যাচাই করুন।'],
        ['গ্রহণযোগ্য ব্যবহার', 'বিভ্রান্তিকরভাবে ওয়েবসাইট নকল করা, সরকারি প্রতিষ্ঠানের পরিচয় ধারণ করা বা প্রতারণার কাজে এর বিষয়বস্তু ব্যবহার করা যাবে না।']
      ],
      disclaimer: [
        ['স্বাধীন প্ল্যাটফর্ম', `${brandName} একটি স্বাধীন তথ্য প্ল্যাটফর্ম। এটি কোনো সরকারি দপ্তর নয় এবং কোনো সরকারি অনুমোদন প্রদান করে না।`],
        ['নির্ভুলতা ও সংশোধন', 'আমরা তারিখ, অর্থের পরিমাণ, যোগ্যতা ও লিঙ্ক যাচাই করার চেষ্টা করি। সরকারি তথ্য পরিবর্তিত হতে পারে; ভুল শনাক্ত হলে সংশোধন করা হয়।'],
        ['বাহ্যিক লিঙ্ক', 'সুবিধার জন্য মূল সূত্রের লিঙ্ক দেওয়া হয়, তবে বাহ্যিক ওয়েবসাইটের প্রাপ্যতা বা নিরাপত্তা আমাদের নিয়ন্ত্রণে নেই।']
      ]
    },
    hi: {
      privacy: [
        ['हम कौन-सी जानकारी रखते हैं', 'यह वर्तमान में एक स्थिर वेबसाइट है। इसमें कोई खाता प्रणाली नहीं है और आगंतुकों की प्रोफ़ाइल संग्रहीत नहीं की जाती। भाषा, थीम, फ़िल्टर और सहेजे गए लेखों की पसंद आपके डिवाइस पर रखी जा सकती है।'],
        ['विश्लेषण और विज्ञापन', 'आगंतुक विश्लेषण और विज्ञापन सामान्य रूप से बंद हैं। इन्हें चालू करने से पहले इस नीति को अपडेट किया जाएगा।'],
        ['बाहरी सेवाएँ', 'Telegram, WhatsApp और जुड़े सरकारी पोर्टल पर जाने पर उनकी अपनी गोपनीयता नीतियाँ लागू होती हैं।'],
        ['संपर्क', contactEmail ? `गोपनीयता संबंधी प्रश्न के लिए ${contactEmail} पर संपर्क करें।` : 'सीधा संपर्क अस्थायी रूप से उपलब्ध नहीं है। ब्रांड का संपर्क माध्यम तैयार होने पर प्रकाशित किया जाएगा।']
      ],
      terms: [
        ['सूचनात्मक उद्देश्य', 'सामग्री सार्वजनिक जानकारी को आसान भाषा में समझाने के लिए दी जाती है। यह कानूनी, वित्तीय या आधिकारिक सरकारी सलाह नहीं है।'],
        ['अंतिम प्राधिकरण', 'मूल सूचना, आदेश या सरकारी पोर्टल ही अंतिम प्राधिकरण है। आवेदन या भुगतान से पहले उसे अवश्य जाँचें।'],
        ['स्वीकार्य उपयोग', 'वेबसाइट की भ्रामक नकल न करें, सरकारी संस्था का रूप धारण न करें और इसकी सामग्री का धोखाधड़ी में उपयोग न करें।']
      ],
      disclaimer: [
        ['स्वतंत्र मंच', `${brandName} एक स्वतंत्र सूचना मंच है। यह सरकारी विभाग नहीं है और आधिकारिक मंज़ूरी जारी नहीं करता।`],
        ['सटीकता और सुधार', 'हम तारीखों, राशि, पात्रता और लिंक को सत्यापित करने का प्रयास करते हैं। सरकारी जानकारी बदल सकती है और त्रुटि मिलने पर सुधार किया जाता है।'],
        ['बाहरी लिंक', 'सुविधा के लिए मूल स्रोतों के लिंक दिए जाते हैं, लेकिन बाहरी वेबसाइटों की उपलब्धता या सुरक्षा हमारे नियंत्रण में नहीं है।']
      ]
    }
  } as const;
  return copy[locale];
}
