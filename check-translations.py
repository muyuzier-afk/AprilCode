import re

with open('./src/i18n/ui.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Extract English keys
en_keys = []
in_en_section = False
for line in lines:
    line = line.strip()
    if line == 'en: {':
        in_en_section = True
    elif line == '},':
        in_en_section = False
    elif in_en_section and ':' in line and not line.endswith(','):
        # Extract key name before colon
        key = line.split(':')[0].strip()
        # Only add if key is a valid identifier
        if re.match(r'^[a-zA-Z0-9_]+$', key):
            en_keys.append(key)

# Extract Chinese keys
zh_keys = []
in_zh_section = False
for line in lines:
    line = line.strip()
    if line == "'zh-CN': {":
        in_zh_section = True
    elif line == '},':
        in_zh_section = False
    elif in_zh_section and ':' in line and not line.endswith(','):
        # Extract key name before colon
        key = line.split(':')[0].strip()
        # Only add if key is a valid identifier
        if re.match(r'^[a-zA-Z0-9_]+$', key):
            zh_keys.append(key)

print(f'English keys: {len(en_keys)}')
print(f'Chinese keys: {len(zh_keys)}')

# Find missing keys in Chinese
missing_in_zh = [key for key in en_keys if key not in zh_keys]
if missing_in_zh:
    print('\nMissing in Chinese:')
    for key in missing_in_zh:
        print(f'- {key}')

# Find extra keys in Chinese
extra_in_zh = [key for key in zh_keys if key not in en_keys]
if extra_in_zh:
    print('\nExtra in Chinese:')
    for key in extra_in_zh:
        print(f'- {key}')

if not missing_in_zh and not extra_in_zh:
    print('\nAll keys are matched!')
