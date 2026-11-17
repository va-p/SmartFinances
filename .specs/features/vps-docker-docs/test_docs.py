#!/usr/bin/env python3
import argparse
import re
import unittest
from pathlib import Path


parser = argparse.ArgumentParser()
parser.add_argument("--frontend-root", type=Path)
parser.add_argument("--backend-root", type=Path)
args, remaining = parser.parse_known_args()

FRONTEND = args.frontend_root or Path(__file__).resolve().parents[3]
BACKEND = args.backend_root or FRONTEND.parent / "smart-finances-backend"
FORMER_HOST = re.compile(r"c[ -]?panel", re.IGNORECASE)
SKIPPED_DIRS = {".git", "node_modules", "dist", "logs", "build", "coverage"}


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


class DeploymentDocumentationTests(unittest.TestCase):
    def test_former_hosting_references_are_absent(self):
        matches = []
        for root in (FRONTEND, BACKEND):
            for path in root.rglob("*"):
                relative = path.relative_to(root)
                if any(part in SKIPPED_DIRS for part in relative.parts):
                    continue
                if FORMER_HOST.search(str(relative)):
                    matches.append(f"{root.name}/{relative}")
                if path.is_file() and not path.is_symlink():
                    try:
                        content = read(path)
                    except UnicodeDecodeError:
                        continue
                    for number, line in enumerate(content.splitlines(), start=1):
                        if FORMER_HOST.search(line):
                            matches.append(f"{root.name}/{relative}:{number}: {line.strip()}")
        self.assertEqual([], matches)

    def test_production_documentation_describes_current_stack(self):
        backend_readme = read(BACKEND / "README.md")
        self.assertIn("Production runs on a dedicated VPS with Docker Compose", backend_readme)
        for service in ("postgres", "api", "pgadmin"):
            self.assertIn(f"`{service}`", backend_readme)
        self.assertIn("docker compose up -d --build api", backend_readme)

        project = read(FRONTEND / ".specs/project/PROJECT.md")
        self.assertIn("deployed on a dedicated VPS with Docker Compose", project)
        self.assertIn("Dedicated VPS + Docker Compose (`api`, `postgres`, `pgadmin`)", project)

    def test_pending_migrations_keep_status_and_use_api_startup(self):
        state = read(FRONTEND / ".specs/project/STATE.md")
        for area in ("Subscription flags DB migration", "Financial goals DB migration"):
            line = next(line for line in state.splitlines() if f"| {area} |" in line)
            self.assertIn("docker compose up -d --build api", line)
            self.assertTrue(line.endswith("| Open |"), line)

    def test_cache_diagnosis_is_historical_and_requires_no_store(self):
        frontend_state = read(FRONTEND / ".specs/project/STATE.md")
        backend_state = read(BACKEND / ".specs/project/STATE.md")
        self.assertIn("former hosting", frontend_state)
        self.assertIn("infraestrutura de hospedagem anterior", backend_state)
        self.assertIn("no-store", frontend_state)
        self.assertIn("no-store", backend_state)

    def test_historical_goals_verdict_is_preserved(self):
        report = read(FRONTEND / ".specs/features/financial-goals/validation.md")
        self.assertIn("**Overall**: ✅ PASS — Ready", report)
        self.assertIn("next `api` container deployment on the VPS", report)


if __name__ == "__main__":
    unittest.main(argv=[parser.prog, *remaining])
