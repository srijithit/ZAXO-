import os
import numpy as np
from PIL import Image, ImageChops

def make_transparent(img_path, output_path):
    img = Image.open(img_path).convert('RGBA')
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # If pixel is white or almost white, make it transparent
        # We can calculate the distance to white [255, 255, 255]
        r, g, b, a = item
        if r > 245 and g > 245 and b > 245:
            # Calculate alpha based on how close it is to white
            # We want pixels at 255 to be 0 alpha, and pixels at 245 to be 255 alpha
            avg = (r + g + b) / 3.0
            opacity = int((255 - avg) * (255 / 10.0))
            opacity = max(0, min(255, opacity))
            new_data.append((r, g, b, opacity))
        else:
            new_data.append((r, g, b, a))
            
    img.putdata(new_data)
    img.save(output_path, 'PNG')
    print(f"Processed transparent logo saved to: {output_path}")

def generate_favicon(img_path, favicon_path):
    img = Image.open(img_path).convert('RGBA')
    arr = np.array(img)
    
    # Locate the green 'Z' emblem.
    # The green emblem has green component larger than red and blue.
    # Let's find pixels where green is dominant (G > R + 20 and G > B + 20)
    green_mask = (arr[:, :, 1] > arr[:, :, 0] + 15) & (arr[:, :, 1] > arr[:, :, 2] + 15)
    y_indices, x_indices = np.where(green_mask)
    
    if len(x_indices) > 0:
        min_x, max_x = x_indices.min(), x_indices.max()
        min_y, max_y = y_indices.min(), y_indices.max()
        
        # Add a small padding (say, 10px) around the green emblem
        padding = 10
        min_x = max(0, min_x - padding)
        max_x = min(img.width, max_x + padding)
        min_y = max(0, min_y - padding)
        max_y = min(img.height, max_y + padding)
        
        # Crop the green emblem
        cropped = img.crop((min_x, min_y, max_x, max_y))
        
        # Make the cropped emblem background transparent
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
        cropped.putdata(new_data)
        
        # Resize to 48x48 for favicon.ico
        favicon = cropped.resize((48, 48), Image.Resampling.LANCZOS)
        favicon.save(favicon_path, 'ICO')
        print(f"Favicon extracted and saved to: {favicon_path}")
    else:
        print("Could not find green emblem. Using center crop for favicon.")
        # Fallback to center square crop
        w, h = img.size
        size = min(w, h)
        left = (w - size) // 2
        top = (h - size) // 2
        cropped = img.crop((left, top, left + size, top + size))
        favicon = cropped.resize((48, 48), Image.Resampling.LANCZOS)
        favicon.save(favicon_path, 'ICO')

# File paths
uploaded_logo = 'C:/Users/sriva/.gemini/antigravity/brain/37c4b901-f2c8-4f6d-a8fe-28ed64bba7f8/media__1781016161116.png'
target_logo = 'c:/Users/sriva/Downloads/ag/zaxo-apparel/public/images/logo.png'
target_favicon = 'c:/Users/sriva/Downloads/ag/zaxo-apparel/src/app/favicon.ico'

make_transparent(uploaded_logo, target_logo)
generate_favicon(uploaded_logo, target_favicon)
