# Design Spec: US Immigration Roadmap Infographic
**Date:** 2026-04-22
**Status:** Approved

---

## Overview

A self-contained, bilingual (English + Vietnamese) glassmorphism HTML infographic serving as the family's US immigration roadmap. Designed to be printed to PDF (A4) and used as a living reference document.

**Outputs:**
1. `us-immigration-plan.html` — standalone glassmorphism infographic
2. `us-immigration-plan.md` — structured Markdown source for future expansion into a detailed DOCX/PDF (week-by-week plans, extended watch-outs, etc.)

---

## Family Profile

| Field | Detail |
|---|---|
| Origin | Vietnam |
| Family size | 4 (Husband, Wife, Child 14, Child 9) |
| Visa status | EB-5 Conditional Green Card — stamped, ready for POE |
| Husband expertise | Senior / Expert Data Analytics |
| Wife expertise | Not listed |
| Children schools | International School (Vietnam); US enrollment planned **Fall 2027** |
| Language | Fluent English |
| Target landing | June 2026 (tentative) |
| US job offer | None |
| Location preference | Open |

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Color palette | Navy & Cyan glassmorphism | Professional, trustworthy, subtle US flag undertone |
| Layout | Mission Brief (Layout A) | Single scrollable page, sequential sections, cleanest for PDF/print |
| Language | Bilingual EN + VI | Family reference document |
| City approach | Top 3 recommended + 3 honorable mentions | Husband has no job offer; city comparison guides the location decision |

---

## Visual Design

- **Background:** `linear-gradient(135deg, #0a192f, #112240, #1d3461)`
- **Glass cards:** `background: rgba(255,255,255,0.08)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(100,200,255,0.2)`
- **Accent color:** `#0ea5e9` (cyan-500), `#38bdf8` (cyan-400)
- **Warning accent:** `#f59e0b` (amber) for conditional GC risks
- **Typography:** System sans-serif; bilingual labels in smaller weight below English headers
- **Print:** `@media print` — white background, drop backdrop-filter, preserve layout, page-break-before on each module section

---

## Page Structure

### Hero Banner
- **Title:** "U.S. Immigration Roadmap 2026 | Lộ Trình Định Cư Hoa Kỳ 2026"
- **Subtitle:** Immigration Plan for Family of 4 · Vietnam → USA
- **Stat pills:** `📅 Target: Jun 2026` · `👨‍👩‍👧‍👦 Family of 4`
- **Tagline (VI):** "Từng bước — Từng tháng — Từng mục tiêu"

---

### Module 1 — Legal Must-Haves | Thủ Tục Pháp Lý

Checklist grid, two columns.

**Immediate (Week 1–2):**
- Port of Entry — preserve all entry stamps + I-94 printout
- Apply for SSNs — all 4 family members
- Open US bank account (passport + visa; Chase / Bank of America)
- Get local SIM cards

**Within 30 Days:**
- Apply for state ID / driver's license (international license + certified translation)
- Health insurance via ACA Marketplace
- ITIN for wife if not SSN-eligible
- Begin secured credit card (credit score starts at zero)

**⚠️ Conditional Green Card Warning (amber card):**
> The Green Card is conditional for 2 years. Risks: (1) continuous absence outside the US >6 months can trigger GC abandonment — obtain **Form I-131 Re-Entry Permit** before any extended Vietnam stay; (2) I-829 petition must be filed within the **90-day window before the 2-year anniversary** — set a hard calendar reminder at Month 18; (3) EB-5 investment conditions must remain satisfied.

**Ongoing:**
- US taxes: global income reportable from Day 1 of residency — hire a US–Vietnam CPA for Year 1
- Credit building: secured card → report to all 3 bureaus → target 700+ score within 12 months

**2027 Horizon:**
- Research school districts in chosen city
- Enroll Child 1 (then 15, high school) and Child 2 (then 10, elementary) — Fall 2027
- Note: if one parent or both children remain in Vietnam through 2026–2027 to finish school, all GC holders must track US physical presence to avoid abandonment

---

### Module 2 — City Comparison | So Sánh Thành Phố

**Top 3 Recommended:**

| | Austin, TX | Seattle / Bellevue, WA | Raleigh-Durham, NC |
|---|---|---|---|
| Data Analytics jobs | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Cost of living | Medium | High | Low–Medium |
| School quality | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| State income tax | None ✅ | None ✅ | 4.5% |
| Vietnamese community | Medium | Large | Small |
| Notes | No tax, booming tech scene | Amazon, Microsoft HQ; best schools | Research Triangle; lowest COL of the 3 |

**Honorable Mentions:**

| | Dallas, TX | Atlanta, GA | Irvine / Orange County, CA 🏘️ |
|---|---|---|---|
| Data Analytics jobs | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Cost of living | Medium | Low–Medium | High |
| School quality | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| State income tax | None ✅ | 5.75% | 9.3%+ |
| Vietnamese community | Large | Medium | **Largest in US** (Little Saigon) |
| Notes | Large Vietnamese community, no tax | Growing hub, diverse | Best Vietnamese community + top schools; higher COL |

---

### Module 3 — Budget & Runway | Ngân Sách & Dự Toán

