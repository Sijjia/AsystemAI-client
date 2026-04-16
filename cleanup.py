import sys
import re

path_html = 'd:/Asystem.AI/asystem/asystem/index.html'
path_css = 'd:/Asystem.AI/asystem/asystem/styles.css'

with open(path_html, 'r', encoding='utf-8') as f:
    html = f.read()

with open(path_css, 'r', encoding='utf-8') as f:
    css = f.read()

# HTML Replacements
html = html.replace('<div class="swiper team-swiper">', '<div class="circular-gallery-container" id="teamGallery">')
html = html.replace('<div class="swiper-wrapper">', '<div class="circular-gallery-cylinder">')

html = html.replace('team-member-card swiper-slide', 'team-member-card circular-card')
html = html.replace('<script src="teamcarousel.js?v=6" defer></script>', '<script src="circulargallery.js?v=1" defer></script>')

# Remove Swiper tags, we no longer need them
html = html.replace('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />\n', '')
html = html.replace('    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>\n', '')

with open(path_html, 'w', encoding='utf-8') as f:
    f.write(html)

# CSS Replacements
css_gallery = '''/* --- CSS3D Circular Gallery Override --- */
.circular-gallery-container {
    perspective: 1500px;
    width: 100%;
    max-width: 1400px;
    margin: 64px auto 0 auto;
    height: 600px;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none; /* Make dragging smoother without selecting text */
}

.circular-gallery-cylinder {
    position: relative;
    width: 360px;
    height: 100%;
    transform-style: preserve-3d;
    display: flex;
    justify-content: center;
    align-items: center;
}

.circular-card {
    position: absolute;
    width: 360px;
    height: auto;
    background: transparent;
    border-radius: 40px;
    will-change: transform, opacity;
}
'''

# Find the old `.team-swiper` chunk in styles.css and replace it
# Safe approach: just append to the end. Since it overrides, it will work.
# Better: remove the Swiper blocks by regex just in case.
css = re.sub(r'/\* Team Carousel configuration \*/.*?\/\* Highlight the active center card \*/\s*\.team-member-card\.swiper-slide-active\s*\{\s*opacity: 1;\s*\}', css_gallery, css, flags=re.DOTALL)

with open(path_css, 'w', encoding='utf-8') as f:
    f.write(css)

print("Replacement Complete")
