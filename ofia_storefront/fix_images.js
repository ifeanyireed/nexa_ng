const fs = require('fs');
const path = require('path');
const targetDir = path.join(__dirname, 'src');

function findAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            findAndReplace(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            // Note: I will replace object-contain on images that appear to be for products
            // and I will also remove p-6/p-8 from their immediate flex containers
            
            if (content.includes('max-h-full max-w-full object-contain') || content.includes('w-full h-full object-contain')) {
                content = content.replace(/p-[0-9]+\s+flex items-center justify-center/g, 'flex items-center justify-center');
                content = content.replace(/max-h-full max-w-full object-contain/g, 'w-full h-full object-cover');
                content = content.replace(/w-full h-full object-contain/g, 'w-full h-full object-cover');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

findAndReplace(targetDir);
console.log('Done');
