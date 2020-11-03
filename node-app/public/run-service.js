/**
 *  RenderOptions :: {
 *      className: String,
 *      innerText: String,
 *      attributes: Object,     (keys are attribute names, eg 'id', values are any)
 *      listeners: Object,      (keys are event names eg 'click', values are functions)
 *  }
 */


const testDataStore = Object.keys(jsFns).reduce((obj, key) => Object.assign(obj, {[key]: {
    js: [],
    rust: [],
    go: []
}}), {});

const postResults = () => {

    if(!testDataStore.cpu || !testDataStore.cpu){
        alert('Input cpu and ram')
        return;
    }

    if(!Object.keys(jsFns).reduce((last, key) => last && ['js', 'rust', 'go'].reduce((last, _key) => last && testDataStore[key][_key].length > 0, true), true)){
        alert('Not all tests are run')
        return;
    }

    fetch('/experiments', {
        method: 'POST',
        body: JSON.stringify(testDataStore),
        headers: {
            'Content-Type': 'application/json'
        },
    })
}

(() => {
    const checkStorage = (name) => {
        const value = localStorage.getItem(name)
        const input = document.getElementById(name);

        if(value){
            input.value = value;
            testDataStore[name] = value;
        };

        const handler = () => {
            testDataStore[name] = input.value;
            localStorage.setItem(name, input.value);
        }

        input.onkeydown = handler
        input.onchange = handler
    }

    ['cpu', 'ram', 'name'].forEach(checkStorage)

    const postBtn = document.getElementById('post-results-btn')
    postBtn.onclick = postResults;
})();

const isTypedIntArray = x => !!x && x.constructor && /Int\d+Array/.test(x.constructor.name)

// currentMs :: () -> Integer
const currentMs = () => new Date().getTime();

// TimerResult :: { elapsed: Integer, value: Any }

// timed :: Function -> TimerResult     (runs the provided function and returns the time elapsed)
const timed = (fn) => {
    const start = currentMs();
    const value = fn();
    const elapsed = currentMs() - start;
    return {elapsed, value};
}

// r :: (String, RenderOptions) -> HtmlElement      (shitty homemade alternative to jsx)
const r = (tag, opts = {}) => {
    const el = document.createElement(tag);
    el.className = opts.className ?? '';
    opts.innerText && (el.innerText = opts.innerText);
    opts.attributes && Object.keys(opts.attributes).forEach(k => {
        const val = opts.attributes[k];
        val === null ? el.setAttribute(k) : el.setAttribute(k, val) 
    })
    opts.children && opts.children(el).forEach(c => {
        el.appendChild(c);
    })
    opts.listeners && Object.keys(opts.listeners).forEach(k => {
        el.addEventListener(k, opts.listeners[k])
    })
    return el;
}

const formatInputLabel = val => {
    if(Array.isArray(val)) return  `${typeof(val[0])}[${val.length}]`;
    return val;
}

// formatResult :: Any -> String
const formatResult = (res) => {
    
    if(Array.isArray(res) && res.length > 4){
        return `[${res[0]}, ${res[1]}, ..., ${res[res.length - 2]}, ${res[res.length - 1]}]`
    }

    if(isTypedIntArray(res)){
        if(res.length > 4){
            const headIter = res.filter((value, index) => index <= 1 );
            const tailIter = res.filter((value, index) => index >= res.length - 2 );

            return `[${headIter.join(', ')}, ..., ${tailIter.join(', ')}]`
        }else{
            return `[${res.join(', ')}]`
        }
    }

    return res;
}

const getNameFromContainer = container => container.getAttribute('data-test')

const getTargetFromContainer = (container, type) => container.querySelector(`.run-btn.run-10.${type}`)

// runSuite :: ([HTMLElement], Object, Object) -> Promise [Any] Error
const runSuite = (containers, jsFns, rustFns, goFns) => {
    const types = ['js', 'rust', 'go'];

    const fns = {
        js: jsFns,
        rust: rustFns,
        go: goFns
    }

    containers.reduce((prom, container) => prom.then(_ => types.reduce((_prom, type) => _prom.then(__ => {
        const target = getTargetFromContainer(container, type);
        return runTestN(container, fns[type], getNameFromContainer(container), type, target, 10);
    }), Promise.resolve())), Promise.resolve())
        .catch(err => {
            console.error(err)
        })
}

