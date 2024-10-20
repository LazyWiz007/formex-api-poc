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



app.post('/api/extract', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;

  var options = {
    method: "POST",
    url: "https://worker.formextractorai.com/v2/extract",
    headers: {
      "X-WORKER-TOKEN": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZV9vd25lcl9pZCI6ImFhZjVmNjAxLWI0ZGItNDQzZi1hNTFiLWFkNjc2YzMxODdmYiIsIndvcmtlcl90b2tlbl9pZCI6IjlhMzFjODI2LTg1NGQtNGNlNS1iYTFlLWIwNjE5ZjI3NzU4NiIsInVzZXJfaWQiOiJhYWY1ZjYwMS1iNGRiLTQ0M2YtYTUxYi1hZDY3NmMzMTg3ZmIifQ.hiMkLXq3iMX9-6eEnbQDL6iLzuwB7teV_qGYYJ3XdHg",
      "X-WORKER-EXTRACTOR-ID": "01e7ebaa-8fb9-404a-96ed-436cf76f4330",
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
