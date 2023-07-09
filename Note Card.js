const print = printValue => {console.log(printValue)};
//Return random number from given range.
const randNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const TEST_QUESTIONS = [];
const MAX_ANSWER_LENGTH = 25;
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
let testing = false;


document.getElementById('prevBtn').disabled = true;
document.getElementById('nextBtn').disabled = true;
document.getElementById('submitBtn').disabled = true;
document.getElementById('beginTestBtn').disabled = true;


//Go to previous or next question using arrow keys
document.onkeydown = (e) =>{
    e = e || window.event;
    if (e.keyCode == '37' && TEST_QUESTIONS.length > 1 && (testing || testSubmitted)) {
        questionIndex = questionIndex > 0 ? questionIndex-1 : TEST_QUESTIONS.length-1;
        loadQuestion();
    }
    else if (e.keyCode == '39' && TEST_QUESTIONS.length > 1 && (testing || testSubmitted)) {
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
    testing = true;
    
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
            questionData = questionData.map(splitLongString);
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
            questionData = questionData.map(splitLongString);
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
                answers: questionData,
                correctAnswers : questionData,
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
}

//Create elements for displaying answers and display them.
function addAnswer(index, type){
    let question = TEST_QUESTIONS[questionIndex];
    let newInputBtn = document.createElement("input");
    let answerContainer = document.createElement('div');
    let correctChoice = false;
    let isSelected = false;
    let answer = TEST_QUESTIONS[questionIndex].answers[index];
    
    answerContainer.classList.add('answerContainer');
    ANSWERS_DIV.appendChild(answerContainer);
    
    ANSWERS_DIV.style.gridTemplateColumns = '1fr 1fr 1fr';
    
    newInputBtn.classList.add('answerInput');
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
        answerContainer.appendChild(newInputBtn);
        getMultCheckLabel(index, answer, correctChoice, type, answerContainer, question, isSelected);
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
        answerContainer.appendChild(newInputBtn);
        getMultCheckLabel(index, answer, correctChoice, type, answerContainer, question, isSelected);
    }else if(type == QUESTION_TYPES.FILL_IN_THE_BLANK && index == 0){
        newInputBtn.setAttribute('value', question.selectedAnswer);
        newInputBtn.onkeyup = (e) =>{question.selectedAnswer = newInputBtn.value;}
        //Highlight this answer green if the test has been submitted and this is the correct answer.
        correctChoice = question.correctAnswers.includes(newInputBtn.value);
        if(testSubmitted && correctChoice)
            newInputBtn.classList.add('fillInCorrect');
        //Highlight this answer red if the test has been submitted, this was the chosen answer, and it is incorrect.
        else if(testSubmitted && !correctChoice)
            newInputBtn.classList.add('fillInWrong');
        answerContainer.appendChild(newInputBtn);
        if(testSubmitted){
            //Display all correct answers if test is submitted
            for(let x = 0; x < question.correctAnswers.length; x++){
                let newLabel = document.createElement("label");
                newLabel.classList.add('answerLbl');
                newLabel.setAttribute('value', question.correctAnswers[x]);
                newLabel.textContent = question.correctAnswers[x];
                answerContainer.appendChild(newLabel);
            }
        }
    }
    newInputBtn.disabled = testSubmitted ? true : false;

}


function getMultCheckLabel(index, answer, correctChoice, type, answerContainer, question, isSelected){
    let newLabel = document.createElement("label");
    newLabel.classList.add('answerLbl');
    newLabel.setAttribute('for', 'answer'+index);
    newLabel.setAttribute('value', answer);
    
    
    //newLabel.style.fontSize = (answer.length <= 30 ? newLabel.style.fontSize : '12px');
    
    
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
}


function splitLongString(longString){
    let splitStr = longString.split(' ');
    let newStr = '';
    for(let x = 0; x < splitStr.length; x++){
        for(let y = MAX_ANSWER_LENGTH; y < splitStr[x].length; y+=MAX_ANSWER_LENGTH){
            newStr += splitStr[x].substring(y-MAX_ANSWER_LENGTH, y)+' ';
            if(y+MAX_ANSWER_LENGTH >= splitStr[x].length)
                newStr += splitStr[x].substring(y);
            else
                newStr += ' ';
        }
    }
    return newStr.length > 0 ? newStr : longString;
}
