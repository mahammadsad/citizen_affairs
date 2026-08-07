import json
import re
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from .schemas import FactCheckResult, GeneratedDraft, ResearchDossier, SeoAnalysis, TopicCandidate

_FRONTMATTER_RE = re.compile(r"^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)")
_FIELD_RE_TEMPLATE = r"(?m)^%s:\s*[\"']?([^\"'\n]+)"
_URL_RE = re.compile(r"https?://[^\s\"'\]]+")
_PUBLIC_WORKFLOWS = {"published", "corrected", "closed"}


def _canonical_url(value: str) -> str:
    parsed = urlsplit(value.strip())
    return urlunsplit((parsed.scheme.lower(), parsed.netloc.lower(), parsed.path.rstrip("/"), parsed.query, ""))


def _yaml_scalar(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def _yaml_list(name: str, values: list[str]) -> list[str]:
    if not values:
        return [f"{name}: []"]
    lines = [f"{name}:"]
    lines.extend(f"  - {_yaml_scalar(value)}" for value in values)
    return lines


def _clean_list(values: list[str], limit: int) -> list[str]:
    cleaned: list[str] = []
    seen: set[str] = set()
    for item in values:
        value = " ".join(str(item).split()).strip()
        key = value.casefold()
        if value and key not in seen:
            seen.add(key)
            cleaned.append(value[:500])
        if len(cleaned) >= limit:
            break
    return cleaned


def _sanitize_body_markdown(value: str) -> str:
    """Keep generated article bodies compatible with the site's heading contract.

    ArticleLayout owns the single page H1, so any accidental model-generated Markdown
    H1 is demoted to H2. Fenced code blocks are left untouched.
    """
    lines = value.strip().splitlines()
    cleaned: list[str] = []
    fence_marker: str | None = None

    for line in lines:
        stripped = line.lstrip()
        marker = stripped[:3] if stripped.startswith(("```", "~~~")) else None
        if marker:
            if fence_marker is None:
                fence_marker = marker
            elif fence_marker == marker:
                fence_marker = None
            cleaned.append(line)
            continue

        if fence_marker is None:
            match = re.match(r"^(\s*)#(?!#)(?=\s)(.*)$", line)
            if match:
                line = f"{match.group(1)}##{match.group(2)}"

        cleaned.append(line)

    return "\n".join(cleaned).strip()


@dataclass(slots=True)
class ExistingArticle:
    path: Path
    title: str
    url_slug: str
    source_urls: set[str]
    is_public: bool


class DraftRepository:
    def __init__(self, repository_root: Path) -> None:
        self.root = repository_root
        self.article_root = repository_root / "src" / "content" / "articles"

    def existing_articles(self) -> list[ExistingArticle]:
        articles: list[ExistingArticle] = []
        if not self.article_root.exists():
            return articles
        for path in self.article_root.glob("*/*.md"):
            source = path.read_text(encoding="utf-8")
            match = _FRONTMATTER_RE.match(source)
            if not match:
                continue
            frontmatter = match.group(1)

            def field(name: str) -> str:
                found = re.search(_FIELD_RE_TEMPLATE % re.escape(name), frontmatter)
                return found.group(1).strip() if found else ""

            urls = {_canonical_url(item.rstrip(",")) for item in _URL_RE.findall(frontmatter)}
            draft_value = field("draft").casefold()
            workflow = field("workflowStatus").casefold()
            is_public = draft_value == "false" and workflow in _PUBLIC_WORKFLOWS
            articles.append(ExistingArticle(path, field("title"), field("urlSlug"), urls, is_public))
        return articles

    def is_duplicate(self, candidate: TopicCandidate) -> bool:
        target = _canonical_url(str(candidate.source_url))
        return any(target in article.source_urls for article in self.existing_articles())

    def internal_link_context(self, limit: int = 30) -> list[dict]:
        context: list[dict] = []
        for article in self.existing_articles():
            if not article.is_public or not article.title or not article.url_slug:
                continue
            language = article.path.parent.name
            context.append({
                "title": article.title,
                "url": f"https://citizenaffairs.in/{language}/{article.url_slug}/",
            })
            if len(context) >= limit:
                break
        return context

    def target_path(self, language: str, slug: str) -> Path:
        return self.article_root / language / f"{slug}.md"

    def render(
        self,
        *,
        language: str,
        candidate: TopicCandidate,
        dossier: ResearchDossier,
        seo: SeoAnalysis,
        draft: GeneratedDraft,
        factcheck: FactCheckResult,
    ) -> str:
        today = date.today()
        next_review = today + timedelta(days=7 if candidate.deadline_urgency == "high" else 30)
        official_sources = dossier.official_sources
        source_urls = [str(source.url) for source in official_sources]
        tags = _clean_list(
            [seo.primary_keyword, *seo.secondary_keywords, *seo.long_tail_keywords],
            8,
        )
        quick_summary = _clean_list(draft.quick_summary, 5)
        important_dates = _clean_list(draft.important_dates, 15)
        qualification = _clean_list(draft.qualification, 15)
        required_documents = _clean_list(draft.required_documents, 20)
        workflow_status = "draft" if factcheck.review_ready else "verification-failed"
        check_label = "passed" if factcheck.review_ready else "requires manual verification"

        government_level = {
            "national": "central",
            "state": "state",
            "local": "state",
        }.get(candidate.relevance_scope)
        if (candidate.state_or_ut or "").casefold() == "west bengal":
            government_level = "west-bengal"

        lines = [
            "---",
            f"language: {language}",
            "contentType: explainer",
            f"workflowStatus: {workflow_status}",
            f"translationKey: {seo.url_slug}",
            f"urlSlug: {seo.url_slug}",
            f"title: {_yaml_scalar(draft.title)}",
            f"description: {_yaml_scalar(draft.short_description)}",
            f"date: {today.isoformat()}",
            f"updated: {today.isoformat()}",
            f"lastVerified: {today.isoformat()}",
            f"nextReviewDate: {next_review.isoformat()}",
            "author: mahammad-sad",
            f"category: {draft.portal_category}",
            "verificationStatus: under-verification",
        ]
        lines.extend(_yaml_list("sourceUrls", source_urls))
        lines.append("sources:")
        for source in official_sources:
            lines.extend([
                f"  - title: {_yaml_scalar(source.title)}",
                f"    url: {_yaml_scalar(str(source.url))}",
                f"    publishingAuthority: {_yaml_scalar(source.publishing_authority)}",
                "    sourceType: official-notification",
                "    designation: primary",
                f"    accessedDate: {today.isoformat()}",
            ])
            if source.document_number:
                lines.append(f"    documentNumber: {_yaml_scalar(source.document_number)}")
            if source.publication_date:
                lines.append(f"    publicationDate: {_yaml_scalar(source.publication_date)}")
        lines.extend(_yaml_list("tags", tags))
        lines.extend([
            "featured: false",
            "draft: true",
            f"seoTitle: {_yaml_scalar(draft.seo_title)}",
            f"seoDescription: {_yaml_scalar(draft.seo_description)}",
            f"officialNoticeUrl: {_yaml_scalar(str(candidate.source_url))}",
        ])
        if government_level:
            lines.append(f"governmentLevel: {government_level}")
        if candidate.state_or_ut:
            lines.append(f"regionLabel: {_yaml_scalar(candidate.state_or_ut)}")
        lines.extend(_yaml_list("quickSummary", quick_summary))
        lines.extend(_yaml_list("importantDates", important_dates))
        lines.extend(_yaml_list("qualification", qualification))
        lines.extend(_yaml_list("requiredDocuments", required_documents))
        if draft.amount_or_vacancies:
            lines.append(f"amountOrVacancies: {_yaml_scalar(draft.amount_or_vacancies)}")
        lines.extend(_yaml_list(
            "updateHistory",
            [f"{today.isoformat()}: Automated official-source draft created; independent AI fact-check {check_label}. Human editorial review is required before publication."],
        ))
        if draft.faqs:
            lines.append("faqs:")
            for faq in draft.faqs:
                lines.extend([
                    f"  - question: {_yaml_scalar(faq.question)}",
                    f"    answer: {_yaml_scalar(faq.answer)}",
                ])
        else:
            lines.append("faqs: []")
        lines.append("---")
        lines.append(_sanitize_body_markdown(draft.body_markdown))
        lines.append("")
        return "\n".join(lines)

    def save(
        self,
        *,
        language: str,
        candidate: TopicCandidate,
        dossier: ResearchDossier,
        seo: SeoAnalysis,
        draft: GeneratedDraft,
        factcheck: FactCheckResult,
    ) -> Path | None:
        path = self.target_path(language, seo.url_slug)
        if path.exists():
            return None
        path.parent.mkdir(parents=True, exist_ok=True)
        content = self.render(
            language=language,
            candidate=candidate,
            dossier=dossier,
            seo=seo,
            draft=draft,
            factcheck=factcheck,
        )
        path.write_text(content, encoding="utf-8")
        return path
