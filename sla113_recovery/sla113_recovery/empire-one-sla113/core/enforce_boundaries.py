import os
import sys

# Protected Internal Paths
FORBIDDEN_PUBLIC_DIRS = ['../public', '../dist', '../client']
SLA113_CORE_ASSETS = ['vox', 'radio', 'registry', 'vfx']

def enforce_boundaries():
    print("🛡️ [G-SHIELD] ENFORCING ADMIN CONSOLE BOUNDARIES...")
    violations = 0

    for root, dirs, files in os.walk("C:/Users/luven/Documents/trae_projects/EmpireOne"):
        for dir_name in dirs:
            # Check if an internal SLA113 module has bled into the public layer
            if any(pub in root for pub in FORBIDDEN_PUBLIC_DIRS):
                if dir_name in SLA113_CORE_ASSETS:
                    print(f"❌ SECURITY VIOLATION: Internal module '{dir_name}' found in public path '{root}'")
                    violations += 1

    if violations == 0:
        print("✅ PERIMETER SECURE: SLA113 Internal OS remains Admin Only.")
    else:
        print(f"⚠️ SHIELD BREACH: {violations} integrity issues found.")
        sys.exit(1)

if __name__ == "__main__":
    enforce_boundaries()
