# DataRev & RAG Ecosystem — Complete Context Resume

## Executive Summary
This document provides the complete, unified context for the **DataRev Lead Generation App (`datarev-diagnostico`)**, the **RAG Simulator & AI Harness App (`rag-simulator`)**, and the **Claude Usage Stats Dashboard**. Use this document in any new AI chat session to seamlessly resume context and continue development without losing any decisions, architecture details, or background.

---

## 1. DataRev Lead Gen App (`datarev-diagnostico`)

### 🎯 Mission & Purpose
The app (`https://datarev-diagnostico.vercel.app`) serves as **DataRev's main Lead Generation tool**. 
- The AI & Data Maturity Assessment acts as a **hook / magnet**.
- The primary goal is capturing **real prospective client leads** (email, company, role, sector, team size, phone).
- Offers a **Free 1-Hour Live Guided Assessment Session** with a DataRev consultant as an alternative to taking the 40-question complete assessment alone.

---

### 🔄 The Conversion Funnel

```
Landing  ──>  Assessment (Express 16p / Complete 40p)  ──>  LEAD GATE  ──>  Full Report  ──>  Consultant CTA
  │                                                            │                                  │
  └─ CTA: "Do it with a consultant live"                      │                                  │
     (Free 1-Hour Session) ────────────────────────────────────┴──────────────────────────────────┘
                                                            consultation_requests
```

1. **Free Assessment (No Registration upfront)**: Users start answering questions immediately (saved to `localStorage`).
2. **Lead Gate**: To view the detailed report, users must register via **Google OAuth** or **Email Form**. This is the core conversion point.
3. **1-Hour Guided Session Offer**: Prominently featured on the Landing Page and at the start of the Complete Assessment (40 questions). Submitting a request records the lead in Supabase *before* opening Calendly.
4. **Report & CTA**: At the end of the report, users get a CTA to review their diagnostic results live in a free consultation.

---

### 🗄️ Database Architecture (Supabase)
- **Project**: `datarev-diagnostico` (`xzeipsznuntnqsaawxmi`)
- **Tables**:
  - `leads`: Unique user contacts (`email` normalized to lowercase), company, role, phone, sector, team size, UTM tags.
  - `assessments`: Completed diagnostic results with raw answers and denormalized scores (`overall_score`, `credited_level`, `stage_id`, `dimension_scores`, `top_gaps`).
  - `consultation_requests`: Requests for live 1-hour sessions (`kind`: `guided_full` or `results_review`).

- **Security & RLS Design**:
  - RLS is active on all 3 tables (no direct public read/write permissions for `anon`).
  - Writes occur via two `SECURITY DEFINER` functions: `capture_lead(...)` and `request_consultation(...)`.
  - **Upsert Guard**: Empty inputs will never overwrite existing valid data on repeat visits.
  - **Email Trimming**: Zod schema uses `z.string().trim().email()` to avoid losing leads with trailing whitespace.

---

### 🎨 Branding & Identity System (DataRev)
- **Palette**:
  - Surface: Navy (`#04081f` / `#08123a`)
  - Primary Action / Buttons: Blue (`#1763ff`) with white text (4.92:1 contrast ratio)
  - Accent / Highlights: Cyan (`#00c2ff`) with navy text (never white text on cyan)
- **Logo Usage**:
  - Monogram + wordmark lockup rendered at **minimum 48px height** to maintain legible "DATA REVOLUTION" text.
  - Light mode & `@media print` support dual logos so printing PDFs maintains full visual clarity.
- **Contact Details**:
  - Phone: `+52 (55) 9199-6815`
  - Website: `https://datarev.solutions`
- **Calendly**: 60-Minute Guided Assessment Event (`NEXT_PUBLIC_CALENDLY_GUIDED_URL`).

---

### 🚀 Production Deployment & Status
- **URL**: [https://datarev-diagnostico.vercel.app](https://datarev-diagnostico.vercel.app)
- **Tech Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, Supabase, Vitest.
- **Verification**: 44 automated unit tests passing, `tsc` & `eslint` clean, zero build errors.

---

## 2. RAG Simulator & AI Harness App (`rag-simulator`)

- **Atomic Tasks Pillar**: Integrated into `harness.js` across English (`EN`), Spanish (`ES`), and Portuguese (`PT`). Deployed to Vercel production.
- **MCP & Tool Agent Architecture**: Added Model Context Protocol (MCP) explanations to Tool/API Harness section and added Tool Agent box to `advanced-rag.js` architecture diagram.
- **GraphRAG Tab**: Added comparative modals (Semantics Modal vs. Ontology Modal) to explain GraphRAG vs Traditional RAG. Live on production CDN.

---

## 3. Claude Usage Statistics Dashboard

- **Log Parser (`parse_stats.py`)**: Extracted metadata from `~/.claude/projects/*.jsonl` covering 14,797+ assistant messages across 8 models.
- **Dashboard UI (`dashboard_final.html`)**: Self-contained 34KB HTML/JS dashboard with live EN/ES bilingual switcher (`renderAll()`). Aggregates daily/weekly/monthly token usage, tool calls, skills, and MCP interactions.

---

## 4. Prompt to Resume Work in a New Chat Session

```text
I am continuing work on DataRev (datarev-diagnostico), RAG Simulator, and Claude Usage Dashboard.

Current Status:
1. DataRev Lead Gen App: Live at https://datarev-diagnostico.vercel.app
   - Assessment hook + Lead Gate (Google OAuth / Email form).
   - 1-Hour Free Guided Assessment session (Calendly + Supabase capture).
   - Supabase xzeipsznuntnqsaawxmi (leads, assessments, consultation_requests) using SECURITY DEFINER functions.
   - DataRev navy/cyan/blue branding & 48px logo min height.

2. RAG Simulator: Deployed GraphRAG tab, MCP docs, and Atomic Tasks pillar across EN/ES/PT.
3. Claude Usage Dashboard: Functional standalone dashboard (dashboard_final.html) with EN/ES i18n.

Please confirm you have reviewed DATREV_CONTEXT_RESUME.md and are ready to proceed!
```
