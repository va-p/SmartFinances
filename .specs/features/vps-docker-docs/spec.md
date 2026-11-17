# VPS Docker Documentation Specification

## Problem Statement

The project documentation still describes the former hosting platform even though production now runs on a dedicated VPS with Docker containers. This can lead maintainers to follow obsolete deployment, migration, and cache troubleshooting instructions.

## Goals

- [ ] Remove all references to the former hosting platform from both repositories.
- [ ] Make VPS and Docker Compose the only documented production deployment model.
- [ ] Preserve useful historical context and existing migration statuses.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Runtime code changes | This is a documentation and environment-template cleanup. |
| Docker or proxy configuration changes | The current VPS configuration already exists. |
| Production deployment or migrations | Remote operations require separate authorization. |
| Unrelated local changes | Existing application work must remain untouched. |

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Historical records | Keep the records, replacing obsolete platform names and instructions. | This preserves context without presenting the former environment as current. | y |
| Migration status | Keep every existing Open/Resolved status unchanged. | No production migration was run as part of this cleanup. | y |
| Docker files | Use the existing README as the deployment source of truth. | It documents the services and commands already used on the VPS. | y |
| Remaining requirement dimensions | N/A for this documentation-only scope. | There are no runtime state, input, auth, concurrency, or external-call changes. | y |

**Open questions:** none.

## User Stories

### P1: Current deployment documentation

**User Story**: As a maintainer, I want all project records to describe the VPS deployment so that I do not follow obsolete hosting instructions.

**Why P1**: Incorrect deployment instructions can direct maintenance to the wrong environment.

**Acceptance Criteria**:

1. The repositories SHALL return zero matches for the case-insensitive pattern `c[ -]?[Pp][Aa][Nn][Ee][Ll]` in project files, excluding Git internals, dependencies, build outputs, and logs.
2. WHEN production deployment is described THEN the documentation SHALL identify a dedicated VPS running the `api`, `postgres`, and `pgadmin` services with Docker Compose.
3. WHEN a pending migration is documented THEN the documentation SHALL target the VPS database through the existing API container deployment flow and SHALL preserve its Open status.
4. WHEN the historical stale-response diagnosis is documented THEN the documentation SHALL identify it as belonging to the former hosting environment and SHALL retain `Cache-Control: no-store` as the expected cache policy.

**Independent Test**: Run the repository-wide forbidden-reference scan, inspect the deployment and migration passages, and confirm that the current Docker commands and unchanged statuses are present.

## Edge Cases

- IF a historical specification or validation report contains an obsolete deployment target THEN the record SHALL be updated without changing its original feature verdict.
- IF an unrelated modified file exists in either worktree THEN the cleanup SHALL leave that file outside the documentation commits.

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| VPS-01 | P1: Current deployment documentation | Execute | Implementing |
| VPS-02 | P1: Current deployment documentation | Execute | Implementing |
| VPS-03 | P1: Current deployment documentation | Execute | Implementing |
| VPS-04 | P1: Current deployment documentation | Execute | Implementing |

**Coverage:** 4 total, 4 mapped to inline execution, 0 unmapped.

## Success Criteria

- [ ] Both repositories pass the forbidden-reference scan with zero matches.
- [ ] Production documentation consistently describes VPS and Docker Compose.
- [ ] Pending migration statuses and historical validation verdicts remain unchanged.
- [ ] Unrelated modified files are not included in the documentation commits.
