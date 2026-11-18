import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!match) throw new Error('No JSON-LD script found in index.html');

const parsed = JSON.parse(match[1]);
console.log('JSON-LD parses cleanly! Total top-level entities:', parsed.length);

const website = parsed.find(e => e['@type'] === 'WebSite');
console.log('\n--- WebSite Schema ---');
console.log(JSON.stringify(website, null, 2));

const org = parsed.find(e => e['@type'] === 'Organization');
console.log('\n--- Organization Schema ---');
console.log(JSON.stringify(org, null, 2));

const canonical = html.match(/<link rel="canonical" href="(.*?)"/);
console.log('\nCanonical URL:', canonical ? canonical[1] : 'NOT FOUND');

const title = html.match(/<title>(.*?)<\/title>/);
console.log('Page Title:', title ? title[1] : 'NOT FOUND');

const ogSiteName = html.match(/<meta property="og:site_name" content="(.*?)"/);
console.log('og:site_name:', ogSiteName ? ogSiteName[1] : 'NOT FOUND');

const favicon = html.match(/<link rel="icon" type="image\/png" sizes="1024x1024" href="(.*?)"/);
console.log('Favicon 1024x1024:', favicon ? favicon[1] : 'NOT FOUND');
