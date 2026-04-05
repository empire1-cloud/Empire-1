import base64
import os

# Paths to the generated images
p1 = r"C:\Users\whitt\.gemini\antigravity\brain\346763eb-cca4-4e29-81a7-05d325df7f53\input_file_16_1775406294723.png"
p2 = r"C:\Users\whitt\.gemini\antigravity\brain\346763eb-cca4-4e29-81a7-05d325df7f53\input_file_17_1775406407004.png"
target = r"c:\Users\whitt\Empire-1\sla113_recovery\sla113_recovery\lib\sovereign_assets.js"

def get_b64(path):
    if not os.path.exists(path):
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" # fallback
    with open(path, "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")

os.makedirs(os.path.dirname(target), exist_ok=True)

with open(target, "w") as f:
    f.write(f"export const LOUNGE_BASE64 = '{get_b64(p1)}';\n")
    f.write(f"export const FIRME_F_BASE64 = '{get_b64(p2)}';\n")

print(f"SLA113 // ASSETS BAKED INTO {target}")
