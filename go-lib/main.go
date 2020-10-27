package main

import (
	"math"
	"syscall/js"
)

func main() {
	fns := make(map[string]interface{})
	fns["array_reverse"] = arrayReverse()
	fns["fib"] = fibWrap()
	fns["eratosthenes"] = eratosthenes()

	js.Global().Set("goFns", fns)

	select {}
}

func eratosthenes() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// Eratosthenes algorithm to find all primes under n
		n := args[0].Int()
		array := make([]bool, n)
		output := make([]interface{}, 0)
		upperLimit := int(math.Sqrt(float64(n)))

		// // Remove multiples of primes starting from 2, 3, 5,...
		for i := 2; i <= upperLimit; i++ {
			if !array[i] {
				for j := i * i; j < n; j += i {
					array[j] = true
				}
			}
		}

		// // All array[i] set to true are primes
		for i := 2; i < n; i++ {
			if !array[i] {
				output = append(output, i)
			}
		}

		return output
	})
}

func mergeSort() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return 0
	})
}

func fibWrap() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return fib(args[0].Int())
	})
}

func fib(n int) int {
	if n <= 1 {
		return n
	}
	return fib(n-1) + fib(n-2)
}

func fibFast(n int) int {
	if n < 1 {
		return 0
	}
	cur := 1
	prev := 0
	for i := 1; i < n; i++ {
		prev, cur = cur, prev+cur
	}
	return cur
}

func arrayReverse() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		array := args[0]
		arrayLen := array.Length()
		for round := 0; round < 10; round++ { // Coresponding functions use 0->999
			for i := 0; i < arrayLen/2; i++ {
				swap(array, i, arrayLen-i-1)
			}
		}
		return checksum(array)
	})
}

func swap(array js.Value, i int, j int) {
	ai := array.Index(i)
	array.SetIndex(i, array.Index(j))
	array.SetIndex(j, ai)
}

func checksum(array js.Value) (sum float64) {
	for i := 0; i < array.Length(); i++ {
		sum += array.Index(i).Float()
	}
	return
}
