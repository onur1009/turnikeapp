// Kodda kullanılan Material Symbols adlarını toplar
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');
const { parse } = require(path.join(root, 'node_modules/@babel/parser'));
const traverse = require(path.join(root, 'node_modules/@babel/traverse')).default;
const NAME = /^[a-z][a-z0-9_]*$/;
const icons = new Set();
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
for (const file of walk(path.join(root, 'src')).filter(f => /\.(jsx?|mjs)$/.test(f))) {
  const src = fs.readFileSync(file, 'utf8');
  let ast; try { ast = parse(src, { sourceType: 'module', plugins: ['jsx'] }); } catch { continue; }
  const isIconEl = (p) => {
    const el = p.findParent(x => x.isJSXElement());
    if (!el) return false;
    const cls = el.node.openingElement.attributes.find(a => a.type === 'JSXAttribute' && a.name.name === 'className');
    return !!cls && /material-symbols/.test(src.slice(cls.start, cls.end));
  };
  traverse(ast, {
    JSXText(p) { const v = p.node.value.trim(); if (NAME.test(v) && isIconEl(p)) icons.add(v); },
    StringLiteral(p) {
      const v = p.node.value;
      if (!NAME.test(v)) return;
      const par = p.parentPath;
      if (par.isObjectProperty() && /icon/i.test(par.node.key.name || par.node.key.value || '')) icons.add(v);
      else if (par.isJSXAttribute() && /icon/i.test(par.node.name.name)) icons.add(v);
      else if (p.findParent(x => x.isJSXExpressionContainer()) && isIconEl(p)) icons.add(v);
    },
    TemplateLiteral(p) { if (isIconEl(p)) p.node.quasis.forEach(q => { const v = q.value.cooked.trim(); if (NAME.test(v)) icons.add(v); }); },
  });
}
console.log([...icons].sort().join(','));
console.error('simge sayısı', icons.size);
