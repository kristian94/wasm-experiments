use wasm_bindgen::prelude::*;
use std::num;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

#[wasm_bindgen]
pub fn fib(n: u32) -> u32 {
    match n {
        0 => 1,
        1 => 1,
        _ => fib(n - 1) + fib(n - 2),
    }
}

#[wasm_bindgen]
pub fn is_prime(n: u32) -> bool {
    if n <= 1 {
        return false;
    }
    for a in 2..n {
        if n % a == 0 {
            return false; // if it is not the last statement you need to use `return`
        }
    }
    true // last value to return
}

#[wasm_bindgen]
pub fn eratosthenes(n: usize) -> Vec<i32> {    
    let upper_limit = (n as f64).sqrt();
    let mut marks: Vec<bool> = vec![true; n]; 
    let mut out: Vec<i32> = Vec::with_capacity(n);

    for i in 2 .. upper_limit as usize {
        if marks[i] == true {
            let mut j = i * i;
            while j < n {
                marks[j] = false;
                j += i;
            }
        }
    }

    for i in 2 .. n as usize {
        if marks[i] == true {
            out.push(i as i32);
        }
    }

    return out;
}