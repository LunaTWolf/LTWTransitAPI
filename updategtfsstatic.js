const { createWriteStream } = require('node:fs');
const fs = require('node:fs/promises'); 
const { Readable } = require('node:stream'); // 🟢 Added to handle Web Fetch streams
const unzipper = require('unzipper');

async function downloadAndUnzip(url, dir) {
  await fs.mkdir(dir, { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Status: ${res.status}`);

  // 🟢 Fixed: Wrapped res.body with Readable.fromWeb() so it can be piped
  const nodeReadableStream = Readable.fromWeb(res.body);

  // Pipes the network stream straight into the unzipper
  await nodeReadableStream.pipe(unzipper.Extract({ path: dir })).promise();
  console.log(`Extracted transit data straight into ${dir}`);
}

async function updateAll() {
  try {
    const data = await fs.readFile('./data/data.json', { encoding: 'utf8' });
    const jsonObject = JSON.parse(data);
    
    for (const key of Object.keys(jsonObject)) {
        const targetDir = `./data/gtfs-static/${key}`;
        const url = jsonObject[key]['GTFS-Static'];
        
        console.log(`Starting download for ${key}...`);
        await downloadAndUnzip(url, targetDir); 
    }
    console.log('All updates complete!');
  } catch (error) {
    console.error('Error updating feeds:', error);
  }
}

updateAll();