const runTestN = (container, fns, name, type, target, n) => new Promise((resolve, reject) => {
    {
        if(n < 1) return;
        const _innterText = target.innerText;
        const valueEl = container.querySelector(`.results .value.${type}`);
        const input = inputGenerators[name]();
    
        const results = [];

        const testFn = fns[name];
        if(!testFn){
            console.error(`no test named "${name}" found in object: ${fns}`)
            resolve()
            return;
        }
    
        const finalize = () => {
            target.innerText = _innterText;
            const avgElapsed = results.reduce((sum, cur) => sum + cur.elapsed, 0) / n;
            const value = results[0].value;
    
            console.log(`${name} finished with value<${typeof value}>:`, value)
            valueEl.innerHTML = `${formatResult(value)}<br>${avgElapsed} ms (average over ${n} runs)`;
            resolve();
        }
    
        const _go = (rem) => {
            target.innerText = `running... (${n - rem + 1}/${n})`;
            setTimeout(() => {
                if(rem > 0){
                    const {elapsed, value} = timed(() => testFn(input));
                    results.push({elapsed, value});
                    testDataStore[name][type].push(elapsed);
                    _go(rem - 1);
                }else{
                    finalize()
                }
            }, 10)
        }
    
        _go(n);
    }
})

const runTest = (container, fns, name, type, target) => {
    const _innterText = target.innerText;
    target.innerText = 'running...';

    const finalize = () => {
        target.innerText = _innterText;
    }

    setTimeout(() => {
        const valueEl = container.querySelector(`.results .value.${type}`);
        const input = inputGenerators[name]();

        const testFn = fns[name];
        if(!testFn){
            const errorMessage = `no test named "${name}" found in object: ${fns}`
            console.error(errorMessage)
            finalize();
            return;
        }
    
        const {elapsed, value} = timed(() => testFn(input));
        testDataStore[name][type].push(elapsed);
        console.log(`${name} finished with value<${typeof value}>:`, value)
        valueEl.innerHTML = `${formatResult(value)}<br>${elapsed} ms`;
        finalize();
    }, 10)
}

// getTestEventListener :: (HTMLElement, Object, String, String) -> Event -> ()
const getTestEventListener = (container, fns, name, type) => e => runTest(container, fns, name, type, e.target)

// getTestEventListener :: (HTMLElement, Object, String, String) -> Event -> ()
const get10TestEventListener = (container, fns, name, type) => e => runTestN(container, fns, name, type, e.target, 10)

// renderTest :: (String, Object, Object) -> HTMLElement
const renderTest = (name, rustFns, jsFns, goFns) => r('div', {
    className: 'test',
    attributes: {
        'data-test': name 
    },
    children: container => [
        r('h3', {
            innerText: `${name} (${formatInputLabel(inputGenerators[name]())})`
        }),
        r('div', {
            className: 'm-500 test-buttons',
            children: () => [
                ['js', jsFns],
                ['rust', rustFns],
                ['go', goFns]
            ].map(t => {
                const [runtimeName, fns] = t;
                return [r('button', {
                    className: `run-btn ${runtimeName}`,
                    innerText: `run ${runtimeName}`,
                    listeners: {
                        'click': getTestEventListener(container, fns, name, runtimeName)
                    }
                }),
                r('button', {
                    className: `run-btn run-10 ${runtimeName}`,
                    innerText: `run ${runtimeName} (10 times)`,
                    listeners: {
                        'click': get10TestEventListener(container, fns, name, runtimeName)
                    }
                })]
            }).reduce((a, b) => a.concat(b), [])
        }),
        r('h4', {
            innerText: 'results'
        }),
        r('div', {
            className: 'results',
            children: () => [
                r('div', { className: 'label js', innerText: 'js' }),
                r('div', { className: 'value js', }),
                r('div', { className: 'label rust', innerText: 'rust' }),
                r('div', { className: 'value rust', }),
                r('div', { className: 'label go', innerText: 'go' }),
                r('div', { className: 'value go', }),
            ]
        })
    ]
})

// initRunService :: (HTMLElement, [String], Object, Object) -> ()
const initRunService = (container, names, rustFns, jsFns, goFns) => {

    const containers = names.map(name => renderTest(name, rustFns, jsFns, goFns));

    const runAllBtn = document.querySelector('#run-all-btn');

    runAllBtn.addEventListener('click', e => {
        runSuite(containers, jsFns, rustFns, goFns)
    })

    containers.forEach(el => {
        container.appendChild(el);
    })
}