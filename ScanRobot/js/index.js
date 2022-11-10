const client = mqtt.connect('ws://192.168.50.91:8883');

const topicInput = document.querySelector("#topicInput");
const startButton = document.querySelector("#startButton");
const stopButton = document.querySelector("#stopButton");
const totalSkippedId = document.querySelector("#totalSkippedTd");
const totalReceivedTd = document.querySelector("#totalReceivedTd");
const skippedTable = document.querySelector("#skippedTable");

let topicToSubscribe = "";
let receivedMessages = [];

startButton.addEventListener("click", () => {
    receivedMessages = [];
    topicToSubscribe = topicInput.value;
    client.subscribe(topicToSubscribe);

    client.on("message", function (topic, payload) {
        receivedMessages.push(payload);
    });
});

stopButton.addEventListener("click", () => {
    client.unsubscribe(topicToSubscribe);

    const receivedMsgIntArr = uintArrToIntArr(receivedMessages);
    receivedMsgIntArr.sort(function(a, b) {
        return a - b;
    });

    const skippedMessages = getSkippedMessages(receivedMsgIntArr);

    totalReceivedTd.textContent = receivedMsgIntArr.length + "";
    totalSkippedId.textContent = skippedMessages.length + "";
    for(let i=0; i<skippedMessages.length; i++){
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = skippedMessages[i] + "";

        tr.appendChild(td);
        skippedTable.appendChild(tr);
    }
});

function getSkippedMessages(sortedArr){
    const result = [];

    let correctValue = 1;
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