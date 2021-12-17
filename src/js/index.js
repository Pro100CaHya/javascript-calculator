// Находим строку ввода и поле вывода
const calcStr = document.querySelector(".main__field");
const output = document.querySelector(".main__output");

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

    output.value = "";

    if (arg === "=") {

        // Преобразовываем массив поля ввода
        let transArr = transformArr(calcArr);

        // Инфиксную запись превращаем в обратную польскую
        let resQueue = transformToReversePolishNotation(transArr);

        /* Если вместо обратной польской вернулось false
           То это значит, что скобки не согласованы */
        if (resQueue === false) {
            output.value = "Не согласованы скобки";
            return;
        }

        // Вычисляем обратную польскую
        let result = calcReversePolishNotation(resQueue);

        /* Если вместо результата выражения вернулось false
           Количество операторов и операндов не соответствует */
        if (result === false) {
            output.value = "Ошибка";
            return;
        }

        // Если всё прошло успешно, то вывести результат
        if (result.includes("Infinity")) {
            result = result.replace("Infinity", "ထ");
        }
        output.value = `Результат: ${result}`;
        localStorage.setItem(calcStr.value, result);
        return;
    }

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

// Функция преобразования массива
function transformArr(arg) {

    let arr = [];
    let index = 0;

    /* Если в начале массива встречается "-"
       то добавляем "0" перед массивом */
    if (arg[0] === "-") {
        arr.push("0", "-");
        index++;
    }

    for (index; index < arg.length; index++) {

        /* Если текущий элемент массива - "("
           а следующий - "-", то между ними вставляем "0" */
        if (arg[index] === "(" && arg[index + 1] === "-") {
            arr.push("(", "0", "-");
            index++;
            continue;
        }

        /* Если текущий элемент массива - число или константа
           а следующая - префиксная функция, то между ними вставляем "×" */
        if (prefixTokens.includes(arg[index]) && (isFinite(arr[arr.length - 1]) || constants[arr[arr.length - 1]])) {
            arr.push("×", arg[index]);
        }

        // Иначе просто добавляем текущий токен
        else {
            arr.push(arg[index]);
        }

    }

    return arr;

}

function transformToReversePolishNotation(arg) {

    // Создаём стек и очередь
    let stack = [];
    let queue = [];

    // Пока есть входной токен
    for (let token of arg) {
        
        // Если токен - число, кладём в очередь
        if (isFinite(token)) {
            queue.push(new Decimal(token));
            continue;
        }

        // Если токен - константа, кладём в очередь
        if (constants[token]) {
            queue.push(new Decimal(constants[token]));
            continue;
        }

        // Если токен - префиксная функция или открывающая скобка, кладём в стек
        if (prefixTokens.includes(token) || token === "(") {
            stack.push(token);
            continue;
        }

        // Если токен - ")", то
        if (token === ")") {

            // Если в стеке нет "(", то скобки не согласованы
            if (!stack.includes("(")) {
                return false;
            }
            
            /* Иначе пока на вершине стека - не "("
               Выталкиваем элементы стека в очередь */
            while (stack[stack.length - 1] !== "(") {
                queue.push(stack.pop());
            }

            // Саму открывающую скобку просто убираем из стека
            stack.pop();



            continue;
        }

        // Если входной токен - бинарная функция
        if (binaryTokens[token]) {

            /* Пока на вершине стека префиксная функция
               или операция на вершине стека приоритетнее входного токена
               выталкиваем элемент стека в очередь */
            while (prefixTokens.includes(stack[stack.length - 1]) || binaryTokens[stack[stack.length - 1]] >= binaryTokens[token]) {
                queue.push(stack.pop());
            }

            // Кладём токен в стек
            stack.push(token);
            continue;

        }
    }

    // Если в стеке есть "(", значит были не согласованы скобки
    if (stack.includes("(")) {

        return false;

    }
    
    // Выталкиваем элементы стека в очередь
    while (stack.length != 0) {

        queue.push(stack.pop());

    }

    // Возвращаем очередь
    return queue;
}

