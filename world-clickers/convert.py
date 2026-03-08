import re
import os
import shutil

css_file = 'style.css'

if not os.path.exists(css_file + '.bak'):
    shutil.copy2(css_file, css_file + '.bak')

with open(css_file, 'r', encoding='utf-8') as f:
    css = f.read()

# Remove the previously added #app-container block
# and revert the game-wrapper width/height to 100vw/100vh
css = re.sub(r'#app-container\s*\{[^}]+\}\s*', '', css)
css = css.replace('width: 1920px;\n    position: relative;\n    padding-top: 0;', 'width: 100vw;\n    position: relative;\n    padding-top: 0;')
css = css.replace('height: 1080px;\n    width: 1920px;', 'height: 100vh;\n    width: 100vw;')


def process_block(match):
    block_content = match.group(1)
    
    # regex matches e.g. "150px" or "-5.5px" or "0px"
    def replacer(m):
        full_val = m.group(0)
        val = m.group(1)
        # Skip 0px
        if float(val) == 0:
            return "0px"  # leave alone
        # Safe scale formulation
        return f"calc({val}px * var(--s))"
        
    new_content = re.sub(r'(-?\d*\.?\d+)px', replacer, block_content)
    return "{" + new_content + "}"

# Replace px sizes inside { ... } blocks to not break media queries
new_css = re.sub(r'\{([^}]+)\}', process_block, css)

# Make sure we declare the variable on the root
if ':root {' not in new_css:
    root_vars = ":root {\n    --s: 1;\n}\n\nhtml {\n    font-size: calc(16px * var(--s));\n}\n\n"
    new_css = root_vars + new_css

with open(css_file, 'w', encoding='utf-8') as f:
    f.write(new_css)
    
print("Successfully processed style.css!")
