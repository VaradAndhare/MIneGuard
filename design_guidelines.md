# Design Guidelines for Online Plagiarism Checker

## Design Approach: Design System (Material Design)

**Rationale**: This is a utility-focused academic tool where efficiency, clarity, and trust are paramount. Users need to quickly upload documents and understand results. Material Design provides the clean, professional aesthetic expected in educational technology while ensuring excellent usability for information-dense content.

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- Primary: 210 100% 50% (professional blue for trust and reliability)
- Primary Dark: 210 100% 40% (darker variant for emphasis)

**Supporting Colors:**
- Success: 120 60% 45% (for clean/original content indicators)
- Warning: 35 100% 50% (for moderate plagiarism alerts)
- Error: 0 70% 50% (for high plagiarism detection)
- Surface: 210 15% 98% (light mode backgrounds)
- Surface Dark: 210 15% 8% (dark mode backgrounds)

### B. Typography

**Primary Font**: Inter (Google Fonts)
- Headers: 600 weight, clean and professional
- Body text: 400 weight for readability of reports
- Code/technical: JetBrains Mono for similarity percentages and technical data

**Hierarchy**:
- H1: 2.5rem (main page titles)
- H2: 2rem (section headers)
- H3: 1.5rem (subsection headers)
- Body: 1rem (primary content)
- Small: 0.875rem (metadata, captions)

### C. Layout System

**Spacing Units**: Tailwind units of 2, 4, 6, and 8
- Micro spacing: p-2, m-2 (8px)
- Standard spacing: p-4, m-4 (16px) 
- Section spacing: p-6, m-6 (24px)
- Large spacing: p-8, m-8 (32px)

**Grid System**: 12-column responsive grid with consistent gutters

### D. Component Library

**Core Components:**

1. **Document Upload Area**
   - Large drag-and-drop zone with dashed border
   - File type indicators (PDF, DOC, TXT)
   - Progress indicators for upload status
   - Clear error states for unsupported files

2. **Plagiarism Report Card**
   - Prominent percentage display with color-coded background
   - Clean metrics layout (similarity score, word count, sources found)
   - Expandable sections for detailed analysis

3. **Text Comparison View**
   - Side-by-side or inline highlighting
   - Color-coded similarity levels (green=original, yellow=similar, red=copied)
   - Source attribution with clickable references

4. **Navigation**
   - Clean header with logo and user actions
   - Breadcrumb navigation for multi-step processes
   - Sidebar for report filtering/organization

5. **Data Tables**
   - Clean rows for submission history
   - Sortable columns (date, plagiarism %, status)
   - Action buttons for viewing/downloading reports

### E. Key Interface Sections

**Upload Interface:**
- Centered layout with prominent upload area
- Clear instructions and supported file types
- Real-time validation feedback

**Results Dashboard:**
- Summary cards showing key metrics
- Visual hierarchy emphasizing plagiarism percentage
- Quick actions (download report, re-check, compare)

**Detailed Report:**
- Clean typography for readability
- Highlighted text sections with source citations
- Sidebar with similarity statistics and source list

## Images

**Hero Section**: No large hero image needed. Focus on clean, functional interface with subtle background patterns or gradients.

**Supporting Graphics**: 
- Simple illustrations for empty states (no documents uploaded)
- Icons for file types and status indicators
- Minimal graphics for loading states and success confirmations

**Placement**: Keep imagery minimal and functional - this tool should feel professional and focused on results rather than marketing visuals.