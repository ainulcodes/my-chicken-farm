#!/usr/bin/env node

/**
 * 🐓 Dummy Data Generator - Ayam Aduan (Node.js)
 * Generates 100 indukan, 50 breeding, 150 anakan
 *
 * Usage:
 *   node generate-dummy-node.js
 *   node generate-dummy-node.js --test (for smaller dataset)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load API URL from .env.local or .env
let API_URL = process.env.REACT_APP_SHEETS_API_URL;

if (!API_URL) {
    try {
        const envPath = path.join(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/REACT_APP_SHEETS_API_URL=(.+)/);
        if (match) {
            API_URL = match[1].trim();
        }
    } catch (e) {
        // Try .env if .env.local doesn't exist
        try {
            const envPath = path.join(__dirname, '.env');
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/REACT_APP_SHEETS_API_URL=(.+)/);
            if (match) {
                API_URL = match[1].trim();
            }
        } catch (e2) {
            // Fallback to hardcoded URL
            API_URL = 'https://script.google.com/macros/s/AKfycbzUQtXWavdeIkU9kedwAoNV9QqTIteyvX67q1ZxCOFYR2sf5wKACO7Bhed83HzB7HGRMA/exec';
        }
    }
}

// Data arrays
const rasAyam = ['Bangkok', 'Saigon', 'Burma', 'Shamo', 'Asil', 'Birma', 'Pakhoy', 'Pelung', 'Ciparage', 'Jepang', 'Filipino', 'Lemon', 'Brazilian', 'Magon', 'Siam'];
const warnaAyam = ['Hitam', 'Merah', 'Putih', 'Kuning', 'Biru', 'Hijau', 'Abu-abu', 'Coklat', 'Emas', 'Perak', 'Hitam Putih', 'Merah Hitam', 'Kuning Hitam', 'Belang Tiga', 'Wido', 'Laso', 'Kembang', 'Blorok'];
const statusAnakan = ['Sehat', 'Sakit', 'Dijual', 'Mati'];

// Helper functions
function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ANSI colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Make HTTP GET request with redirect support
function httpGet(url, redirectCount = 0) {
    return new Promise((resolve, reject) => {
        if (redirectCount > 5) {
            return reject(new Error('Too many redirects'));
        }

        https.get(url, (res) => {
            // Handle redirects
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
                const redirectUrl = res.headers.location;
                if (redirectUrl) {
                    return resolve(httpGet(redirectUrl, redirectCount + 1));
                }
            }

            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ success: false, error: 'Invalid JSON response', raw: data });
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Insert data in batches
async function insertDataBatch(action, dataArray, batchSize = 5) {
    const results = [];
    const totalBatches = Math.ceil(dataArray.length / batchSize);

    for (let i = 0; i < dataArray.length; i += batchSize) {
        const batch = dataArray.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;

        log(`📦 Batch ${batchNumber}/${totalBatches} (${batch.length} items)...`, 'blue');

        const promises = batch.map(async (item) => {
            try {
                const params = new URLSearchParams({
                    action: action,
                    ...item
                });

                const url = `${API_URL}?${params.toString()}`;
                const result = await httpGet(url);
                return result;
            } catch (error) {
                log(`❌ Error: ${error.message}`, 'red');
                return { success: false, error };
            }
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);

        // Debug: log first response in first batch
        if (i === 0) {
            console.log('\n🔍 DEBUG - Sample API Response:');
            console.log(JSON.stringify(batchResults[0], null, 2));
            console.log('');
        }

        if (i + batchSize < dataArray.length) {
            log('⏳ Waiting 2s before next batch...', 'yellow');
            await sleep(2000);
        }
    }

    const successCount = results.filter(r => r.success).length;
    log(`✅ Inserted ${successCount}/${dataArray.length} items`, 'green');

    return results;
}

// Main generation function
async function generateAllDummyData(isTest = false) {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('🐓 DUMMY DATA GENERATOR - AYAM ADUAN (Node.js)', 'blue');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    console.log();
    log(`🔗 API URL: ${API_URL.substring(0, 60)}...`, 'yellow');
    console.log();

    const startTime = Date.now();

    const counts = isTest
        ? { indukan: 20, breeding: 10, anakan: 30 }
        : { indukan: 100, breeding: 50, anakan: 150 };

    try {
        // Step 1: Ayam Indukan
        log('━━━━━ STEP 1: AYAM INDUKAN ━━━━━', 'blue');
        log(`🐓 Generating ${counts.indukan} Ayam Indukan...`, 'yellow');

        const indukanData = [];
        const jantanCount = Math.floor(counts.indukan / 2);

        for (let i = 1; i <= counts.indukan; i++) {
            const jenisKelamin = i <= jantanCount ? 'Jantan' : 'Betina';
            const prefix = jenisKelamin === 'Jantan' ? 'JTN' : 'BTN';

            indukanData.push({
                kode: `${prefix}-${String(i).padStart(3, '0')}`,
                jenis_kelamin: jenisKelamin,
                ras: randomElement(rasAyam),
                warna: randomElement(warnaAyam),
                tanggal_lahir: randomDate(new Date(2020, 0, 1), new Date(2024, 0, 1))
            });
        }

        const indukanResults = await insertDataBatch('add_ayam_induk', indukanData, 5);
        const indukans = indukanResults.filter(r => r.success && r.data).map(r => r.data);
        log(`✓ Total Indukan in database: ${indukans.length}`, 'green');
        console.log();
        await sleep(2000);

        // Step 2: Breeding
        log('━━━━━ STEP 2: BREEDING DATA ━━━━━', 'blue');
        log(`💑 Generating ${counts.breeding} Breeding records...`, 'yellow');

        const jantanList = indukans.filter(a => a.jenis_kelamin === 'Jantan');
        const betinaList = indukans.filter(a => a.jenis_kelamin === 'Betina');

        if (jantanList.length === 0 || betinaList.length === 0) {
            log('❌ Not enough indukan to create breeding pairs', 'red');
            return;
        }

        log(`Available: ${jantanList.length} Jantan, ${betinaList.length} Betina`, 'yellow');

        const breedingData = [];
        for (let i = 0; i < counts.breeding; i++) {
            const tanggalKawin = randomDate(new Date(2023, 0, 1), new Date(2024, 9, 1));
            const kawinDate = new Date(tanggalKawin);
            kawinDate.setDate(kawinDate.getDate() + 21);

            breedingData.push({
                pejantan_id: randomElement(jantanList).id,
                betina_id: randomElement(betinaList).id,
                tanggal_kawin: tanggalKawin,
                tanggal_menetas: kawinDate.toISOString().split('T')[0],
                jumlah_anakan: Math.floor(Math.random() * 7) + 2
            });
        }

        const breedingResults = await insertDataBatch('add_breeding', breedingData, 5);
        const breedings = breedingResults.filter(r => r.success && r.data).map(r => r.data);
        log(`✓ Total Breeding in database: ${breedings.length}`, 'green');
        console.log();
        await sleep(2000);

        // Step 3: Ayam Anakan
        log('━━━━━ STEP 3: AYAM ANAKAN ━━━━━', 'blue');
        log(`🐣 Generating ${counts.anakan} Ayam Anakan...`, 'yellow');

        const anakanData = [];
        let counter = 1;

        for (const breeding of breedings) {
            const jumlah = Math.floor(Math.random() * 3) + 2;

            for (let j = 0; j < jumlah && counter <= counts.anakan; j++) {
                anakanData.push({
                    breeding_id: breeding.id,
                    kode: `ANK-${String(counter).padStart(3, '0')}`,
                    jenis_kelamin: Math.random() > 0.5 ? 'Jantan' : 'Betina',
                    warna: randomElement(warnaAyam),
                    status: Math.random() > 0.8 ? randomElement(statusAnakan) : 'Sehat'
                });
                counter++;
            }

            if (counter > counts.anakan) break;
        }

        const anakanResults = await insertDataBatch('add_ayam_anakan', anakanData, 5);
        const anakans = anakanResults.filter(r => r.success && r.data).map(r => r.data);
        log(`✓ Total Anakan in database: ${anakans.length}`, 'green');
        console.log();

        // Summary
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
        log('✅ DUMMY DATA GENERATION COMPLETE!', 'green');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
        console.log();
        log('📊 Summary:', 'blue');
        console.log(`   🐓 Ayam Indukan: ${indukans.length} / ${counts.indukan}`);
        console.log(`   💑 Breeding: ${breedings.length} / ${counts.breeding}`);
        console.log(`   🐣 Ayam Anakan: ${anakans.length} / ${counts.anakan}`);
        console.log();
        log(`⏱️  Total time: ${duration}s`, 'blue');
        console.log();
        log('💡 Tip: Refresh aplikasi untuk melihat data baru!', 'yellow');

        return {
            success: true,
            data: {
                indukans: indukans.length,
                breedings: breedings.length,
                anakans: anakans.length
            },
            duration
        };
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        console.error(error);
        return { success: false, error: error.message };
    }
}

// Run the script
const isTest = process.argv.includes('--test');

if (isTest) {
    log('🧪 Running in TEST mode (smaller dataset)', 'yellow');
}

generateAllDummyData(isTest)
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        log(`❌ Fatal error: ${error.message}`, 'red');
        process.exit(1);
    });
