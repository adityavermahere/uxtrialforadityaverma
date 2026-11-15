#!/usr/bin/env python3
"""Create cacheable media variants without changing the extracted originals.

Requires Pillow with WebP support and ffmpeg/ffprobe. Run this when source media
changes, not on every Vercel build. The generated assets and map are build inputs.
"""

from __future__ import annotations

import argparse
from concurrent.futures import ProcessPoolExecutor
import hashlib
import io
import json
from pathlib import Path
import shutil
import subprocess

from PIL import Image, features


ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "public/assets/original"
OUTPUT = ROOT / "public/assets/media"


def web_url(path: Path) -> str:
    return "/" + path.relative_to(ROOT / "public").as_posix()


def describe(path: Path, size: tuple[int, int] | None = None) -> dict:
    item = {"url": web_url(path), "bytes": path.stat().st_size}
    if size:
        item.update(width=size[0], height=size[1])
    return item


def output_path(uid: str, label: str, payload: bytes, extension: str) -> Path:
    digest = hashlib.sha256(payload).hexdigest()[:12]
    return OUTPUT / f"{uid}-{label}.{digest}.{extension}"


def encode_webp(image: Image.Image, *, lossless: bool, quality: int) -> bytes:
    target = io.BytesIO()
    metadata = {}
    if image.info.get("icc_profile"):
        metadata["icc_profile"] = image.info["icc_profile"]
    if image.info.get("exif"):
        metadata["exif"] = image.info["exif"]
    xmp = image.info.get("XML:com.adobe.xmp") or image.info.get("xmp")
    if xmp:
        metadata["xmp"] = xmp.encode() if isinstance(xmp, str) else xmp
    image.save(
        target,
        format="WEBP",
        lossless=lossless,
        quality=quality,
        method=6,
        exact=True,
        **metadata,
    )
    return target.getvalue()


def optimize_image(source: Path) -> tuple[str, dict, dict]:
    uid = source.stem
    with Image.open(source) as image:
        image.load()
        rgba = image.convert("RGBA")
        rgba.info = image.info.copy()
    full_bytes = encode_webp(rgba, lossless=True, quality=100)
    decoded = Image.open(io.BytesIO(full_bytes)).convert("RGBA")
    # Verify decoded pixels, including RGB under transparent pixels, rather than
    # claiming a full-resolution lossy image is an equivalent original.
    exact_pixels = decoded.size == rgba.size and decoded.tobytes() == rgba.tobytes()
    if exact_pixels and len(full_bytes) < source.stat().st_size:
        full = output_path(uid, "full", full_bytes, "webp")
        full.write_bytes(full_bytes)
    else:
        full = source

    variants = {"full": describe(full, rgba.size)}
    for label, maximum, lossless, quality in [
        ("display", 2000, True, 100),
        ("thumbnail", 480, False, 92),
        ("room", 768, False, 94),
    ]:
        if max(rgba.size) <= maximum:
            variants[label] = variants["full"].copy()
            continue
        smaller = rgba.copy()
        smaller.thumbnail((maximum, maximum), Image.Resampling.LANCZOS)
        smaller.info = rgba.info.copy()
        payload = encode_webp(smaller, lossless=lossless, quality=quality)
        # Resampling flat screenshot text can introduce more entropy than the
        # original pixels. Prefer the smaller, sharper full image in that case.
        if len(payload) >= full.stat().st_size:
            variants[label] = variants["full"].copy()
            continue
        target = output_path(uid, label, payload, "webp")
        target.write_bytes(payload)
        variants[label] = describe(target, smaller.size)

    mapping = {
        "type": "image",
        "full": variants["full"]["url"],
        "display": variants["display"]["url"],
        "thumbnail": variants["thumbnail"]["url"],
        "room": variants["room"]["url"],
        "original": web_url(source),
        "width": rgba.width,
        "height": rgba.height,
        "variants": variants,
    }
    report = {
        "source": web_url(source),
        "sourceBytes": source.stat().st_size,
        "dimensions": list(rgba.size),
        "fullPixelsVerified": exact_pixels,
        "fullUsesOriginal": full == source,
        "variants": variants,
    }
    return uid, mapping, report


def ffprobe(source: Path) -> dict:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_entries",
            "format=duration,size,bit_rate:stream=index,codec_name,sample_rate,channels,bit_rate,width,height",
            "-of", "json", str(source),
        ],
        check=True, capture_output=True, text=True,
    )
    return json.loads(result.stdout)


def ffmpeg(*arguments: str) -> None:
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *arguments], check=True)


def stream_hashes(source: Path) -> list[str]:
    result = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(source),
         "-map", "0", "-c", "copy", "-f", "streamhash", "-hash", "sha256", "-"],
        check=True, capture_output=True, text=True,
    )
    return result.stdout.strip().splitlines()


