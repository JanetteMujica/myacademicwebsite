# -*- coding: utf-8 -*-
"""
Export iCARE-PD_timeline_database.xlsx to the JSON used by the website page
/contribution/ecarepdtimeline/  (file: <website>/data/ecarepd_timeline.json).

Everything the page shows is computed here from the data sheets, so the export
is correct even if Excel has not recalculated the Overview formulas.
Quotes are exported only when their 'Include' column contains x.
"""
import json, re, warnings
from datetime import date, datetime
from openpyxl import load_workbook

warnings.filterwarnings("ignore", message="Data Validation extension")


def _clean(v):
    if isinstance(v, datetime):
        return v.date().isoformat()
    if isinstance(v, date):
        return v.isoformat()
    if isinstance(v, str):
        v = v.strip()
        if v.startswith("="):            # a formula: recomputed below
            return None
        return v or None
    return v


def _rows(wb, name):
    if name not in wb.sheetnames:
        return []
    it = wb[name].iter_rows(values_only=True)
    hdr = [str(h).strip().lower() if h else None for h in next(it)]
    out = []
    for r in it:
        if not r or r[0] is None or str(r[0]).strip() == "":
            continue
        out.append({h: _clean(v) for h, v in zip(hdr, r) if h})
    return out


def build(excel_file):
    wb = load_workbook(excel_file)          # formulas are recomputed here, not read
    stages = _rows(wb, "Stages")
    quotes_all = _rows(wb, "Quotes")
    pubs = _rows(wb, "Publications")
    talks = [t for t in _rows(wb, "Talks") if t.get("title")]
    funding = [f for f in _rows(wb, "Funding") if f.get("funder")]
    lines = _rows(wb, "Funding_Lines")
    protos = _rows(wb, "Prototypes")
    tax_v = _rows(wb, "Taxonomy_Versions")
    tax_t = _rows(wb, "Taxonomy_Terms")

    # funding totals: typed number in Funding.total_amount, otherwise the sum of Funding_Lines
    sums = {}
    for l in lines:
        if isinstance(l.get("amount"), (int, float)):
            sums[l["grant_id"]] = sums.get(l["grant_id"], 0) + l["amount"]
    for g in funding:
        if not isinstance(g.get("total_amount"), (int, float)):
            g["total_amount"] = sums.get(g["grant_id"])

    # per-stage counts (same as the Overview sheet)
    def count(rows, sid):
        return sum(1 for r in rows if r.get("stage_id") == sid)
    overview = []
    for s in stages:
        sid = s["stage_id"]
        overview.append({
            "stage_id": sid, "stage": s.get("short_label"),
            "start": s.get("start_date"), "end": s.get("end_date"),
            "publications": count(pubs, sid), "talks": count(talks, sid),
            "prototypes": count(protos, sid), "taxonomy_versions": count(tax_v, sid),
            "funding_cad": sum(g["total_amount"] or 0 for g in funding if g.get("stage_id") == sid),
        })

    data = {
        "overview": overview,
        "stages": stages,
        "quotes": [q for q in quotes_all if str(q.get("include") or "").strip().lower() == "x"],
        "publications": pubs,
        "talks": talks,
        "funding": funding,
        "prototypes": protos,
        "taxonomy_versions": tax_v,
        "taxonomy_terms": tax_t,
        # the two quotes shown in the introduction (patient P8, neurologist)
        "intro_quotes": [q for q in quotes_all if q.get("quote_id") in ("Q032", "Q041")],
        "meta": {"generated": datetime.now().isoformat(timespec="seconds"), "source_file": str(excel_file)},
    }
    return data, _check(data)


def _check(d):
    """Problems worth fixing in the workbook (the export still runs)."""
    warn = []
    sids = {s["stage_id"] for s in d["stages"]}
    for key, idk in [("quotes", "quote_id"), ("publications", "pub_id"), ("talks", "talk_id"),
                     ("funding", "grant_id"), ("prototypes", "proto_id"), ("taxonomy_versions", "tax_id")]:
        seen = set()
        for r in d[key]:
            rid = r.get(idk)
            if rid in seen:
                warn.append(f"{key}: duplicate ID {rid}")
            seen.add(rid)
            if r.get("stage_id") not in sids:
                warn.append(f"{key} {rid}: stage_id '{r.get('stage_id')}' is not in Stages (row not shown)")
    for t in d["talks"]:
        if not re.match(r"^\d{4}(-\d{2}){0,2}$", str(t.get("date") or "")):
            warn.append(f"talks {t.get('talk_id')}: date should look like 2026, 2026-03 or 2026-03-18")
    for k in ("Q032", "Q041"):
        if k not in {q["quote_id"] for q in d["intro_quotes"]}:
            warn.append(f"intro quote {k} not found in Quotes")
    return warn


def export(excel_file, json_file):
    data, warn = build(excel_file)
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    counts = {k: len(v) for k, v in data.items() if isinstance(v, list)}
    print(f"Wrote {json_file}")
    print("  " + ", ".join(f"{k}={v}" for k, v in counts.items()))
    if warn:
        print("Check these in the workbook:")
        for w in warn:
            print("  - " + w)
    else:
        print("No problems found.")
    return data


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        sys.exit("Usage: python tools/update_timeline.py path/to/iCARE-PD_timeline_database.xlsx [data/ecarepd_timeline.json]")
    export(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "data/ecarepd_timeline.json")
