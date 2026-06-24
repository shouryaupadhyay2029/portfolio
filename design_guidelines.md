# SHOURYA // FOUNDRY — Design Consistency Guidelines

This document outlines the core structural principles and layout rules for the portfolio. Adhering to these rules guarantees a clean, high-fidelity visual experience representing engineering precision, architectural blueprints, and editorial elegance.

---

## 1. Container Usage Matrix

Use the correct container wrapper component based on the content's role and layout scale:

| Container | Width Limit | Recommended Use Case |
| :--- | :--- | :--- |
| `FullWidthContainer` | `100%` (Edge-to-edge) | Interactive stages, canvas simulations, large background media, and hero backdrop animations. |
| `EditorialContainer` | `1536px` | Section header banners, major info tables, navigation bounds, and complex column groupings. |
| `ShowcaseContainer` | `1800px` | High-fidelity modular project cards, large case-study images, and layout portfolios. |
| `ContentContainer` | `1200px` | General text grids, standard lists, detail descriptions, and typical section content. |
| `NarrowReadingContainer` | `800px` | High-readability copy (paragraphs, articles, bios, technical journals). |

---

## 2. Vertical Section Rhythm

We enforce generous vertical spacing to give the editorial design room to breathe:

- **Between Sections**: Use `.section-gap` (`margin-bottom: clamp(6rem, 12vw, 16rem)`). Never stack section elements immediately above each other without this.
- **Between Headings and Content**: Use `.heading-gap` (`margin-bottom: clamp(2.5rem, 5vw, 4.5rem)`).
- **Between Content Blocks**: Use `.block-gap` (`margin-bottom: clamp(1.2rem, 2.5vw, 2.8rem)`) to separate logical copy cards.
- **Extreme Bottom Breaks**: Use `.large-section-break` (`padding-top: clamp(8rem, 15vw, 22rem)`) to separate content streams from the large contact signatures.

---

## 3. Architectural Alignment Grid

Every element must align with an invisible 12-column grid system. Rather than placing elements randomly, they must span exact column slots:

- **12-Column Base**: Apply `.grid-12` to grid containers. Use `gap: clamp(1rem, 2.2vw, 2.2rem)`.
- **Editorial Alignment (Cols 1-8)**: Main text headlines, core summaries, and visual titles must span columns 1 to 8 on desktop using `.col-editorial-left`.
- **Metadata Alignment (Cols 9-12)**: Technical stats, category labels, or supporting lists align to the right side using `.col-editorial-right`.
- **Reading Alignment (Cols 4-9)**: Paragraph articles should span columns 4 to 9 using `.col-reading-zone` to maintain center focus.
- **Asymmetrical Showcase (Cols 1-7 vs 8-12)**: Large portfolio grid cards align asymmetrically, e.g., column 1 to 7 for visual screens and column 8 to 12 for project descriptors.

---

## 4. Mobile Adaptability & Responsive Rules

All grid systems must fall back cleanly on smaller viewports:

1. **Desktop / Ultra-wide (`>1200px`)**: Full 12-column grids, asymmetrical offsets, wide container caps, and full fluid scaling.
2. **Laptops (`1024px - 1200px`)**: Maintain grid columns, but gutters and padding scale down fluidly using custom CSS clamp values.
3. **Tablets (`768px - 1023px`)**: Asymmetric columns shift to full-width or simpler stacks (e.g., editorial blocks stack vertically; timeline elements shift to a single left-aligned layout; columns span `span 12` instead of offsets).
4. **Mobile (`<768px`)**: Grids collapse into a single-column block layout. Standard container horizontal paddings reduce to `1.5rem` (`px-6`).
