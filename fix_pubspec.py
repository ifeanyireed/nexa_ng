import re
with open("mobile_driver/pubspec.yaml", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.strip() == "- family: Dropa" and lines[lines.index(line)-1].strip() != "fonts:":
        # This is a broken line
        continue
    if "- asset: assets/fonts/Dropa-Regular.ttf" in line:
        continue
    new_lines.append(line)

with open("mobile_driver/pubspec.yaml", "w") as f:
    f.writelines(new_lines)