def optimize_video(source: Path) -> tuple[dict, dict]:
    probe = ffprobe(source)
    # Preserve both encoded streams. Moving the MP4 index to the beginning helps
    # playback startup without a generation of lossy video/audio transcoding.
    temporary = OUTPUT / f"{source.stem}-faststart.tmp.mp4"
    ffmpeg("-i", str(source), "-map", "0", "-c", "copy", "-movflags", "+faststart", str(temporary))
    payload = temporary.read_bytes()
    target = output_path(source.stem, "faststart", payload, "mp4")
    temporary.replace(target)
    source_hashes = stream_hashes(source)
    if source_hashes != stream_hashes(target):
        raise RuntimeError("Faststart remux changed encoded media streams")
    poster_temp = OUTPUT / f"{source.stem}-poster.tmp.webp"
    ffmpeg("-ss", "0", "-i", str(source), "-frames:v", "1", "-vf", "scale=960:-2", "-c:v", "libwebp", "-quality", "92", str(poster_temp))
    poster = output_path(source.stem, "poster", poster_temp.read_bytes(), "webp")
    poster_temp.replace(poster)
    video_stream = next(s for s in probe["streams"] if "width" in s)
    mapping = {
        "type": "video", "full": web_url(target), "display": web_url(target),
        "poster": web_url(poster), "original": web_url(source),
        "width": video_stream["width"], "height": video_stream["height"],
        "duration": float(probe["format"]["duration"]),
    }
    report = {
        "source": web_url(source), "sourceBytes": source.stat().st_size,
        "sourceMetadata": probe, "output": describe(target),
        "poster": describe(poster), "streamsReencoded": False,
        "streamHashesVerified": True, "streamHashes": source_hashes,
        "outputMetadata": ffprobe(target),
    }
    return mapping, report


def optimize_audio(source: Path) -> tuple[dict, dict]:
    probe = ffprobe(source)
    temporary = OUTPUT / f"{source.stem}-192k.tmp.mp3"
    ffmpeg(
        "-i", str(source), "-map_metadata", "0", "-c:a", "libmp3lame",
        "-b:a", "192k", "-write_xing", "1", str(temporary),
    )
    target = output_path(source.stem, "192k", temporary.read_bytes(), "mp3")
    temporary.replace(target)
    mapping = {
        "type": "audio", "full": web_url(source), "display": web_url(target),
        "original": web_url(source), "duration": float(probe["format"]["duration"]),
        "bitrate": 192000, "lossyTranscode": True,
    }
    report = {
        "source": web_url(source), "sourceBytes": source.stat().st_size,
        "sourceMetadata": probe, "output": describe(target),
        "outputMetadata": ffprobe(target), "lossyTranscode": True,
        "note": "192 kbps stereo playback derivative; original 320 kbps MP3 is retained. No trimming or sample-rate/channel changes.",
    }
    return mapping, report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, default=4)
    options = parser.parse_args()
    source_map = json.loads((ROOT / "asset-map.json").read_text())
    required = [ROOT / "public" / url.lstrip("/") for url in source_map.values()
                if url.endswith((".png", ".mp3", ".mp4"))]
    missing = [str(path.relative_to(ROOT)) for path in required if not path.is_file()]
    if missing:
        raise SystemExit("Restore the locally retained original media before regenerating variants. "
                         f"Missing {len(missing)} original files; existing mappings were not changed.")
    if not features.check("webp"):
        raise SystemExit("Pillow must include WebP support")
    for executable in ["ffmpeg", "ffprobe"]:
        if not shutil.which(executable):
            raise SystemExit(f"Required executable missing: {executable}")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    mapping = {}
    reports = {}
    images = sorted(ORIGINAL.glob("*.png"))
    with ProcessPoolExecutor(max_workers=max(1, options.workers)) as pool:
        for uid, item, report in pool.map(optimize_image, images):
            mapping[uid] = item
            reports[uid] = report
            print(f"{uid}: {report['sourceBytes']:,} -> full {item['variants']['full']['bytes']:,}; display {item['variants']['display']['bytes']:,}", flush=True)
    for source in sorted(ORIGINAL.glob("*.mp4")):
        mapping[source.stem], reports[source.stem] = optimize_video(source)
    for source in sorted(ORIGINAL.glob("*.mp3")):
        mapping[source.stem], reports[source.stem] = optimize_audio(source)
    # SVG remains vector, including its original provenance metadata.
    for source in sorted(ORIGINAL.glob("*.svg")):
        url = web_url(source)
        mapping[source.stem] = {"type": "image", "full": url, "display": url, "thumbnail": url, "room": url, "original": url}
    summary = {
        "pngCount": len(images),
        "originalPngBytes": sum(reports[p.stem]["sourceBytes"] for p in images),
        "fullImageBytes": sum(mapping[p.stem]["variants"]["full"]["bytes"] for p in images),
        "displayImageBytes": sum(mapping[p.stem]["variants"]["display"]["bytes"] for p in images),
        "thumbnailBytes": sum(mapping[p.stem]["variants"]["thumbnail"]["bytes"] for p in images),
        "roomVariantBytes": sum(mapping[p.stem]["variants"]["room"]["bytes"] for p in images),
        "allFullImagesPixelVerified": all(reports[p.stem]["fullPixelsVerified"] or reports[p.stem]["fullUsesOriginal"] for p in images),
    }
    (ROOT / "media-map.json").write_text(json.dumps(mapping, indent=2) + "\n")
    (ROOT / "reports/media-optimization.json").write_text(json.dumps({"summary": summary, "assets": reports}, indent=2) + "\n")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
