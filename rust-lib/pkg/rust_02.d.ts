/* tslint:disable */
/* eslint-disable */
/**
* @param {string} name
*/
export function greet(name: string): void;
/**
* @param {number} n
* @returns {number}
*/
export function fib(n: number): number;
/**
* @param {number} n
* @returns {boolean}
*/
export function is_prime(n: number): boolean;
/**
* @param {number} n
* @returns {Int32Array}
*/
export function eratosthenes(n: number): Int32Array;
/**
* @param {Int32Array} a
* @returns {Int32Array}
*/
export function merge_sort(a: Int32Array): Int32Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly greet: (a: number, b: number) => void;
  readonly fib: (a: number) => number;
  readonly is_prime: (a: number) => number;
  readonly eratosthenes: (a: number, b: number) => void;
  readonly merge_sort: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
        