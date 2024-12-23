const { createInterface } = require('readline');
const { readFile, writeFile, createWriteStream } = require('fs');
const { Volume } = require('memfs');

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
});

const r = file => new Promise((res, rej) => readFile(file, 'utf8', (err, dat) => err ? rej(err) : res(dat)));

const memfs = new Volume();

(async () => {
    console.log(`\nПросчитываем DISK..`);

    let mb = 32;

    let c = '0'.repeat(1024);

    let disktime = await (() => new Promise(res => {
        writeFile('mib.txt', '', 'utf8', () => {
            let time = Date.now();
            let s = createWriteStream('mib.txt', 'utf8');
            let wb = 0;
            s.once('finish', () => res(Date.now() - time));
            while (wb < (mb * 1024 * 1024)) (s.write(c), wb += c.length);
            s.end();
        });
    }))();

    console.log(`Просчитываем RAM..`);

    let ramtime = await (() => new Promise(res => {
        memfs.writeFile('/mib.txt', '', 'utf8', () => {
            let time = Date.now();
            let s = memfs.createWriteStream('/mib.txt', 'utf8');
            let wb = 0;
            s.once('finish', () => res(Date.now() - time));
            while (wb < (mb * 1024 * 1024)) (s.write(c), wb += c.length);
            s.end();
        });
    }))();

    console.log(`--- Подсчёты ---\nRAM: ${ramtime}мс.\nDISK: ${disktime}мс.\nRAM быстрее DISK в ~${(disktime / ramtime).toFixed(2)} раз.`);

    await new Promise(res => writeFile('mib.txt', '', 'utf8', () => res()));
    
    rl.close();
})();
