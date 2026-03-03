import fs from 'fs';
import path from 'path';

const UPLOAD_URL = 'http://localhost:3001/api/upload-itinerary';

async function testUpload() {
    console.log('🚀 Testing direct upload API:', UPLOAD_URL);

    try {
        const filePath = path.resolve('test-itinerary.txt');
        const fileContent = fs.readFileSync(filePath);

        const blob = new Blob([fileContent], { type: 'text/plain' });

        const formData = new FormData();
        formData.append('file', blob, 'test-itinerary.txt');
        formData.append('brandName', 'Alpha Travels (Upload Test)');
        formData.append('theme', 'umrah-mature');
        formData.append('style', 'original');
        formData.append('language', 'id');

        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        console.log('📬 Response Status:', response.status);
        if (response.status === 200) {
            console.log('✅ Upload test passed!', data);
        } else {
            console.error('❌ Upload test failed:', data);
        }
    } catch (e) {
        console.error('Test error:', e);
    }
}

testUpload();
