import os
import json
from datetime import datetime

def get_base_name(filename):
    # Remove extension
    base = os.path.splitext(filename)[0]
    # Check if it's a carousel post
    if '_UTC_' in base:
        parts = base.split('_UTC_')
        if len(parts) > 1:
            # If it has a number suffix, remove it
            if parts[1].split('_')[-1].isdigit():
                return f"{parts[0]}_UTC"
            # If it has a post ID, keep it
            return f"{parts[0]}_UTC_{parts[1].split('_')[0]}"
    return base

def get_post_info(base_files, caption_path):
    # Sort files by their carousel number (_1, _2, etc.)
    def get_carousel_number(filename):
        parts = os.path.splitext(filename)[0].split('_')
        if parts[-1].isdigit():
            return int(parts[-1])
        return 0
    
    sorted_files = sorted(base_files, key=get_carousel_number)
    
    post_info = {
        'image_paths': [os.path.basename(f) for f in sorted_files],
        'date': datetime.strptime(os.path.basename(sorted_files[0]).split('_')[0], '%Y-%m-%d'),
        'caption': '',
        'hashtags': []
    }
    
    if os.path.exists(caption_path):
        with open(caption_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            lines = [line.strip() for line in content.split('\n') if line.strip()]
            
            # Process each line
            caption_lines = []
            hashtags = []
            
            for line in lines:
                if line.startswith('#'):
                    # Line contains only hashtags
                    hashtags.extend(['#' + tag.strip() for tag in line.split('#') if tag.strip()])
                elif '#' in line:
                    # Line contains both caption and hashtags
                    parts = line.split('#', 1)
                    if parts[0].strip():
                        caption_lines.append(parts[0].strip())
                    hashtags.extend(['#' + tag.strip() for tag in parts[1].split('#') if tag.strip()])
                elif line.startswith('.'):
                    # Skip separator lines
                    continue
                elif line.startswith('~') and line.endswith('~'):
                    # Remove decorative characters
                    caption_lines.append(line.strip('~ '))
                else:
                    caption_lines.append(line.strip())
            
            post_info['caption'] = ' '.join(caption_lines)
            post_info['hashtags'] = hashtags
    
    return post_info

def organize_content():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    posts_dir = os.path.join(base_dir, 'posts')
    
    # Read profile info
    with open(os.path.join(base_dir, 'profile_info.txt'), 'r', encoding='utf-8') as f:
        profile_info = {}
        for line in f:
            if ':' in line:
                key, value = line.split(':', 1)
                profile_info[key.strip()] = value.strip()
    
    # First, group all files by their base name
    post_groups = {}
    for filename in os.listdir(posts_dir):
        if filename.endswith('.txt'):
            continue
        
        base_name = get_base_name(filename)
        if base_name not in post_groups:
            post_groups[base_name] = []
        post_groups[base_name].append(os.path.join(posts_dir, filename))
    
    # Process each group
    posts = []
    for base_name, files in post_groups.items():
        # Filter for media files
        media_files = [f for f in files if f.endswith(('.jpg', '.mp4'))]
        if media_files:
            caption_path = os.path.join(posts_dir, f"{base_name}.txt")
            post_info = get_post_info(media_files, caption_path)
            posts.append(post_info)
    
    # Sort posts by date
    posts.sort(key=lambda x: x['date'], reverse=True)
    
    # Convert datetime objects to strings for JSON serialization
    for post in posts:
        post['date'] = post['date'].strftime('%Y-%m-%d')
    
    # Create data.js with the content
    js_content = f"""const profileInfo = {json.dumps(profile_info, indent=2)};
const posts = {json.dumps(posts, indent=2)};"""
    
    with open(os.path.join(base_dir, 'data.js'), 'w', encoding='utf-8') as f:
        f.write(js_content)

if __name__ == '__main__':
    organize_content()
