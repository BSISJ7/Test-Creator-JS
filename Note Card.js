const print = printValue => {console.log(printValue)};
//Return random number from given range.
const randNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const TEST_QUESTIONS = [];
const ANSWERS_DIV = document.getElementById('answersDiv');
const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 'mult',
    CHECK_BOX: 'check',
    FILL_IN_THE_BLANK: 'fill'
}
Object.freeze(QUESTION_TYPES);

let questionIndex = 0; //Currently displayed question
let testSubmitted = false;
let shuffleQuestions = true;


//Go to previous or next question using arrow keys
document.onkeydown = (e) =>{
    e = e || window.event;
    if (e.keyCode == '37' && TEST_QUESTIONS.length > 1) {
        questionIndex = questionIndex > 0 ? questionIndex-1 : TEST_QUESTIONS.length-1;
        loadQuestion();
    }
    else if (e.keyCode == '39' && TEST_QUESTIONS.length > 1) {
        questionIndex = questionIndex < TEST_QUESTIONS.length-1 ? questionIndex+1 : 0;
        loadQuestion();
    }
};


document.getElementById('testInput').onchange = () =>{
    document.getElementById('beginTestBtn').disabled = document.getElementById("testInput").value.length > 0 ? false : true;
    for (let file of event.target.files) {read(file)}
};


//Set test to submitted state, display first question, correct and incorrect answers now marked.
document.getElementById("submitBtn").onclick = () =>{
    testSubmitted = true;
    question = TEST_QUESTIONS[questionIndex];
    
    questionIndex = 0;
    loadQuestion();
    document.getElementById('submitBtn').disabled = true;
};


//Submit answers for checking
document.getElementById("beginTestBtn").onclick = () =>{
    document.getElementById('prevBtn').disabled = false;
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('submitBtn').disabled = false;
    
    if(shuffleQuestions){randomizeQuestions()}
    
    for(let x = 0; x < TEST_QUESTIONS.length; x++){randomizeAnswers(x)}
    
    testSubmitted = false;
    questionIndex = 0;
    resetSelectedAnswers();
    loadQuestion();
};


//Go to previous question
document.getElementById("prevBtn").onclick = () =>{
    questionIndex = questionIndex > 0 ? questionIndex-1 : TEST_QUESTIONS.length-1;
    loadQuestion();
};


//Go to next question
document.getElementById("nextBtn").onclick = () =>{
    questionIndex = questionIndex < TEST_QUESTIONS.length-1 ? questionIndex+1 : 0;
    loadQuestion();
};


function resetSelectedAnswers(){
    for(let x = 0; x < TEST_QUESTIONS.length; x++){
        if(TEST_QUESTIONS[x].type === QUESTION_TYPES.MULTIPLE_CHOICE)
            TEST_QUESTIONS[x].selectedAnswer = '';
        else if(TEST_QUESTIONS[x].type === QUESTION_TYPES.CHECK_BOX){
            TEST_QUESTIONS[x].selectedAnswers = [];
        }
        else if(TEST_QUESTIONS[x].type === QUESTION_TYPES.FILL_IN_THE_BLANK){
            TEST_QUESTIONS[x].selectedAnswer = '';
        }
    }
}


//https://stackoverflow.com/questions/16505333/get-the-data-of-uploaded-file-in-javascript
//Reads test data from user uploaded file and splits the data into a test array consisting of an array of question objects.
async function read(file) {
    let data = await file.text();
    let questions = data.split('[Q]'); //Split up data for each question into arrays.
    
    //Take the question data and put it into a question object
    for(let x = 0; x < questions.length; x++){
        //Split data based on new lines since each line contains different data and remove empty values.
        let questionData = questions[x].split(`\n`).filter(val => val);
        
        //If the question is missing too much information skip it.
        if(questionData.length < 3){continue}
            
        let questionType = questionData.shift();
        let questionText = questionData.shift()
        
        if(questionType == QUESTION_TYPES.MULTIPLE_CHOICE){
            let newQuestion = {
                type: questionType,
                questionText : questionText,
                answers : questionData,
                correctAnswer : questionData[0],
                selectedAnswer : ''
            };
            TEST_QUESTIONS.push(newQuestion);
        }else if(questionType == QUESTION_TYPES.CHECK_BOX){
            let correctAnswers = [];
            let allAnswers = [];
            
            //Remove `[C]` from correct answers and append the correct and extra answers
            //to their respective arrays.
            for(let x = 0; x < questionData.length; x++){
                if(questionData[x].includes(`[C]`)){
                    questionData[x] = questionData[x].replace(`[C]`, ``);
                    correctAnswers.push(questionData[x]);
                }
                allAnswers.push(questionData[x]);
            }
            let newQuestion = {
                type: questionType,
                questionText : questionText,
                answers : allAnswers,
                correctAnswers : correctAnswers,
                selectedAnswers : []
            };
            TEST_QUESTIONS.push(newQuestion);
        }else if(questionType == QUESTION_TYPES.FILL_IN_THE_BLANK){
            let correctAnswer = questionData;
            let newQuestion = {
                type: questionType,
                questionText : questionText,
                answers: correctAnswer,
                correctAnswer : correctAnswer,
                selectedAnswer : ''
            };
            TEST_QUESTIONS.push(newQuestion);
        }
    }
    return file.text();
}


//Shuffle questions.
function randomizeQuestions(){
    for(let x = 0; x < TEST_QUESTIONS.length-1; x++){
        let randLoc = randNum(x+1, TEST_QUESTIONS.length-1);
        let temp = TEST_QUESTIONS[randLoc];
        TEST_QUESTIONS[randLoc] = TEST_QUESTIONS[x];
        TEST_QUESTIONS[x] = temp;
    }
}


