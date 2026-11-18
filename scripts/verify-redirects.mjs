async function verify() {
  const tests = [
    { name: 'Root Homepage', url: 'https://music-b2696.web.app/', expectedStatus: 301, expectedLoc: 'https://adventurerecords.web.app/' },
    { name: 'Index File', url: 'https://music-b2696.web.app/index.html', expectedStatus: 301, expectedLoc: 'https://adventurerecords.web.app/' },
    { name: 'Pricing Page', url: 'https://music-b2696.web.app/pricing', expectedStatus: 301, expectedLoc: 'https://adventurerecords.web.app/pricing' },
    { name: 'Admin Portal', url: 'https://music-b2696.web.app/admin', expectedStatus: 301, expectedLoc: 'https://adventurerecords.web.app/admin' },
    { name: 'Release Upload', url: 'https://music-b2696.web.app/upload', expectedStatus: 301, expectedLoc: 'https://adventurerecords.web.app/upload' },
    { name: 'Contact Page', url: 'https://music-b2696.web.app/contact', expectedStatus: 301, expectedLoc: 'https://adventurerecords.web.app/contact' },
    { name: 'Features Page', url: 'https://music-b2696.web.app/features', expectedStatus: 301, expectedLoc: 'https://adventurerecords.web.app/features' },
  ];

  console.log('=== TEST 1: Old Site 301 Permanent Redirect Checks ===');
  let allRedirectsPass = true;
  for (const t of tests) {
    const res = await fetch(t.url, { redirect: 'manual' });
    const loc = res.headers.get('location');
    const is301 = res.status === 301;
    const matchesLoc = loc === t.expectedLoc;
    const pass = is301 && matchesLoc;
    if (!pass) allRedirectsPass = false;
    console.log(`${pass ? 'PASS' : 'FAIL'}: [${t.name}] ${t.url} -> HTTP ${res.status} Location: ${loc}`);
  }

  console.log('\n=== TEST 2: Full End-to-End Hop Verification (No Loops) ===');
  for (const t of tests) {
    const res = await fetch(t.url, { redirect: 'follow' });
    const pass = res.status === 200 && res.url.startsWith('https://adventurerecords.web.app');
    console.log(`${pass ? 'PASS' : 'FAIL'}: ${t.url} -> Followed to final URL: ${res.url} (HTTP ${res.status})`);
  }

  console.log('\n=== TEST 3: New Site Standalone HTTP 200 Checks ===');
  const newSiteTests = [
    'https://adventurerecords.web.app/',
    'https://adventurerecords.web.app/pricing',
    'https://adventurerecords.web.app/admin',
    'https://adventurerecords.web.app/upload'
  ];
  for (const url of newSiteTests) {
    const res = await fetch(url);
    console.log(`${res.status === 200 ? 'PASS' : 'FAIL'}: ${url} (HTTP ${res.status})`);
  }
}

verify();
