import ngrok from 'ngrok';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function startNgrokTunnel() {
    try {
        const url = await ngrok.connect({
            addr: 3000,
            authtoken: process.env.NGROK_AUTH_TOKEN || '',
            region: 'us',
            hostname: 'subtle-bluebird-probable.ngrok-free.app'
        });

        console.log('🚀 Ngrok tunnel created:', url);
        console.log('Dashboard:', 'https://dashboard.ngrok.com/endpoints/');
    } catch (err) {
        console.error('❌ Error creating ngrok tunnel:', err);
        process.exit(1);
    }
}

startNgrokTunnel();