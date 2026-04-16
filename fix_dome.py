import sys

path = 'd:/Asystem.AI/asystem/asystem/index.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('                    <div class="circular-gallery-cylinder">\n', '')

# Replace the closing tag. The deepest level was:
#                            </div>
#                        </div>
#                    </div>
#                </div>
#            </div>
#        </section>
# 
# We just replace one </div> from that block.
old_closing = '''                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </section>'''

new_closing = '''                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>'''

text = text.replace(old_closing, new_closing)

# Bumping circulargallery version
text = text.replace('circulargallery.js?v=2', 'circulargallery.js?v=3')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
