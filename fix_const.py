import os
import re

def fix_const_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove `const ` before `Icon(fixIcon(...)` or lists containing it, etc.
    # Actually, a safer way to fix `const_eval_method_invocation` is to let dart fix it, but `dart fix --apply` doesn't remove `const` when it causes an error, it only fixes lints.
    # We can try to use a regex to strip `const ` from `Icon(fixIcon(`
    new_content = re.sub(r'const\s+Icon\(\s*fixIcon', r'Icon(fixIcon', content)
    
    # Also strip `const ` from arrays that might contain fixIcon
    # A bit harder with regex, but we can remove `const ` before `Row(`, `Column(`, `ListView(`, `Padding(`, `SizedBox(`, `Center(`, `Container(` if it has `fixIcon` inside.
    # The safest way is to iteratively remove `const ` on lines that flutter analyze complains about.
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed const Icon in {filepath}")

for root, _, files in os.walk('mobile_fleet/lib'):
    for file in files:
        if file.endswith('.dart'):
            fix_const_in_file(os.path.join(root, file))

for root, _, files in os.walk('mobile_driver/lib'):
    for file in files:
        if file.endswith('.dart'):
            fix_const_in_file(os.path.join(root, file))
