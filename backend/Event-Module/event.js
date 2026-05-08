const EventEmitter = require("events");
    //js class
 const emitter = new EventEmitter();
  //<button onclick="f1()"> </button>

 //listening the event & Recieving the data 
 emitter.on("data",(value)=>{
     console.log("Data Event Got Trigger", value);
 });

 emitter.on("data",(datavalue)=>{
     console.log("another action", datavalue);
 })

 //creating ,Triggering the  Event & sending Data
 emitter.emit("data",999);