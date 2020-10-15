const getNRandArray = (n) => {
    const upper = 2 ** 31 - 1;
    const out = [];
    for(let i = 0; i < n; i++){
        out.push(Math.floor(Math.random() * upper));
    }
    return out;
}


const inputGenerators = {
    fib: () => 40,
    eratosthenes: () => 39999990,
    merge_sort: (() => {
        const a = getNRandArray(10 ** 6);
        return () => a;
    })()
};