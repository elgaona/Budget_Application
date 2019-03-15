
//BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        
        if(totalIncome > 0) {
            
            this.percentage = Math.round((this.value/totalIncome) * 100);
            
        } else {
            this.percentage = '---';
        }
        
    };
    
    Expense.prototype.getPercentage = function() {
        
        return this.percentage;
        
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            if(data.allItems[type].length > 0) {
               ID = data.allItems[type][data.allItems[type].length-1].id + 1; //Create new ID based on type exp or inc
            } else {
                ID = 0;
            }
            
            
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            data.allItems[type].push(newItem); //push to our data structure
            return newItem; //return the item to be able to access it from our other modules
        }, 
        
        deleteItem: function(type, id) {
            var ids, index;
            
            
            
            ids = data.allItems[type].map(function(current){
                
                return current.id;
                
            });  
            
            index = ids.indexOf(id);
            
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function() {
            
            
            //Calculate total income and expenses
            
            calculateTotal('exp');
            calculateTotal('inc');
            
            //Calculate the budget income - expenses.
            
            data.budget = data.totals.inc - data.totals.exp;
            
            //Calculate the percentage of income that we spend.
            
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            

        },
        
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        getPercentages: function() {
          
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
            
        }, 
        
        testing: function() {
            console.log(data);
        }
    };
    
})();








//USER INTERFACE CONTROLLER
var UIController = (function() {
    
    
    var DOMStrings = {
        inputType: '.add__type',
        descriptionType: '.add__description',
        valueType: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    };
    
        var formatNumber = function(num, type) {
            
            var numSplit, int, dec;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
            dec = numSplit[1];
            
            
            
            return ( type === 'exp' ? '-' :  '+') + ' ' + int + '.' + dec;
                
         }; 
    
    
        var nodeListForEach = function(list, callback) {
            for(var i = 0; i < list.length; i++) {
                    callback(list[i], i);
            }    
        }; 
        
    
    
    return {
        getInput: function() {
            
            return {
                type: document.querySelector(DOMStrings.inputType).value, //Will be inc or exp
                description: document.querySelector(DOMStrings.descriptionType).value,
                value: parseFloat(document.querySelector(DOMStrings.valueType).value)
            };
        },
        
        addListItem: function(obj, type) {
            var HTML, newHTML, element;
            //HTML string with placeholder text
            if(type === 'inc') { 
                element = DOMStrings.incomeContainer;
                HTML = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp') {
                element = DOMStrings.expensesContainer;
                HTML = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //Replace that text with some input data
            
            newHTML = HTML.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            
            //insert the html into the DOM
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
            
        },
        
        deleteListItem: function(selectorID) {
            
            var element = document.getElementById(selectorID)
            
            element.parentNode.removeChild(element)
        },
        
        clearFields: function() {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.descriptionType + ', ' + DOMStrings.valueType); 
            
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            
            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
            
        },
        
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMStrings.expPercLabel);
            
            
            nodeListForEach(fields, function(current, index){
                
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
                
                
            });
            
        },
        
        displayMonth: function() {
            var now, year, month;
            
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
            
            
            
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.descriptionType + ',' +
                DOMStrings.valueType);
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
            
            
        },

        getDOMstrings: function() {
            return DOMStrings;
        }
    }
    
    
})();







//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        
        
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13) {
                ctrlAddItem();
            
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
    };
    
    var updateBudget = function() {
                
        //1. Calculate the budget.
        
        var total = budgetCtrl.calculateBudget();
        
        //2. return the budget
        var budget = budgetCtrl.getBudget();
        //3. Display the budget in UI.
        
        UICtrl.displayBudget(budget);
    };
        
    var updatePercentages = function() {
        //1. Calculate the percentages
        
        budgetCtrl.calculatePercentages();
        
        //2. Read them from the budget controller
        
        var percentages = budgetCtrl.getPercentages();
        
        //3. Update the UI with the new percentages.
        
        UICtrl.displayPercentages(percentages);
        
    }
    
    

    var ctrlAddItem = function() {
        var input, newItem ;
        //We want to add the expense or income to the numbers of expense or income.
        //1. Get the field input data
        
        input = UICtrl.getInput();
        
        //2. Add the item to the budget controller
        
        if(input.description !== "" && !isNaN(input.value) && input.value !== 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            //3. Add a new item to the UI
            
            UICtrl.addListItem(newItem, input.type);
        
            //4. Clear Fields
        
            UICtrl.clearFields();
        
            //5. Calculate and update budget
        
            updateBudget();
            
            //6. Calculate the percentages
            
            updatePercentages();
            
            
        }
        
    };
    
    var ctrlDeleteItem = function(event) {
        
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1. Delete the item from the data structure
            
            budgetCtrl.deleteItem(type, ID);
            
            //2. Delete the item from the UI.
            
            UICtrl.deleteListItem(itemID);
            
            //3. Update and show the new budget
            
            updateBudget();
            
            //4. Calculate the percentages
            
            updatePercentages();
            
        }
        
    };
    
    
    return {
        init: function() {
            console.log('Started!');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
            UICtrl.displayMonth();
        }
    };
    
})(budgetController, UIController);


controller.init();