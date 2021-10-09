// Находим строку ввода
const calcStr = document.querySelector(".main__field");

/* Создаём вспомогательные переменные:
        calcArr - массив токенов
        last    - последний введённый токен
        num     - переменная, которая будет хранить последнее введённое число 
                (для корректного ввода точки - разделителя целой и дроб. части) */
let calcArr = [];
let last = "", num = "";

/* Создаём другие переменные:
        binaryTokens - объект, который в качестве ключей хранить бинарные операции
                     а в качестве значений - приоритеты данных бинарных операций 
        prefixTokens - массив префиксных токенов
        constants    - объект констант */
const binaryTokens = {"+": 1, "-": 1, "×": 2, "÷": 2, "^": 3};
const prefixTokens = ["sin", "cos", "tg", "lg₁₀", "lg₂", "ln", "√"];
const constants = {"π": Math.PI, "e": Math.E};

// Массив запретных токенов (см. функцию inputValue)
const firstErrorTokens = ["+", "×", "÷", "^", ")"];

// Функция ввода токена
function inputValue(arg) {

    /* Если входной токен - "C", то очистить всё: строку поля ввода,
       массив поля ввода, переменную num, last */
    if (arg === "C") {
        calcStr.value = "";
        calcArr = [];
        num = last = "";
        return;
    }

    /* Если входной токен - "←" 
       Запустить функцию удаления одного символа */
    if (arg === "←") {
        deleteOneSymbol();
        return;
    }

    /* Проверки на корректность ввода
    
       Проверка №1: длина строки поля ввода равна нулю или последний токен - префикс. функция
                    входной токен - среди токенов firstErrorTokens */
    if ((calcStr.value.length === 0 || prefixTokens.includes(last)) && firstErrorTokens.includes(arg)) {
        return;
    }

    /* Проверка №2: последний элемент поля ввода - минус
                    входной токен - среди токенов secondErrorTokens или минус */
    if (last === "-" && (firstErrorTokens.includes(arg) || arg === last)) {
        return;
    }

    /* Проверка №3: переменная num не пустая или последний элемент - константа
                    входной токен - константа */
    if ((num !== "" || constants[last]) && constants[arg]) {
        return;
    }

    /* Проверка №4: последний токен поля ввода - константа
                    входной токен - число или точка */
    if (constants[last] && (isFinite(arg) || arg === ".")) {
        return;
    }

    /* Проверка №5: входной токен - точка
                    переменная num - пустая или содержит точку*/
    if ((num.includes(".") || num === "") && arg === ".") {
        return;
    }

    /* Если входной токен - число или точка
       Запустить функцию ввода цифра */
    if (isFinite(arg) || arg === ".") {
        inputDigit(arg);
        return;
    } 
    else {
        num = "";
    }

    /* Если входной и последний токены - бинарные токены
       то заменить последний токен на входной */
    if (binaryTokens[last] && binaryTokens[arg]) {
        calcStr.value = calcStr.value.slice(0, calcStr.value.length - 1);
        calcArr.pop();
    }

    /* В случае, если проверки пройдены, и входной токен - не число
       то добавить входной токен к строке поля ввода и в массив поля ввода */
    calcStr.value += arg;
    calcArr.push(arg);
    last = arg;
}

// Функция ввода цифры
function inputDigit(arg) {
    
    /* Прибавляем к num цифру
       В переменную index кладём длину массива поля ввода */
    num += arg;
    let index = calcArr.length;

    /* Если длина переменной равна единице, это значит
       было введено новое число. И если длина num равна единице, 
       то добавляем новый элемент num в массив поля ввода 
       Иначе заменяем последний элемент массива поля ввода на num */
    if (num.length !== 1) {
        index--;
    }

    calcArr[index] = num;
    calcStr.value += arg;
    last = arg;

}

// Функция удаления одного символа
function deleteOneSymbol() {
    
    // Если длина массива равна нулю, ничего не делаем
    if (calcArr.length == 0) {
        return;
    }

    // Изначально создаём переменную length равную единице
    let length = 1;
    
    /* Если последний элемент массива поля ввода - не число 
       то в length кладём длину последнего токена массива и удаляем последний элемент */
    if (isNaN(calcArr[calcArr.length - 1])) {
        length = calcArr[calcArr.length - 1].length;
        calcArr.pop();
    }

    /* Иначе берём последний токен массива
       Преобразовываем его в строку
       Записываем его без последнего символа в num
       И заменяем последний токен массива на переменную num 
       Затем проверяем, не является ли последний токен массива пустой строкой
       Если является, то удаляем последний токен */
    else {
        num = String(calcArr[calcArr.length - 1]).slice(0, String(calcArr[calcArr.length - 1]).length - length);
        calcArr[calcArr.length - 1] = num;
        if (calcArr[calcArr.length - 1] === "") {
            calcArr.pop();
        }
    }

    // Удаляем последний токен строки поля ввода
    calcStr.value = calcStr.value.slice(0, calcStr.value.length - length);

    /* Для корректной записи последнего элемента last проверим,
       не является ли последний элемент массива поля ввода оператором
       Если да, то в last записываем последний элемент массива поля ввода */
    if (isNaN(calcArr[calcArr.length - 1])) {
        last = calcArr[calcArr.length - 1];
    }

    /* Иначе перезаписываем переменную num: в неё кладём
       последний элемент массива, а в last кладём последний символ num */
    else {
        num = String(calcArr[calcArr.length - 1]);
        last = num[num.length - 1];
    }

}