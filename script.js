class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        // State variables for new features
        this.angleMode = 'Rad'; // 'Rad' or 'Deg'
        this.isInverse = false; // Inverse toggle
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') {
            this.currentOperand = '0';
        }
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
    }
    
    appendParenthesis(paren) {
        if (this.currentOperand === '0' && this.previousOperand === '') {
            this.previousOperand = paren;
            this.currentOperand = '';
        } else if (this.currentOperand === '0') {
             this.previousOperand += paren;
        } else {
            this.previousOperand += this.currentOperand + paren;
            this.currentOperand = '0';
        }
    }
    
    chooseOperation(operation) {
        if (this.currentOperand === '' && this.previousOperand === '') return;
        if (this.currentOperand !== '0' || this.previousOperand.slice(-1) === ')') {
             this.previousOperand += this.currentOperand + operation;
             this.currentOperand = '0';
        } else { // Change operation
             this.previousOperand = this.previousOperand.slice(0, -1) + operation;
        }
    }

    // New methods for constants
    appendConstant(constant) {
        if (this.currentOperand !== '0') return; // Prevent 5e, should be 5*e
        switch(constant) {
            case 'π':
                this.currentOperand = Math.PI;
                break;
            case 'e':
                this.currentOperand = Math.E;
                break;
        }
    }
    
    // Updated method for all scientific operations
    chooseSciOperation(sciOperation) {
        const value = parseFloat(this.currentOperand);
        if (isNaN(value)) return;

        let result;

        // --- Angle Conversion for Trig ---
        // Convert to radians if in Degree mode, as Math functions use radians
        const angle = this.angleMode === 'Deg' ? value * (Math.PI / 180) : value;

        // --- Inverse Function Logic ---
        if (this.isInverse) {
            switch(sciOperation) {
                case 'sin': result = Math.asin(angle); break;
                case 'cos': result = Math.acos(angle); break;
                case 'tan': result = Math.atan(angle); break;
                default: break; // Other functions not affected by inverse
            }
        } else {
             switch(sciOperation) {
                case 'sin': result = Math.sin(angle); break;
                case 'cos': result = Math.cos(angle); break;
                case 'tan': result = Math.tan(angle); break;
                default: break;
            }
        }
        
        // If not a trig function, calculate here
        if (result === undefined) {
             switch(sciOperation) {
                case 'ln': result = Math.log(value); break;
                case 'log': result = Math.log10(value); break;
                case '!': result = this.factorial(value); break;
                case '%': result = value / 100; break;
                case '√': result = Math.sqrt(value); break;
            }
        }
        
        // For inverse trig, convert back to degrees if in Degree mode
        if (this.isInverse && ['sin','cos','tan'].includes(sciOperation) && this.angleMode === 'Deg') {
            result = result * (180 / Math.PI);
        }

        this.currentOperand = result;
    }
    
    factorial(n) {
        if (n < 0 || n % 1 !== 0) return 'Error'; // Factorial is for non-negative integers
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = n; i > 1; i--) {
            result *= i;
        }
        return result;
    }

    compute() {
        try {
            let expression = this.previousOperand + this.currentOperand;
            // Replace our display operators with JS-compatible ones
            expression = expression.replace(/×/g, '*')
                                 .replace(/÷/g, '/')
                                 .replace(/xʸ/g, '**');
            
            const result = eval(expression);
            this.currentOperand = result;
            this.previousOperand = '';
        } catch (e) {
            this.currentOperand = 'Error';
            this.previousOperand = '';
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.currentOperand;
        this.previousOperandTextElement.innerText = this.previousOperand;
    }
}


// --- DOM Element Selection ---
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const sciOperationButtons = document.querySelectorAll('[data-sci-operation]');
const constantButtons = document.querySelectorAll('[data-sci-constant]');
const toggleButtons = document.querySelectorAll('[data-sci-toggle]');
const parenthesisButtons = document.querySelectorAll('[data-parenthesis]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

// --- Event Listeners ---
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

allClearButton.addEventListener('click', button => {
    calculator.clear();
});

equalsButton.addEventListener('click', button => {
    calculator.compute();
    calculator.updateDisplay();
});

deleteButton.addEventListener('click', button => {
    calculator.delete();
    calculator.updateDisplay();
});

parenthesisButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendParenthesis(button.innerText);
        calculator.updateDisplay();
    });
});

constantButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendConstant(button.innerText);
        calculator.updateDisplay();
    });
});

sciOperationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseSciOperation(button.innerText);
        calculator.updateDisplay();
    });
});

// Logic for Toggle Buttons (Rad/Deg, Inv)
toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('toggle-active');
        if (button.id === 'rad-deg') {
            calculator.angleMode = calculator.angleMode === 'Rad' ? 'Deg' : 'Rad';
            button.innerText = calculator.angleMode;
        }
        if (button.id === 'inv') {
            calculator.isInverse = !calculator.isInverse;
            // Update trig button labels
            const trigButtons = document.querySelectorAll('[data-sci-operation]');
            trigButtons.forEach(tb => {
                if (['sin', 'cos', 'tan'].includes(tb.innerText.replace('⁻¹',''))) {
                    tb.innerText = calculator.isInverse ? tb.innerText + '⁻¹' : tb.innerText.replace('⁻¹','');
                }
            });
        }
    });
});
