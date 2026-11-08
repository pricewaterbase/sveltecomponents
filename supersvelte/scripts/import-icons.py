"""Safely extract the supplied TSX icons without executing uploaded code."""
import json
import re
import sys
import zipfile
from pathlib import Path, PurePosixPath
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT.parents[1] / "attached_assets/svg_1793397142431.zip"
ATTRS = {
    "fillRule": "fill-rule", "clipRule": "clip-rule",
    "strokeLinecap": "stroke-linecap", "strokeLinejoin": "stroke-linejoin",
    "strokeWidth": "stroke-width", "clipPath": "clip-path", "className": "class",
}


def convert(source: str) -> str:
    match = re.search(r"<svg\b[\s\S]*?</svg>", source)
    if not match:
        raise ValueError("Missing SVG")
    svg = match.group().replace("{...props}", "")
    svg = re.sub(r"=\{(-?\d+(?:\.\d+)?)\}", r'="\1"', svg)
    for jsx, xml in ATTRS.items():
        svg = re.sub(r"\b" + jsx + r"=", xml + "=", svg)
    svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ', 1)
    svg = re.sub(r"\s+>", ">", svg)
    root = ET.fromstring(svg)
    allowed = {"svg", "path", "g", "rect", "circle", "ellipse", "line",
               "polyline", "polygon", "defs", "clipPath", "title"}
    for element in root.iter():
        tag = element.tag.split("}")[-1]
        if tag not in allowed:
            raise ValueError(f"Unsafe SVG element: {tag}")
        for key, value in element.attrib.items():
            if key.lower().startswith("on") or key in {"href", "src", "style"}:
                raise ValueError(f"Unsafe SVG attribute: {key}")
            if "url(" in value and not re.fullmatch(r"url\(#[\w-]+\)", value):
                raise ValueError("External SVG resource")
    return svg


def main():
    catalog = []
    with zipfile.ZipFile(ARCHIVE) as archive:
        if sum(i.file_size for i in archive.infolist()) > 10_000_000:
            raise ValueError("Archive too large")
        for entry in archive.infolist():
            path = PurePosixPath(entry.filename)
            if path.is_absolute() or ".." in path.parts or "\\" in entry.filename:
                raise ValueError("Unsafe archive path")
            if entry.is_dir():
                continue
            if not re.fullmatch(r"svg/[A-Za-z0-9_]+\.tsx", entry.filename):
                raise ValueError(f"Unexpected archive entry: {entry.filename}")
            if entry.file_size > 100_000:
                raise ValueError("Entry too large")
            source = archive.read(entry).decode("utf-8")
            name = path.stem
            svg = convert(source)
            destination = ROOT / "source-icons" / path.name
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(source)
            catalog.append({"name": name, "svg": svg})
    catalog.sort(key=lambda icon: icon["name"].lower())
    if len({i["name"] for i in catalog}) != len(catalog):
        raise ValueError("Duplicate icon names")
    output = ROOT / "server/data/icons.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(catalog, ensure_ascii=False, separators=(",", ":")))
    print(f"Validated and imported {len(catalog)} icons")


if __name__ == "__main__":
    main()
