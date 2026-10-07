import os
import re

directories = ['mobile_customer/lib', 'mobile_fleet/lib', 'mobile_driver/lib']

replacements = {
    r'fixIcon\(FlexIcon\.remix\.lessThanSignCircle\)': 'Icons.arrow_back',
    r'fixIcon\(FlexIcon\.remix\.downloadArrow\)': 'Icons.keyboard_arrow_down',
    r'fixIcon\(FlexIcon\.remix\.lineArrowExpand\)': 'Icons.chevron_right',
    r'fixIcon\(FlexIcon\.remix\.lineArrowExpandWindow2\)': 'Icons.open_in_new'
}

for d in directories:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith('.dart'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                new_content = content
                for old, new in replacements.items():
                    new_content = re.sub(old, new, new_content)
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
