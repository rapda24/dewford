#!/usr/bin/env python3
"""
공통 영역(헤더 / 푸터 / 플로팅 버튼) 동기화 스크립트.

사용법:
    1. partials/header.html, partials/footer.html, partials/floating-buttons.html
       파일을 원하는 대로 수정한다.
    2. 아래 명령을 실행한다.

        python3 scripts/sync_common.py

    그러면 TARGET_FILES에 나열된 모든 정적 HTML 페이지의 해당 영역이
    partials 내용으로 그대로 치환된다. 결과물은 순수 정적 HTML이므로
    배포/로딩 속도에는 전혀 영향을 주지 않는다 (런타임 include/fetch 없음).

주의:
    - 각 페이지에는 아래와 같은 마커 주석이 있어야 한다.
        <!-- pxl:common:header:start --> ... <!-- pxl:common:header:end -->
        <!-- pxl:common:footer:start --> ... <!-- pxl:common:footer:end -->
        <!-- pxl:common:floating:start --> ... <!-- pxl:common:floating:end -->
    - 마커가 없는 파일은 건너뛰고 경고만 출력한다.
"""

import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTIALS_DIR = ROOT / "partials"

BLOCKS = [
    ("header", PARTIALS_DIR / "header.html"),
    ("footer", PARTIALS_DIR / "footer.html"),
    ("floating", PARTIALS_DIR / "floating-buttons.html"),
]

TARGET_FILES = [
    "why-dewford.html",
    "event.html",
    "contact.html",
    "admissions-inquiry.html",
    "educational-philosophy.html",
    "elementary-calendar.html",
    "elementary-esl.html",
    "elementary-international.html",
    "inquiry-learning.html",
    "international-preschool.html",
    "learning-journey.html",
    "literacy-program.html",
    "preschool-calendar.html",
    "rolling-enrollment.html",
    "special-subjects.html",
    "student-outcomes.html",
]


def sync_file(path: pathlib.Path, partial_contents: dict) -> bool:
    text = path.read_text(encoding="utf-8")
    changed = False

    for name, content in partial_contents.items():
        start_marker = f"<!-- pxl:common:{name}:start -->"
        end_marker = f"<!-- pxl:common:{name}:end -->"

        start_idx = text.find(start_marker)
        end_idx = text.find(end_marker)

        if start_idx == -1 or end_idx == -1 or end_idx < start_idx:
            print(f"  [경고] {path.name}: '{name}' 마커를 찾지 못해 건너뜀")
            continue

        block_start = start_idx + len(start_marker)
        old_block = text[block_start:end_idx]
        new_block = "\n" + content.strip("\n") + "\n"

        if old_block != new_block:
            text = text[:block_start] + new_block + text[end_idx:]
            changed = True

    if changed:
        path.write_text(text, encoding="utf-8")

    return changed


def main() -> int:
    partial_contents = {}
    for name, partial_path in BLOCKS:
        if not partial_path.exists():
            print(f"[오류] partial 파일이 없습니다: {partial_path}")
            return 1
        partial_contents[name] = partial_path.read_text(encoding="utf-8")

    updated = []
    for filename in TARGET_FILES:
        path = ROOT / filename
        if not path.exists():
            print(f"[경고] 대상 파일이 없습니다: {filename}")
            continue
        if sync_file(path, partial_contents):
            updated.append(filename)

    if updated:
        print(f"\n동기화 완료: {len(updated)}개 파일 업데이트")
        for f in updated:
            print(f"  - {f}")
    else:
        print("\n변경 사항 없음 (이미 최신 상태).")

    return 0


if __name__ == "__main__":
    sys.exit(main())
