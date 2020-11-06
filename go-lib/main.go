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
	fns["merge_sort"] = mergeSortWrapper()

	js.Global().Set("goFns", fns)

	select {}
}

func convertJsArrayToIntSlice(jsArr js.Value) []int {
	size := jsArr.Length()
	arr := make([]int, size, size)
	for i := 0; i < len(arr); i++ {
		arr[i] = jsArr.Index(i).Int()
	}
	return arr
}

func convertJsArrayToFloatSlice(jsArr js.Value) []float64 {
	size := jsArr.Length()
	arr := make([]float64, size, size)
	for i := 0; i < len(arr); i++ {
		arr[i] = jsArr.Index(i).Float()
	}
	return arr
}

func merge(left, right []int) []int {
	size, i, j := len(left)+len(right), 0, 0
	result := make([]int, size, size)

	for k := 0; k < size; k++ {
		if i > len(left)-1 && j <= len(right)-1 {
			result[k] = right[j]
			j++
		} else if j > len(right)-1 && i <= len(left)-1 {
			result[k] = left[i]
			i++
		} else if left[i] < right[j] {
			result[k] = left[i]
			i++
		} else {
			result[k] = right[j]
			j++
		}
	}
	return result
}

func mergeSort(array []int) []int {
	if len(array) == 1 {
		return array
	}
	mid := len(array) / 2
	return merge(mergeSort(array[:mid]), mergeSort(array[mid:]))
}

func mergeSortWrapper() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if args[0].Length() <= 1 {
			return args[0]
		}
		array := convertJsArrayToIntSlice(args[0])
		result := mergeSort(array)
		return convertToInterfaceSlice(result)
	})
}

func convertToInterfaceSlice(arr []int) []interface{} {
	res := make([]interface{}, len(arr), len(arr))
	for i := range arr {
		res[i] = arr[i]
	}
	return res
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
		array := convertJsArrayToFloatSlice(args[0])
		length := len(array)
		for round := 0; round < 999; round++ {
			for i := 0; i < len(array)/2; i++ {
				swap(array, i, length-i-1)
			}
		}
		return checksum(array)
	})
}

func jsSwap(array js.Value, i int, j int) {
	ai := array.Index(i)
	array.SetIndex(i, array.Index(j))
	array.SetIndex(j, ai)
}

func jsChecksum(array js.Value) (sum float64) {
	for i := 0; i < array.Length(); i++ {
		sum += array.Index(i).Float()
	}
	return
}

func swap(array []float64, i int, j int) {
	ai := array[i]
	array[i] = array[j]
	array[j] = ai
}

func checksum(array []float64) (sum float64) {
	for i := 0; i < len(array); i++ {
		sum += array[i]
	}
	return
}
