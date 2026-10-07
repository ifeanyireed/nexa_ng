import re

# Read mobile_customer main.dart
with open('mobile_customer/lib/main.dart', 'r') as f:
    customer_main = f.read()

# Extract the theme
theme_match = re.search(r'theme: ThemeData\([\s\S]+?,\n      \),', customer_main)
if not theme_match:
    print("Could not extract theme from mobile_customer")
    exit(1)
theme_str = theme_match.group(0)

# Extract SystemChrome setup
system_chrome = """  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );"""

def update_main(app_path):
    with open(f'{app_path}/lib/main.dart', 'r') as f:
        content = f.read()
    
    # Add SystemChrome to main
    if 'SystemChrome' not in content:
        content = content.replace('void main() {', 'import \'package:flutter/services.dart\';\n\nvoid main() {\n  WidgetsFlutterBinding.ensureInitialized();\n' + system_chrome)
        
    # Replace theme
    content = re.sub(r'theme: ThemeData\([\s\S]+?,\n      \),?', theme_str + '\n', content)
    
    with open(f'{app_path}/lib/main.dart', 'w') as f:
        f.write(content)

update_main('mobile_fleet')
update_main('mobile_driver')