//Shuffle answers.
function randomizeAnswers(index){
    let answers = TEST_QUESTIONS[index].answers;
    for(let x = 0; x < answers.length-1; x++){
        let randLoc = randNum(x+1, answers.length-1);
        let temp = answers[randLoc];
        answers[randLoc] = answers[x];
        answers[x] = temp;
    }
}

//Add question and answers to HTML page 
function loadQuestion(){
    let question = TEST_QUESTIONS[questionIndex];
    document.getElementById('questionTextField').innerHTML = question.questionText;
    
    //Clear out old answers.
    ANSWERS_DIV.replaceChildren([]);
    
    //Display question answers
    for(let x = 0; x < question.answers.length; x++){addAnswer(x, question.type)}
    
    //Set answer container height based on number of questions
    ANSWERS_DIV.style.height = question.answers.length * 10 + 'px';
}

//Create elements for displaying answers and display them.
function addAnswer(index, type){
    let question = TEST_QUESTIONS[questionIndex];
    let newInputBtn = document.createElement("input");
    let newLabel = document.createElement("label");
    let answerContainer = document.createElement('div');
    let correctChoice = false;
    let isSelected = false;
    let answer = TEST_QUESTIONS[questionIndex].answers[index];
    
    ANSWERS_DIV.appendChild(answerContainer);
    
    newInputBtn.classList.add('answerInput');
    newInputBtn.setAttribute('flex', '1');
    newInputBtn.setAttribute('flex-basis', '50%');
    //Update the selected answer for the question.
    if(type == QUESTION_TYPES.MULTIPLE_CHOICE){
        newInputBtn.id = 'answer'+index;
        newInputBtn.setAttribute('value', answer);
        newInputBtn.setAttribute('name', 'answerRadio');
        newInputBtn.setAttribute('type', 'radio');
        newInputBtn.onclick = () =>{question.selectedAnswer = newInputBtn.value}
        isSelected = question.selectedAnswer === newInputBtn.value ? true : false;
        newInputBtn.checked = isSelected;
        correctChoice = question.correctAnswer === newInputBtn.value;
    }else if(type == QUESTION_TYPES.CHECK_BOX){
        newInputBtn.id = 'answer'+index;
        newInputBtn.setAttribute('value', answer);
        newInputBtn.setAttribute('name', 'answerCheckbox');
        newInputBtn.setAttribute('type', 'checkbox');
        newInputBtn.onclick = () =>{
            selectedAnswers = question.selectedAnswers;
            if(newInputBtn.checked)
                question.selectedAnswers.push(newInputBtn.value);
            else
                question.selectedAnswers = question.selectedAnswers
                    .filter(val => !val.includes(newInputBtn.value));
        };
        isSelected = question.selectedAnswers.includes(newInputBtn.value) ? true : false;
        newInputBtn.checked = isSelected;
        correctChoice = question.correctAnswers.includes(newInputBtn.value);
    }else if(type == QUESTION_TYPES.FILL_IN_THE_BLANK){
        newInputBtn.setAttribute('value', question.selectedAnswer);
        newInputBtn.onkeyup = (e) =>{question.selectedAnswer = newInputBtn.value;}
        //Highlight this answer green if the test has been submitted and this is the correct answer.
        correctChoice = question.correctAnswer == newInputBtn.value;
        if(testSubmitted && correctChoice)
            newInputBtn.classList.add('fillInCorrect');
        //Highlight this answer red if the test has been submitted, this was the chosen answer, and it is incorrect.
        else if(testSubmitted && !correctChoice)
            newInputBtn.classList.add('fillInWrong');
    }
    newInputBtn.disabled = testSubmitted ? true : false;
    answerContainer.appendChild(newInputBtn);

    if(type == QUESTION_TYPES.CHECK_BOX || type == QUESTION_TYPES.MULTIPLE_CHOICE){
        newLabel.classList.add('answerLbl');
        newLabel.setAttribute('for', 'answer'+index);
        newLabel.setAttribute('value', answer);
        //Update the selected answer for the question.
        newLabel.onclick = () =>{question.selectedAnswer = newLabel.textContent}
        //Highlight this answer green if the test has been submitted and this is the correct answer.
        if(testSubmitted && correctChoice)
            newLabel.classList.add('correctAnswer');
        //Highlight this answer red if the test has been submitted, this was the chosen answer, and it is incorrect.
        else if(testSubmitted && isSelected && !correctChoice)
            newLabel.classList.add('wrongAnswer');
        newLabel.textContent = answer;
        answerContainer.appendChild(newLabel);
    }else if(testSubmitted && type == QUESTION_TYPES.FILL_IN_THE_BLANK && !correctChoice){
        newLabel.classList.add('answerLbl');
        newLabel.setAttribute('value', question.correctAnswer);
        newLabel.textContent = question.correctAnswer;
        answerContainer.appendChild(newLabel);
    }
}


//////////////////////////////////////////////////////////////////////////
////////////////////        Element Testing             //////////////////
//////////////////////////////////////////////////////////////////////////
let testFS = document.getElementById('testFieldSet');

let testElement = document.createElement("input");
testElement.classList.add('answerInput');
testElement.id = 'input1';
testElement.setAttribute('type', 'checkbox');
testElement.setAttribute('name', 'answerInput');
testElement.setAttribute('value', 'answer1');
testElement.disabled = false;
testFS.appendChild(testElement);

let testLbl = document.createElement("label");
testLbl.classList.add('answerLbl');
testLbl.setAttribute('for', 'input1');
testLbl.textContent = 'Test Label';
testFS.appendChild(testLbl);
