import os
from PIL import Image, ImageDraw, ImageFont

# Set output directories
images_dir = 'c:/Users/sriva/Downloads/ag/zaxo-apparel/public/images'
app_dir = 'c:/Users/sriva/Downloads/ag/zaxo-apparel/src/app'

os.makedirs(images_dir, exist_ok=True)

# 1. Generate PNG logo (512x128) with high-quality anti-aliasing (oversampling by 4x)
scale = 4
width, height = 512, 128
os_width, os_height = width * scale, height * scale

# Create RGBA image with transparent background
img = Image.new('RGBA', (os_width, os_height), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)

# Circle parameters
# Let's place the circle on the left, vertically centered
circle_diameter = 80 * scale
circle_x = 24 * scale
circle_y = (os_height - circle_diameter) // 2
circle_r = circle_diameter // 2
circle_cx = circle_x + circle_r
circle_cy = circle_y + circle_r

# Draw black circle
draw.ellipse(
    [circle_x, circle_y, circle_x + circle_diameter, circle_y + circle_diameter],
    fill=(15, 23, 42, 255) # slate-900
)

# Draw white triangle pointing up
# Centered inside the circle
triangle_height = 42 * scale
triangle_width = 46 * scale
# Bottom center of triangle
tri_bottom_y = circle_cy + (triangle_height // 2) - (2 * scale)
tri_top_y = tri_bottom_y - triangle_height
tri_cx = circle_cx

points = [
    (tri_cx, tri_top_y), # Top vertex
    (tri_cx - (triangle_width // 2), tri_bottom_y), # Bottom-left vertex
    (tri_cx + (triangle_width // 2), tri_bottom_y)  # Bottom-right vertex
]
draw.polygon(points, fill=(255, 255, 255, 255))

# Draw text "ZAXO Medical"
# Font path (Segoe UI Bold)
font_path = 'C:/Windows/Fonts/segoeuib.ttf'
if not os.path.exists(font_path):
    font_path = 'C:/Windows/Fonts/arialbd.ttf'

font_size = 38 * scale
font = ImageFont.truetype(font_path, font_size)

# Calculate text position
text_x = circle_x + circle_diameter + (20 * scale)
# Segoe UI vertical alignment adjustment
text_y = (os_height - font_size) // 2 - (6 * scale)

draw.text(
    (text_x, text_y),
    'ZAXO Medical',
    fill=(15, 23, 42, 255), # slate-900
    font=font
)

# Downsample image using high-quality resizing
logo_png = img.resize((width, height), Image.Resampling.LANCZOS)
logo_png_path = os.path.join(images_dir, 'logo.png')
logo_png.save(logo_png_path, 'PNG')
print('Saved PNG logo to:', logo_png_path)


# 2. Generate Favicon.ico (48x48) containing just the emblem
ico_scale = 4
ico_size = 48
ico_os_size = ico_size * ico_scale

ico_img = Image.new('RGBA', (ico_os_size, ico_os_size), (255, 255, 255, 0))
ico_draw = ImageDraw.Draw(ico_img)

# Center circle
ico_diameter = 40 * ico_scale
ico_xy = (ico_os_size - ico_diameter) // 2
ico_cx = ico_os_size // 2
ico_cy = ico_os_size // 2

ico_draw.ellipse(
    [ico_xy, ico_xy, ico_xy + ico_diameter, ico_xy + ico_diameter],
    fill=(15, 23, 42, 255) # slate-900
)

# Centered white triangle
ico_tri_height = 20 * ico_scale
ico_tri_width = 22 * ico_scale
ico_tri_bottom_y = ico_cy + (ico_tri_height // 2) - (1 * ico_scale)
ico_tri_top_y = ico_tri_bottom_y - ico_tri_height
ico_tri_cx = ico_cx

ico_points = [
    (ico_tri_cx, ico_tri_top_y),
    (ico_tri_cx - (ico_tri_width // 2), ico_tri_bottom_y),
    (ico_tri_cx + (ico_tri_width // 2), ico_tri_bottom_y)
]
ico_draw.polygon(ico_points, fill=(255, 255, 255, 255))

favicon = ico_img.resize((ico_size, ico_size), Image.Resampling.LANCZOS)
favicon_path = os.path.join(app_dir, 'favicon.ico')
favicon.save(favicon_path, 'ICO')
print('Saved Favicon to:', favicon_path)


# 3. Generate SVG version of the logo
svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none">
  <!-- Black Circle (slate-900) -->
  <circle cx="30" cy="30" r="22" fill="#0f172a"/>
  <!-- White Triangle -->
  <polygon points="30,17 19,37 41,37" fill="#ffffff"/>
  <!-- Text: ZAXO Medical -->
  <text x="64" y="36" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#0f172a">ZAXO Medical</text>
</svg>
"""

svg_path = os.path.join(images_dir, 'logo.svg')
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)
print('Saved SVG logo to:', svg_path)
