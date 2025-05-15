import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { designation, name, id, ic, position, fault } = req.body;

    // Prepare data for the template
    const templateData = {
        designation: designation || 'NULL',
        name: name || 'NULL',
        id: id || 'NULL',
        ic: ic || 'NULL',
        position: position || 'NULL',
        fault: fault || 'NULL',
    };

    try {
        // Step 1: Authenticate with iLovePDF
        const authResponse = await fetch('https://api.ilovepdf.com/v1/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_key: process.env.PUBLIC_KEY }),
        });
        const authData = await authResponse.json();
        const token = authData.token;

        // Step 2: Start the task
        const tool = 'officepdf';
        const startResponse = await fetch(`https://api.ilovepdf.com/v1/start/${tool}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        const startData = await startResponse.json();
        const { task, server } = startData;

        // Step 3: Upload the file
        const fileURL = 'https://firebasestorage.googleapis.com/v0/b/mygaji-7212c.firebasestorage.app/o/letters%2F1407%2FSurat_Tunjuk_Sebab.docx?alt=media&token=3e18315b-9e14-4a19-9d77-6fb74214b07f';
        const uploadResponse = await fetch(`https://${server}/v1/upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task, cloud_file: fileURL }),
        });
        const uploadData = await uploadResponse.json();
        const serverFilename = uploadData.server_filename;

        // Step 4: Process the file
        const processResponse = await fetch(`https://${server}/v1/process`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                task,
                tool,
                files: [{ server_filename: serverFilename, filename: 'letterAPB.pdf' }],
            }),
        });
        const processData = await processResponse.json();

        // Step 5: Download the file
        const downloadResponse = await fetch(`https://${server}/v1/download/${task}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });
        const fileBuffer = await downloadResponse.buffer();

        // Save the file locally
        const outputPath = path.join(process.cwd(), 'public', 'letterAPB.pdf');
        fs.writeFileSync(outputPath, fileBuffer);

        // Return the file URL
        const fileUrl = `${req.headers.origin}/letterAPB.pdf`;
        res.status(200).send(fileUrl);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process the PDF' });
    }
}
