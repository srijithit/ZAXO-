import os
import numpy as np
from PIL import Image

def process_logo(img_path, output_logo_path, output_favicon_path):
    img = Image.open(img_path).convert('RGBA')
    arr = np.array(img)
    
    # 1. Make background transparent
    # Find pixels that are white or very close to white
    # The background in the image is solid white [255, 255, 255, 255]
    new_data = []
    for item in img.getdata():
        r, g, b, a = item
        # If it is white/almost white, make it transparent
        if r > 245 and g > 245 and b > 245:
            # Simple feathering
            avg = (r + g + b) / 3.0
            opacity = int((255 - avg) * (255 / 10.0))
            opacity = max(0, min(255, opacity))
            new_data.append((r, g, b, opacity))
        else:
            new_data.append((r, g, b, a))
            
    transparent_img = Image.new('RGBA', img.size)
    transparent_img.putdata(new_data)
    
    # Find bounding box of non-transparent pixels to crop nicely
    # Convert alpha channel to numpy array
    alpha = np.array(transparent_img)[:, :, 3]
    non_transparent = alpha > 10
    y_indices, x_indices = np.where(non_transparent)
    
    if len(x_indices) > 0:
        min_x, max_x = x_indices.min(), x_indices.max()
        min_y, max_y = y_indices.min(), y_indices.max()
        
        # Add 2px padding
        padding = 4
        min_x = max(0, min_x - padding)
        max_x = min(img.width, max_x + padding)
        min_y = max(0, min_y - padding)
        max_y = min(img.height, max_y + padding)
        
        cropped_logo = transparent_img.crop((min_x, min_y, max_x, max_y))
        cropped_logo.save(output_logo_path, 'PNG')
        print(f"Saved cropped transparent logo to: {output_logo_path} (size: {cropped_logo.size})")
    else:
        transparent_img.save(output_logo_path, 'PNG')
        print(f"Saved full transparent logo to: {output_logo_path}")
        cropped_logo = transparent_img
        
    # 2. Extract emblem (the black circle with white triangle) for favicon
    # The circle is on the left. Let's find its bounding box.
    # The circle is dark/black (R < 50, G < 50, B < 50)
    arr_cropped = np.array(cropped_logo)
    # Let's look for dark pixels in the left half of the cropped image
    left_half_w = cropped_logo.width // 2
    dark_mask = (arr_cropped[:, :left_half_w, 0] < 60) & \
                (arr_cropped[:, :left_half_w, 1] < 60) & \
                (arr_cropped[:, :left_half_w, 2] < 60) & \
                (arr_cropped[:, :left_half_w, 3] > 200)
                
    y_indices_dark, x_indices_dark = np.where(dark_mask)
    
    if len(x_indices_dark) > 0:
        c_min_x, c_max_x = x_indices_dark.min(), x_indices_dark.max()
        c_min_y, c_max_y = y_indices_dark.min(), y_indices_dark.max()
        
        # Add 2px padding
        c_min_x = max(0, c_min_x - 2)
        c_max_x = min(left_half_w, c_max_x + 2)
        c_min_y = max(0, c_min_y - 2)
        c_max_y = min(cropped_logo.height, c_max_y + 2)
        
        emblem = cropped_logo.crop((c_min_x, c_min_y, c_max_x, c_max_y))
        # Resize to square
        w, h = emblem.size
        size = max(w, h)
        square_emblem = Image.new('RGBA', (size, size), (255, 255, 255, 0))
        # Center the emblem inside the square
        offset_x = (size - w) // 2
        offset_y = (size - h) // 2
        square_emblem.paste(emblem, (offset_x, offset_y))
        
        # Resize to 48x48
        favicon = square_emblem.resize((48, 48), Image.Resampling.LANCZOS)
        favicon.save(output_favicon_path, 'ICO')
        print(f"Extracted favicon saved to: {output_favicon_path}")
    else:
        print("Could not isolate dark circle. Creating favicon from center crop.")
        w, h = cropped_logo.size
        size = min(w, h)
        cropped_emblem = cropped_logo.crop((0, 0, size, size))
        favicon = cropped_emblem.resize((48, 48), Image.Resampling.LANCZOS)
        favicon.save(output_favicon_path, 'ICO')

# Run processing
uploaded_logo = 'C:/Users/sriva/.gemini/antigravity/brain/37c4b901-f2c8-4f6d-a8fe-28ed64bba7f8/media__1781016214516.png'
target_logo = 'c:/Users/sriva/Downloads/ag/zaxo-apparel/public/images/logo.png'
target_favicon = 'c:/Users/sriva/Downloads/ag/zaxo-apparel/src/app/favicon.ico'

process_logo(uploaded_logo, target_logo, target_favicon)
