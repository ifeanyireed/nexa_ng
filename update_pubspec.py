import os

def update_pubspec(app_dir):
    with open(f'{app_dir}/pubspec.yaml', 'r') as f:
        content = f.read()
    
    if 'family: Dropa' not in content:
        fonts_config = """
  fonts:
    - family: Dropa
      fonts:
        - asset: assets/fonts/Dropa-Regular.ttf
"""
        if '  fonts:' in content:
            # Just replace it
            content = content.replace('  fonts:', fonts_config.strip('\n'))
        else:
            # append it
            content += fonts_config
            
        with open(f'{app_dir}/pubspec.yaml', 'w') as f:
            f.write(content)

update_pubspec('mobile_fleet')
update_pubspec('mobile_driver')
