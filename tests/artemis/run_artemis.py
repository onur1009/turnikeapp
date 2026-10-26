"""Turnike mobil testlerini Artemis üzerinden çalıştırır.

Ön koşullar:
  * Artemis kurulu ve sunucusu çalışıyor (`uv run artemis ui`, varsayılan http://127.0.0.1:8000)
  * Bir Android cihaz ya da emülatör bağlı (`adb devices`)
  * Debug APK derlenmiş: `npm run build && npx cap sync android && cd android && gradlew assembleDebug`

Kullanım:
  python tests/artemis/run_artemis.py                 # tüm senaryolar, temiz kurulumla
  python tests/artemis/run_artemis.py --only home_layout first_level
  python tests/artemis/run_artemis.py --keep-data     # uygulama verisini silmeden

Sonuçlar tests/artemis/reports/<zaman>.json dosyasına yazılır. Bir senaryo başarısızsa
çıkış kodu 1 olur (CI'da kullanılabilir).
"""

import argparse
import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ARTEMIS_HOME = Path(os.environ.get("ARTEMIS_HOME", r"C:\artemis"))

# artemis-client sıfır bağımlılıklı; kurulum gerektirmeden Artemis deposundan yüklenir
sys.path.insert(0, str(ARTEMIS_HOME / "packages" / "artemis-client" / "src"))
sys.path.insert(0, str(HERE))
from artemis_client import ArtemisClient  # noqa: E402
from scenarios import APP_PACKAGE, SCENARIOS, VERDICT_FORMAT  # noqa: E402

import tempfile  # noqa: E402

# npm run android:apk çıktıyı geçici klasöre yazar (scripts/gradle-build-outside.gradle); yoksa standart yol
_APK_CANDIDATES = [
    Path(tempfile.gettempdir()) / "turnike-gradle-build" / "app" / "outputs" / "apk" / "debug" / "app-debug.apk",
    ROOT / "android" / "app" / "build" / "outputs" / "apk" / "debug" / "app-debug.apk",
]
DEFAULT_APK = next((p for p in _APK_CANDIDATES if p.exists()), _APK_CANDIDATES[0])


def find_adb() -> str:
    adb = shutil.which("adb")
    if adb:
        return adb
    sdk = os.environ.get("ANDROID_HOME") or os.environ.get("ANDROID_SDK_ROOT") or \
        str(Path(os.environ.get("LOCALAPPDATA", "")) / "Android" / "Sdk")
    candidate = Path(sdk) / "platform-tools" / ("adb.exe" if os.name == "nt" else "adb")
    if candidate.exists():
        return str(candidate)
    sys.exit("adb bulunamadı: Android SDK platform-tools PATH'te olmalı")


def adb(serial: str, *args: str) -> str:
    out = subprocess.run([find_adb(), "-s", serial, *args], capture_output=True, text=True, timeout=180)
    return (out.stdout + out.stderr).strip()


def parse_verdict(output) -> dict:
    """Ajan çıktısındaki {"verdict": ..., "notes": ...} JSON'unu bulur."""
    text = output if isinstance(output, str) else json.dumps(output, ensure_ascii=False)
    match = re.search(r'\{[^{}]*"verdict"[^{}]*\}', text or "")
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return {"verdict": "UNKNOWN", "notes": (text or "")[:500]}


async def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--server", default=os.environ.get("ARTEMIS_BASE_URL", "http://127.0.0.1:8000"))
    parser.add_argument("--serial", help="cihaz seri numarası (varsayılan: bağlı ilk cihaz)")
    parser.add_argument("--apk", default=str(DEFAULT_APK))
    parser.add_argument("--only", nargs="*", help="yalnızca bu senaryolar")
    parser.add_argument("--keep-data", action="store_true", help="başlamadan uygulama verisini silme")
    parser.add_argument("--profile", choices=["flash", "pro"], help="tüm senaryolar için profili zorla")
    parser.add_argument("--timeout", type=float, default=900)
    args = parser.parse_args()

    client = ArtemisClient(args.server)
    try:
        await client.health()
    except Exception as exc:  # sunucu kapalıysa anlaşılır mesaj
        print(f"Artemis sunucusuna ulaşılamadı ({args.server}): {exc}\n"
              f"Başlatmak için: cd {ARTEMIS_HOME} && uv run artemis ui")
        return 2

    serial = args.serial
    if not serial:
        devices = [d for d in await client.list_devices() if getattr(d, "serial", None)]
        if not devices:
            print("Bağlı cihaz yok. Emülatörü açın ya da telefonu USB hata ayıklama ile bağlayın.")
            return 2
        serial = devices[0].serial
    print(f"Cihaz: {serial}")

    apk = Path(args.apk)
    if not apk.exists():
        print(f"APK bulunamadı: {apk}\nÖnce: npm run build && npx cap sync android && cd android && gradlew assembleDebug")
        return 2
    print("APK kuruluyor:", adb(serial, "install", "-r", str(apk)).splitlines()[-1])
    if not args.keep_data:
        print("Uygulama verisi temizleniyor:", adb(serial, "shell", "pm", "clear", APP_PACKAGE))

    selected = [s for s in SCENARIOS if not args.only or s.name in args.only]
    results = []
    for scenario in selected:
        print(f"\n▶ {scenario.name} ...", flush=True)
        started = time.monotonic()
        result = await client.run(
            f"{scenario.goal}\n\n{VERDICT_FORMAT}",
            profile=args.profile or scenario.profile,
            device_serial=serial,
            locked_app_package=APP_PACKAGE,
            timeout=args.timeout,
        )
        verdict = parse_verdict(result.output)
        passed = result.succeeded and verdict.get("verdict") == "PASS"
        results.append({
            "scenario": scenario.name,
            "passed": passed,
            "task_status": result.status,
            "verdict": verdict.get("verdict"),
            "notes": verdict.get("notes"),
            "error": result.error,
            "trace_id": getattr(result, "trace_id", None),
            "seconds": round(time.monotonic() - started),
        })
        mark = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {mark} ({results[-1]['seconds']} sn) {verdict.get('notes') or result.error or ''}")

    reports = HERE / "reports"
    reports.mkdir(exist_ok=True)
    report_path = reports / f"{time.strftime('%Y%m%d-%H%M%S')}.json"
    report_path.write_text(json.dumps({"device": serial, "results": results}, ensure_ascii=False, indent=2), encoding="utf-8")
    passed = sum(r["passed"] for r in results)
    print(f"\n{passed}/{len(results)} senaryo geçti. Rapor: {report_path}")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
