/**
 *  RunService :: {
 *      runTest: (string) -> TimerResult
 *  }
 * 
 *  RenderOptions :: {
 *      className: String,
 *      innerText: String,
 *      attributes: Object,     (keys are attribute names, eg 'id', values are any)
 *      listeners: Object,      (keys are event names eg 'click', values are functions)
 *  }
 */

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
const runSuite = (containers, jsFns, wasmFns, goFns) => {
    const types = ['js', 'wasm', 'go'];

    fns = {
        js: jsFns,
        wasm: wasmFns,
        go: goFns
    }

    containers.reduce((prom, container) => prom.then(_ => types.reduce((_prom, type) => _prom.then(__ => {
        const target = getTargetFromContainer(container, type);
        return runTestN(container, fns[type], getNameFromContainer(container), type, target, 10);
    }), Promise.resolve())), Promise.resolve())

    // return Promise.all(containers.map(container => Promise.all(types.map(type => {
    //     const target = getTargetFromContainer(container, type)
    //     return runTestN(container, fns[type], getNameFromContainer(container), type, target, 10);
    // }))))
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
            const errorMessage = `no test named "${name}" found in object: ${fns}`
            errorHandler(new Error(errorMessage))
            console.error(errorMessage)
            reject()
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
            errorHandler(new Error(errorMessage))
            console.error(errorMessage)
            finalize();
            return;
        }
    
        const {elapsed, value} = timed(() => testFn(input));
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
const renderTest = (name, wasmFns, jsFns, goFns) => r('div', {
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
                r('button', {
                    className: 'run-btn js',
                    innerText: 'run js',
                    listeners: {
                        'click': getTestEventListener(container, jsFns, name, 'js')
                    }
                }),
                r('button', {
                    className: 'run-btn run-10 js',
                    innerText: 'run js (10 times)',
                    listeners: {
                        'click': get10TestEventListener(container, jsFns, name, 'js')
                    }
                }),
                r('button', {
                    className: 'run-btn wasm',
                    innerText: 'run wasm',
                    listeners: {
                        'click': getTestEventListener(container, wasmFns, name, 'wasm')
                    }
                }),
                r('button', {
                    className: 'run-btn run-10 wasm',
                    innerText: 'run wasm (10 times)',
                    listeners: {
                        'click': get10TestEventListener(container, wasmFns, name, 'wasm')
                    }
                }),
                r('button', {
                    className: 'run-btn go',
                    innerText: 'run go',
                    listeners: {
                        'click': getTestEventListener(container, goFns, name, 'go')
                    }
                }),
                r('button', {
                    className: 'run-btn run-10 go',
                    innerText: 'run go (10 times)',
                    listeners: {
                        'click': get10TestEventListener(container, goFns, name, 'go')
                    }
                }),
            ]
        }),
        r('h4', {
            innerText: 'results'
        }),
        r('div', {
            className: 'results',
            children: () => [
                r('div', { className: 'label js', innerText: 'js' }),
                r('div', { className: 'value js', }),
                r('div', { className: 'label wasm', innerText: 'wasm' }),
                r('div', { className: 'value wasm', }),
                r('div', { className: 'label go', innerText: 'go' }),
                r('div', { className: 'value go', }),
            ]
        })
    ]
})

// initRunService :: (HTMLElement, [String], Object, Object) -> RunService
const initRunService = (container, names, wasmFns, jsFns, goFns) => {

    const containers = names.map(name => renderTest(name, wasmFns, jsFns, goFns));

    const runAllBtn = document.querySelector('#run-all-btn');

    runAllBtn.addEventListener('click', e => {
        runSuite(containers, jsFns, wasmFns, goFns)
    })

    containers.forEach(el => {
        container.appendChild(el);
    })

    
}

