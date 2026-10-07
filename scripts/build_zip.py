import json, os, zipfile

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dist"), exist_ok=True)
os.chdir(root)
version = json.load(open("manifest.json"))["version"]
out = f"dist/wa-rich-export-{version}.zip"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    z.write("manifest.json")
    for d in ("icons", "src"):
        for r, _, fs in os.walk(d):
            for f in sorted(fs):
                z.write(os.path.join(r, f), os.path.join(r, f).replace(os.sep, "/"))
names = zipfile.ZipFile(out).namelist()
print(out, names[0], len(names), os.path.getsize(out), "bytes")
