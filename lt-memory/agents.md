# Agency Agents

Notes on the `.claude/agents/` setup in this repo.

---

## Source

Copied from https://github.com/msitarzewski/agency-agents — "The Agency" collection.
178 agent `.md` files across 14 domain directories.

## Structure

```
.claude/agents/
  academic/        — anthropologist, historian, geographer, psychologist, narratologist
  design/          — UI designer, UX architect, UX researcher, brand guardian, whimsy injector, visual storyteller
  engineering/     — frontend, backend, AI, DevOps, security, mobile, SRE, code reviewer, technical writer, etc.
  game-development/— Unity, Godot, Unreal, Roblox, audio, narrative, level design
  marketing/       — SEO, TikTok, Reddit, LinkedIn, Instagram, podcast, growth hacker, etc.
  paid-media/      — PPC, programmatic, paid social, creative strategist, tracking
  product/         — product manager, sprint prioritizer, feedback synthesizer
  project-management/ — project shepherd, studio producer, Jira steward
  sales/           — deal strategist, discovery coach, pipeline analyst, outbound
  spatial-computing/ — visionOS, XR, Metal engineers
  specialized/     — MCP builder, orchestrator, compliance auditor, Salesforce architect, etc.
  strategy/        — Nexus strategy, phase playbooks (0–6), runbooks
  support/         — finance tracker, legal compliance, infrastructure maintainer
  testing/         — accessibility auditor, API tester, reality checker, performance benchmarker
```

## Usage

Activate an agent in a Claude Code session by referencing its role:
> "Activate the Frontend Developer agent and help me build..."
> "Use the Reality Checker to review this plan."

## Update

To refresh from upstream: `gh repo clone msitarzewski/agency-agents /tmp/agency-agents` then re-copy domain folders into `.claude/agents/`.
