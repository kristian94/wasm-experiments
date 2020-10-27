const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');

/**
 * add folders, containing output of wasm builds, to this array
 * 
 * first element should be the root network path, on which you want
 * the files to be available
 * 
 * the second element should be the path to the directory of wasm builds
 */
const buildFolders = [
    ['/rust', path.join(__dirname, '../rust-lib/pkg')],
    // ['/go', path.join(__dirname, '../go-lib/???')]
]

app.use(morgan('tiny'));
app.use('/', express.static('public'));

buildFolders.forEach(t => {
    [_path, dir] = t;

    app.get(`${_path}/:fileName`, (req, res, next) => {
        res.sendFile(req.params.fileName, {root: dir});
    })
})

app.listen(8080, () => {
    console.log('listening on 8080')
})