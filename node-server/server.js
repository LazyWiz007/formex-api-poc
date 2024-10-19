const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const request = require('request');
const app = express();
const port = 3000;

const { fillPdf } = require('./src/pdfFiller');

app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

app.post('/api/extract', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;

  var options = {
    method: "POST",
    url: "https://worker.formextractorai.com/v2/extract",
    headers: {
      "X-WORKER-TOKEN": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZV9vd25lcl9pZCI6IjBiMDk2NTViLTIzYTUtNGI5NS05YTM0LThmNWVlMzlhYzUyMyIsIndvcmtlcl90b2tlbl9pZCI6IjMwZmFmZjVjLTQyMTEtNDFlNy1iYzFmLTE3YWFiOWIxMjY4MyIsInVzZXJfaWQiOiIwYjA5NjU1Yi0yM2E1LTRiOTUtOWEzNC04ZjVlZTM5YWM1MjMifQ.khO6VnK2wtA5pC6hQVmevF1dCqTDE7viPmVjGmQqHM0",
      "X-WORKER-EXTRACTOR-ID": "31578c06-5ce0-4d80-9471-94b2a4764ae9",
      "Content-Type": "image/jpeg",
      "X-WORKER-ENCODING": "base64",
    },
    body: base64_encode(filePath),
  };

  request(options, function (error, response) {
    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to extract data' });
    }
    
    // Delete the uploaded file
    fs.unlinkSync(filePath);

    const responseData = JSON.parse(response.body);

    // Call the fillPdf function to fill form.pdf with extracted data
    fillPdf(responseData);
    // console.log('PDF filled successfully', JSON.parse(response.body));

    res.json(JSON.parse(response.body));
  });
});

function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap).toString("base64");
}

app.get('/api/download-pdf', (req, res) => {
  const filePath = './uploads/OCRfilledDoc.pdf';
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'OCRfilledDoc.pdf');
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
