---
target: landing page (Dashboard.tsx + PremiumHero.tsx)
total_score: 18
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
p2_count: 2
timestamp: 2026-07-31T04-41-07Z
slug: frontend-src-pages-dashboard-tsx
---
# Veritras Landing Page Critique — 2026-07-31

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Live indicator + SSE updates present; wallet-connection state not visible on dashboard |
| 2 | Match System / Real World | 2 | KPI labels domain-correct but CTAs vague ("Explore Now"); no concrete supply-chain nouns above fold |
| 3 | User Control and Freedom | 2 | No skip-to-content; full-viewport hero has no escape hatch on mobile |
| 4 | Consistency and Standards | 3 | Internally consistent glassmorphism; but hero (marketing) and dashboard (data) feel like two design languages |
| 5 | Error Prevention | 1 | Empty state has no guidance or CTA; no wallet-connection nudge; error state has no retry |
| 6 | Recognition Rather Than Recall | 2 | Nav always visible; but KPIs lack tooltips; Recent Products list lacks context |
| 7 | Flexibility and Efficiency | n/a | Landing page — no repeat-use workflows to accelerate |
| 8 | Aesthetic and Minimalist Design | 3 | Clean composition; but 11px uppercase tracking text is systemic legibility problem |
| 9 | Error Recovery | 1 | Error shows raw message with no retry, no troubleshooting, no support link |
| 10 | Help and Documentation | n/a | No onboarding or docs linked; acceptable for marketing but dashboard creates unmet utility expectation |
| **Total** | | **18/32** | **Acceptable (56%)** |

## Design Specificity Verdict

Category-interchangeable with supply-chain labels applied. The visual language (dark glassmorphism, massive serif, lime accent, animated orbs) is a well-executed premium SaaS template. Swap the nouns and it sells any product. The animated route pulses and verification pings are product-specific but live in the background.

## Priority Issues

1. **[P1] Hero lacks concrete product visualization** — 100dvh of aspirational copy with no screenshot, demo, or provenance chain visualization
2. **[P1] Dual CTAs with no hierarchy** — "Explore Now" (vague) and "Verify Product" (concrete) equally weighted; the more valuable action is less prominent
3. **[P1] Dashboard section lacks context and narrative** — Raw numbers without interpretation, trend indicators, or next-action guidance
4. **[P2] Empty and error states are dead ends** — No recovery path, no CTA, no guidance in either state
5. **[P2] 11px uppercase tracking text is systemic legibility problem** — Used for all secondary labels across the entire page

## Detector Findings

6 findings across 4 files (gradient-text x3, side-tab x2, overused-font x1). Gradient-text likely intentional for brand. Overused-font likely false positive.
