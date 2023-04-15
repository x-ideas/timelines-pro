/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process');

exec('mv main.css styles.css', (err, stdout, stderr) => {
  if (err) {
    //some err occurred
    console.error(err);
  } else {
    process.stdout.write('Successfully moved main.css to styles.css');
  }
});
