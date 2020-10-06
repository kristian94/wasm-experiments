# wasm-experiments

## setup

1. install Rust, including cargo
2. install the cargo package: 'wasm-pack' ````cargo install wasm-pack````
3. install node and npm

## Serving the html file
run all commands from ````./node-app````

1. if you haven't done so before, run ````npm i````
2. run ````node app````
3. files in ````./node-app/public```` and ````./rust-lib/pkg```` are now
   served on ````localhost:8080````

## compiling Rust to WASM
run all command from ````./rust-lib````

1. modify files in src as wanted
2. run ````wasm-pack build --target web````
3. if you created new files, make sure these are imported in ````node-app/public/index.html````