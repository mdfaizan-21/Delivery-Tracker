import os
import re

directories = [
    'c:/Users/mf781/Desktop/New folder/LastMile_delivery/backend/src/main/java/com/example/lastmile/model',
    'c:/Users/mf781/Desktop/New folder/LastMile_delivery/backend/src/main/java/com/example/lastmile/payload/request',
    'c:/Users/mf781/Desktop/New folder/LastMile_delivery/backend/src/main/java/com/example/lastmile/payload/response'
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '@Data' not in content:
        return
        
    print(f"Processing {filepath}")
    
    # Remove lombok imports and annotations
    content = re.sub(r'import lombok\..*?;\n', '', content)
    content = re.sub(r'@Data\n', '', content)
    content = re.sub(r'@NoArgsConstructor\n', '', content)
    content = re.sub(r'@AllArgsConstructor\n', '', content)
    
    # Extract class name
    class_match = re.search(r'public\s+class\s+(\w+)', content)
    if not class_match:
        return
    class_name = class_match.group(1)
    
    # Extract fields
    fields = []
    # Match fields like: private String name;
    # Or with default values like: private OrderStatus status = OrderStatus.PENDING;
    for match in re.finditer(r'private\s+([A-Za-z0-9_<>,\s]+)\s+([A-Za-z0-9_]+)\s*(?:=[^;]+)?;', content):
        fields.append((match.group(1).strip(), match.group(2).strip()))
        
    methods = "\n"
    methods += f"    public {class_name}() {{}}\n\n"
    
    if fields:
        args = ", ".join([f"{t} {n}" for t, n in fields])
        methods += f"    public {class_name}({args}) {{\n"
        for t, n in fields:
            methods += f"        this.{n} = {n};\n"
        methods += "    }\n\n"
    
    for t, n in fields:
        cap_n = n[0].upper() + n[1:]
        methods += f"    public {t} get{cap_n}() {{\n        return {n};\n    }}\n\n"
        methods += f"    public void set{cap_n}({t} {n}) {{\n        this.{n} = {n};\n    }}\n\n"
        
    last_brace_idx = content.rfind('}')
    if last_brace_idx != -1:
        content = content[:last_brace_idx] + methods + content[last_brace_idx:]
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for d in directories:
    if os.path.exists(d):
        for f in os.listdir(d):
            if f.endswith('.java'):
                process_file(os.path.join(d, f))
