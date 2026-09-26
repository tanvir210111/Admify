const fs = require('fs');
const path = require('path');

const adminDir = path.resolve('src/pages/admin');
const compDir = path.resolve('src/components/admin');
const files = [
  ...fs.readdirSync(adminDir).map(f => ({ dir: 'pages', name: f, path: path.join(adminDir, f) })),
  ...fs.readdirSync(compDir).map(f => ({ dir: 'components', name: f, path: path.join(compDir, f) }))
];

const audit = [];

for (const { dir, name, path: fpath } of files) {
  if (!name.endsWith('.jsx')) continue;
  const content = fs.readFileSync(fpath, 'utf8');
  
  // Find all endpoints mentioned
  const endpoints = [];
  const endpointRegex = /['"`](\/api\/[a-zA-Z0-9_\-\/${}]+(\?[^'"`]*)?)['"`]/g;
  let m;
  while ((m = endpointRegex.exec(content)) !== null) {
    if (!endpoints.includes(m[1])) endpoints.push(m[1]);
  }

  // Check response patterns
  const resDataSuccess = content.includes('res.data.success') || content.includes('data.data.success');
  const resDataData = content.includes('res.data.data') || content.includes('data.data.data');
  const resSuccess = content.includes('res.success') || content.includes('res?.success') || content.includes('data?.success') || content.includes('data.success');
  const hasApiImport = content.includes('import api') || content.includes('import { api }');

  audit.push({
    file: name,
    hasApiImport,
    endpoints,
    resDataSuccess,
    resDataData,
    resSuccess
  });
}

console.log(JSON.stringify(audit, null, 2));
