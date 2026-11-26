#!/usr/bin/env python3
"""
Cut the pages of Jeff Erickson's "Algorithms" (1st edition, CC BY 4.0) into image strips for the site.

For one chapter it produces:
  * reading strips for every section: from its heading up to the next section heading
  * one set of strips per end-of-chapter exercise, with the exercise group heading it belongs to
Running heads and page numbers are cropped away so the strips read continuously.

Outputs:
  public/book/chNN/<section>-<i>.webp, public/book/chNN/ex<k>-<i>.webp
  src/data/book-pages/chNN.json

Requires poppler (pdftoppm, pdftotext) and Pillow.
Usage:  python3 tools/extract_erickson.py 1
"""
import json, re, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "public" / "book" / "erickson-algorithms.pdf"
OFFSET = 18          # pdf page = book page + OFFSET
SCALE = 2.6          # px per pt
BODY_TOP, BODY_BOTTOM = 62, 652   # pt; outside = running head / page number
GAP = 8              # pt above a heading where a cut is made

# chapter -> first and last book page of the chapter, the book page where "Exercises" starts, section titles
CHAPTERS = {
    0: dict(first=1, last=20, exercises=17, sections=[
        ("0.1", "What is an algorithm?"), ("0.2", "Multiplication"), ("0.3", "Congressional Apportionment"),
        ("0.4", "A Bad Example"), ("0.5", "Describing Algorithms"), ("0.6", "Analyzing Algorithms"),
    ]),
    2: dict(first=71, last=96, exercises=93, sections=[
        ("2.1", "N Queens"), ("2.2", "Game Trees"), ("2.3", "Subset Sum"), ("2.4", "The General Pattern"),
        ("2.5", "Text Segmentation (Interpunctio Verborum)"), ("2.6", "Longest Increasing Subsequence"),
        ("2.7", "Longest Increasing Subsequence, Take 2"), ("2.8", "Optimal Binary Search Trees"),
    ]),
    3: dict(first=97, last=158, exercises=123, sections=[
        ("3.1", 'Mātrāvr.tta'), ("3.2", "Aside: Even Faster Fibonacci Numbers"), ("3.3", "Interpunctio Verborum Redux"),
        ("3.4", "The Pattern: Smart Recursion"), ("3.5", "Warning: Greed is Stupid"), ("3.6", "Longest Increasing Subsequence"),
        ("3.7", "Edit Distance"), ("3.8", "Subset Sum"), ("3.9", "Optimal Binary Search Trees"),
        ("3.10", "Dynamic Programming on Trees"),
    ]),
    4: dict(first=159, last=186, exercises=176, sections=[
        ("4.1", "Storing Files on Tape"), ("4.2", "Scheduling Classes"), ("4.3", "General Pattern"),
        ("4.4", "Huffman Codes"), ("4.5", "Stable Matching"),
    ]),
    5: dict(first=187, last=224, exercises=207, sections=[
        ("5.1", "Introduction and History"), ("5.2", "Basic Deﬁnitions"), ("5.3", "Representations and Examples"),
        ("5.4", "Data Structures"), ("5.5", "Whatever-First Search"), ("5.6", "Important Variants"),
        ("5.7", "Graph Reductions: Flood Fill"),
    ]),
    6: dict(first=225, last=256, exercises=244, sections=[
        ("6.1", "Preorder and Postorder"), ("6.2", "Detecting Cycles"), ("6.3", "Topological Sort"),
        ("6.4", "Memoization and Dynamic Programming"), ("6.5", "Strong Connectivity"),
        ("6.6", "Strong Components in Linear Time"),
    ]),
    7: dict(first=257, last=272, exercises=268, sections=[
        ("7.1", "Distinct Edge Weights"), ("7.2", "The Only Minimum Spanning Tree Algorithm"),
        ("7.3", "Borůvka’s Algorithm"), ("7.4", "Jarník’s (“Prim’s”) Algorithm"), ("7.5", "Kruskal’s Algorithm"),
    ]),
    8: dict(first=273, last=307, exercises=297, sections=[
        ("8.1", "Shortest Path Trees"), ("8.2", "Negative Edges"), ("8.3", "The Only SSSP Algorithm"),
        ("8.4", "Unweighted Graphs: Breadth-First Search"), ("8.5", "Directed Acyclic Graphs: Depth-First Search"),
        ("8.6", "Best-First: Dijkstra’s Algorithm"), ("8.7", "Relax ALL the Edges: Bellman-Ford"),
    ]),
    9: dict(first=309, last=326, exercises=320, sections=[
        ("9.1", "Introduction"), ("9.2", "Lots of Single Sources"), ("9.3", "Reweighting"),
        ("9.4", "Johnson’s Algorithm"), ("9.5", "Dynamic Programming"), ("9.6", "Divide and Conquer"),
        ("9.7", "Funny Matrix Multiplication"), ("9.8", "(Kleene-Roy-)Floyd-Warshall(-Ingerman)"),
    ]),
    10: dict(first=327, last=352, exercises=344, sections=[
        ("10.1", "Flows"), ("10.2", "Cuts"), ("10.3", "The Maxﬂow-Mincut Theorem"),
        ("10.4", "Ford and Fulkerson’s augmenting-path algorithm"), ("10.5", "Combining and Decomposing Flows"),
        ("10.6", "Edmonds and Karp’s Algorithms"), ("10.7", "Further Progress"),
    ]),
    11: dict(first=353, last=378, exercises=368, sections=[
        ("11.1", "Edge-Disjoint Paths"), ("11.2", "Vertex Capacities and Vertex-Disjoint Paths"),
        ("11.3", "Bipartite Matching"), ("11.4", "Tuple Selection"), ("11.5", "Disjoint-Path Covers"),
        ("11.6", "Baseball Elimination"), ("11.7", "Project Selection"),
    ]),
    12: dict(first=379, last=428, exercises=415, sections=[
        ("12.1", "A Game You Can’t Win"), ("12.2", "P versus NP"), ("12.3", "NP-hard, NP-easy, and NP-complete"),
        ("12.4", "Formal Deﬁnitions (HC SVNT DRACONES)"), ("12.5", "Reductions and SAT"), ("12.6", "3SAT (from CIRCUITSAT)"),
        ("12.7", "Maximum Independent Set (from 3SAT)"), ("12.8", "The General Pattern"),
        ("12.9", "Clique and Vertex Cover (from Independent Set)"), ("12.10", "Graph Coloring (from 3SAT)"),
        ("12.11", "Hamiltonian Cycle"), ("12.12", "Subset Sum (from Vertex Cover)"), ("12.13", "Other Useful NP-hard Problems"),
        ("12.14", "Choosing the Right Problem"), ("12.15", "A Frivolous Real-World Example"), ("12.16", "On Beyond Zebra"),
    ]),
    1: dict(first=21, last=70, exercises=44, sections=[
        ("1.1", "Reductions"), ("1.2", "Simplify and Delegate"), ("1.3", "Tower of Hanoi"),
        ("1.4", "Mergesort"), ("1.5", "Quicksort"), ("1.6", "The Pattern"), ("1.7", "Recursion Trees"),
        ("1.8", "Linear-Time Selection"), ("1.9", "Fast Multiplication"), ("1.10", "Exponentiation"),
    ]),
}


