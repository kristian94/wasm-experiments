const fib = (n) => {
    if(n == 0 || n == 1) return 1;
    return fib(n - 1) + fib(n - 2)
}

const is_prime = (n) => {
    if(n <= 1) return false;

    for(let i = 2; i < n; i++){
        if(n % i == 0) return false;
    }

    return true;
}

const eratosthenes = function(n) {
    // Eratosthenes algorithm to find all primes under n
    var array = [], upperLimit = Math.sqrt(n), output = [];

    // Make an array from 2 to (n - 1)
    for (var i = 0; i < n; i++) {
        array.push(true);
    }

    // Remove multiples of primes starting from 2, 3, 5,...
    for (var i = 2; i <= upperLimit; i++) {
        if (array[i]) {
            for (var j = i * i; j < n; j += i) {
                array[j] = false;
            }
        }
    }

    // All array[i] set to true are primes
    for (var i = 2; i < n; i++) {
        if(array[i]) {
            output.push(i);
        }
    }

    return output;
};

const merge = (a, b) => {
    let i = 0;
    let j = 0;

    const out = [];

    while(i < a.length || j < b.length){
        if(i >= a.length){
            out.push(b[j]);
            j++;
            continue;
        }

        if(j >= b.length){
            out.push(a[i]);
            i++;
            continue;
        }

        if(a[i] < b[j]){
            out.push(a[i]);
            i++;
        }else{
            out.push(b[j]);
            j++;
        }
    }

    return out;
}

// merge_sort :: [int] -> [int]
const merge_sort = array => {
    if(array.length === 1) return array;
    const i = Math.floor(array.length / 2)
    return merge(merge_sort(array.slice(0, i)), merge_sort(array.slice(i)))
}

const jsFns = {
    fib,
    // is_prime,
    eratosthenes,
    merge_sort
}