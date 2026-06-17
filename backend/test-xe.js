const https = require('https');

https.get('https://www.xe.com/currencyconverter/convert/?Amount=1&From=QAR&To=INR', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    // Look for <p class="result__BigRate-sc-1bsijpp-1 iwgxPq">23.238691<span class="faded-digits"> INR</span></p>
    const match = data.match(/result__BigRate[^>]+>([\d.]+)<span/);
    if (match) {
      console.log('Extracted rate:', match[1]);
    } else {
      console.log('Failed to extract rate from BigRate class. Searching loosely...');
      const looseMatch = data.match(/([\d.]+)<span class="faded-digits"> INR<\/span>/);
      if (looseMatch) {
          console.log('Extracted rate loosely:', looseMatch[1]);
      } else {
          console.log('Data length:', data.length);
          console.log('Status code:', res.statusCode);
      }
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
