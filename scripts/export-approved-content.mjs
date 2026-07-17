import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import YAML from 'yaml';

const arg = (name) => process.argv[process.argv.indexOf(name) + 1];
const articleId = arg('--article-id');
const publicationEventId = arg('--event-id');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!uuid.test(articleId || '') || !uuid.test(publicationEventId || '')) throw new Error('Valid --article-id and --event-id values are required');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required');
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const one = async (table, select, column = 'article_id', value = articleId, optional = false) => {
  const query = supabase.from(table).select(select).eq(column, value);
  const { data, error } = optional ? await query.maybeSingle() : await query.single();
  if (error) throw new Error(`${table}: ${error.message}`);
  return data;
};

const event = await one('publication_events', '*', 'id', publicationEventId);
if (event.article_id !== articleId || !['requested', 'building'].includes(event.status)) throw new Error('Publication event is not active for this article');
const article = await one('articles', '*', 'id', articleId);
if (article.version !== event.article_version || !['approved', 'scheduled'].includes(article.workflow_status)) throw new Error('Article is not an approved current version');
const section = await one('sections', 'slug', 'id', article.primary_section_id);
const job = article.content_type === 'job' ? await one('job_details', '*', 'article_id', articleId) : null;
const scheme = article.content_type === 'scheme' ? await one('scheme_details', '*', 'article_id', articleId) : null;
const { data: sources, error: sourcesError } = await supabase.from('sources').select('*').eq('article_id', articleId).order('designation').order('created_at');
if (sourcesError) throw new Error(`sources: ${sourcesError.message}`);
const staffIds = [...new Set([article.author_id, article.assigned_editor_id, article.assigned_fact_checker_id, article.assigned_copy_reviewer_id, article.assigned_reviewer_id, article.assigned_publisher_id].filter(Boolean))];
const { data: profiles, error: profilesError } = await supabase.from('staff_public_profiles').select('staff_id, slug, is_published').in('staff_id', staffIds);
if (profilesError) throw new Error(`staff_public_profiles: ${profilesError.message}`);
const profileById = new Map((profiles || []).map((profile) => [profile.staff_id, profile]));
for (const staffId of staffIds) if (!profileById.get(staffId)?.is_published) throw new Error(`Staff member ${staffId} needs a published public profile before publication`);
const staffSlug = (id) => id ? profileById.get(id)?.slug : undefined;
const dateOnly = (value) => value ? String(value).slice(0, 10) : undefined;
const iso = (value) => value ? new Date(value).toISOString() : undefined;
const list = (value) => Array.isArray(value) ? value.map(String) : value && typeof value === 'object' ? Object.entries(value).map(([key, item]) => `${key}: ${item}`) : value ? [String(value)] : [];
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== null && item !== undefined && item !== '').map(([key, item]) => [key, clean(item)]));
  return value;
};
const validSourceTypes = new Set(['official-notification', 'official-portal', 'official-order', 'press-release', 'government-dataset', 'secondary']);

