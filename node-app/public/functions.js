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

const jsFns = {
    fib,
    is_prime
}