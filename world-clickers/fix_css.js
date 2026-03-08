const fs = require('fs');
const cssText = fs.readFileSync('style.css', 'utf8');
const scaledRoot = `:root {
    --s: 1;
}

html {
    font-size: calc(16px * var(--s));
}

`;
if (!cssText.includes(':root {')) {
    fs.writeFileSync('style.css', scaledRoot + cssText);
    console.log('Successfully prepended scaling!');
} else {
    console.log('Scaling already exists or :root found.');
}
