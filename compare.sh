#!/bin/bash

echo "==============================================="
echo "COMPARING VERSIONS: _1_ vs _09"
echo "==============================================="

# Compare package.json
echo -e "\n1. PACKAGE.JSON DIFFERENCES:"
diff /home/claude/package.json /home/claude/app_v09/package.json | head -20 || echo "✅ No differences"

# Compare key source files
echo -e "\n2. APP MAIN FILES:"
for file in "app/_layout.tsx" "package.json" "pnpm-lock.yaml"; do
    size1=$(wc -c < "/home/claude/$file")
    size2=$(wc -c < "/home/claude/app_v09/$file")
    if [ "$size1" -eq "$size2" ]; then
        echo "  ✅ $file - SAME (${size1} bytes)"
    else
        echo "  ⚠️  $file - DIFFERENT (v1: ${size1} vs v09: ${size2} bytes)"
    fi
done

# Compare all app source files
echo -e "\n3. SCANNING SOURCE FILE CHANGES..."
CHANGES=0
for file in $(find /home/claude/app -type f -name "*.tsx" -o -name "*.ts"); do
    file_rel=${file#/home/claude/}
    if [ -f "/home/claude/app_v09/$file_rel" ]; then
        if ! diff -q "$file" "/home/claude/app_v09/$file_rel" > /dev/null 2>&1; then
            echo "  📝 CHANGED: $file_rel"
            CHANGES=$((CHANGES+1))
        fi
    else
        echo "  ❌ REMOVED: $file_rel"
        CHANGES=$((CHANGES+1))
    fi
done

if [ $CHANGES -eq 0 ]; then
    echo "  ✅ No changes to app source files"
fi

# Check dist folder
echo -e "\n4. BUILD OUTPUT (dist folder):"
dist1_size=$(du -sh /home/claude/dist 2>/dev/null | cut -f1)
dist2_size=$(du -sh /home/claude/app_v09/dist 2>/dev/null | cut -f1)
echo "  v1 dist: $dist1_size"
echo "  v09 dist: $dist2_size"

