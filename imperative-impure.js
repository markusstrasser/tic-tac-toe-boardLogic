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
const boardSlices = [...rows, ...columns, d1, d2].map(idxs => selectIndices(boardState, idxs))

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