const frontmatter = clean({
  contentType: article.content_type,
  sourceRecordId: article.id,
  publicationEventId,
  language: article.language,
  translationKey: article.translation_group_id,
  urlSlug: article.slug,
  title: article.title,
  description: article.short_description,
  date: iso(article.publication_date || event.requested_at),
  updated: iso(article.updated_date),
  author: staffSlug(article.author_id),
  assignedEditor: staffSlug(article.assigned_editor_id),
  factCheckedBy: staffSlug(article.assigned_fact_checker_id),
  copyReviewedBy: staffSlug(article.assigned_copy_reviewer_id),
  reviewedBy: staffSlug(article.assigned_reviewer_id),
  publishedBy: staffSlug(article.assigned_publisher_id),
  workflowStatus: 'published',
  nextReviewDate: iso(article.next_review_date),
  category: section.slug,
  tags: article.tags || [],
  featured: article.featured,
  featuredImage: article.featured_image_path?.startsWith('/uploads/') ? article.featured_image_path : undefined,
  featuredImageAlt: article.featured_image_path?.startsWith('/uploads/') ? article.featured_image_alt : undefined,
  draft: false,
  seoTitle: article.seo_title,
  seoDescription: article.seo_description,
  canonical: article.canonical_url,
  verificationStatus: article.verification_status,
  sources: (sources || []).map((source) => clean({
    title: source.title,
    url: source.url,
    publishingAuthority: source.publishing_authority,
    sourceType: validSourceTypes.has(source.source_type) ? source.source_type : source.designation === 'primary' ? 'official-portal' : 'secondary',
    designation: source.designation,
    documentNumber: source.document_number,
    publicationDate: dateOnly(source.publication_date),
    accessedDate: dateOnly(source.accessed_date),
    archivedUrl: source.archived_url,
    notes: source.notes,
  })),
  lastVerified: iso(article.last_verified_date),
  governmentLevel: article.government_level,
  state: article.state_or_ut,
  qualification: job?.qualification || [],
  amountOrVacancies: job ? `${job.total_vacancies} vacancies` : scheme?.benefit_amount,
  officialNoticeUrl: job?.official_notification_url,
  applicationUrl: job?.official_application_url || scheme?.official_portal,
  deadline: iso(job?.application_deadline),
  job: job && {
    recruitingOrganization: job.recruiting_organization, postName: job.post_name, notificationNumber: job.notification_number,
    notificationDate: dateOnly(job.notification_date), department: job.department, employmentType: job.employment_type,
    totalVacancies: job.total_vacancies, categoryWiseVacancies: job.category_wise_vacancies || {}, qualification: job.qualification,
    experienceRequirement: job.experience_requirement, minimumAge: job.minimum_age, maximumAge: job.maximum_age,
    ageCalculationDate: dateOnly(job.age_calculation_date), ageRelaxation: job.age_relaxation || [], salaryMinimum: job.salary_minimum,
    salaryMaximum: job.salary_maximum, salaryUnit: job.salary_unit, payLevel: job.pay_level, applicationFee: list(job.application_fee),
    feeExemptions: job.fee_exemptions || [], applicationStartDate: iso(job.application_start_date), applicationDeadline: iso(job.application_deadline),
    correctionWindowDates: list(job.correction_window), admitCardDate: iso(job.admit_card_date), examinationDate: iso(job.examination_date),
    resultDate: iso(job.result_date), selectionProcess: job.selection_process, jobLocation: job.job_location || [], applicationMode: job.application_mode,
    officialNotificationUrl: job.official_notification_url, officialApplicationUrl: job.official_application_url, recruitmentStatus: job.recruitment_status,
  },
  scheme: scheme && {
    schemeName: scheme.scheme_name, alternativeNames: scheme.alternative_names || [], ministry: scheme.ministry, department: scheme.department,
    schemeLevel: scheme.scheme_level, launchDate: dateOnly(scheme.launch_date), targetBeneficiaries: scheme.target_beneficiaries,
    benefitType: scheme.benefit_types, benefitAmount: scheme.benefit_amount, benefitFrequency: scheme.benefit_frequency,
    minimumAge: scheme.minimum_age, maximumAge: scheme.maximum_age, incomeLimit: scheme.income_limit, residenceRequirement: scheme.residence_requirement,
    occupationRequirement: scheme.occupation_requirement, eligibilityCriteria: scheme.eligibility_criteria, exclusionConditions: scheme.exclusion_conditions || [],
    requiredDocuments: scheme.required_documents || [], applicationProcess: scheme.application_process, applicationMode: scheme.application_mode,
    officialPortal: scheme.official_portal, helplineInformation: scheme.helpline_information || [], schemeStatus: scheme.scheme_status,
    lastOfficialPolicyUpdate: dateOnly(scheme.last_official_policy_update),
  },
});
const directory = path.join(process.cwd(), 'src', 'content', 'articles', article.language);
const output = path.join(directory, `${article.slug}.md`);
await mkdir(directory, { recursive: true });
await writeFile(output, `---\n${YAML.stringify(frontmatter, { lineWidth: 0 }).trim()}\n---\n\n${article.body_markdown.trim()}\n`, 'utf8');
process.stdout.write(`${output}\n`);
