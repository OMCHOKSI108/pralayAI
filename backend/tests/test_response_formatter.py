"""Tests for response_formatter.py"""
import unittest
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.response_formatter import (
    format_response,
    get_mode_instruction,
    RESPONSE_MODE_INSTRUCTIONS,
    _has_structure,
    _strip_disclaimers,
)


class TestStripDisclaimers(unittest.TestCase):
    def test_removes_general_knowledge_note(self):
        text = (
            "SQL injection is a code injection technique.\n\n"
            "Note: This answer is based on general knowledge. "
            "For critical decisions, please verify with authoritative sources."
        )
        result = _strip_disclaimers(text)
        self.assertNotIn("general knowledge", result)
        self.assertIn("SQL injection", result)

    def test_removes_ai_disclaimer(self):
        text = "Malware is software designed to harm. As an AI language model, I cannot guarantee accuracy."
        result = _strip_disclaimers(text)
        self.assertNotIn("AI language model", result)
        self.assertIn("Malware", result)

    def test_removes_blockquote_disclaimer(self):
        text = "Good answer.\n\n> **Note:** This answer is based on general knowledge, please verify."
        result = _strip_disclaimers(text)
        self.assertNotIn("general knowledge", result)
        self.assertIn("Good answer", result)

    def test_clean_text_unchanged(self):
        text = "**Phishing** is a social engineering attack that tricks users into revealing credentials."
        result = _strip_disclaimers(text)
        self.assertEqual(result, text)

    def test_collapses_extra_blank_lines(self):
        text = "Line one.\n\n\n\n\nLine two."
        result = _strip_disclaimers(text)
        self.assertEqual(result.count("\n"), 2)


class TestHasStructure(unittest.TestCase):
    def test_detects_heading(self):
        self.assertTrue(_has_structure("## What is SQL Injection?\n\nIt's..."))

    def test_detects_bullet(self):
        self.assertTrue(_has_structure("- Prevention step one\n- Prevention step two"))

    def test_detects_numbered_list(self):
        self.assertTrue(_has_structure("1. First step\n2. Second step"))

    def test_plain_text_false(self):
        self.assertFalse(_has_structure("This is just plain text without any structure."))


class TestFormatResponse(unittest.TestCase):
    def test_blocked_adds_header(self):
        result = format_response("I can't help with hacking.", "unsafe_cyber_request", blocked=True)
        self.assertIn("## I Can't Help With That", result)

    def test_blocked_adds_safe_alternatives(self):
        result = format_response("Refused.", "unsafe_cyber_request", blocked=True)
        self.assertIn("What I Can Help With", result)

    def test_cybersecurity_intent_adds_header(self):
        plain = "Incident response is a structured approach to security incidents."
        result = format_response(plain, "cybersecurity_concept")
        self.assertIn("## Cybersecurity Explanation", result)
        self.assertIn("Incident response", result)

    def test_structured_output_not_double_headed(self):
        structured = "## What Is It?\n\nSQL injection is..."
        result = format_response(structured, "cybersecurity_concept")
        # Should NOT prepend another heading since structure already exists
        self.assertEqual(result.count("##"), 1)

    def test_sources_appended(self):
        sources = [{"title": "OWASP", "url": "https://owasp.org"}]
        result = format_response("Answer here.", "cybersecurity_concept", sources=sources)
        self.assertIn("## Sources", result)
        self.assertIn("OWASP", result)
        self.assertIn("https://owasp.org", result)

    def test_sources_not_duplicated(self):
        sources = [{"title": "OWASP", "url": "https://owasp.org"}]
        text_with_sources = "Answer.\n\n## Sources\n1. [OWASP](https://owasp.org)"
        result = format_response(text_with_sources, "cybersecurity_concept", sources=sources)
        self.assertEqual(result.count("## Sources"), 1)

    def test_normal_chat_no_forced_header(self):
        result = format_response("Hello! How can I help you today?", "normal_chat")
        self.assertNotIn("##", result)

    def test_memory_read_header(self):
        result = format_response("Your sister's name is Tisha.", "personal_memory_read")
        self.assertIn("## From This Conversation", result)

    def test_company_query_header(self):
        result = format_response("I don't have info about that company.", "company_or_person_query")
        self.assertIn("## Verified Source Required", result)

    def test_disclaimers_stripped_before_structure_check(self):
        text = (
            "Zero trust is a security model.\n\n"
            "Note: This answer is based on general knowledge. "
            "For critical decisions, please verify with authoritative sources."
        )
        result = format_response(text, "cybersecurity_concept")
        self.assertNotIn("general knowledge", result)
        self.assertIn("## Cybersecurity Explanation", result)

    def test_blocked_refusal_no_duplicate_footer(self):
        raw = "I can't help with that."
        result1 = format_response(raw, "unsafe_cyber_request", blocked=True)
        result2 = format_response(result1, "unsafe_cyber_request", blocked=True)
        self.assertEqual(result1.count("What I Can Help With"), 1)
        self.assertEqual(result2.count("What I Can Help With"), 1)


class TestResponseModes(unittest.TestCase):
    def test_all_modes_have_instruction(self):
        for mode in ("short", "medium", "detailed", "step-by-step", "table"):
            instruction = get_mode_instruction(mode)
            self.assertIsInstance(instruction, str)
            self.assertGreater(len(instruction), 10)

    def test_unknown_mode_returns_medium(self):
        instruction = get_mode_instruction("unknown_mode")
        self.assertEqual(instruction, RESPONSE_MODE_INSTRUCTIONS["medium"])

    def test_short_mode_mentions_bullets(self):
        self.assertIn("bullet", get_mode_instruction("short").lower())

    def test_detailed_mode_mentions_sections(self):
        self.assertIn("section", get_mode_instruction("detailed").lower())

    def test_table_mode_mentions_table(self):
        self.assertIn("table", get_mode_instruction("table").lower())

    def test_step_by_step_mentions_steps(self):
        self.assertIn("step", get_mode_instruction("step-by-step").lower())


if __name__ == "__main__":
    unittest.main()
