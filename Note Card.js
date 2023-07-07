const print = printValue => {console.log(printValue);};
const QUESTIONS_ANSWERS_FILE = './Test Data.txt';
const TEST_QUESTIONS = [];

const ANSWERS = document.getElementById('answerFieldset').getElementsByClassName('answerLbl');
const ANSWERS_INPUT = document.getElementById('answerFieldset').getElementsByClassName('answerInput');
const ANSWERS_DIV = document.getElementById('answersDiv');

let questionIndex = 0;
let testSubmitted = false;

let rawData = undefined;


//Reads test data from user uploaded file
/*document.getElementById('testInput').addEventListener("change", (event) => {
  for (let file of event.target.files) {
    read(file);
  }
});*/


document.getElementById('testInput').onchange = () =>{
    document.getElementById('beginTestBtn').disabled = document.getElementById("testInput").value.length > 0 ? false : true;
    for (let file of event.target.files) {
        read(file);
    }
};


let answerLabels = document.getElementById('answerFieldset').getElementsByClassName('answerLbl');
for(let x = 0; x < answerLabels.length; x++){
    answerLabels[x].onclick = () =>{
        TEST_QUESTIONS[questionIndex].selectedAnswer = answerLabels[x].value;
    }
}


//Submit answers for checking
document.getElementById("submitBtn").onclick = () =>{
    testSubmitted = true;
    question = TEST_QUESTIONS[questionIndex];
    
    for(let x = 0; x < question.answers.length; x++)
        ANSWERS_INPUT[x].disabled = true;
        
    questionIndex = 0;
    questionLoader(TEST_QUESTIONS[questionIndex]);
    document.getElementById('submitBtn').disabled = true;
};


//Submit answers for checking
document.getElementById("beginTestBtn").onclick = () =>{
    document.getElementById('prevBtn').disabled = false;
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('submitBtn').disabled = false;
    
    testSubmitted = false;
    questionIndex = 0;
    //for(let x = 0; x < TEST_QUESTIONS[questionIndex].answers.length; x++)
    //    ANSWERS_INPUT[x].disabled = false;
        
    for(let x = 0; x < TEST_QUESTIONS.length; x++)
        TEST_QUESTIONS[x].selectedAnswer = '';
        
    questionLoader(TEST_QUESTIONS[questionIndex]);
};


document.getElementById("prevBtn").onclick = () =>{
    questionIndex = questionIndex > 0 ? questionIndex-1 : TEST_QUESTIONS.length-1;
    questionLoader(TEST_QUESTIONS[questionIndex]);
};


document.getElementById("nextBtn").onclick = () =>{
    questionIndex = questionIndex < TEST_QUESTIONS.length-1 ? questionIndex+1 : 0;
    questionLoader(TEST_QUESTIONS[questionIndex]);
};


//Set current test question and answers on HTML
function loadQuestion(question){
    const QUESTION = document.getElementById('questionTextField').innerHTML = question.question;
    
    //set answers for checkbox text and select previously selected answer
    for(let x = 0; x < question.answers.length; x++){
        let isSelected = question.answers[x] == question.selectedAnswer;
        let correctChoice = question.answers[x] == question.correctAnswer;
        
        if(ANSWERS[x].lastChild.data == undefined)
            ANSWERS[x].innerHTML += `[${question.answers[x]}]`;
        else
            ANSWERS[x].lastChild.data = `[${question.answers[x]}]`;
        
        ANSWERS[x].value = question.answers[x];
        
        //check the input box if user selected this question
        ANSWERS_INPUT[x].checked = question.answers[x] == question.selectedAnswer ? true : false;
        
        ANSWERS[x].classList.remove('correctAnswer');
        ANSWERS[x].classList.remove('wrongAnswer');
        
        if(testSubmitted && correctChoice)
            ANSWERS[x].classList.add('correctAnswer');
        else if(testSubmitted && isSelected && !correctChoice)
            ANSWERS[x].classList.add('wrongAnswer');
        
    }
}


//https://stackoverflow.com/questions/16505333/get-the-data-of-uploaded-file-in-javascript
//Reads test data from user uploaded file and splits the test data in arrays containing objects with question data.
async function read(file) {
    rawData = await file.text();
    
    let questions = rawData.split('[Q]');
    for(let x = 0; x < questions.length; x++){
        let lines = questions[x].split(`\n`);
        if(lines.length < 2)
            continue;
        lines = lines.filter(val => val);
        let newQuestion = {
            type: lines.shift(),
            question : lines.shift(),
            answers : lines,
            correctAnswer : lines[0],
            selectedAnswer : ''
        };
        
        TEST_QUESTIONS.push(newQuestion);
    }
        
    return file.text();
}



function questionLoader(question){
    const QUESTION = document.getElementById('questionTextField').innerHTML = question.question;
    
    ANSWERS_DIV.replaceChildren([]);
    
    //set answers for checkbox text and select previously selected answer
    for(let x = 0; x < question.answers.length; x++){
        let isSelected = question.answers[x] == question.selectedAnswer;
        let correctChoice = question.answers[x] == question.correctAnswer;
        addRadioQuestion(x, question.answers[x], isSelected, correctChoice);
    }
}


function addRadioQuestion(index, answer, isSelected, correctChoice){
    let newInput = document.createElement("input");
    let answerContainer = document.createElement('div');
    let newLbl = document.createElement("label");
    
    ANSWERS_DIV.appendChild(answerContainer);
    
    newInput.classList.add('answerInput');
    newInput.id = 'answer'+index;
    newInput.setAttribute('type', 'radio');
    newInput.setAttribute('name', 'answerRadio');
    newInput.setAttribute('value', answer);
    newInput.setAttribute('flex', '1');
    newInput.setAttribute('flex-basis', '50%');
    if(testSubmitted && correctChoice)
        newInput.classList.add('correctAnswer');
    else if(testSubmitted && isSelected && !correctChoice)
        newInput.classList.add('wrongAnswer');
    newInput.checked = isSelected ? true : false;
    newInput.disabled = true;
    answerContainer.appendChild(newInput);

    newLbl.classList.add('answerLbl');
    newLbl.setAttribute('for', 'answer'+index);
    newLbl.setAttribute('flex', '1');
    newLbl.setAttribute('flex-basis', '50%');
    newLbl.textContent = answer;
    answerContainer.appendChild(newLbl);
}



let testFS = document.getElementById('testFieldSet');

let testElement = document.createElement("input");
testElement.classList.add('answerInput');
testElement.id = 'input1';
testElement.setAttribute('type', 'radio');
testElement.setAttribute('name', 'answerInput');
testElement.setAttribute('value', 'answer1');
testElement.disabled = false;
testFS.appendChild(testElement);

let testLbl = document.createElement("label");
testLbl.classList.add('answerLbl');
testLbl.setAttribute('for', 'input1');
testLbl.textContent = 'Test Label';
testFS.appendChild(testLbl);
