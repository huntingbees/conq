window.correct = 1814;
window.levelStarted = Date.now();

window.myUsername = $("#user_id").text();

window.myAbs = -1;
window.opAbs = -1;
window.myDt = -1;
window.opDt = -1;

window.finish = function() {
 enter(vic);
 enter("up");
}

window.submitAnswerCallback = function (answer) {

  const obj = {

    user: myUsername,
    task_id: task_id,
    answer: answer,
    time: Date.now()

  };

  connection.invoke("BroadcastMessage", team_id.toString(),  JSON.stringify(obj));
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

connection.on("BroadcastMessage", (team, message) => {
  console.log("SignalR ReceiveMessage.", team, message);
  
  if (team !== team_id.toString()) {
   return;
  }

  const data = JSON.parse(message);
  const user = data.user;

  if (data.user === myUsername) {
    const abs = Math.abs(window.correct - data.answer);
    const dt = (data.time - window.levelStarted) / 1000.0;
    $("#myinput_short").text(data.answer);
    $("#myinput").text(data.answer + " — " + " разница " + abs + " — " + dt + " секунд");
    myAbs = abs;
    myDt = dt;
  }

  if (data.user !== myUsername) {
    const abs = Math.abs(window.correct - data.answer);
    const dt = (data.time - window.levelStarted) / 1000.0;
    $("#opinput").text(data.answer + " — " + " разница " + abs + " — " + dt + " секунд");
    opAbs = abs;
    opDt = dt;
  }

  if ((myAbs > -1) && (opAbs > -1)) {
    if (myAbs < opAbs) {
      window.vic = "myVic";
      $("#output").text("Вы выиграли!");
    }

    if (myAbs > opAbs) {
      window.vic = "opVic";
      $("#output").text("Вы проиграли!");
    }

    if (myAbs === opAbs) {
      if (myDt < opDt) {
        window.vic = "myVic";
      $("#output").text("Вы выиграли!");
      }

      if (myDt > opDt) {
        window.vic = "opVic";
      $("#output").text("Вы проиграли!");
      }

      if (myDt === opDt) {
        window.vic = "draw";
      $("#output").text("Ничья!");
      }
    }
    
    $("#correct_answer").text("Ответ: " + window.correct);
    $("#up").attr("hidden", false);
    $("#opinput").attr("hidden", false);
    $("#myinput").attr("hidden", false);
    $("#myinput_short").attr("hidden", true);


  }

});

// Start the connection.
start();
