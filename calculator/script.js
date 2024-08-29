// 숫자번트을 가져온다
const numberButtons = document.querySelectorAll('.number');
// 모든 연산자 버튼을 가져온다
const operatorButtons = document.querySelectorAll('.operator');
// 등호 버튼을 가져온다
const equalsButton = document.getElementById('equals');
// 지우기 버튼과 전체 지우기 버튼을 가져온다
const clearButton = document.getElementById('clear');
const clearAllButton = document.getElementById('clearAll');
// 디스플레이 입력창을 가져온다
const display = document.getElementById('display');

// 숫자 버튼을 클릭했을 때 디스플레이에 숫자를 추가한다
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        display.value += button.textContent;
    });
});

// 연산자 버튼을 클릭했을 때 디스플레이에 연산자를 추가한다
operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        display.value += button.textContent;
    });
});

// 등호 버튼을 클릭했을 때 디스플레이에 있는 수식을 계산한다
equalsButton.addEventListener('click', () => {
    try {
        display.value = evaluateExpression(display.value);
    } catch (e) {
        display.value = 'Error';
    }
});

// 지우기 버튼과 전체 지우기 버튼을 클릭했을 때 디스플레이를 수정한다
clearButton.addEventListener('click', () => {
    display.value = display.value.slice(0, -1);
});

clearAllButton.addEventListener('click', () => {
    display.value = '';
});

// 수식을 계산하는 함수
function evaluateExpression(expression) {
    const sanitizedExpression = expression
        .replace(/[^0-9+\-*/().]/g, '');
    
    return new Function('return ' + sanitizedExpression)();
}
