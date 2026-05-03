# Veritras UI/UX Checklist

> Based on the **Laws of UX** principles documented in `UI-UX principle.md`
> Apply these checks during development and review of the remaining pages.

---

## Products Page

### Layout & Structure (Law of Proximity, Law of Common Region, Prägnanz)
- [ ] **Chunking (Miller's Law)** — Group products into visually distinct cards/modules (max 7±2 visible per row)
- [ ] **Law of Proximity** — Related info (product ID, name, status) is visually closer to each other than to other products
- [ ] **Common Region** — Each product card has a clearly defined boundary (border, background, shadow) 
- [ ] **Prägnanz** — Product cards are simple rectangles/cards, not complex shapes
- [ ] **Uniform Connectedness** — Status badges, action buttons, and metadata are visually connected within each card

### Information Display (Cognitive Load, Selective Attention)
- [ ] **Cognitive Load** — Limit metadata shown per product to essentials (ID, name, status, date). Move details to modal/drawer
- [ ] **Selective Attention** — Guide attention to the "Register Product" CTA with accent color and size contrast
- [ ] **Chunking** — Break registration form into logical steps if >7 fields
- [ ] **Working Memory** — Show breadcrumbs or sticky header so users know where they are

### Visual Hierarchy (Von Restorff, Similarity)
- [ ] **Von Restorff Effect** — The primary action ("Register Product") is visually distinctive from secondary actions
- [ ] **Similarity** — All product cards share the same visual treatment (shape, padding, border-radius)
- [ ] **Aesthetic-Usability Effect** — Cards have generous padding, subtle shadows, and consistent spacing

### Interactions (Fitts's Law, Doherty Threshold, Hick's Law)
- [ ] **Fitts's Law** — "Register Product" button is large enough (min 44px height) and placed in an easily acquired position
- [ ] **Doherty Threshold** — Product list loads within 400ms; show skeleton loaders during loading states
- [ ] **Hick's Law** — Filter/sort options are limited (≤5 primary filters); advanced filters hidden behind "More Filters"
- [ ] **Postel's Law** — Search accepts partial product IDs, fuzzy matching, and case-insensitive input

### Feedback & Flow (Peak-End Rule, Zeigarnik Effect)
- [ ] **Peak-End Rule** — Registration success shows a delightful confirmation with animation (not just a toast)
- [ ] **Zeigarnik Effect** — If registration is interrupted, show progress indicator and "Continue" prompt
- [ ] **Goal-Gradient Effect** — Registration form shows progress (Step 1 of 3) to motivate completion

---

## Shipments Page

### Layout & Structure
- [ ] **Chunking (Miller's Law)** — Shipment cards or table rows grouped logically; use pagination or infinite scroll
- [ ] **Law of Proximity** — Shipment ID, product link, status, and origin/destination are visually grouped
- [ ] **Common Region** — Active shipments have a distinct container style from delivered ones
- [ ] **Prägnanz** — Status timeline is a simple horizontal or vertical line, not a complex diagram

### Information Display
- [ ] **Cognitive Load** — Timeline shows only key checkpoints; expandable for full history
- [ ] **Selective Attention** — Current/active shipment status is the most prominent element
- [ ] **Working Memory** — Timeline shows numbered steps so users don't need to remember the sequence
- [ ] **Chunking** — Break "Create Shipment" form into: Product Selection → Route Details → Confirm

### Visual Hierarchy
- [ ] **Von Restorff Effect** — "Add Checkpoint" button stands out with accent color on the shipment detail view
- [ ] **Similarity** — All status badges use consistent color coding (e.g., green = delivered, blue = in transit)
- [ ] **Aesthetic-Usability Effect** — Timeline has connecting lines, dots, and subtle animations

### Interactions
- [ ] **Fitts's Law** — "Create Shipment" and "Add Checkpoint" buttons are large with ample spacing
- [ ] **Doherty Threshold** — Timeline updates within 400ms after adding a checkpoint
- [ ] **Hick's Law** — Status selection dropdown has ≤7 options (or grouped categories)
- [ ] **Postel's Law** — Location input accepts partial addresses, autocomplete suggestions

### Feedback & Flow
- [ ] **Peak-End Rule** — Adding a checkpoint shows a satisfying animation/confirmation
- [ ] **Flow** — The task difficulty matches user skill: simple for basic users, advanced options available
- [ ] **Zeigarnik Effect** — Incomplete shipment creation is auto-saved as a draft

---

## Analytics Page

### Layout & Structure
- [ ] **Chunking (Miller's Law)** — Dashboard widgets are grouped into 3-5 visually distinct sections (KPIs, Charts, Anomalies)
- [ ] **Law of Proximity** — Chart title, legend, and chart are closer together than to other charts
- [ ] **Common Region** — Each chart/analytic widget has its own container/card
- [ ] **Prägnanz** — Charts use simple, familiar chart types (line, bar, area) — avoid exotic visualizations

### Information Display
- [ ] **Cognitive Load** — Default view shows only top-level metrics; drill-down for details
- [ ] **Selective Attention** — Anomalies/bottlenecks use accent color to draw attention without being alarming
- [ ] **Chunking** — KPI numbers are large; supporting text is smaller and subordinate
- [ ] **Working Memory** — Date range selector is persistent so users don't lose context

### Visual Hierarchy
- [ ] **Von Restorff Effect** — Highest-priority anomaly or bottleneck is visually isolated (border, color, size)
- [ ] **Similarity** — All charts use the same color palette and axis styling
- [ ] **Aesthetic-Usability Effect** — Charts have gradient fills, subtle grid lines, and smooth curves

### Interactions
- [ ] **Fitts's Law** — Export buttons (CSV/PDF) are large enough and placed near the data they export
- [ ] **Doherty Threshold** — Chart tooltips appear within 100ms; full page load under 400ms
- [ ] **Hick's Law** — Time period selector has 3-5 presets (24h, 7d, 30d, All) not an open calendar
- [ ] **Postel's Law** — Date inputs accept multiple formats (MM/DD/YYYY, YYYY-MM-DD, relative terms)

### Feedback & Flow
- [ ] **Peak-End Rule** — Export completion shows a satisfying download animation
- [ ] **Flow** — Users can quickly switch between analytics views without losing their date range
- [ ] **Pareto Principle** — The 20% of metrics that matter most (KPIs) are given 80% of the visual space

---

## Verify Page

### Layout & Structure
- [ ] **Chunking (Miller's Law)** — The verification flow is 2-3 clear steps: Input → Loading → Result
- [ ] **Law of Proximity** — Input field and "Verify" button are grouped together as one unit
- [ ] **Common Region** — Verification result is clearly contained in a result card/modal
- [ ] **Prägnanz** — The verification input is a single, prominent field (not a complex form)

### Information Display
- [ ] **Cognitive Load** — Result page shows: Valid/Invalid first, then details, then full history
- [ ] **Selective Attention** — The verification status (✓ Valid / ✗ Invalid) is the largest, most prominent element
- [ ] **Working Memory** — Product ID being verified is displayed at the top of the result page
- [ ] **Chunking** — Verification details are grouped: Product Info → Timeline → Metadata

### Visual Hierarchy
- [ ] **Von Restorff Effect** — Valid/Invalid status uses high-contrast colors (green/red) with large icons
- [ ] **Similarity** — Valid products use green accents; invalid products use red accents consistently
- [ ] **Aesthetic-Usability Effect** — The verification flow feels clean and trustworthy (not cluttered or suspicious)

### Interactions
- [ ] **Fitts's Law** — The "Verify" button is large and placed directly below the input field
- [ ] **Doherty Threshold** — Verification result appears within 400ms; show a progress indicator if longer
- [ ] **Hick's Law** — Only one primary action on this page ("Verify"); no competing CTAs
- [ ] **Postel's Law** — Input accepts product IDs with or without prefixes, case-insensitive, with auto-trim

### Feedback & Flow
- [ ] **Peak-End Rule** — Successful verification ends with a satisfying "Verified on Blockchain" animation
- [ ] **Jakob's Law** — Verification flow follows familiar patterns (like package tracking or certificate validation)
- [ ] **Mental Model** — The verification result matches what users expect: a certificate-like display with checkmarks
- [ ] **Zeigarnik Effect** — If verification is loading, show clear progress (don't leave users hanging)

---

## Cross-Page Principles

### Navigation (Serial Position Effect, Jakob's Law)
- [ ] **Serial Position Effect** — Most important nav items (Dashboard, Products) are placed at the beginning
- [ ] **Jakob's Law** — Navigation behavior matches common web patterns (sticky top nav, active state indicator)
- [ ] **Fitts's Law** — Nav items are large enough for easy clicking; mobile hamburger is ≥44px

### Forms & Inputs (Postel's Law, Tesler's Law)
- [ ] **Postel's Law** — All forms accept flexible input formats and show clear validation messages
- [ ] **Tesler's Law** — Complexity is handled by the system (auto-formatting, validation) not the user
- [ ] **Parkinson's Law** — Forms are designed to be completed quickly (autofill, defaults, smart suggestions)

### Loading & Empty States (Doherty Threshold, Peak-End Rule)
- [ ] **Doherty Threshold** — Skeleton loaders or progress indicators for any load >200ms
- [ ] **Peak-End Rule** — Empty states are helpful and on-brand (not just "No data"), with a CTA to create content
- [ ] **Aesthetic-Usability Effect** — Loading states are visually polished, not raw spinners

### Accessibility & Inclusion
- [ ] **Von Restorff Effect** — Important actions don't rely solely on color (use icons + text)
- [ ] **Selective Attention** — Motion is used sparingly; respect `prefers-reduced-motion`
- [ ] **Fitts's Law** — Touch targets are minimum 44×44px on mobile
- [ ] **Cognitive Load** — Error messages are human-readable, not raw error codes

---

## Design Review Checklist

Before marking any page as complete, verify:

- [ ] **Occam's Razor** — Can any element be removed without compromising function?
- [ ] **Aesthetic-Usability Effect** — Is the page visually polished enough to inspire confidence?
- [ ] **Cognitive Load** — Can a new user understand the page in <5 seconds?
- [ ] **Miller's Law** — Are there ≤7 major elements competing for attention?
- [ ] **Doherty Threshold** — Does every interaction feel responsive (<400ms)?
- [ ] **Peak-End Rule** — Is the most important moment (the "peak") delightful?
- [ ] **Jakob's Law** — Does it work the way users expect based on other sites?

---

*Last updated: 2026-05-03*
*Based on Laws of UX from `UI-UX principle.md`*
