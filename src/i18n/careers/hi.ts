export const CAREERS_HI = {
  eyebrow: 'सिटिजन अफेयर्स में करियर', principles: 'सटीकता · स्पष्टता · भरोसा',
  signals: [['check', 'प्राथमिक स्रोत'], ['globe', 'तीन भाषाएँ'], ['group', 'नागरिक-केंद्रित काम'], ['services', 'भारत-व्यापी फोकस']],
  title: 'काम के अवसर भी हमारी रिपोर्टिंग जितने तथ्यपूर्ण होने चाहिए',
  intro: 'Citizen Affairs कोई vacancy तभी सूचीबद्ध करता है जब उसका scope, accountability, compensation process और applicant privacy terms मंजूर हों।',
  primaryAction: 'Vacancy status देखें', statusLabel: 'मौजूदा vacancy status', statusTitle: 'अभी कोई सार्वजनिक रिक्ति सूचीबद्ध नहीं है',
  statusBody: 'Repository में कोई approved public requisition नहीं है। यह किसी private hiring discussion के बारे में दावा नहीं है; यह केवल बताता है कि सामान्य role description को open job न समझें।',
  noResume: 'किसी specific approved vacancy और privacy notice के प्रकाशित होने से पहले résumé, identity document या applicant data न भेजें।',
  futureTitle: 'हर future vacancy में क्या बताना जरूरी है', futureIntro: 'नीचे के तथ्य दर्ज होकर repository validation पास किए बिना कोई vacancy open नहीं दिखाई जा सकती।',
  requirements: [
    ['Approved requisition', 'Real requisition ID, legal hiring entity और accountable hiring owner।'],
    ['स्पष्ट working terms', 'Engagement type, location, expected workload और compensation information या approved policy।'],
    ['Dates और selection', 'Opening/closing dates, selection stages और expected communication process।'],
    ['Applicant privacy', 'Data लेने से पहले purpose, processor, access, retention, deletion और grievance information।'],
    ['Safe application route', 'Validation और abuse protection वाला tested controlled route; unreviewed external form नहीं।'],
    ['Editorial independence', 'Hiring, sponsorship या commercial interest verification नहीं खरीद सकते और coverage को प्रभावित नहीं कर सकते।']
  ],
  processLabel: 'Future publication process', processTitle: 'Approved opening कैसे दिखाई जाएगी',
  process: [['01', 'पहले evidence', 'Owner complete requisition और privacy decisions दर्ज करेगा।'], ['02', 'Independent review', 'दूसरा responsible person scope, claims और data route जाँचेगा।'], ['03', 'Publish और close', 'Dated vacancy प्रकाशित, monitor और समय पर closed या remove होगी।']],
  contactTitle: 'Careers पर सामान्य सवाल?', contactText: 'सामान्य प्रश्न के लिए email-only contact page इस्तेमाल करें। Approved vacancy न होने पर résumé या personal documents attach न करें।', contactAction: 'Contact page खोलें'
} as const;
