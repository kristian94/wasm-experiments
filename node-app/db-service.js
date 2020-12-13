const { GridFSBucketWriteStream } = require('mongodb');

const init = (app) => {
    const tryRequire = moduleName => {
        try{
            return require(moduleName)
        }catch(err){
            console.info(`Module ${moduleName} missing. Program will continue to run, but features depending on the module will be disabled`)
            return null;
        }
    }
    
    const mongo = tryRequire('mongodb');
    if(!mongo) return;

    const { MongoClient } = mongo;
    require('dotenv').config()
    const bodyParser = require('body-parser')

    const uaParser = require('ua-parser-js');

    const { DB_USER, DB_PASS, DB_NAME } = process.env;

    const user = encodeURIComponent(DB_USER);
    const password = encodeURIComponent(DB_PASS);
    const authMechanism = 'DEFAULT';

    const url = `mongodb://${user}:${password}@localhost:27017/${DB_NAME}`;

    const client = new MongoClient(url, { useUnifiedTopology: true });

    client.connect(err => {
        if(err){
            console.error('Mongo connection failed')
            console.error(err)
            return;
        }

        const db = client.db(DB_NAME);

        const Experiments = db.collection('experiments');

        

        /**
         *  Body {
         *      fib: {
         *          js: Number,
         *          rust: Number,
         *          go: Number
         *      },
         *      ... (eratosthenes, merge_sort, array_reverse)
         *      name: String,
         *      cpu: String,
         *      ram: String,
         *  }
         * 
         */
        app.post('/experiments', bodyParser.json(), (req, res, next) => {
            const missingKeys = [ 'fib', 'eratosthenes', 'merge_sort', 'array_reverse' ].filter(key => req.body[key] == null)

            console.log(req.body)

            if(missingKeys.length > 0){
                return res.status(400).json({
                    message: `Following keys missing from body: ${missingKeys.join(', ')}`
                })
            }
            const parsedUA = uaParser(req.headers['user-agent']);
            console.log(parsedUA)
            const { browser, os, engine, ua } = parsedUA;
            const { architecture } = parsedUA.cpu

            const document = Object.assign({}, req.body, {
                browser,
                os,
                engine,
                architecture,
                userAgent: ua
            })

            console.log('inserting document:', document);

            Experiments.insertOne(document, (err, result) => {
                if(err){
                    res.status(500).json({err})
                    return 
                }

                res.json({});
            })
        })

        const add = (x, y) => x + y;

        const mean = numbers => numbers.reduce(add, 0) / numbers.length;

        const standardDeviation = numbers => Math.sqrt(numbers.map(x => (x - mean(numbers)) ** 2).reduce(add, 0) / (numbers.length - 1));

        // mapExperimentResults :: (Document[], Number[] -> Any) -> Document[]
        const mapExperimentResults = (docs, fn) => {
            return docs.map(doc => {
                ['fib', 'eratosthenes', 'merge_sort', 'array_reverse'].forEach(k => {
                    ['js', 'rust', 'go'].forEach(_k => {
                        doc[k][_k] = fn(doc[k][_k], doc, k, _k);
                    })
                })
                return doc;
            })
        }

        app.get('/experiments', (req, res, next) => {
            const options = Object.assign({
                skip: 0
            }, req.query)

            Experiments.find({ omitted: {$ne: true} }).skip(Number(options.skip)).toArray((err, results) => {
                if(err){ return res.json({err}) }
                
                const _results = mapExperimentResults(results, numbers => ({
                    mean: mean(numbers),
                    sd: standardDeviation(numbers)
                }))

                const __results = mapExperimentResults(results, (obj, doc, k, _k) => {
                    if(_k == 'js') return obj;

                    obj.relativeMean = obj.mean / doc[k].js.mean;
                    return obj;
                })

                res.json(__results);
            })
        })

        /**
         *  Response [
         *      {
         *          name: 'fib',
         *          value: [{'js': Number}, {'rust': Number}, ...]
         *      },
         *      ...
         *  ]
         */
        app.get('/experiments/averages', (req, res, next) => {
            const options = Object.assign({
                skip: 0
            }, req.query)

            Experiments.find({ omitted: {$ne: true} }).skip(Number(options.skip)).toArray((err, results) => {
                if(err){ return res.json({err}) }

                const f1 = (d, f) => ({
                    js: mean(d[f].js),
                    rust: mean(d[f].rust),
                    go: mean(d[f].go)
                })

                const f2 = (name, obj) => ({
                    name,
                    value: [{'js': [ obj[name].js ]}, {'rust': [ obj[name].rust ]}, {'go': [ obj[name].go ]}]
                })

                const json = results.map(doc => ({
                        fib:            f1(doc, 'fib'),
                        eratosthenes:   f1(doc, 'eratosthenes'),
                        merge_sort:     f1(doc, 'merge_sort'),
                        array_reverse:  f1(doc, 'array_reverse'),
                    })) // [Object { js: Number, rust: Number, go: Number }]
                    .reduce((acc, cur) => acc === null 
                        ? [
                            f2('fib', cur),
                            f2('eratosthenes', cur),
                            f2('merge_sort', cur),
                            f2('array_reverse', cur),
                        ] // [ { name: String, value: [{js: [Number]}, {rust: [Number]}, {go: [Number]}] } ]
                        : acc.map(x => {
                            ['js', 'rust', 'go'].forEach((runtime, i) => {
                                x.value[i][runtime].push(cur[x.name][runtime])
                            })
                            return x;
                        }), null)
                    .map(x => {
                        ['js', 'rust', 'go'].forEach((runtime, i) => {
                            x.value[i][runtime] = mean(x.value[i][runtime])

                        })
                        const jsMean = x.value[0].js;
                        const rustMean = x.value[1].rust;
                        const goMean = x.value[2].go;

                        x.rust_rel = `${Math.round(rustMean)} (${Math.round((rustMean / jsMean * 100))}%)`;
                        x.go_rel = `${Math.round(goMean)} (${Math.round((goMean / jsMean * 100))}%)`;

                        return x;
                    })
                
                console.log('json:', json)

                res.json(json);
            })
        })

        app.get('/experiments/:fn', (req, res, next) => {
            const options = Object.assign({
                skip: 0
            }, req.query)

            Experiments.find({ omitted: {$ne: true} }).skip(Number(options.skip)).toArray((err, results) => {
                if(err){ return res.json({err}) }
                
                const { fn } = req.params;
                const { round } = Math;

                res.json(results.map(r => [
                    r.name,
                    r.os, 
                    r.browser, 
                    `${round(mean(r[fn].js))} (100%)`, 
                    `${round(mean(r[fn].rust))} (${round(mean(r[fn].rust) / mean(r[fn].js) * 100)}%)`, 
                    `${round(mean(r[fn].go))} (${round(mean(r[fn].go) / mean(r[fn].js) * 100)}%)`,
                    'standard deviations:',
                    standardDeviation(r[fn].js).toFixed(2), 
                    standardDeviation(r[fn].rust).toFixed(2), 
                    standardDeviation(r[fn].go).toFixed(2),
                ]));
            })
        })

    })
}


module.exports = {
    init
}