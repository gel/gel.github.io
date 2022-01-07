+++
title = "Algorithms"
weight = 1
+++

- [Sorting Algorithms](#sorting-algorithms)
  -  [Quicksort](#quicksort)
  -  [Insertion Sort](#insertion-sort)
  -  [Merge Sort](#merge-sort)
  -  [Bucket Sort](#bucket-sort)
  -  [Counting Sort](#counting-sort)

---

### Sorting Algorithms

| Algorithm | Worst | Average | Best | Space | Notes |
|------|------------|----------|----------|----------| ---------|
| Quicksort  | `O(n^2)` | `O(n*log*(n))` | `O(n*log*(n))` | `O(log*(n))`| |
| Mergesort  | `O(n*log*(n))` | `O(n*log*(n))` | `O(n*log*(n))` | `O(n)`| |
| Bubble Sort  | `O(n^2)` | `O(n^2)` | `O(n))` | `O(1)`| Never use! |
| Insertion Sort  | `O(n^2)` | `O(n^2)` | `O(n))` | `O(1)`| Less swaps - more efficient |
| Selection Sort  | `O(n^2)` | `O(n^2)` | `O(n^2))` | `O(1)`| Less swaps |
| Bucket Sort  | `O(n^2)` | `O(n+k)` | `O(n+k))` | `O(n)`| |
| Counting Sort  | `O(n+k)` | `O(n+k)` | `O(n+k))` | `O(k)`| |

#### Quicksort

Most popular / optimized on average sorting algorithm for small data-sets (unstable - position based on pivot selection). `O(N^2)` worst case `O(N *Log(N))` average case. 

Lomuto partitioning (last elm), Hoare partitioning (random / middle - mostly performs better).

`QuickSelect` is a selection algorithm to find kth smallest element (Ohare), it’s a partial quick-sort algorithm - sort only one side of recursion partitioning -  O(logn) or it’s O(n)

```java
// Sorts a (portion of an) array, divides it into partitions, then sorts those
algorithm quicksort(A, lo, hi) is 
    if lo >= 0 && hi >= 0 && lo < hi then
        p := partition(A, lo, hi) 
        quicksort(A, lo, p) // Note: the pivot is now included
        quicksort(A, p + 1, hi) 

    // Divides array into two partitions
    algorithm partition(A, lo, hi) is 
    // Pivot value
    pivot := A[ floor((hi + lo) / 2) ] // The value in the middle of the array
    // Left index
    i := lo - 1 
    // Right index
    j := hi + 1

    loop forever 
        // Move the left index to the right at least once and while the element
        // at the left index is less than the pivot 
        do i := i + 1 while A[i] < pivot 
        
        // Move the right index to the left at least once and while the element 
  // at the right index is greater than the pivot 
  do j := j - 1 while A[j] > pivot 

  // If the indices crossed, return
  if i ≥ j then return j
        
  // Swap the elements at the left and right indices
  swap A[i] with A[j]
  ```

#### Insertion Sort

Simplest sorting algorithm (stable) - `O(N^2)` worst and average case.

```java
    i ← 1
    while i < length(A)
        j ← i
        while j > 0 and A[j-1] > A[j]
            swap A[j] and A[j-1]
            j ← j - 1
        end while
        i ← i + 1
    end while
```

#### Merge Sort

Very efficient for large data-sets - `O(N*Log(N))` average and worst case.

```java
// Sorting the entire array is accomplished by TopDownMergeSort(A, B, length(A)).    

// Array A[] has the items to sort; array B[] is a work array.
void TopDownMergeSort(A[], B[], n)
{
    CopyArray(A, 0, n, B);           // one time copy of A[] to B[]
    TopDownSplitMerge(B, 0, n, A);   // sort data from B[] into A[]
}

// Split A[] into 2 runs, sort both runs into B[], merge both runs from B[] to A[]
// iBegin is inclusive; iEnd is exclusive (A[iEnd] is not in the set).
void TopDownSplitMerge(B[], iBegin, iEnd, A[])
{
if (iEnd - iBegin <= 1)                     // if run size == 1
    return;                                 //   consider it sorted
    // split the run longer than 1 item into halves
    iMiddle = (iEnd + iBegin) / 2;              // iMiddle = mid point
    // recursively sort both runs from array A[] into B[]
    TopDownSplitMerge(A, iBegin,  iMiddle, B);  // sort the left  run
    TopDownSplitMerge(A, iMiddle,    iEnd, B);  // sort the right run
    // merge the resulting runs from array B[] into A[]
    TopDownMerge(B, iBegin, iMiddle, iEnd, A);
}

//  Left source half is A[ iBegin:iMiddle-1].
// Right source half is A[iMiddle:iEnd-1   ].
// Result is            B[ iBegin:iEnd-1   ].
void TopDownMerge(A[], iBegin, iMiddle, iEnd, B[])
{
    i = iBegin, j = iMiddle;
    // While there are elements in the left or right runs...
    for (k = iBegin; k < iEnd; k++) {
        // If left run head exists and is <= existing right run head.
         if (i < iMiddle && (j >= iEnd || A[i] <= A[j])) {
             B[k] = A[i];
             i = i + 1;
         } else {
             B[k] = A[j];
             j = j + 1;
         }
      }
  }

  void CopyArray(A[], iBegin, iEnd, B[])
  {
      for (k = iBegin; k < iEnd; k++)
          B[k] = A[k];
  }
```

#### Bucket Sort

Used as a distribution sort.

Runtime = `O(N^2)` worst case, `O(n + n^2/k + k)` average case when k = buckets
Space = `O(N*k)`

1. Set up an array of initially empty "buckets".
2. Scatter: Go over the original array, putting each object in its bucket.
3. Sort each non-empty bucket.
4. Gather: Visit the buckets in order and put all elements back into the original array.
  
Example:

| Bucket 1 | Bucket 2 | Bucket 3 |
|------|------------|----------|
|  0-9 | 10-99 | 10-999 |
|  1,3 |       |  333   |

##### Radix / digital sort

Used to sort numbers according to their base (specific case of bucket sort)
Runtime: `O(nw)` time, where n is the number of keys, and w is the key length.

#### Counting Sort

​Used when the keys distribution is low compared to number of elements
​Runtime `O(N+K)` runtime. Bucket sort can be used instead (but required dynamic allocation of memory)

```java
​function CountingSort(input, k) ​
    ​count ← array of k + 1 zeros
    ​output ← array of same length as input
     ​
    ​for i = 0 to length(input) - 1 do
        ​j = key(input[i])
        ​count[j] += 1

    ​for i = 1 to k do
        ​count[i] += count[i - 1]

    ​for i = length(input) - 1 downto 0 do
         ​j = key(input[i])
         ​count[j] -= 1
         ​output[count[j]] = input[i]

    ​return output
```
