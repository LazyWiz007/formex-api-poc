const { PDFDocument } = require("pdf-lib");
const fs = require('fs');

async function fillPdf(response) {
    console.log('PDFfiller data:', response.documents?.[0]?.data || 'No data available');
    const data = fs.readFileSync('./print-pdf/OCRTestPdf.pdf');
    const pdfDoc = await PDFDocument.load(data);
    const form = pdfDoc.getForm();

    const nameField = form.getTextField('Name');
    const genderField = form.getTextField('Gender');
    const dobField = form.getTextField('Age');
    const aadharField = form.getTextField('aadhar number');

    nameField.setText(response.documents?.[0]?.data.given_name);
    genderField.setText(response.documents?.[0]?.data.sex);
    dobField.setText(response.documents?.[0]?.data.date_of_birth);
    aadharField.setText(response.documents?.[0]?.data.document_number || response.documents?.[0]?.data.passport_number || '');

    const pdfBytes = await pdfDoc.save();

    fs.writeFileSync("./uploads/OCRfilledDoc.pdf", pdfBytes);

}

// Export the function using CommonJS syntax
module.exports = { fillPdf };
