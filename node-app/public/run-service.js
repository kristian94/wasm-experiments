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

// getTestEventListener :: (HTMLElement, Object, String, String) -> Event -> ()
const getTestEventListener = (container, fns, name, type) => e => {
    const _innterText = e.target.innerText;
    console.log(e.target)
    e.target.innerText = 'running...';

    setTimeout(() => {
        const valueEl = container.querySelector(`.results .value.${type}`);
        const input = inputGenerators[name]();
    
        const testFn = fns[name];
    
        const {elapsed, value} = timed(() => testFn(input));
        valueEl.innerText = `${value} (in ${elapsed} ms)`;
        e.target.innerText = _innterText;
    }, 10)
}

// renderTest :: (String, Object, Object) -> HTMLElement
const renderTest = (name, wasmFns, jsFns) => r('div', {
    className: 'test',
    attributes: {
        'data-test': name 
    },
    children: container => [
        r('h3', {
            innerText: name
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
                    className: 'run-btn wasm',
                    innerText: 'run wasm',
                    listeners: {
                        'click': getTestEventListener(container, wasmFns, name, 'wasm')
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
            ]
        })
    ]
})

// initRunService :: (HTMLElement, [String], Object, Object) -> RunService
const initRunService = (container, names, wasmFns, jsFns) => {

    names.forEach(name => {
        container.appendChild(renderTest(name, wasmFns, jsFns));
    })

}   

