"""Unit tests for the CRM prospecting bridge's trust boundaries."""

import unittest

from fastapi import HTTPException
from pydantic import ValidationError

from app.routers.crm import (
    ProspectImportItem,
    evidence_hash,
    lead_fingerprint,
    normalize_domain,
    normalize_email,
    validate_stage_transition,
)


class CRMBridgeContractTests(unittest.TestCase):
    def test_email_normalization_is_stable(self):
        self.assertEqual(normalize_email("  Founder@Example.COM "), "founder@example.com")
        self.assertIsNone(normalize_email("   "))

    def test_domain_normalization_removes_scheme_and_www(self):
        self.assertEqual(
            normalize_domain("https://www.Example.com/jobs/platform"),
            "example.com",
        )
        self.assertEqual(normalize_domain("example.com"), "example.com")

    def test_fingerprint_deduplicates_case_and_spacing(self):
        first = lead_fingerprint(
            name="Platform Lead",
            company="Acme AI",
            email="Lead@Acme.ai",
            domain="https://acme.ai",
        )
        second = lead_fingerprint(
            name="  platform   lead ",
            company="ACME AI",
            email="lead@acme.ai",
            domain="www.acme.ai",
        )
        self.assertEqual(first, second)

    def test_evidence_hash_is_order_independent(self):
        self.assertEqual(
            evidence_hash({"company": "Acme", "signal": "hiring"}),
            evidence_hash({"signal": "hiring", "company": "Acme"}),
        )

    def test_stage_transition_blocks_skipping_the_pipeline(self):
        validate_stage_transition("lead", "qualified")
        with self.assertRaises(HTTPException) as caught:
            validate_stage_transition("lead", "active")
        self.assertEqual(caught.exception.status_code, 409)

    def test_grounded_prospect_requires_source_and_evidence(self):
        with self.assertRaises(ValidationError):
            ProspectImportItem(
                name="Platform Lead",
                company="Acme",
                source_url="",
                source_evidence="",
            )

    def test_unverified_email_remains_explicit(self):
        prospect = ProspectImportItem(
            name="Platform Lead",
            company="Acme",
            contact_email="possible@acme.ai",
            email_verification_status="unverified",
            source_url="https://acme.ai/careers",
            source_evidence="Acme is hiring for an AI developer-experience role.",
        )
        self.assertEqual(prospect.email_verification_status, "unverified")


if __name__ == "__main__":
    unittest.main()
