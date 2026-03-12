import os
import subprocess
import time

out_dir = "/Users/macbook/.openclaw/workspace/fatman-assets/oem-parts"

prompts = [
    ("brake-rotor", "High-end carbon-ceramic brake rotor with red calipers, studio lighting, isolated product shot, realistic OEM part catalog photography, 8k resolution, white background, no logos."),
    ("alternator", "Precision machined aluminum alternator for automotive engine, gleaming metal, dramatic studio lighting, realistic OEM part catalog photography, 8k resolution, white background, no logos."),
    ("coilover-suspension", "Heavy-duty adjustable coilover suspension strut, red and black anodized aluminum, realistic OEM part catalog photography, 8k resolution, white background, no logos."),
    ("oil-filter", "Premium performance oil filter, matte black finish with subtle knurling, pristine product photography, realistic OEM part catalog photography, 8k resolution, white background, no logos."),
    ("spark-plug", "High-performance iridium spark plug, macro shot, extremely detailed ceramic insulator and metal threading, realistic OEM part catalog photography, 8k resolution, white background, no logos."),
    ("engine-piston", "Forged aluminum engine piston with rings, mirror finish on top, sharp focus, professional ecommerce shot, realistic OEM part catalog photography, 8k resolution, white background, no logos."),
    ("air-intake", "Performance cold air intake cone filter, crimson red mesh, carbon fiber housing, realistic OEM part catalog photography, 8k resolution, white background, no logos."),
    ("brake-lines", "Braided stainless steel brake lines with anodized blue fittings, neatly coiled, realistic OEM part catalog photography, 8k resolution, white background, no logos.")
]

html_lines = ["<html><head><title>OEM Parts Catalog</title><style>body { font-family: sans-serif; background: #f4f4f4; padding: 20px; } .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; } .card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); } img { max-width: 100%; border-radius: 4px; } h3 { margin-top: 10px; font-size: 1.1em; }</style></head><body><h1>Fatman OEM Parts Catalog Assets</h1><div class='grid'>"]

script_path = os.path.expanduser("~/.nvm/versions/node/v22.14.0/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py")

for name, prompt in prompts:
    filename = f"{name}.png"
    filepath = os.path.join(out_dir, filename)
    print(f"Generating {filename}...")
    cmd = [
        "uv", "run", script_path,
        "--prompt", prompt,
        "--filename", filepath,
        "--aspect-ratio", "1:1",
        "--resolution", "2K"
    ]
    
    subprocess.run(cmd, check=True)
    html_lines.append(f"<div class='card'><img src='{filename}' alt='{name}'><h3>{name}</h3><p>{prompt}</p></div>")
    time.sleep(2)  # brief pause to avoid rate limits

html_lines.append("</div></body></html>")

with open(os.path.join(out_dir, "index.html"), "w") as f:
    f.write("\n".join(html_lines))

print("Done generating images and index.html")
