window.correct = 100;
window.levelStarted = Date.now();

window.myUsername = $("#user_id").text();
window.opUsername = "гопстоп";

window.myAbs = -1;
window.opAbs = -1;
window.myDt = -1;
window.opDt = -1;

if (window.vic === "myVic" || window.vic === "opVic") {
  $("#up").attr("hidden", false);

  if (window.vic === "myVic") {
    enter("myvic");
    return;
  }

  if (window.vic === "opVic") {
    enter("opvic");
    return;
  }
}

window.vic = "";



window.finish = function () {
  enter("up");
}



window.submitAnswerCallback = function (answer) {

  const obj = {

    username: $("#user_id").text(),
    task_id: task_id,
    answer: answer,
    time: Date.now()

  };

  connection.invoke("BroadcastMessage", myUsername, JSON.stringify(obj));

  //  $("#output").append(answer + " " + Date.now() + "</br>"); 

  console.log("on answer submit", answer);
}

console.log("on init");
const myname = $("#user_id").text();

const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://kc-eng-signalr-w8.azurewebsites.net/hub")
  .configureLogging(signalR.LogLevel.Information)
  .build();

async function start() {
  try {
    await connection.start();
    console.log("SignalR Connected.");

  } catch (err) {
    console.log(err);
    setTimeout(start, 5000);
  }
};

connection.onclose(async () => {pd
  await start();
});

connection.on("send", data => {
  console.log(data);
});

connection.on("BroadcastMessage", (user, message) => {
  console.log("SignalR ReceiveMessage.", user, message);


  if (user === myUsername) {
    const data = JSON.parse(message);
    const abs = Math.abs(window.correct - data.answer);
    const dt = (data.time - window.levelStarted) / 1000.0;
    $("#myinput").text(user + ": " + data.answer + " через " + dt + " секунд, разница: " + abs);
    myAbs = abs;
    myDt = dt;
  }

  if (user === opUsername) {
    const data = JSON.parse(message);
    const abs = Math.abs(window.correct - data.answer);
    const dt = (data.time - window.levelStarted) / 1000.0;
    $("#opinput").text(user + ": " + data.answer + " через " + dt + " секунд, разница: " + abs);
    opAbs = abs;
    opDt = dt;
  }

  if ((myAbs > 0) && (opAbs > 0)) {
    if (myAbs < opAbs) {
      $("#output").text(myUsername);
      window.vic = "myVic";
    }

    if (myAbs > opAbs) {
      $("#output").text(opUsername);
      window.vic = "opVic";
      $("#up").attr("hidden", false);
    }

    if (myAbs === opAbs) {
      if (myDt < opDt) {
        $("#output").text(myUsername);
        window.vic = "myVic";
        $("#up").attr("hidden", false);
      }

      if (myDt > opDt) {
        $("#output").text(opUsername);
        window.vic = "opVic";
        $("#up").attr("hidden", false);
      }

      if (myDt === opDt) {
        $("#output").text("draw");
        window.vic = "draw";
        $("#up").attr("hidden", false);
      }

    }
  }

});

// Start the connection.
start();
