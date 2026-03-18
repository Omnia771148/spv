const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data.js');
let content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
let currentCategory = '';
const outLines = [];

for (let line of lines) {
    const match = line.match(/^\s*\/\/+\s*(.+)/);
    if (match) {
        // Remove double quotes so it won't break the object syntax later
        currentCategory = match[1].trim().replace(/"/g, '');
    }
    
    if (line.includes('{') && line.includes('id:') && currentCategory) {
        if (!line.includes('category:')) {
            line = line.replace(/(,\s*image:\s*)/, `, category: "${currentCategory}"$1`);
        }
    }
    outLines.push(line);
}

fs.writeFileSync(filePath, outLines.join('\n'), 'utf-8');
console.log('Update successful for data.js in ahakitchens');
