import os
import re

html_path = 'index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

icons = {
    'card-1': r'консультация.svg',
    'card-2': r'стратегия.svg',
    'card-3': r'разработка.svg',
    'card-4': r'внедрение.svg',
    'card-5': r'поддержка.svg'
}

for card_class, icon in icons.items():
    svg_path = os.path.join('image', icon)
    with open(svg_path, 'r', encoding='utf-8') as f:
        svg_content = f.read().strip()
        
    # Inject reliable sizing and fluid fill rules while stripping any pre-baked colored circles
    svg_content = re.sub(r'fill="[^"]+"', 'fill="currentColor"', svg_content)
    if 'fill="currentColor"' not in svg_content:
        svg_content = svg_content.replace('<svg ', '<svg fill="currentColor" width="48" height="48" ')
    
    pattern = rf'(<div class="scroll-stack-card {card_class}">.*?<div class="process-icon")[^>]*>.*?(</div>\s*</div>)'
    
    match = re.search(pattern, html, flags=re.DOTALL)
    if match:
        replacement = f'{match.group(1)} style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">{svg_content}</div></div>'
        html = html.replace(match.group(0), replacement)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Inlined SVGs successfully.")
