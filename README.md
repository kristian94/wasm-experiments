# wasm-experiments

project for comparing in-browser performance of JavaScript and wasm (compiled from Rust and Golang)

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

### 1.2 Compiling Rust to WASM
run all command from ````./rust-lib````

1. modify files in src as wanted
2. run ````wasm-pack build --target web````
3. if you created new files, make sure these are imported in ````node-app/public/index.html````

### 1.3 Compiling Go to WASM
1. modify go files in go-lib directory.
2. run `./build-wasm.sh` to build wasm module and js bindings. Output is placed in `node-app/public/`

## 2. experiments

below is a list of functions, the project aims to test. Functions
will be implemented in both js and wasm, and timed in the browser.

---
### 2.1 functions
- fib
- mergeSort
- ... and the rest of the gang

---
### 2.2 adding functions

#### 2.2.1 js 

add the function to ````node-app/public/functions.js```` and make sure it is referenced in the ````jsFns```` object (in the same file)

#### 2.2.2 rust

add the function to ````rust-lib/src/lib.rs```` and make sure it is annotated with ````#[wasm_bindgen]````

make sure you recompile the rust package after adding a new function (see section 1.2)

Make sure the name of the function matches the equivalent javascript function (if not, it wont
be shown in the application UI)

#### 2.2.3 input-generators

navigate to ````node-app/public/input-generators.js````. As the name suggests, this file generates input values for the tested functions. Add a property to the ````inputGenerators```` object, where the key matches  the name of the test function, and the value is a function that returns a value, that the function can be tested with

### 3 mongo

#### 3.1 adding a mongo user

Having installed mongo, and the mongo shell, start up a new shell session. The application needs a user, type the following commands (replacing the <tags> with the correct values)

````
use <db>

db.createUser({
   user: "<name>",
   pwd: "<pass>",
   roles: [
      { role: "readWrite", db: "<db>" }
   ]
})
````

values used should correspond to your local .env file. The user created will only have access to the defined db.

Example with values from the default .env:

````
use wasmexp

db.createUser({
   user: "bois",
   pwd: "denerbra",
   roles: [
      { role: "readWrite", db: "wasmexp" }
   ]
})
````