const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');

const pkgDir = path.join(__dirname, '../rust-lib/pkg')
const publicDir = path.join(__dirname, 'public')

app.use(morgan('tiny'));
app.use('/', express.static('public'));

app.get('/pkg/:fileName', (req, res, next) => {
    res.sendFile(req.params.fileName, {root: pkgDir});
})

app.listen(8080, () => {
    console.log('listening on 8080')
})