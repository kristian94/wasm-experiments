use wasm_bindgen::prelude::*;
use std::num;

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



fn merge(a: Vec<i32>, b: Vec<i32>) -> Vec<i32> {
    let mut i = 0;
    let mut j = 0;

    let length = a.len() + b.len() as usize;

    let mut v = Vec::new();

    while i < a.len() || j < b.len() {
        if i >= a.len() {
            v.push(b[j]);
            j += 1;
            continue;
        }

        if j >= b.len() {
            v.push(a[i]);
            i += 1;
            continue;
        }

        if a[i] < b[j] {
            v.push(a[i]);
            i += 1;
        }else{
            v.push(b[j]);
            j += 1;
        }
    }

    return v;
}

#[wasm_bindgen]
pub fn merge_sort(mut a: Vec<i32>) -> Vec<i32>{
    if a.len() == 1 {
        return a;
    }

    let i = ((a.len() / 2) as f64).floor() as usize;
    let b = a.split_off(i);

    return merge(merge_sort(a), merge_sort(b)) ;
}


pub fn get_some_vec() -> Vec<i32>{
    return vec![5; 5]; 
}

#[wasm_bindgen]
pub fn array_reverse(mut array: Vec<f32>) -> f32 {
    let len = array.len();

    for _ in 0..999 {
        // build in `array.reverse()` is the same perf
        for i in 0..(len / 2) {
            let tmp = array[len-i-1]; 
            array[len-i-1] = array[i];
            array[i] = tmp;
        }
    }

    return checksum(array)
}

fn checksum(array: Vec<f32>) -> f32 {
    let mut sum: f32 = 0.0;
    for i in array {
        sum += i
    }
    return sum
}