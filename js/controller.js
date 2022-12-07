const client = mqtt.connect('ws://192.168.50.91:8883');

const angleInput = document.querySelector("#angleInput");
const setAngleButton = document.querySelector("#setAngleButton");
const angleInputSpan = document.querySelector("#angleInputSpan");
const currentAngleSpan = document.querySelector("#currentAngleSpan");
const currentSpeedSpan = document.querySelector("#currentSpeedSpan");

const servoAngleTopic = "plc/servo/angle";
const servoSpeedTopic = "plc/servo/speed/out";

client.subscribe(servoAngleTopic + "/out");
client.subscribe(servoSpeedTopic);

setAngleButton.addEventListener("click", ()=>{
    angleInputSpan.textContent = "";

   const angleToSet = angleInput.value;
   if(angleToSet !== undefined && angleToSet !== ""){
        const angleInt = parseInt(angleToSet);
        if(angleInt < 0)
            angleInputSpan.textContent = "angle should be positive number(0-360)";
        else if(angleInt > 360)
            angleInputSpan.textContent = "angle should be less than 360(0-360)";
        else
            client.publish(servoAngleTopic, angleToSet);
   } else
       angleInputSpan.textContent = "please provide an angle(0-360)";
});

client.on("message", function (topic, payload){
    if(topic === (servoAngleTopic + "/out"))
        currentAngleSpan.textContent = payload.toString();

    if(topic === servoSpeedTopic)
        currentSpeedSpan.textContent = payload.toString();
});