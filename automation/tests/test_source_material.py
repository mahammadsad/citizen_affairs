from app.discovery import _classify, is_official_url
from app.source_material import _ReadableHtmlParser


def test_official_url_filter_rejects_lookalike_domains():
    assert is_official_url("https://ssc.gov.in/") is True
    assert is_official_url("https://ssc.gov.in.evil.example/notice") is False
    assert is_official_url("javascript:alert(1)") is False


def test_listing_classification_prioritizes_relevant_public_information():
    category, score, reasons = _classify("Corrigendum: recruitment application last date extended")
    assert category in {"jobs", "notices"}
    assert score >= 60
    assert reasons


def test_html_parser_excludes_script_content_and_collects_links():
    parser = _ReadableHtmlParser()
    parser.feed("""
    <html><head><title>Official Notice</title><script>secretNoise()</script></head>
    <body><p>Applications close on the stated date.</p><a href="/notice.pdf">Download notification</a></body></html>
    """)
    text = " ".join(parser.text_parts)
    assert "Applications close" in text
    assert "secretNoise" not in text
    assert parser.links == [("/notice.pdf", "Download notification")]
