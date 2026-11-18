import https from 'node:https';

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- 1. Testing Live Old URL 301 Redirect ---');
  const oldRes = await checkUrl('https://music-b2696.web.app/');
  console.log('Status code:', oldRes.statusCode);
  console.log('Location header:', oldRes.headers.location);

  console.log('\n--- 2. Testing Live New URL Content ---');
  const newRes = await checkUrl('https://adventurerecords.web.app/');
  console.log('Status code:', newRes.statusCode);
  const html = newRes.body;

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  console.log('Live Title:', titleMatch ? titleMatch[1] : 'Not found');

  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  console.log('Live Canonical:', canonicalMatch ? canonicalMatch[1] : 'Not found');

  const siteNameMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:)?site_name["']\s+content=["']([^"']+)["']/i);
  console.log('Live Site Name:', siteNameMatch ? siteNameMatch[1] : 'Not found');

  const faviconMatch = html.match(/<link\s+rel=["']icon["'][^>]+href=["']([^"']+)["']/i);
  console.log('Live Favicon:', faviconMatch ? faviconMatch[1] : 'Not found');

  const hasWebSite = html.includes('"@type": "WebSite"') && html.includes('"name": "Adventure Records"');
  console.log('Live WebSite Schema in HTML:', hasWebSite ? 'YES (Valid)' : 'NO');

  const hasAlternateName = html.includes('"alternateName": "Adventure Records Music Distribution"');
  console.log('Live alternateName in WebSite Schema:', hasAlternateName ? 'YES (Valid)' : 'NO');
}

run().catch(console.error);
