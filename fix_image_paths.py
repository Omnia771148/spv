import os
import re

def main():
    target_dir = os.path.join("src", "app")
    pattern = re.compile(r'["\']/fooditems/1\s*\(200\)\.webp["\']')
    
    count = 1
    files_updated = 0
    total_replacements = 0
    
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file == "data.js":
                file_path = os.path.join(root, file)
                print(f"Processing: {file_path}")
                
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Check if the pattern exists in this file
                matches = pattern.findall(content)
                if not matches:
                    continue
                
                # We will replace matches one by one with sequential image IDs
                new_content = []
                last_end = 0
                for match in pattern.finditer(content):
                    start, end = match.span()
                    # Add content before the match
                    new_content.append(content[last_end:start])
                    # Generate the new image path
                    new_img_path = f'"/fooditems/1 ({count}).webp"'
                    new_content.append(new_img_path)
                    
                    # Increment counter
                    count += 1
                    if count > 500:
                        count = 1
                        
                    last_end = end
                
                new_content.append(content[last_end:])
                final_content = "".join(new_content)
                
                # Write back to file
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(final_content)
                
                files_updated += 1
                total_replacements += len(matches)
                print(f"  -> Replaced {len(matches)} occurrences in {file_path}")
                
    print(f"\nDone! Updated {files_updated} files with a total of {total_replacements} unique food image paths.")

if __name__ == "__main__":
    main()
