const client = mqtt.connect('ws://192.168.50.91:8883');

const timerInput = document.querySelector("#timerInput");
const timerSpan = document.querySelector("#timerSpan");
const startStopButton = document.querySelector("#startStopButton");
const messageInput = document.querySelector("#messageInput");
const messageSpan = document.querySelector("#messageSpan");
const testTypeFieldset = document.querySelector("#testTypeFieldset");
const counterSpeedTestRadio = document.querySelector("#counterSpeedTestRadio");
const messageSpeedTestRadio = document.querySelector("#messageSpeedTestRadio");
const capacityTestRadio = document.querySelector("#capacityTestRadio");
const testTypeRadioButtons = [counterSpeedTestRadio, messageSpeedTestRadio, capacityTestRadio];

const skippedTable = document.querySelector("#skippedTable");
const totalSkippedId = document.querySelector("#totalSkippedTd");
const totalReceivedTd = document.querySelector("#totalReceivedTd");
const msgSizeTd = document.querySelector("#msgSizeTd");
const statusSpan = document.querySelector("#statusSpan");

const counterTestTopic = 'plc/counterTest';
const messageTestTopic = 'plc/messageTest';
const capacityTestTopic = 'plc/capacityTest';

let topicToSubscribe = counterTestTopic;
let isStarted = false;

startStopButton.addEventListener("click", () => {
    if(!isStarted){
        const receivedMessages = [];
        isStarted = true;
        statusSpan.textContent = "Measuring started";
        startStopButton.textContent = "Stop";
        startStopButton.style.backgroundColor = "red";

        if(capacityTestRadio.checked){
            const msgToPublish = messageInput.value;
            if(msgToPublish !== undefined && msgToPublish !== ""){
                messageSpan.textContent = msgToPublish.length + " chars";
                client.publish(capacityTestTopic, msgToPublish);
             }else
                messageSpan.textContent = "Please provide a message to be sent";
        }

        client.subscribe(topicToSubscribe);

        client.on("message", function (topic, payload) {
            receivedMessages.push(payload);
        });

        let time = parseInt(timerInput.value);
        if(!isNaN(time) && time > 0){
            startTimer(time);
            setTimeout(() => stopMeasuring(receivedMessages), time*1000);
        }

    } else{
        stopMeasuring();
    }
});

testTypeFieldset.addEventListener("click", ()=>{
    for(let i=0; i<testTypeRadioButtons.length; i++){
        if(testTypeRadioButtons[i].checked){
            switch (testTypeRadioButtons[i].id) {
                case "counterSpeedTestRadio":
                    topicToSubscribe = counterTestTopic;
                    break;
                case "messageSpeedTestRadio":
                    topicToSubscribe = messageTestTopic;
                    break;
                case "capacityTestRadio":
                    topicToSubscribe = capacityTestTopic + "/out";
                    break;
            }

            break;
        }
    }
});

function stopMeasuring(receivedMsgArr) {
    isStarted = false;
    startStopButton.textContent = "Start";
    startStopButton.style.backgroundColor = "green";
    statusSpan.textContent = "Measuring finished";

    totalReceivedTd.textContent = receivedMsgArr.length + "";

    client.unsubscribe(topicToSubscribe);

    let receivedMsgIntArr = uintArrToIntArr(receivedMsgArr);
    receivedMsgIntArr.sort(function(a, b) {
        return a - b;
    });

    if(counterSpeedTestRadio.checked){
        const skippedMessages = getSkippedMessages(receivedMsgArr);
        totalSkippedId.textContent = skippedMessages.length + "";
        showTestResults(skippedMessages);
    } else if(capacityTestRadio.checked){
        showTestResults(receivedMsgArr);
        msgSizeTd.textContent = receivedMsgArr[0].length + " bytes or " + receivedMsgArr[0].length*8 + " bits or " + receivedMsgArr[0].toString().length + " symbols";
    }

}

function showTestResults(resultToDisplayArr) {
    for(let i=0; i<resultToDisplayArr.length; i++){
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = resultToDisplayArr[i] + "";

        tr.appendChild(td);
        skippedTable.appendChild(tr);
    }
}

function startTimer(time) {
    const intervalId = setInterval(()=>{
        time--;
        timerSpan.textContent = time + " s";

        if(time < 1) {
            clearInterval(intervalId);
            timerSpan.textContent = "";
        }
    }, 1000);
}

function getSkippedMessages(sortedArr){
    const result = [];

    let correctValue = sortedArr[0];
    for(let i=0; i<sortedArr.length; i++){
        if(sortedArr[i] !== correctValue){
            for(let j=0; j<sortedArr[i]-correctValue; j++)
                result.push(correctValue+j);

            correctValue = sortedArr[i]+1;
        } else
            correctValue++;
    }

    return result;
}

function uintArrToIntArr(arr) {
    const result = [];
    for(let i=0; i<arr.length; i++)
        result[i] = parseInt(arr[i].toString());

    return result;
}