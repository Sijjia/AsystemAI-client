import re

path = 'd:/Asystem.AI/asystem/asystem/index.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# The cards are easily identifiable by the HTML comment and the div.
# They look like: "                    <!-- 1. Асылбек Айтматов -->\n                    <div class="team-member-card
# Let's extract them securely using regex.
pattern = re.compile(r'( {20}<!-- \d+\. [^\n]+ -->\n {20}<div class="team-member-card circular-card">.*?\n {20}</div>)', re.DOTALL)

matches = pattern.findall(text)
print(f"Found {len(matches)} valid cards.")

# The problem is that the previously inserted cards had some extra </div> tags physically appended to the 8th card (which was Alinur).
# But the regex above ONLY grabs up to the matching indentation `                    </div>`.
# Wait, let's verify if `.*?\n {20}</div>` securely captures a single card without trailing junk!
# Inside a card, the deepest tag is usually indented more.
# The card's closing tag is exactly `                    </div>` (20 spaces).
# Let's make sure the regex doesn't capture too much.

# Let's rebuild the section instead of just regexing.
start_marker = '<div class="circular-gallery-container" id="teamGallery">'
start_idx = text.find(start_marker) + len(start_marker)
end_idx = text.find('<section id="process"', start_idx) - 20 # Before the process section starts
gallery_html = text[start_idx:end_idx]

# Clean up gallery_html by extracting all well-formed cards
cards_clean = pattern.findall(gallery_html)
print(f"Cards found in gallery: {len(cards_clean)}")

if len(cards_clean) == 16:
    for i, c in enumerate(cards_clean):
        print(f"Card {i} length: {len(c)}")
    
    # Let's reconstruct the gallery container payload
    # The gallery container just contains the 16 cards directly.
    new_payload = "\n" + "\n\n".join(cards_clean) + "\n                </div>\n            </div>\n        </section>\n\n        "
    
    new_text = text[:start_idx] + new_payload + text[end_idx:]
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Reconstructed successfully!")
else:
    print("Could not find exactly 16 clean cards.")
