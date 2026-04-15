import os
import re

FRONTEND_DIR = "/Users/user/Desktop/exams_resultspro/frontend/src"

def process_classes(cls_str):
    if 'bg-white/2' in cls_str or 'bg-white/5' in cls_str:
        cls_str = re.sub(r'\bbg-white/2\b', 'bg-white/[0.02]', cls_str)
        if 'border-white/5' in cls_str and 'border-t-white' not in cls_str:
            cls_str = re.sub(r'\bborder-white/5\b', 'border-white/[0.05] border-t-white/[0.1]', cls_str)
        elif 'border-white/10' in cls_str and 'border-t-white' not in cls_str:
            cls_str = re.sub(r'\bborder-white/10\b', 'border-white/[0.1] border-t-white/[0.15]', cls_str)
        
        if 'backdrop-blur-sm' in cls_str or 'backdrop-blur-md' in cls_str:
            cls_str = re.sub(r'\bbackdrop-blur-(sm|md)\b', 'backdrop-blur-xl backdrop-saturate-[1.2] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]', cls_str)
    return cls_str

def enhance_files():
    for root, _, files in os.walk(FRONTEND_DIR):
        for file in files:
            if not (file.endswith('.tsx') or file.endswith('.ts')):
                continue
                
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content
            
            # Replace regular className="..."
            def rep1(match):
                return 'className="' + process_classes(match.group(1)) + '"'
            new_content = re.sub(r'className="([^"]+)"', rep1, new_content)

            # Replace template string className={`...`}
            def rep2(match):
                return 'className={`' + process_classes(match.group(1)) + '`}'
            new_content = re.sub(r'className=\{`([^`]+)`\}', rep2, new_content)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated comprehensively: {filepath}")

if __name__ == '__main__':
    enhance_files()
