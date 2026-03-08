const fs = require('fs');

const cssFile = 'style.css';
const cssBak = 'style.css.bak';

if (!fs.existsSync(cssBak)) {
    fs.copyFileSync(cssFile, cssBak);
}

let css = fs.readFileSync(cssFile, 'utf8');

// Ensure #app-container is fully removed
css = css.replace(/#app-container\s*\{[^}]+\}\s*/, '');
// Revert game wrapper to taking full viewport space (100vh/100vw instead of fixed 1080/1920)
css = css.replace(/width: 1920px;[\s\n]*position: relative;/, 'width: 100vw;\n    position: relative;');
css = css.replace(/height: 1080px;[\s\n]*width: 1920px;/, 'height: 100vh;\n    width: 100vw;');

// Process blocks
css = css.replace(/\{([^}]+)\}/g, (match, block) => {
    let newBlock = block.replace(/(-?\d*\.?\d+)px/g, (m, valStr) => {
        let val = parseFloat(valStr);
        if (val === 0) return '0px';
        return `calc(${val}px * var(--s))`;
    });
    return "{" + newBlock + "}";
});

// Add variable to root
if (!css.includes(':root {')) {
    const rootVars = `:root {\n    --s: 1;\n}\n\nhtml {\n    font-size: calc(16px * var(--s));\n}\n\n`;
    css = rootVars + css;
}

fs.writeFileSync(cssFile, css, 'utf8');
console.log("Successfully processed style.css with Node!");
