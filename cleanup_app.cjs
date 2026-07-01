const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// The best way to remove these functions is to find their signatures and use regex to remove them, but they might span multiple lines.
// Since we have a lot of dead code, maybe it's easier to manually review the file or just leave them for now.
// Actually, dead code like loadLevel, handleWordSubmit, etc. will throw warnings if unused, but we use React, so it's just lint warnings.

// Let's remove them via some simple string replacement.
content = content.replace(/  const loadLevel = useCallback\(\(idx\) => \{[\s\S]*?\}, \[startTimer, language\]\);\n/g, '');
content = content.replace(/  const handleWordSubmit = async \(word\) => \{[\s\S]*?  \};\n/g, '');
content = content.replace(/  const advanceLevel = \(\) => \{[\s\S]*?  \};\n/g, '');

fs.writeFileSync('src/App.jsx', content);
