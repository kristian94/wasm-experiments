# wasm-experiments

project for comparing in-browser performance of JS and wasm (compiled from rust)

## 1. setup

1. install Rust, including cargo
2. install the cargo package: 'wasm-pack' ````cargo install wasm-pack````
3. install node and npm

### 1.1 Serving the html file
run all commands from ````./node-app````

1. if you haven't done so before, run ````npm i````
2. run ````node app````
3. files in ````./node-app/public```` and ````./rust-lib/pkg```` are now
   served on ````localhost:8080````

### 1.2 compiling Rust to WASM
run all command from ````./rust-lib````

1. modify files in src as wanted
2. run ````wasm-pack build --target web````
3. if you created new files, make sure these are imported in ````node-app/ public/index.html````


## 2. experiments

below is a list of functions, the project aims to test. Functions
will be implemented in both js and wasm, and timed in the browser.

---
### 2.1 functions
- fib
- mergeSort
- ... and the rest

---
### 2.2 adding functions

#### js 

add the function to ````node-app/public/functions.js```` and make sure it is referenced in the ````jsFns```` object (in the same file)

#### rust

add the function to ````rust-lib/src/lib.rs```` and make sure it is annotated with ````#[wasm_bindgen]````

make sure you recompile the rust package after adding a new function (see section 1.2)

#### index.html: 
navigate to ````node-app/public/index.html```` and find the following line:
````
initRunService(
   document.querySelector('.tests'),
   ['fib'],
   wasmFns,
   jsFns
)
````
make sure you add the name of your test function (should be the same in rust and js) to the string array (2nd argument to the ````initRunService```` function)