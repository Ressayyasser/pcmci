#!/usr/bin/env node

const http = require('http');

const APIs = [
  { name: 'PCMCI Analysis', url: 'http://localhost:3000/api/pcmci' },
  { name: 'Anomalies', url: 'http://localhost:3000/api/anomalies' },
  { name: 'Q-Learning Strategy', url: 'http://localhost:3000/api/rl_strategy' },
  { name: 'System Summary', url: 'http://localhost:3000/api/summary' },
  { name: 'Insights', url: 'http://localhost:3000/api/insights' },
];

async function verifyAPI(name, url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ ${name}`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Data keys: ${Object.keys(json).slice(0, 3).join(', ')}...`);
        } catch (e) {
          console.log(`❌ ${name} - Invalid JSON`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`❌ ${name} - ${err.message}`);
      resolve();
    });
  });
}

async function main() {
  console.log('\n🔍 OCP Dashboard API Verification\n');
  console.log('Checking all API endpoints...\n');

  for (const api of APIs) {
    await verifyAPI(api.name, api.url);
  }

  console.log('\n✨ Verification complete!\n');
}

main();
