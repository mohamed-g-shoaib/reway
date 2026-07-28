# README structure patterns

Choose one primary pattern from the intended reader and the project evidence. These are defaults, not fixed templates. Drop any section that has no useful, verified content.

## Shared opening

Most README files should begin with:

1. An intentional cover, logo, or badge group, if one exists
2. Project name
3. One sentence that says what it is and who it helps
4. Two to four sentences that explain the value and scope

The reader should understand the project before seeing setup commands or a technology list.

## Agency case study

Use for portfolio work, selected projects, client delivery, or agency website reuse.

Recommended order:

1. At a glance
2. Brief or starting point
3. Challenge
4. Approach or solution
5. Services
6. What was built
7. Outcome
8. Delivery timeline
9. Current status
10. Technology

Keep setup instructions out unless the same README must also onboard developers. Describe measured outcomes only when a source proves them. Otherwise describe the operational or product capability delivered.

## Application or product

Use for web apps, mobile apps, desktop apps, platforms, and end-user products.

Recommended order:

1. Product purpose and audience
2. Main workflows or capabilities
3. Screenshots or demo
4. Current status and known limits
5. Architecture at a useful level
6. Setup and configuration
7. Testing and deployment
8. Project documentation links

Lead with what users can do. Keep framework details below the product explanation.

## Open-source library or framework

Use when adoption, integration, and contribution are the main reader goals.

Recommended order:

1. Value and supported use cases
2. Installation
3. Minimal working example
4. Core concepts
5. API or configuration
6. Compatibility and requirements
7. Examples and deeper documentation
8. Contributing, support, security, and license

Show the shortest correct path to a working result. Do not use a case-study narrative as the main structure.

## API or service

Use for network services, backends, gateways, workers, and service repositories.

Recommended order:

1. Responsibility and boundaries
2. Consumers and dependencies
3. Quick start or local run
4. Authentication and configuration
5. Main endpoints, events, jobs, or contracts
6. Errors and failure behavior
7. Data and architecture
8. Testing, observability, deployment, and operations

State what the service does not own when boundaries matter.

## Command-line tool

Use for terminal tools, build utilities, generators, and automation.

Recommended order:

1. Purpose
2. Installation
3. First command with expected output
4. Commands and common options
5. Configuration
6. Examples
7. Exit codes or failure behavior
8. Compatibility, contributing, and license

Make commands copy-ready. Keep a full command reference in separate docs when it would bury the common path.

## Research, data, or machine learning

Use for studies, datasets, experiments, models, notebooks, and analysis.

Recommended order:

1. Research question or dataset purpose
2. Scope and provenance
3. Method
4. Repository contents
5. Reproduction steps
6. Results
7. Limits and ethical or data-use notes
8. Citation, license, and contacts

Distinguish observed results from hypotheses. Record dates and dataset or model versions when results can drift.

## Internal tool or service

Use when operators, maintainers, or another internal team are the reader.

Recommended order:

1. Purpose and owner
2. Users and supported workflow
3. Access and environments
4. Local setup
5. Common operations
6. Architecture and dependencies
7. Failure handling, support, and runbooks
8. Release process

Favor operational clarity over promotional copy. Never place credentials in the README.

## Monorepo

Use when the repository contains several apps, services, or packages.

Recommended order:

1. Shared product or system purpose
2. Workspace map
3. Main apps, services, and packages
4. Prerequisites and setup
5. Common workspace commands
6. Architecture and shared conventions
7. Testing, releases, and deployment
8. Package-level documentation links

Explain relationships, not every directory. Let package README files own package-specific usage.

## Nontechnical business or initiative

Use for service businesses, programs, campaigns, community work, and operations repositories.

Recommended order:

1. Purpose and audience
2. Problem or need
3. Offering or work
4. Process
5. Verified proof or current status
6. Team or ownership, when public
7. Contact or next step
8. Supporting records

Do not invent a technology story. Use business language from the source material and explain internal files only when they help the intended reader.

## Selection rules

- If the user says the README will appear on an agency site, choose the agency case study.
- If strangers need to install a reusable package, choose open source.
- If developers need to run and operate one service, choose API or service.
- If the repository mainly coordinates many packages, choose monorepo.
- If no setup is needed by the target reader, remove setup.
- If two audiences matter, serve the primary audience in the README and link the secondary audience to focused documentation.
- If status is unclear, use a narrow factual statement or ask; never imply production readiness.
