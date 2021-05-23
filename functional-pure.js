const boardState = [2, 2, 1, 2, 2, 0, 1, 2, 1] //P2 wins
const size = 3

/*utils*/
const VAdd = (v1, v2) => v1.map((e, i) => e + v2[i])
//assuming both are arrays and equal length
const selectIndices = (arr, idxs) => arr.filter((_, i) => idxs.includes(i))
//selects multiple indices from array (applies a mask)

const baseV = Array(size).fill(0)
//helper struct for broadcasting / .mapping instead of for loops

const rowBase = baseV.map((_, i) => i * size) // [0, 3 , 6]
const colBase = baseV.map((_, i) => i) // [0, 1, 2]

const cIdxs = colBase.map(cIdx => VAdd(baseV.fill(cIdx), rowBase))
const rIdxs = rowBase.map(rIdx => VAdd(baseV.fill(rIdx), colBase))

const diagIdx = [
    baseV.map((_, i) => i * (size+1)), //corner starting at upper left
    baseV.map((_, i) => (size - 1) + i * (size-1)) //corner starting at upper right 
]

const boardSlices = [...rIdxs, ...cIdxs, ...diagIdx].map(idxs => selectIndices(boardState, idxs))
/* [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6],
];*/

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

console.log("-----", boardSlices, status, "------")