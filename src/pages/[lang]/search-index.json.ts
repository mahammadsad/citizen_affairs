import { getCollection } from 'astro:content';
import { categoryName, getCategoryData } from '@lib/content';
import { deadlineState } from '@lib/deadline';
import { regionName } from '@lib/regions';
import { isActiveCategory, SITE } from '@utils/constants';
import { locales, verificationLabels, type Locale } from '../../i18n';

export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang }, props: { locale: lang } }));
}

export async function GET({ props }: { props: { locale: Locale } }) {
  const { locale } = props;
  const articles = await getCollection('articles', ({ data }) =>
    !data.draft
    && ['published', 'corrected', 'closed'].includes(data.workflowStatus)
    && data.language === locale
    && data.verificationStatus !== 'withdrawn'
    && isActiveCategory(data.category)
  );

  const items = await Promise.all(articles.map(async (article) => {
    const data = article.data;
    const category = await getCategoryData(data.category);
    const categoryLabel = category ? categoryName(category, locale) : data.category;
    const qualification = [...new Set([
      ...data.qualification,
      ...(data.job?.qualification || []),
      ...(data.scheme?.targetBeneficiaries || []),
      ...(data.scheme?.eligibilityCriteria || []),
      ...(data.admission?.eligibilityCriteria || []),
      ...(data.scholarship?.academicLevel || []),
      ...(data.scholarship?.targetStudents || []),
      ...(data.scholarship?.eligibilityCriteria || []),
      ...(data.service?.eligibilityCriteria || []),
      ...(data.alert?.affectedPeople || [])
    ].filter(Boolean))];

    const structuredActionUrls = [
      data.job?.officialNotificationUrl,
      data.job?.officialApplicationUrl,
      data.scheme?.officialPortal,
      data.admission?.officialProspectusUrl,
      data.admission?.officialApplicationUrl,
      data.scholarship?.officialPortal,
      data.service?.officialPortal,
      data.alert?.officialOrderUrl
    ].filter((value): value is string => Boolean(value));
    const sourceUrls = [...new Set([
      ...data.sourceUrls,
      ...data.sources.map((source) => source.url),
      data.officialNoticeUrl,
      data.applicationUrl,
      ...structuredActionUrls
    ].filter((value): value is string => Boolean(value)))];

    const keywords = [
      data.description,
      categoryLabel,
      ...data.tags,
      ...data.quickSummary,
      ...data.importantDates,
      ...qualification,
      data.governmentLevel || '',
      data.state || '',
      data.regionLabel || '',
      data.amountOrVacancies || '',
      data.job?.recruitingOrganization || '',
      data.job?.postName || '',
      data.job?.notificationNumber || '',
      data.job?.department || '',
      data.job?.employmentType || '',
      data.job?.payLevel || '',
      ...(data.job?.jobLocation || []),
      ...(data.job?.selectionProcess || []),
      data.scheme?.schemeName || '',
      ...(data.scheme?.alternativeNames || []),
      data.scheme?.ministry || '',
      data.scheme?.department || '',
      ...(data.scheme?.benefitType || []),
      data.scheme?.benefitAmount || '',
      data.admission?.institution || '',
      data.admission?.programme || '',
      data.admission?.admissionLevel || '',
      data.admission?.academicSession || '',
      data.admission?.entranceExam || '',
      data.scholarship?.scholarshipName || '',
      data.scholarship?.provider || '',
      data.scholarship?.benefitAmount || '',
      data.service?.serviceName || '',
      data.service?.department || '',
      ...(data.service?.serviceActions || []),
      data.alert?.alertType || '',
      data.alert?.issuingAuthority || '',
      ...(data.alert?.actionRequired || [])
    ].filter(Boolean);

    const governmentScope = ['west-bengal', 'other-state'].includes(data.governmentLevel || '')
      ? 'state'
      : data.governmentLevel || '';
    const state = data.state || (data.governmentLevel === 'west-bengal' ? 'west-bengal' : '');

    return {
      label: data.title,
      sub: categoryLabel,
      description: data.description,
      category: categoryLabel,
      categoryId: data.category,
      type: data.contentType,
      verification: verificationLabels[locale][data.verificationStatus],
      verificationId: data.verificationStatus,
      status: deadlineState(data.deadline),
      state,
      regionLabel: data.regionLabel || regionName(state, locale),
      governmentLevel: governmentScope,
      qualification,
      deadline: data.deadline?.toISOString() || '',
      published: data.date.toISOString(),
      updated: (data.updated || data.lastVerified || data.date).toISOString(),
      sourceCount: sourceUrls.length,
      actionAvailable: Boolean(data.applicationUrl || data.officialNoticeUrl || structuredActionUrls.length),
      href: `${SITE.basePath}${locale}/articles/${data.urlSlug}/`,
      keywords
    };
  }));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
