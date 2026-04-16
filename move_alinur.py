import re

path = 'd:/Asystem.AI/asystem/asystem/index.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = '<div class="circular-gallery-container" id="teamGallery">'
start_idx = text.find(start_marker) + len(start_marker)
end_idx = text.find('<section id="process"', start_idx) - 20
gallery_html = text[start_idx:end_idx]

pattern = re.compile(r'( {20}<!-- \d+\. [^\n]+ -->\n {20}<div class="team-member-card circular-card">.*?\n {20}</div>)', re.DOTALL)
cards = pattern.findall(gallery_html)

# Identify which card is who
cards_dict = {}
order = []
for idx, card in enumerate(cards):
    # Extract name for reliable identification
    name_match = re.search(r'<h3 class="team-member-name">(.*?)</h3>', card)
    if name_match:
        name = name_match.group(1).strip()
        cards_dict[name] = card
        order.append(name)
    else:
        print(f"Error parsing name on card {idx}")

print("Original order:", order)

# Extract Alinur
alinur_name = "Алинур Бейшенбеков"
alan_name = "Алан Бешев"

if alinur_name in order and alan_name in order:
    order.remove(alinur_name)
    alan_index = order.index(alan_name)
    
    # Insert after Alan
    order.insert(alan_index + 1, alinur_name)
    
    print("New order:", order)
    
    # Rebuild
    new_cards = [cards_dict[n] for n in order]
    new_payload = "\n" + "\n\n".join(new_cards) + "\n                </div>\n            </div>\n        </section>\n\n        "
    
    new_text = text[:start_idx] + new_payload + text[end_idx:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Successfully moved Alinur!")
else:
    print("Names not found!")
