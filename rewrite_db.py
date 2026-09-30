import os
import re

files_to_process = [
    "service_ai/internal/db/db.go",
    "service_erp/db/db.go",
    "service_logistics/internal/db/db.go",
    "service_marketplace/internal/db/db.go"
]

for filepath in files_to_process:
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        continue
    
    with open(filepath, "r") as f:
        content = f.read()

    # Remove mysql import
    content = re.sub(r'\n\s*"gorm\.io/driver/mysql"', '', content)

    # Remove ParseDatabaseDSN
    content = re.sub(r'func ParseDatabaseDSN\(.*?return rawURL\n}\n\n', '', content, flags=re.DOTALL)

    # Replace InitDB block
    pattern = r'(func InitDB\(\) \*gorm\.DB \{.*?)(var dialector gorm\.Dialector.*?)(\n\s*var err error)'
    
    def repl(m):
        prefix = m.group(1)
        suffix = m.group(3)
        return prefix + '\n\tlog.Println("🐘 Connecting to Neon Postgres database...")\n\tdialector := postgres.Open(databaseURL)' + suffix
        
    content = re.sub(pattern, repl, content, flags=re.DOTALL)

    # Add PrepareStmt: true if not present
    if "PrepareStmt: true" not in content and "PrepareStmt:" not in content:
        content = re.sub(r'(gorm\.Open\(dialector, &gorm\.Config{)', r'\1\n\t\tPrepareStmt: true,', content)

    with open(filepath, "w") as f:
        f.write(content)

    print(f"Processed {filepath}")

