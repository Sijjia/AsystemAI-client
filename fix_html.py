import re

html_path = 'd:/Asystem.AI/asystem/asystem/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# I will find all blocks that start with "                    <!--" and contain ".circular-card"
# I will extract them and clean them.

start_marker = '<div class="circular-gallery-container" id="teamGallery">'
end_marker = '</section>\n\n        <section id="process"'

start_idx = text.find(start_marker) + len(start_marker)
end_idx = text.find(end_marker)

gallery_section = text[start_idx:end_idx]

# Split by the comment start
parts = gallery_section.split('                    <!-- ')

header = parts[0] # probably just newline
cards = []

for p in parts[1:]:
    card_html = '                    <!-- ' + p
    # Clean up trailing closing divs that don't belong to the card itself
    # A circular card has:
    # <div class="team-member-card circular-card">
    #   <div class="team-member-photo"> ... </div>
    #   <div class="team-member-info"> ... </div>
    # </div>
    # But Alinur's card got extra </div>\n</div>\n</div> attached to it.
    
    # Let's count divs to be safe, or just violently strip all trailing lines that are just closing divs until we hit the card's own closing div.
    # Actually, the extra divs belong to the previous layout:
    # </div> (closes container)
    # </div> (closes section content? wait)
    
    # Let's remove trailing whitespace
    card_html = card_html.rstrip()
    
    # If the card ends with multiple </div>, we only keep the one that closes team-member-card.
    # We can use regex to find exactly the team-member-card boundaries.
    pass

# A better way is to use regex to find exactly 16 team-member-card blocks!
# Each block starts with `<!-- {num}. {Name} -->`
# and ends with `</div>` (the closing tag of circular-card).

pattern = re.compile(r'( {20}<!-- \d+\. [^-]+? -->\s+<div class="team-member-card circular-card">.*?</div>\s+</div>\s+</div>\s+</div>)', re.DOTALL)
# Wait, this regex is difficult to get right without BeautifulSoup.
