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
            Experiments.find({}).toArray((err, results) => {
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

        app.get('/experiments/:fn', (req, res, next) => {
            Experiments.find({}).toArray((err, results) => {
                if(err){ return res.json({err}) }
                
                const {fn} = req.params;

                /* 
                    ExpEntry {
                        fib: {js, rust, go} (Object Number),
                        erato... -||-,
                        merge_sort: -||-,
                        array_reverse: -||-,
                        name,
                        cpu,
                        ram,
                        browser,
                        os,
                        ...
                    }
                */

                // desired:
                // [os, browser, jsTime, rustTime, goTime]

                console.log(results)

                res.json(results.map(r => [r.os, r.browser, mean(r[fn].js), mean(r[fn].rust), mean(r[fn].go)]));
            })
        })

        
    })
}


module.exports = {
    init
}