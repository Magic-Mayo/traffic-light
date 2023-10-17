const selectors = () => ({
    cols: document.querySelector('#num-cols'),
    rows: document.querySelector('#num-rows'),
    submitSize: document.querySelector('.set-size'),
    size: document.querySelector('.size-form'),
    boardWrapper: document.querySelector('.board-wrapper'),
    board: document.querySelector('.lights'),
    pallette: document.querySelector('.pallette'),
    colors: document.querySelectorAll('.color'),
    reset: document.querySelector('.reset'),
    keyboard: document.querySelector('.keyboard')
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

const letters = {
    a: [middle, outer, all, outer, outer],
    b: [left2, outer, left2, outer, left2],
    c: [right2, left,left,left,right2],
    d: [left2,outer,outer,outer,left2],
    e: [all,left,left2,left,all],
    f: [all, left, left2, left, left],
    g: [right2, left, outer, outer, middle],
    h: [outer, outer, middle,outer,outer],
    i: [all, middle, middle, middle, all],
    j: [right, right, right,right, left2],
    k: [outer,outer,left2,outer,outer],
    l: [left,left,left,left,all],
    m: [[...left2].push(0,1), [...outer].push(0,1),[...outer].push(0,1),[...outer].push(0,1),[...outer].push(0,1)],
    n: [left2, outer,outer,outer,outer],
    o: [middle, outer,outer,outer,middle],
    p: [left2, outer,left2, left, left],
    q: [middle,outer,outer,outer,right2],
    r: [left2,outer,left2,outer,outer],
    s: [right2, left,middle,right,left2],
    t: [all,middle,middle,middle,middle],
    u: [outer,outer,outer,outer,all],
    v: [outer,outer,outer,outer,middle],
    x: [outer,outer,middle,outer,outer],
    y: [outer,outer,middle,middle,middle],
    z: [all, right,middle,left,all]
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
    const { colors: [{value: red}, {value: green}, {value: blue}] } = selectors();
    const data = e.target.dataset;
    if(data.red === red && data.blue === blue && data.green === green){
        e.target.style = `background-color: rgb(255, 255, 255)`;
    } else e.target.style = `background-color: rgb(${red}, ${green}, ${blue})`;
    data.red = red;
    data.blue = blue;
    data.green = green;
    updateMatrix({[data.led]: [red,green,blue]});
}

const changePallette = () => {
    const { pallette, colors: [{value: red}, {value: green}, {value: blue}] } = selectors();
    pallette.style = `background-color: rgb(${parseInt(red)}, ${parseInt(green)}, ${parseInt(blue)})`;
}

const showBoard = ({ height, width }) => {
    const { boardWrapper, board, size } = selectors();
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
}

const resetBoard = () => {
    const { board } = selectors();
    board.innerHTML = '';
    showBoard(JSON.parse(localStorage.getItem('size')));
}

const updateMatrix = ({letter, ...rest}) => {
    if(letter){
        const l = letters[letter.toLowerCase()];
        const width = l[0].length;
        const size = getSize();
        const curCol = wordsDisplayed.totalDots[wordsDisplayed.totalDots.length-1];

        if(curCol.length + width < size.width){
            curCol.push(l)
            wordsDisplayed.letters.push(letter);
        }
    } else {
        Object.entries(rest).forEach(([k,colors]) => matrix[k] = colors);
    }
}

const display = e => {
    const toDisplay = e.target.value;

    clearTimeout(debounce);
    debounce = setTimeout(() => updateMatrix({letter: toDisplay}), 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    const { reset, submitSize, keyboard, colors } = selectors();
    submitSize.addEventListener('click', setSize);
    reset.addEventListener('click', resetBoard);
    colors.forEach(el => el.addEventListener('change', changePallette));
    keyboard.addEventListener('change', display)
    const sizeSet = getSize();
    if(sizeSet) showBoard(sizeSet);
});