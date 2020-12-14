package main

import (
	"fmt"
	"time"
)

// just an experiment -> did not work

const num = 45

func runFib(num int) {
	jobs := make(chan int, num)
	results := make(chan int, num)
	defer elapsed(results)()

	// concurrent workers
	// remove or add some to test different configs
	go worker(jobs, results)
	go worker(jobs, results)
	go worker(jobs, results)
	go worker(jobs, results)

	for i := 0; i < num; i++ {
		jobs <- i
	}
	close(jobs)

	for j := 0; j < num; j++ {
		// fmt.Println(<-results)
		<-results
	}
}

func worker(jobs <-chan int, results chan<- int) {
	for n := range jobs {
		results <- fib2(n)
	}
}

func fib2(n int) int {
	if n <= 1 {
		return n
	}
	return fib2(n-1) + fib2(n-2)
}

// calculate time elapsed
func elapsed(res chan int) func() int64 {
	start := time.Now()
	return func() int64 {
		fmt.Printf("Calculation took %v milliseconds\n", time.Since(start).Milliseconds())
		return time.Since(start).Milliseconds()
	}
}