function calcReversePolishNotation(arg) {

    // Создаём переменную счётчик
    let index = 0;

    // Пока счётчик меньше длины массива токенов
    while (index < arg.length) {

        // Создаём обработчик ошибок
        try {

            // Если входной токен - оператор, то выполнить действие оператора
            switch (arg[index]) {
            
                case "+":
                    arg[index - 2] = arg[index - 2].plus(arg[index - 1]);
                    arg.splice(--index, 2);
                    break;
                case "-":
                    arg[index - 2] = arg[index - 2].minus(arg[index - 1]);
                    arg.splice(--index, 2);
                    break;
                case "×":
                    arg[index - 2] = arg[index - 2].times(arg[index - 1]);
                    arg.splice(--index, 2);
                    break;
                case "÷":
                    arg[index - 2] = arg[index - 2].dividedBy(arg[index - 1]);
                    arg.splice(--index, 2);
                    break;
                case "^":
                    arg[index - 2] = arg[index - 2].toPower(arg[index - 1]);
                    arg.splice(--index, 2);
                    break;
                case "√":
                    arg[index - 1] = arg[index - 1].squareRoot();
                    arg.splice(index, 1);
                    break;
                case "sin":
                    arg[index - 1] = arg[index - 1].times(Decimal
                                                                .acos(-1))
                                                                .dividedBy(180)
                                                                .sine()
                                                                .times(10000000000)
                                                                .round()
                                                                .dividedBy(10000000000);
                    arg.splice(index, 1);
                    break;
                case "cos":
                    arg[index - 1] = arg[index - 1].times(Decimal
                                                                .acos(-1))
                                                                .dividedBy(180)
                                                                .cosine()
                                                                .times(10000000000)
                                                                .round()
                                                                .dividedBy(10000000000);
                    console.log(arg[index - 1].valueOf());
                    arg.splice(index, 1);
                    break;
                case "tg":
                    let sin = arg[index - 1].times(Decimal
                                                            .acos(-1))
                                                            .dividedBy(180)
                                                            .sine()
                                                            .times(10000000000)
                                                            .round()
                                                            .dividedBy(10000000000);
                    
                    if (sin.valueOf() === "-0") {
                        sin = sin.times(-1);
                    }

                    let cos = arg[index - 1].times(Decimal
                                                            .acos(-1))
                                                            .dividedBy(180)
                                                            .cosine()
                                                            .times(10000000000)
                                                            .round()
                                                            .dividedBy(10000000000);
                                            
                    if (cos.valueOf() === "-0") {
                        cos = cos.times(-1);
                    }

                    arg[index - 1] = sin
                                          .dividedBy(cos)
                                          .times(10000000000)
                                          .round()
                                          .dividedBy(10000000000);

                    arg.splice(index, 1);
                    break;
                case "lg₂":
                    arg[index - 1] = arg[index - 1].log(2);
                    arg.splice(index, 1);
                    break;
                case "lg₁₀":
                    arg[index - 1] = arg[index - 1].log(10);
                    arg.splice(index, 1);
                    break;
                case "ln":
                    arg[index - 1] = arg[index - 1].log(constants.e);
                    arg.splice(index, 1);
                    break;

                // Иначе увеличиваем счётчик на 1
                default:
                    index++;
                    break;
                    
            }   
        } 
        
        /* Если произошла ошибка (ошибка может возникнуть из-за
            несоответствия операторов и операндов (например, было введено выражение
            "5 + "), то вернуть false) */
        catch (error) {

            return false;

        }

    }

    // Если длина массива не равна единице, то вернуть false
    if (arg.length !== 1) {
        return false;
    }

    // Результат округлить до 10 знаков после запятой
    let result = roundNum(arg[0]);
    return result;

}

// Функция округления результата
function roundNum(arg) {

    // В num кладём строковое представление числа
    let num = arg.toString();

    /* Если в num нет дробной части, или число представлено в виде
       экспоненциальной записи, то вернуть аргумент */
    if (!num.includes(".") || num.includes("e")) {
        return num;
    }

    // Делим число на целую и дробную часть
    let integerPart = num.slice(0, num.indexOf("."));
    let fractionalPart = num.slice(num.indexOf(".") + 1);

    // Отдельно будем хранить нули, которые идут сразу после запятой
    let zero = "";
    
    if (fractionalPart[0] === "0") {
        zero = String(fractionalPart.match(/^0+/gm));
    }

    // Дробную часть округляем до нужного количества знаков
    fractionalPart = String(Math.round(fractionalPart / (10 ** (fractionalPart.length - 10))));

    // Возвращаем Decimal число в виде суммы целой части, точки, нулей после запятой и дробной округлённой части
    num = String(integerPart + "." + zero + fractionalPart);

    return num;

}