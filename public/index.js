const selectors = () => ({
    cols: document.querySelector('#num-cols'),
    rows: document.querySelector('#num-rows'),
    submitSize: document.querySelector('.set-size'),
    size: document.querySelector('.size-form'),
    boardWrapper: document.querySelector('.board-wrapper'),
    board: document.querySelector('.lights'),
    pallette: document.querySelector('.pallette'),
    reset: document.querySelector('.reset'),
    keyboard: document.querySelector('.keyboard'),
    color: document.querySelector('[type=color]')
});

const matrix = [];
const wordsDisplayed = {
    totalDots: [],
    letters: []
};
let debounce = 0;

const left = [1,0,0];
const left2 = [1,1,0];
const middle = [0,1,0];
const outer = [1,0,1];
const right = [0,0,1];
const right2 = [0,1,1];
const none = [0,0,0];
const all = [1,1,1];
const space = [0];

const letters = {
    a: [middle, outer, all, outer, outer],
    b: [left2, outer, left2, outer, left2],
    c: [right2, left,left,left,right2],
    d: [left2,outer,outer,outer,left2],
    e: [all,left,left2,left,all],
    f: [all, left, left2, left, left],
    g: [[...all,1], [...left,0], [...outer,1], [...left,1], [...all,1]],
    h: [outer, outer, all,outer,outer],
    i: [all, middle, middle, middle, all],
    j: [right, right, right,right, left2],
    k: [outer,outer,left2,outer,outer],
    l: [left,left,left,left,all],
    m: [[...all,1,1], [...outer,0,1],[...outer,0,1],[...outer,0,1],[...outer,0,1]],
    n: [left2, outer,outer,outer,outer],
    o: [middle, outer,outer,outer,middle],
    p: [left2, outer,left2, left, left],
    q: [middle,outer,outer,outer,right2],
    r: [left2,outer,left2,outer,outer],
    s: [all, left,all,right,all],
    t: [all,middle,middle,middle,middle],
    u: [outer,outer,outer,outer,all],
    v: [outer,outer,outer,outer,middle],
    w: [[...outer,0,1],[...outer,0,1],[...outer,0,1],[...outer,0,1],[...all,1,1]],
    x: [outer,outer,middle,outer,outer],
    y: [outer,outer,middle,middle,middle],
    z: [all, right,middle,left,all],
    32: [space],
    1: [middle,left2,middle,middle,all],
    2: [all,right,all,left,all],
    3: [all,right,all,right,all],
    4: [outer,outer,all,right,right],
    5: [all,left,left2,right,all],
    6: [left,left,all,outer,all],
    7: [all,right,right,right,right],
    8: [all,outer,all,outer,all],
    9: [all,outer,all,right,right],
    0: [all,outer,outer,outer,all],
    ';': [[0,0], [0,1], [0,0], [0,1], [1,0]],
    ':': [[0], [0,1], [0], [0,1], [0]],
    ',': [[0,0], [0,0], [0,0], [0,1], [1,0]],
    '.': [[0], [0], [0], [0], [1]],
}

const setSize = () => {
    const { rows, cols } = selectors();
    const colSize = parseInt(cols.value);
    const rowSize = parseInt(rows.value);

    localStorage.setItem('size', JSON.stringify({width: colSize, height: rowSize}));
    showBoard({ width: colSize, height: rowSize });
}

const getSize = () => {
    const size = JSON.parse(localStorage.getItem('size'));

    if(size && size.width && size.height) return size;
    return null;
}

const changeColor = e => {
    const { color } = selectors();
    const hex = color.value.substring(1);
    const red = parseInt(hex.substring(0,2), 16);
    const green = parseInt(hex.substring(2,4), 16);
    const blue = parseInt(hex.substring(4), 16);
    const data = e.target.dataset;
    const [ledR, ledG, ledB] = matrix[data.led-1];
    if(ledR === red && ledG === green && ledB === blue){
        e.target.style = `background-color: rgb(255, 255, 255)`;
    } else e.target.style = `background-color: rgb(${red}, ${green}, ${blue})`;
    data.red = red;
    data.blue = blue;
    data.green = green;
    updateMatrix({[data.led]: [red,green,blue]});
}

