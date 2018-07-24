const config = require('config');


const app = require('./src/app');

const PORT = process.env.PORT || config.get('port');
const HOST = process.env.HOST || config.get('host');

app.listen(PORT, HOST, () => {
  console.log(`App listening on port ${PORT}!`);
});
