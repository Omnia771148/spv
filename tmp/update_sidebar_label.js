const fs = require('fs');
const path = require('path');

const restaurants = [
    'AmigoNoshery', 'ahakitchens', 'brostory', 'foodland', 'funandfood', 
    'hindustan', 'lassycorner', 'mandi9r', 'mrhangout', 'prgrand', 
    'reddyfamilyrest', 'ruchivedhika', 'tajdarbar', 'talimpu', 'vivafinedine'
];

const basePath = 'd:/parthu adding rest/spv/src/app';

restaurants.forEach(rest => {
    const filePath = path.join(basePath, rest, 'page.js');
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Update the sidebar toggle button HTML
    // It usually looks like: <button className="sidebar-toggle-btn" ...> ... </button>
    if (content.includes('sidebar-toggle-btn')) {
        const toggleBtnRegex = /<button className="sidebar-toggle-btn"([\s\S]*?)>([\s\S]*?)<\/button>/;
        content = content.replace(toggleBtnRegex, (match, attrs, inner) => {
            // Preserve the onClick and other attributes, replace inner icon with icon + label
            return `<button className="sidebar-toggle-btn"${attrs}>
        <i className={\`fa-solid \${isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}\`}></i>
        <div className="sidebar-label">CATEGORIES</div>
      </button>`;
        });
    } else {
        // Special case for restaurants that don't have a sidebar (like vivafinedine)
        // We SHOULD add sidebar logic here to be thorough.
        // But let's first check if vivafinedine has categories in its Data.
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${rest}`);
});
