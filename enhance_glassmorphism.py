import os
import re

FRONTEND_DIR = "/Users/user/Desktop/exams_resultspro/frontend/src"

def enhance_files():
    for root, _, files in os.walk(FRONTEND_DIR):
        for file in files:
            if not (file.endswith('.tsx') or file.endswith('.ts')):
                continue
                
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content
            
            # Enhance standard cards (bg-white/2 border border-white/5 backdrop-blur-sm)
            # We add backdrop-saturate, border-t-white/10, stronger blur, and a nice shadow
            old_card_pattern = r'bg-white/2\s+border\s+border-white/5\s+backdrop-blur-sm'
            new_card_class = 'bg-white/[0.02] border border-white/[0.05] border-t-white/[0.1] backdrop-blur-xl backdrop-saturate-[1.2] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
            new_content = re.sub(old_card_pattern, new_card_class, new_content)

            # Enhance buttons in Hero.tsx
            if 'Hero.tsx' in filepath:
                # Primary Button (Battle Mode)
                old_btn1 = r'shadow-\[0_1px_3px_0_rgba\(0,200,83,0\.35\)_inset,0_0_20px_0_rgba\(0,200,83,0\.20\)_inset,0_1px_22px_0_rgba\(255,255,255,0\.10\),0_4px_4px_0_rgba\(0,0,0,0\.05\),0_10px_10px_0_rgba\(0,0,0,0\.10\)\]\s+backdrop-blur-\[10px\]\s+bg-\[rgba\(255,255,255,0\.02\)\]\s+flex\s+gap-3\s+overflow-hidden\s+px-8\s+py-4\s+rounded-xl\s+border-solid\s+border-green/30\s+hover:bg-green/10\s+transition-all'
                new_btn1 = 'shadow-[0_1px_3px_0_rgba(0,200,83,0.4)_inset,0_0_20px_0_rgba(0,200,83,0.3)_inset,0_1px_22px_0_rgba(255,255,255,0.15),0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl backdrop-saturate-150 bg-[rgba(255,255,255,0.03)] flex gap-3 overflow-hidden px-8 py-4 rounded-xl border border-solid border-green/30 border-t-green/50 hover:bg-green/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
                new_content = re.sub(old_btn1, new_btn1, new_content)

                # Secondary Button (Practice)
                old_btn2 = r'shadow-\[0_1px_3px_0_rgba\(255,255,255,0\.1\)_inset,0_0_20px_0_rgba\(255,255,255,0\.05\)_inset,0_1px_22px_0_rgba\(255,255,255,0\.10\)\]\s+backdrop-blur-\[10px\]\s+bg-\[rgba\(255,255,255,0\.02\)\]\s+flex\s+gap-3\s+overflow-hidden\s+px-8\s+py-4\s+rounded-xl\s+border-solid\s+border-white/10\s+hover:bg-white/5\s+transition-all'
                new_btn2 = 'shadow-[0_1px_3px_0_rgba(255,255,255,0.15)_inset,0_0_20px_0_rgba(255,255,255,0.08)_inset,0_1px_22px_0_rgba(255,255,255,0.15),0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl backdrop-saturate-150 bg-[rgba(255,255,255,0.03)] flex gap-3 overflow-hidden px-8 py-4 rounded-xl border border-solid border-white/10 border-t-white/20 hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
                new_content = re.sub(old_btn2, new_btn2, new_content)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")

if __name__ == '__main__':
    enhance_files()
