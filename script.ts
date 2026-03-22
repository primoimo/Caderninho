import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace colors
code = code.replace(/text-\[#F2EEE7\]/g, 'text-[var(--color-primary-text)]');
code = code.replace(/bg-\[#F2EEE7\]/g, 'bg-[var(--color-bg)]');
code = code.replace(/#F2EEE7/g, 'var(--color-bg)');

code = code.replace(/#3A2317/g, 'var(--color-dark)');
code = code.replace(/bg-white/g, 'bg-[var(--color-card)]');
code = code.replace(/#4361EE/g, 'var(--color-primary)');

// Fix theme tags to always use dark text/border for contrast against pastels
code = code.replace(/text-\[var\(--color-dark\)\] border-2 border-\[var\(--color-dark\)\] text-xs font-black px-3 py-1.5 rounded-full shadow-\[2px_2px_0px_var\(--color-dark\)\]/g, 'text-[#3A2317] border-2 border-[#3A2317] text-xs font-black px-3 py-1.5 rounded-full shadow-[2px_2px_0px_#3A2317]');

fs.writeFileSync('src/App.tsx', code);
