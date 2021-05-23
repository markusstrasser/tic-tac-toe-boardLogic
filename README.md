# Tic Tac Toe : Logic to Decide The Game is Over (with n x n cells)



Setup: Two players play on a **n** x **n** game board. You're given the board's state as 1D array where

```
0: empty
1: Player1
2: Player2
```

The goal is for a given board state return if the game is won by P1, P2, a draw or still ongoing.



## First Iteration: Imperative with mutative and impure for-loops (🤮)

This is the main logic for the good old vanilla (error-prone) double for loop.

Interestingly it works comparatively well for this exact problem, because selecting arbitrary sections of the matrix (*ie. the opposite diagonal*) is something that's hard to abstract into `.map .filter .reduce` idioms. Even in the last functional (with-3rd-party-utils) example, the opposite diagonal wasn't covered by usual matrix utility methods. 

Here's the main logic:

```javascript
const boardState = [2, 2, 1, 2, 2, 0, 1, 2, 1] //P2 wins
const size = 3

const selectIndices = (arr, idxs) => arr.filter((_, i) => idxs.includes(i))

let rows = []
let columns = []

/* getting masks (indices) */
for (i = 0; i < size; i++) {
    let rowidxs = []
    let columnidxs = []
    for (j = 0; j < size; j++) {
        // console.log(rowStart, i)
        rowidxs = rowidxs.concat(j + i * size)
        columnidxs = columnidxs.concat(i + j * size)
    }
    rows = rows.concat([rowidxs])
    columns = columns.concat([columnidxs])
}

let d1 = []
let d2 = []
for (i = 0; i < size; i++) { // could be solved better with a "range" function like in python
    d1 = d1.concat(i * (size + 1)) //[0 -> 4 -> 8 ] (3x3)
    d2 = d2.concat((size - 1) + i * (size - 1)) //starts at 2 and does steps of 2 (3x3)
}
//mapping indices (masks) to values in the boardState
const boardSlices = [...rows, ...columns, d1, d2] .map(idxs => selectIndices(boardState, idxs))

/* indices: [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6],];*/
```

This example and the second iteration (vanilla-js-functional) check the individual sections and decide the game's state this basic way:

```javascript
//this is still imperative -- there's a cooler version in with-3rd-party-utils
let status = "Game is Still on"
for (const c of boardSlices) {
    console.log(c)
    if (!boardState.some(x => x == 0)) {
        status = "It's a Draw (no more empty fields)"
        break
    }

    if (c.every(x => x == 1)) {
        status = "Player 1 Won"
        break
    }
    else if (c.every(x => x == 2)) {
        status = "Player 2 Won"
        break
    }
}

console.log(boardSlices, status)
```



## Second Iteration: Vanilla JS, but more functional and pure

`/functional-pure.js`

Here we're not using for loops and we're not mutating array objects like rows [] through global state. This, to me, is much cleaner and idiomatic. 

The main problem with for-loops is that they have much more language specific syntax and are hard to read because they show the how ("create an index, increase, do stuff in body etc....", but not that what ("map over rows"). 

`.map .filter .reduce` are universal abstractions with an agreed upon API that's consistent across most workable programming languages.

```javascript
const boardState = [2, 2, 1, 2, 2, 0, 1, 2, 1] //P2 wins
const size = 3

/*utils*/
const VAdd = (v1, v2) => v1.map((e, i) => e + v2[i]) //assuming both are arrays and equal length
const selectIndices = (arr, idxs) => arr.filter((_, i) => idxs.includes(i)) 
//selects multiple indices from array (applies a mask)

const baseV = Array(size).fill(0) //
//helper struct for broadcasting / using V.map() instead of for loops

/**/
const rowBase = baseV.map((_, i) => i * size) // [0, 3 , 6]
const colBase = baseV.map((_, i) => i) // [0, 1, 2]

/*in numpy that supports broadcasting we could do (cIdx + rowBase) instead of VAdd(baseV.fill(cIdx) */
const cIdxs = colBase.map(cIdx => VAdd(baseV.fill(cIdx), rowBase)) 
const rIdxs = rowBase.map(rIdx => VAdd(baseV.fill(rIdx), colBase))

const diagIdx = [
    baseV.map((_, i) => i * (size+1)), //corner starting at upper left
    baseV.map((_, i) => (size - 1) + i * (size-1)) //corner starting at upper right 
]

const boardSlices = [...rIdxs, ...cIdxs, ...diagIdx].map(idxs => selectIndices(boardState, idxs))

/*using same code to decide game status as above*/
```



## Third Iteration: add 3rd-party utilities

`/with-3rd-party-utils.html`

The more you understand a problem and it's abstractions, the likelier it is that most of it can be rephrased through common utilities or mathematical structures supported in your language's big utility libs. 

For JS I recommend  [Ramda](https://ramdajs.com/docs/) because methods are curried by default which gives more expressive power (vs. lodash).

Here we use [math.js matrix](https://mathjs.org/docs/datatypes/matrices.html) to get the main diagonals, row and column values directly (*before we got the indicies as masks first*).

```javascript
 /*with 3rd party utils*/
    const boardState = [2, 2, 1, 2, 2, 0, 1, 2, 1] //P2 wins
    const size = 3 /* chose n */
    
    const board = math.reshape(boardState, [size, size])
    const diagonals = [
        math.diag(board), //main diagonal 
        boardState.filter((_, i) => math //right upper -> left lower diagonal
            .range(start = size - 1, end = 2 * size, step = size-1, includeEnd = true) /*indices*/
            .toArray().includes(i)),
    ]
    
    /*fold rows, columns, diagonals into one array of [ [0,1, 1], [0, 1, 2], ....] with length n*2 + 2*/
    const boardSlices = Array(size).fill(0) //instead of for loop
        .reduce((acc, _, i) => acc.concat(
            math.row(board, i),
            [math.squeeze(math.column(board, i))] //columns return as [1] [2] [3] so need extra processing
        ) , diagonals) 
         
    /*that's it for getting all the (8 when 3x3) board sections to iterate over*/
```



Then we're evaluating the board state to figure out the **game status**. We can use ramda's **cond** function instead of what we had before. *This is more elegant, composable and readable for my taste.*

```javascript
	/* returns true if ANY slice of the board has a full streak of  'player' */
    const checkWin = player => boardSlices => (
      boardSlices.reduce((acc, current) => acc || current.every(x => x == player), false))
    
    /*https://ramdajs.com/docs/#cond*/         //takes [predicate, transformation]
    const getStatus = R.cond([
        [_ => !boardState.some(x => x == 0), () => 'Draw! (board is full)'],
        /*boardSlices are passed as input and call the predicate ala checkWin(1)(boardSlices) => true/false*/
        [checkWin(1), () => 'Player 1 Won'],
        [checkWin(2), () => 'Player 2 Won']
    ]);
    console.log(boardSlices, getStatus(boardSlices))
```



## Better Ideas?

I haven't found a way to abstract over that non-main diagonal. I can imagine flipping the matrix vertically (it's symmetric counterpart) and then just using .diag again 







*If you*