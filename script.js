const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const modeToggle = document.getElementById("mode-toggle");

window.onload = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") document.body.classList.add("light");

  const savedChats = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  savedChats.forEach(({ sender, text }) => appendMessage(sender, text));
};

modeToggle.onclick = () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
};

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  saveChat(sender, text);
}

function saveChat(sender, text) {
  const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  history.push({ sender, text });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;
  appendMessage("You", msg);
  respond(msg);
  userInput.value = "";
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utter);
}

function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = (event) => {
    const voiceText = event.results[0][0].transcript;
    appendMessage("You (voice)", voiceText);
    respond(voiceText);
  };

  recognition.onerror = () => {
    appendMessage("System", "Voice input error.");
  };
}

function respond(msg) {
  const message = msg.toLowerCase();
  let response = "Sorry, I didn’t understand that.";

  if (message.includes("hello")) response = "Hi! How can I help you?";
  else if (message.includes("hi")) response = "Hi! How can I help you?";
  else if (message.includes("your name")) response = "I'm Jarvis, your offline assistant.";
  else if (message.includes("time")) response = new Date().toLocaleTimeString();
  else if (message.includes("date")) response = new Date().toLocaleDateString();

  else if (message.startsWith("set alarm for")) {
    const match = message.match(/set alarm for (\d+)\s*(seconds?|minutes?|hours?)/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      let ms = 0;

      if (unit.includes("second")) ms = value * 1000;
      else if (unit.includes("minute")) ms = value * 60000;
      else if (unit.includes("hour")) ms = value * 3600000;

      setTimeout(() => {
        alert("⏰ Alarm: Time's up!");
        speak("Alarm ringing!");
      }, ms);

      response = `Alarm set for ${value} ${unit}`;
    } else {
      response = "Say: 'Set alarm for 5 minutes'";
    }
  }
else if (msg.includes("open calendar")) {
  response = "Opening calendar.";
  window.open("https://calendar.google.com", "_blank");
}
else if (msg.includes("open calculator")) {
  response = "Opening calculator.";
  window.open("https://www.google.com/search?q=calculator", "_blank");
}
let stopwatchStart;

else if (msg.includes("start stopwatch")) {
  stopwatchStart = Date.now();
  response = "Stopwatch started.";
}

else if (msg.includes("stopwatch stop")) {
  if (stopwatchStart) {
    const duration = Math.round((Date.now() - stopwatchStart) / 1000);
    response = `⏱ Stopwatch stopped. Time: ${duration} seconds.`;
    stopwatchStart = null;
  } else {
    response = "Stopwatch wasn't started.";
  }
}
else if (msg.includes("start timer for")) {
  const secs = parseInt(msg.match(/\d+/)[0]);
  response = `Timer started for ${secs} seconds.`;
  setTimeout(() => {
    speak("⏰ Timer done!");
    alert("⏰ Timer done!");
  }, secs * 1000);
}

  else if (message.includes("weather")) {
    response = "The weather seems fine today. (Offline response)";
  }

  else if (message.includes("open google calendar")) {
    response = "Opening Google Calendar.";
    window.open("https://calendar.google.com", "_blank");
  }

  else if (message.includes("open whatsapp")) {
    const numberMatch = message.match(/send message to (\d+)/);
    if (numberMatch) {
      const num = numberMatch[1];
      response = `Opening WhatsApp chat with ${num}`;
      window.open(`https://wa.me/${num}`, "_blank");
    } else {
      response = "Say: 'Open WhatsApp and send message to [number]'";
    }
  }

  else if (message.includes("spotify") || message.includes("play")) {
    const song = message.replace("play", "").replace("on spotify", "").trim();
    response = `Opening Spotify for "${song}"`;
    window.open(`https://open.spotify.com/search/${encodeURIComponent(song)}`, "_blank");
  }

  else if (message.includes("search for")) {
    const query = message.replace("search for", "").trim();
    response = `Searching Google for "${query}"`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
  }

  else if (message.includes("take a note")) {
    const note = message.replace("take a note", "").trim();
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    notes.push(note);
    localStorage.setItem("notes", JSON.stringify(notes));
    response = `Note saved: "${note}"`;
  }

  else if (message.includes("show my notes")) {
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    response = notes.length ? `Your notes: ${notes.join("; ")}` : "You have no saved notes.";
  }

  else if (message.includes("clear notes")) {
    localStorage.removeItem("notes");
    response = "All notes cleared.";
  }

  else if (message.includes("clear chat")) {
    localStorage.removeItem("chatHistory");
    chatBox.innerHTML = "";
    response = "Chat history cleared.";
  }

  const memory = JSON.parse(localStorage.getItem("memory") || "{}");

if (message.includes("my name is")) {
  const name = message.split("my name is")[1].trim();
  memory.username = name;
  localStorage.setItem("memory", JSON.stringify(memory));
  response = `Nice to meet you, ${name}`;
}

else if (message.includes("what is my name")) {
  response = memory.username ? `Your name is ${memory.username}` : "I don't know your name yet.";
}


  // Math expression handling
  else if (/^[0-9+\-*/().\s^]+$/.test(message)) {
    try {
      const safeExpr = message.replace(/\^/g, "**");
      const result = eval(safeExpr);
      response = `The answer is ${result}`;
    } catch {
      response = "That looks like math, but I couldn't solve it.";
    }
  }

  appendMessage("Jarvis", response);
  speak(response);
}