const showBoard = ({ height, width }) => {
    const { boardWrapper, board, size, keyboard } = selectors();
    size.classList.add('d-none');
    board.style = `grid-template-columns: repeat(${width}, 1fr); grid-template-rows: repeat(${height}, 1fr);`;

    for(let i = 1,row = 1; i <= height*width; i++){
        const col = i%width || width;
        if(col === 1 && i > 1) row++;
        const filament = document.createElement('div');
        const bulb = document.createElement('div');
        bulb.style = `grid-column: ${col}/${col+1}; grid-row: ${row}/${row+1}`;
        filament.classList.add('led');
        filament.addEventListener('click', changeColor);
        filament.dataset.led = i;
        bulb.classList.add('d-flex', 'justify-content-center');
        bulb.dataset.num = i-1;
        bulb.append(filament);
        board.append(bulb);
        matrix.push([255,255,255]);
    }

    boardWrapper.classList.remove('d-none');
    boardWrapper.classList.add('d-flex');
    keyboard.focus();
}

const resetBoard = () => {
    const { board } = selectors();
    board.innerHTML = '';
    showBoard(JSON.parse(localStorage.getItem('size')));
}

const updateMatrix = ({letter, undo, ...rest}) => {
     if(letter){
        letter = letter.split('').pop();
        const l = letter !== ' ' ? letters[letter.toLowerCase()] : letters['32'];
        const width = l[0].length;
        const size = getSize();
        const dots = wordsDisplayed.totalDots;
        const numCols = dots.length;
        if(numCols === 0){
            dots.push(1);
        }

        let curCol = dots[dots.length-1];

        if(curCol + width === size.width && letter !== ' '){
            dots[dots.length-1] += width;
        } else if(curCol + width < size.width){
            dots[dots.length-1] += width+1;
        } else {
            dots.push(1+width);
            curCol = 1;
        }

        l.forEach((row, ri) =>
            row.forEach((b, ci) =>
                b && document.querySelector(`[data-led="${((dots.length-1)*5+(dots.length === 1 ? ri : ri+dots.length-1))*64+(curCol+ci%64)}"]`).click()
        ));

        wordsDisplayed.letters.push(letter);
    } else if(undo !== undefined){
        const l = undo !== ' ' ? letters[undo.toLowerCase()] : letters['32'];
        const curRow = (wordsDisplayed.totalDots.length-1)*5;
        const dots = wordsDisplayed.totalDots[wordsDisplayed.totalDots.length-1]-1-l[0].length;
        l.forEach((row, ri) =>
            row.forEach((b, ci) =>
                b && document.querySelector(`[data-led="${(curRow+(wordsDisplayed.totalDots.length === 1 ? ri : ri+1))*64+(dots+ci%64)}"]`).click()
        ));
        wordsDisplayed.totalDots[wordsDisplayed.totalDots.length-1] -= l[0].length+1;
        wordsDisplayed.letters.pop();
    } else {
        Object.entries(rest).forEach(([k,colors]) => matrix[k-1] = colors);
    }
}

const display = e => {
    const toDisplay = e.target.value;
    const dots = wordsDisplayed.totalDots;
    const numCols = dots.length;
    const size = getSize();
    const next = toDisplay.substring(toDisplay.length-1);

    if(toDisplay === '' && wordsDisplayed.letters.length > 0){
        wordsDisplayed.letters.splice(0);
        wordsDisplayed.totalDots.splice(0);
        selectors().board.innerHTML = '';
        showBoard(getSize());
    } else if((toDisplay && numCols*5 + numCols + 5 > size.height) || (next !== ' ' && letters[next] === undefined)){
        e.target.value = toDisplay.substring(0,toDisplay.length-1);
    } else {
        const newLetter = {};
        if(debounce > toDisplay.length) newLetter.undo = wordsDisplayed.letters[wordsDisplayed.letters.length-1];
        else newLetter.letter = toDisplay;
        updateMatrix(newLetter);
        debounce = toDisplay.length
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const { reset, submitSize, keyboard } = selectors();
    submitSize.addEventListener('click', setSize);
    reset.addEventListener('click', resetBoard);
    keyboard.addEventListener('input', display);
    const sizeSet = getSize();
    if(sizeSet) showBoard(sizeSet);
});
