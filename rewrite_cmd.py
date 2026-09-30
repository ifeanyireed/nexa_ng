import os
import re
import glob

files = glob.glob('service_*/cmd/**/*.go', recursive=True) + glob.glob('service_*/test_mysql.go') + glob.glob('service_erp/main.go')

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    content = re.sub(r'\n\s*_"github\.com/go-sql-driver/mysql"', '', content)
    content = re.sub(r'\n\s*"github\.com/go-sql-driver/mysql"', '', content)
    content = re.sub(r'\n\s*driverMysql\s+"github\.com/go-sql-driver/mysql"', '', content)
    content = re.sub(r'\n\s*"gorm\.io/driver/mysql"', '', content)
    
    # Replace sql.Open("mysql", dsn) with sql.Open("postgres", dsn)
    content = content.replace('sql.Open("mysql", dsn)', 'sql.Open("postgres", dsn)')
    
    # Replace mysql.Open(dsn) with postgres.Open(dsn)
    content = content.replace('mysql.Open(dsn)', 'postgres.Open(dsn)')

    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

