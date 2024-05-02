import fs from 'fs';
import { exit } from 'process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Get all files in the directory
const files = fs.readdirSync(__dirname, {recursive:true}, );

// Filter out any non-JavaScript files
const jsFiles = files.filter(file => (file.endsWith('.js') && file !== 'index.js')
    ).forEach(file => {
        (async () => {
            const testModule = await import('./'+file);
            console.log('Running tests in '+file);
            await testModule.test();
        })();
    });

