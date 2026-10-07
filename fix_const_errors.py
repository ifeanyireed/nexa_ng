import re
import subprocess
import os

def run_analyze(directory):
    result = subprocess.run(['flutter', 'analyze'], cwd=directory, capture_output=True, text=True)
    return result.stdout + result.stderr

def fix_const_errors(directory):
    while True:
        print(f"Analyzing {directory}...")
        output = run_analyze(directory)
        
        # look for "const_eval_method_invocation" lines
        # format: error • Methods can't be invoked in constant expressions • lib/screens/home_screen.dart:98:34 • const_eval_method_invocation
        lines = output.split('\n')
        fixes = {}
        for i, line in enumerate(lines):
            if 'const_eval_method_invocation' in line:
                # the file path and line number is usually in the line or the previous line
                match = re.search(r'([a-zA-Z0-9_/\.]+):(\d+):\d+', line)
                if match:
                    filepath = os.path.join(directory, match.group(1))
                    lineno = int(match.group(2))
                    fixes.setdefault(filepath, set()).add(lineno)
        
        if not fixes:
            break
        
        print(f"Found {sum(len(v) for v in fixes.values())} errors in {directory}")
        for filepath, linenos in fixes.items():
            if not os.path.exists(filepath):
                continue
            with open(filepath, 'r') as f:
                content = f.readlines()
            
            for lineno in sorted(linenos, reverse=True):
                idx = lineno - 1
                if idx < len(content):
                    # We have a line with a method invocation in a const expression.
                    # We need to find the `const` keyword that applies to this expression and remove it.
                    # Since it could be on the same line or previous lines, we just remove `const ` from the current line,
                    # or if not there, look backwards.
                    curr = idx
                    while curr >= 0 and curr >= idx - 10:
                        if 'const ' in content[curr]:
                            content[curr] = re.sub(r'\bconst\s+', '', content[curr])
                            break
                        curr -= 1

            with open(filepath, 'w') as f:
                f.writelines(content)
                
fix_const_errors('mobile_fleet')
fix_const_errors('mobile_driver')
