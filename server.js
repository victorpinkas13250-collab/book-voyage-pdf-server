const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();

// Allow large book content (lots of base64 images)
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check - useful to "wake up" the free server before generating a PDF
app.get('/', (req, res) => {
  res.send('Book de Voyage PDF server is running ✅');
});

// Main endpoint: receives full HTML, returns a PDF
app.post('/generate-pdf', async (req, res) => {
  const { html, filename } = req.body;

  if (!html) {
    return res.status(400).json({ error: 'Missing "html" field in request body' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Load the full HTML content (with embedded styles/images as base64)
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate the PDF, preserving CSS print styles (@page, page-break, etc.)
    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename || 'book-de-voyage.pdf'}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    if (browser) await browser.close();
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'PDF generation failed', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