**Initial Setup Costs (Month 1–2, one-time):**

| Item | Estimated Cost |
|---|---|
| Flights + excess baggage / shipping | $5,000–8,000 |
| Rental deposit + first/last month | $6,000–12,000 |
| Car purchase (used, reliable) | $15,000–22,000 |
| Furniture & household setup | $5,000–8,000 |
| Health insurance (first 3 months) | $2,500–3,500 |
| School supplies / fees (2027) | Deferred |
| Emergency reserve | $10,000–15,000 |
| **Total setup estimate** | **$43,500–68,500** |

**Monthly Burn Rate (family of 4, mid-tier city):**

| Item | Est. / Month |
|---|---|
| Rent (3-bed, good school district) | $2,500–3,500 |
| Utilities + internet | $300–400 |
| Groceries | $800–1,000 |
| Car payment + insurance + gas | $800–1,200 |
| Health insurance (marketplace) | $800–1,200 |
| Kids' activities / general | $300–500 |
| Misc / dining | $400–600 |
| **Total monthly burn** | **$5,900–8,400** |

**Runway indicator:** At ~$7,000/month average, after ~$55K setup, a $150K starting fund yields ~13 months runway. **Target: husband employed by Month 4–5.**

---

### Module 4 — Opportunity & Risk | Cơ Hội & Rủi Ro

**Opportunities ✅**
- **Data Analytics job market:** 50K+ open senior roles; median salary $115K–$145K for senior level
- **EB-5 → full Green Card:** File I-829 before 2-year mark → permanent residency, no more conditions
- **Kids' US education (2027):** World-class public schools in top districts — free
- **Wife's path:** Community college re-skilling, ESL teaching, Vietnamese-language services (high demand in Vietnamese communities)
- **No state income tax** in TX (Austin/Dallas) — saves $8K–$14K/year at senior DA salary
- **Credit building from Day 1:** Clean slate means intentional, optimized credit history

**Risks ⚠️**
- **Zero US credit history:** No credit card approvals, harder to rent without cosigner → mitigate with secured card + ITIN early
- **Health insurance gap:** No employer = marketplace plan at $800–1,200/month until job offer with benefits
- **Tax complexity:** Global income reportable from Day 1 of residency; hire US–Vietnam CPA for Year 1
- **Job search timeline:** Senior DA roles average 2–4 months to close; budget for 6 months without income
- **I-829 filing deadline:** File within 90-day window before 2-year GC anniversary — calendar alert at Month 18
- **Extended absence / re-entry risk:** Any GC holder staying outside US >6 months continuously risks abandonment; obtain I-131 Re-Entry Permit before extended Vietnam stays
- **Kids in Vietnam 2026–2027:** If children (or accompanying parent) remain in Vietnam to finish school, the absent GC holder must not exceed 6 continuous months abroad without I-131

---

### Module 5 — 60-Day Tactical Plan | Kế Hoạch 60 Ngày

**Week 1 — Land & Survive:**
- Clear Port of Entry; preserve all stamps + print I-94 record online
- Purchase local SIM cards for all adults
- Open US bank account (Chase / BofA — passport + visa sufficient)
- Book extended-stay or Airbnb housing (temporary, 4–6 weeks)
- Apply for SSNs for all 4 family members at local SSA office

**Week 2–3 — Stabilize:**
- Find permanent rental in target city
- Purchase reliable used car
- Apply for state ID and driver's license (bring international license + certified translation)
- Set up utilities, internet, renter's insurance
- Enroll in ACA Marketplace health insurance
- Apply for ITIN for wife (if applicable)

**Week 4–6 — Job Search Launch:**
- Convert resume to US format (1–2 pages, quantified achievements)
- Optimize LinkedIn profile (open to work, target companies listed)
- Apply to target employers in chosen city (start with 5–10 high-fit roles/week)
- Attend local data / tech meetups and networking events
- Open secured credit card (Discover IT Secured or Capital One)

**Week 7–8 — Foundation:**
- Consult immigration attorney: I-829 timeline, re-entry permit for any extended Vietnam trips
- Open investment account (Fidelity / Vanguard — index funds)
- Connect with local Vietnamese community / cultural associations
- File state business/tax registration if wife plans self-employment
- Review emergency fund allocation and monthly budget actuals vs. plan

**2027 Horizon (flagged):**
- Research school districts in chosen city (Niche.com, GreatSchools.org)
- Enroll Child 1 (high school, Grade 10) and Child 2 (elementary, Grade 5) — Fall 2027
- File US Year 1 tax return (with CPA — includes global income disclosure)
- Begin I-829 preparation with immigration attorney (Month 18 alert)

---

## Markdown Output Intent

The `us-immigration-plan.md` companion file will mirror the infographic content in clean Markdown, structured for easy expansion into:
- Week-by-week detailed action plans
- Full watch-out / pitfall lists per category
- DOCX / PDF generation via Pandoc or similar

---

## Output Files

| File | Location | Purpose |
|---|---|---|
| `us-immigration-plan.html` | `/immigration-plan/us-immigration-plan.html` | Glassmorphism infographic, print-to-PDF ready |
| `us-immigration-plan.md` | `/immigration-plan/us-immigration-plan.md` | Expandable Markdown source |
