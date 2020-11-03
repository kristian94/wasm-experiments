#!/usr/bin/env bash
cd $(dirname "$0")
GOOS=js GOARCH=wasm go build -o ../node-app/public/go.wasm
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" ../node-app/public/go_wasm_exec.js
