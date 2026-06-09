import os
import numpy as np
from PIL import Image

uploaded_logo = 'C:/Users/sriva/.gemini/antigravity/brain/37c4b901-f2c8-4f6d-a8fe-28ed64bba7f8/media__1781016311562.png'
target_favicon = 'c:/Users/sriva/Downloads/ag/zaxo-apparel/src/app/favicon.ico'

img = Image.open(uploaded_logo).convert('RGBA')
arr = np.array(img)

# Search for green pixels on the left side
left_limit = 400
left_pixels = arr[:, :left_limit]

# Bounding box of green emblem (G > R + 30 and G > B + 30)
green_mask = (left_pixels[:, :, 1].astype(int) - left_pixels[:, :, 0].astype(int) > 30) & \
             (left_pixels[:, :, 1].astype(int) - left_pixels[:, :, 2].astype(int) > 30)

y_indices, x_indices = np.where(green_mask)

if len(x_indices) > 0:
    min_x, max_x = x_indices.min(), x_indices.max()
    min_y, max_y = y_indices.min(), y_indices.max()
    
    # Crop with padding
    padding = 15
    crop_x1 = max(0, min_x - padding)
    crop_x2 = min(left_limit, max_x + padding)
    crop_y1 = max(0, min_y - padding)
    crop_y2 = min(img.height, max_y + padding)
    
    cropped = img.crop((crop_x1, crop_y1, crop_x2, crop_y2))
    
    # Make white background transparent
    datas = cropped.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        if r > 245 and g > 245 and b > 245:
            avg = (r + g + b) / 3.0
            opacity = int((255 - avg) * (255 / 10.0))
            opacity = max(0, min(255, opacity))
            new_data.append((r, g, b, opacity))
        else:
            new_data.append((r, g, b, a))
            
    cropped_transparent = Image.new('RGBA', cropped.size)
    cropped_transparent.putdata(new_data)
    
    # Make it a square canvas to avoid distortion
    w, h = cropped_transparent.size
    square_size = max(w, h)
    square_img = Image.new('RGBA', (square_size, square_size), (255, 255, 255, 0))
    
    # Center the cropped emblem
    offset_x = (square_size - w) // 2
    offset_y = (square_size - h) // 2
    square_img.paste(cropped_transparent, (offset_x, offset_y))
    
    # Resize to standard sizes: 16x16, 32x32, 48x48
    favicon = square_img.resize((48, 48), Image.Resampling.LANCZOS)
    favicon.save(target_favicon, 'ICO')
    print(f"Extracted 'only Z' emblem favicon successfully to: {target_favicon}")
else:
    print("Error: Could not locate the green 'Z' emblem.")
