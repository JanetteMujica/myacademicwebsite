# eCARE-PD timeline — install in myacademicwebsite

Unzip at the root of the repository. It only adds new files, plus one sentence
in `content/contribution/_index.md` that links to the new page.

```
assets/css/ecarepd-timeline.css                 page styles (all scoped under .ecp)
assets/js/ecarepd-timeline.js                   timeline behaviour (uses d3 7.9.0 from cdnjs)
content/contribution/_index.md                  + one sentence linking to the timeline
content/contribution/ecarepdtimeline/index.md   the page  →  /contribution/ecarepdtimeline/
data/ecarepd_timeline.json                      data exported from the Excel workbook
layouts/_default/ecarepdtimeline.html           page template (uses your baseof: header, menu, footer)
static/img/ecarepdtimeline/README.txt           the image list (below)
tools/update_timeline.py                        re-export the data after editing the workbook
```

## Images — all in `static/img/ecarepdtimeline/`

None of the images from `static/img/contributions/` are used. Until an image is added,
the page shows a placeholder with the expected file name, so you can add them one at a time.

### Introduction (3)
| File | What | Shown as |
|---|---|---|
| `biggareselfcare.png` | Sara Riggare's 1 h vs 8,765 h self-care illustration | full width of the text column, natural height — ≥ 1440 px wide |
| `patient-blurred.jpg` | blurred photo of a person living with Parkinson's | 4:3, cropped to fill — 1200 × 900 px |
| `neurologist-blurred.jpg` | blurred photo of a doctor / neurologist | 4:3, cropped to fill — 1200 × 900 px |

### Prototypes (14) — one per version, shown on the timeline, in each stage panel and in the gallery
Format: PNG, 16:10, about 1600 × 1000 px. Images are shown whole (not cropped) on a neutral background, so other ratios also work.

| File | Prototype | Stage | Dates |
|---|---|---|---|
| `PR01.png` | Exploratory low-fidelity prototype | Foundations | 2019 |
| `PR02.png` | α prototype | Iteration 1 · eCARE-PD 1.0 | 2019-10 – 2020 |
| `PR03.png` | β prototype | Iteration 1 · eCARE-PD 1.0 | 2020 |
| `PR04.png` | eCARE-PD 1.0 final prototype | Iteration 1 · eCARE-PD 1.0 | 2021-03 |
| `PR05.png` | eCARE-PD 2.0 | Iteration 2 · eCARE-PD 2.0 | 2021 – 2023 |
| `PR08.png` | iCARE-PD sensor technologies (MooVeo, SpiroGym, PDMonitor®) | Iteration 2 · eCARE-PD 2.0 | 2021 – 2022 |
| `PR11.png` | eCARE-PD visual identity and structure redesign | Iteration 4 · Analysis to design | 2025 |
| `PR09.png` | First CAFY prototype (priority selector in a medical dashboard) | Iteration 4 · Analysis to design | 2025-03 |
| `PR06.png` | CAFY design probe (Conversational Assistant for self-care For You) | Iteration 4 · Analysis to design | 2025-05 – 2025-09 |
| `PR10.png` | CAFY virtual assistant — task-oriented flow | Iteration 4 · Analysis to design | 2025-05 |
| `PR12.png` | eCARE-PD prototype with CAFY (Care Assistant For You) — first complete user flow | Iteration 4 · Analysis to design | 2025-06 – 2025-12 |
| `PR13.png` | Low-fidelity prototype for visualising self-care journeys ('Journey' page) | Iteration 6 · Care-tips & data-viz workshops | 2026-07 |
| `PR07.png` | CRS v1.0 — conversational recommender system (eCARE-PD 3.0) | Iteration 7 · Intentions & CRS | 2026 |
| `PR14.png` | e-Care PD prototype — full workflow (demo) | Iteration 7 · Intentions & CRS | 2026-09 |

**Workbook, Prototypes tab, `image_file` column:** the page uses this column when it is filled,
and `PRxx.png` when it is empty. These rows still name old contribution images
that won't be in the new folder: PR09 (2eCarePD.png), PR10 (4e_CarePD.png), PR11 (5e_CarePD.png; 6e_CarePD.png), PR12 (7e_CarePD.png), PR13 (lowFiPrototype.png).
Clear those cells (or type the new file names), then run the update script.

## Updating the data
```
pip install openpyxl
python tools/update_timeline.py path/to/iCARE-PD_timeline_database.xlsx
```
This rewrites `data/ecarepd_timeline.json`. Commit and push; the GitHub Action rebuilds the site.
Quotes appear only when their **Include** column has an x.

## Notes
- The page is kept out of the automatic /contribution/ list (`build: list: never` in its front matter).
- Test locally: `hugo server`, then open http://localhost:1313/contribution/ecarepdtimeline/
- French version: not built yet (planned once the content is stable).
