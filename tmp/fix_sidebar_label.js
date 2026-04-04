const fs = require('fs');
const path = require('path');

const restaurants = [
    'AmigoNoshery', 'ahakitchens', 'brostory', 'foodland', 'funandfood', 
    'hindustan', 'lassycorner', 'mandi9r', 'mrhangout', 'prgrand', 
    'reddyfamilyrest', 'ruchivedhika', 'tajdarbar', 'talimpu'
];

const basePath = 'd:/parthu adding rest/spv/src/app';

restaurants.forEach(rest => {
    const filePath = path.join(basePath, rest, 'page.js');
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix the broken sidebar-toggle-btn
    const badBtn = /<button className="sidebar-toggle-btn" onClick=\{\(\) =>\s*<i className=\{\`fa-solid \$\{isSidebarOpen \? 'fa-angle-left' : 'fa-angle-right'\}\`\}><\/i>\s*<div className="sidebar-label">CATEGORIES<\/div>\s*<\/button>/;
    
    // Better match that identifies the messed up part
    content = content.replace(/<button className="sidebar-toggle-btn" onClick=\{\(\) =>\s*<i/, '<button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><i');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated (fixed): ${rest}`);
});
