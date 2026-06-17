const https = require('https');

https.get('https://www.xe.com/currencyconverter/convert/?Amount=1&From=QAR&To=INR', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const lines = data.split('\n');
    let found = false;
    for (let i = 0; i < data.length; i++) {
        if (data.substring(i, i+10).includes('INR')) {
            console.log(data.substring(Math.max(0, i-50), i+150));
            found = true;
            break; // just print the first occurrence around INR
        }
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
