const client = mqtt.connect('ws://192.168.50.91:8883');

const angleInput = document.querySelector("#angleInput");
const setAngleButton = document.querySelector("#setAngleButton");
const angleInputSpan = document.querySelector("#angleInputSpan");
const currentAngleSpan = document.querySelector("#currentAngleSpan");

const servoTopic = "plc/servo";

client.subscribe(servoTopic + "/out");

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
            client.publish(servoTopic, angleToSet);
   } else
       angleInputSpan.textContent = "please provide an angle(0-360)";
});

client.on("message", function (topic, payload){
    if(topic === (servoTopic + "/out"))
        currentAngleSpan.textContent = payload.toString();
});