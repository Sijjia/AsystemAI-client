import sys

html_path = 'd:/Asystem.AI/asystem/asystem/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = '<div class="circular-gallery-container" id="teamGallery">'
end_marker = '            </div>\n        </section>\n\n        <section id="process"'

start_idx = text.find(start_marker) + len(start_marker)
end_idx = text.find('            </div>\n        </section>\n\n        <section id="process"', start_idx)

# Go backwards slightly to just capture the team cards end
end_idx = text.rfind('</div>\n            </div>\n        </section>', start_idx, end_idx + 80)

gallery_html = text[start_idx:end_idx]

parts = gallery_html.split('                    <!-- ')

header_whitespace = parts[0]
cards = []
for p in parts[1:]:
    cards.append('                    <!-- ' + p)

print(f"Parsed {len(cards)} cards.")

if len(cards) == 16:
    asylbek = cards[0]
    urmat = cards[1]
    asel = cards[2]
    alinur = cards[15]
    
    new_cards = [
        asylbek,
        urmat,
        cards[3],
        cards[4],
        cards[5],
        cards[6],
        cards[7],
        alinur,
        cards[8],
        cards[9],
        cards[10],
        cards[11],
        cards[12],
        cards[13],
        cards[14],
        asel
    ]
    
    new_gallery_html = header_whitespace + "".join(new_cards)
    
    new_text = text[:start_idx] + new_gallery_html + text[end_idx:]
    
    # Bump v=10 to v=11
    new_text = new_text.replace('circulargallery.js?v=10', 'circulargallery.js?v=11')
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Reordered successfully.")
else:
    print(f"Expected 16 cards, found {len(cards)}")
