const fs = require('fs');
const PDFDocument = require('pdfkit');

const files = [
    { in: '01_Freelance_Design_Agreement.md', out: '01_Freelance_Design_Agreement.pdf' },
    { in: '02_Employment_NDA.md', out: '02_Employment_NDA.pdf' },
    { in: '03_SaaS_Vendor_Agreement.md', out: '03_SaaS_Vendor_Agreement.pdf' },
    { in: '04_Influencer_Sponsorship.md', out: '04_Influencer_Sponsorship.pdf' },
];

files.forEach(file => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(file.out));

    const content = fs.readFileSync(file.in, 'utf8');
    
    // Very basic markdown parsing
    const lines = content.split('\n');
    
    lines.forEach(line => {
        if (line.startsWith('# ')) {
            doc.fontSize(20).font('Helvetica-Bold').text(line.replace('# ', ''), { align: 'center' });
            doc.moveDown();
        } else if (line.startsWith('## ')) {
            doc.fontSize(14).font('Helvetica-Bold').text(line.replace('## ', ''));
            doc.moveDown(0.5);
        } else if (line.trim() === '---') {
            doc.moveDown();
        } else if (line.startsWith('**') && line.includes(':** ')) {
            // simple bold label parsing
            const parts = line.split('**');
            doc.fontSize(12).font('Helvetica-Bold').text(parts[1], { continued: true });
            doc.font('Helvetica').text(parts[2] || '');
        } else if (line.trim() !== '') {
            // normal text
            let text = line.replace(/\*\*/g, ''); // strip bold marks for simplicity
            doc.fontSize(12).font('Helvetica').text(text, { align: 'justify' });
            doc.moveDown(0.5);
        }
    });

    doc.end();
});
console.log('PDFs generated successfully!');