def lines_on_page(book_page):
    out = subprocess.run(["pdftotext", "-f", str(book_page + OFFSET), "-l", str(book_page + OFFSET), "-bbox-layout", str(PDF), "-"],
                         capture_output=True, text=True, check=True).stdout
    res = []
    for m in re.finditer(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>', out, re.S):
        words = re.findall(r">([^<]*)</word>", m.group(5))
        res.append(dict(x0=float(m.group(1)), y0=float(m.group(2)), x1=float(m.group(3)), y1=float(m.group(4)), text=" ".join(words)))
    return sorted(res, key=lambda l: (l["y0"], l["x0"]))


OPENERS = set()   # chapter opener pages have no running head, so their text starts higher


def body(lines, page=None):
    top = 20 if page in OPENERS else BODY_TOP
    return [l for l in lines if top <= l["y0"] and l["y1"] <= BODY_BOTTOM]


def xrange_of(pages):
    """Crop box in x for odd and even book pages: the union of all body lines, padded."""
    box = {0: [1e9, 0], 1: [1e9, 0]}
    for p, ls in pages.items():
        for l in body(ls):
            b = box[p % 2]
            b[0] = min(b[0], l["x0"]); b[1] = max(b[1], l["x1"])
    return {k: (v[0] - 10, v[1] + 10) for k, v in box.items()}


def render(book_page, tmp):
    stem = tmp / f"p{book_page}"
    if not Path(f"{stem}.png").exists():
        subprocess.run(["pdftoppm", "-f", str(book_page + OFFSET), "-l", str(book_page + OFFSET), "-r", str(int(72 * SCALE)),
                        "-png", "-singlefile", str(PDF), str(stem)], check=True)
    return Image.open(f"{stem}.png").convert("RGB")


def cut(markers, end, pages, xr, tmp, outdir, chap, prefix):
    """markers: ordered [(label, page, y)]; each segment runs to the next marker, the last one to `end`.
    Returns {label: [strip, ...]}."""
    store = {}
    bounds = markers + [end]
    for i, (label, page, y) in enumerate(markers):
        _, page2, y2 = bounds[i + 1]
        strips, k = [], 0
        for p in range(page, page2 + 1):
            ys = y if p == page else BODY_TOP
            ye = y2 if p == page2 else BODY_BOTTOM
            if p == page and p in OPENERS and ys == BODY_TOP:
                ys = 20
            bl = [l for l in body(pages[p], p) if l["y0"] >= ys - 1 and l["y1"] <= ye + 1]
            if not bl:
                continue
            top = max(16, min(l["y0"] for l in bl) - 4)
            bot = min(BODY_BOTTOM, max(l["y1"] for l in bl) + 6)
            x0, x1 = xr[p % 2]
            img = render(p, tmp)
            crop = img.crop((int(x0 * SCALE), int(top * SCALE), int(x1 * SCALE), int(bot * SCALE)))
            k += 1
            name = f"{prefix}{label}-{k}.webp"
            crop.save(outdir / name, "WEBP", quality=82, method=6)
            strips.append(dict(src=f"book/ch{chap:02d}/{name}", w=crop.width, h=crop.height, page=p))
        store[label] = strips
    return store


def main(chap):
    cfg = CHAPTERS[chap]
    outdir = ROOT / "public" / "book" / f"ch{chap:02d}"
    outdir.mkdir(parents=True, exist_ok=True)
    for f in outdir.glob("*.webp"):
        f.unlink()
    OPENERS.add(cfg["first"])
    pages = {p: lines_on_page(p) for p in range(cfg["first"], cfg["last"] + 1)}
    xr = xrange_of(pages)

    # --- section reading ---
    markers = []
    for sid, title in cfg["sections"]:
        want = f"{sid} {title}"
        hit = None
        for p in range(cfg["first"], cfg["exercises"] + 1):
            bl = body(pages[p])
            for l in bl:
                same = " ".join(x["text"] for x in bl if abs(x["y0"] - l["y0"]) < 4 and x["x0"] > l["x0"])
                if l["text"].lstrip("ª ") == want or (l["text"].lstrip("ª ") == sid and same.startswith(title)):
                    hit = (p, l["y0"] - GAP); break
            if hit: break
        if not hit:
            sys.exit(f"heading not found: {want}")
        markers.append((sid, *hit))
    markers[0] = (markers[0][0], cfg["first"], BODY_TOP)   # the chapter opener belongs to the first section
    ex_head = next(((p, l["y0"] - GAP) for p in range(cfg["exercises"], cfg["exercises"] + 1) for l in body(pages[p]) if l["text"] == "Exercises"), None)
    if not ex_head:
        sys.exit("Exercises heading not found")
    reading = cut(markers, ("end", *ex_head), pages, xr, Path(TMP), outdir, chap, "")

    # --- exercises: one marker per numbered exercise; group headings become labels ---
    left = {k: v[0] + 10 for k, v in xr.items()}
    # group headings sit at the text margin, like the "Exercises" heading itself (odd pages are shifted right by 18pt)
    ex_line = next(l for l in body(pages[ex_head[0]]) if l["text"] == "Exercises")
    shift = 18 if ex_head[0] % 2 == 0 else -18
    margin = {ex_head[0] % 2: ex_line["x0"], 1 - ex_head[0] % 2: ex_line["x0"] + shift}
    ex_markers, groups, group = [], {}, None
    start = True
    for p in range(cfg["exercises"], cfg["last"] + 1):
        ls = body(pages[p])
        for i, l in enumerate(ls):
            if p == ex_head[0] and l["y0"] <= ex_head[1] + GAP + 2:
                continue
            m = re.match(r"^(?:ª\s*)?(\d+)\.\s", l["text"])
            if m and l["x0"] <= left[p % 2] + 26:
                n = int(m.group(1))
                ex_markers.append((n, p, l["y0"] - 4))
                groups[n] = group
                continue
            # a group heading: short line at the left margin, with a gap above it, not part of an exercise body
            prev = ls[i - 1] if i else None
            gap = l["y0"] - prev["y1"] if prev else 99
            if abs(l["x0"] - margin[p % 2]) < 2.5 and len(l["text"].split()) <= 6 and gap > 12 and not l["text"][0].isdigit() and l["text"][0] != "(" and l["text"][0].isupper():
                nxt = ls[i + 1] if i + 1 < len(ls) else None
                if nxt and re.match(r"^\d+\.\s", nxt["text"]):
                    group = l["text"]
                    ex_markers.append((f"g{len(ex_markers)}", p, l["y0"] - 4))
    # drop group-heading markers from the exercise list: they only end the previous exercise's strip
    end = ("end", cfg["last"], BODY_BOTTOM)
    cuts = cut(ex_markers, end, pages, xr, Path(TMP), outdir, chap, "ex")
    exercises = [dict(num=n, group=groups[n], strips=cuts[n]) for (n, _, _) in ex_markers if isinstance(n, int)]
    for f in outdir.glob("exg*.webp"):
        f.unlink()

    data = dict(chapter=chap, offset=OFFSET, pages=[cfg["first"], cfg["last"]], exercisesPage=cfg["exercises"],
                reading=reading, exercises=exercises)
    dst = ROOT / "src" / "data" / "book-pages"
    dst.mkdir(parents=True, exist_ok=True)
    (dst / f"ch{chap:02d}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    print(f"chapter {chap}: {sum(len(v) for v in reading.values())} reading strips, {len(exercises)} exercises")
    for n in range(1, len(exercises) + 1):
        if not any(e["num"] == n for e in exercises):
            print("  missing exercise", n)


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as TMP:
        main(int(sys.argv[1]))
