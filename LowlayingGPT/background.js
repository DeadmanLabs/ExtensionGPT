var MOUSE_VISITED_CLASSNAME = 'crx_mouse_visited';
var prevDOM = null;
var lastElementChecked = null;
var running = false;
var key = "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";
var url = "https://api.openai.com/v1/chat/completions";
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`
};

function handleGPTClick(e) {
    let srcElement = e.srcElement;
    let trueElement = document.getElementsByClassName(MOUSE_VISITED_CLASSNAME)[0];
    if (trueElement.textContent != "" && trueElement.textContent != null && lastElementChecked != srcElement)
    {
        let query = prompt("Query");
        if (query != "")
        {
            console.log(query + "\n\n" + trueElement.textContent);
            fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{"role": "user", "content": query + "\n\n" + trueElement.textContent}],
                })
            }).then(response => response.json()).then(response => {
                trueElement.textContent += "[]: " + response.choices[0].message.content;
            }).catch (error => {
                console.log("Error: " + error);
            });
        }
        lastElementChecked = srcElement;
        document.removeEventListener('mousedown', handleGPTClick);
        document.removeEventListener('mousemove', handleGPTHover);
        document.getElementsByClassName(MOUSE_VISITED_CLASSNAME)[0].style.border = "0px solid transparent";
        prevDOM.classList.remove(MOUSE_VISITED_CLASSNAME);
    }
    else if (srcElement != lastElementChecked)
    {
        console.log("No text for the selected element!");
        lastElementChecked = srcElement;
    }
}

function handleGPTHover(e) {
    let srcElement = e.srcElement;
    if (prevDOM != srcElement)
    {
        if (prevDOM != null)
        {
            document.getElementsByClassName(MOUSE_VISITED_CLASSNAME)[0].style.border = "0px solid transparent";
            prevDOM.classList.remove(MOUSE_VISITED_CLASSNAME);
        }
        srcElement.classList.add(MOUSE_VISITED_CLASSNAME);
        document.getElementsByClassName(MOUSE_VISITED_CLASSNAME)[0].style.border = "1px solid red";
        prevDOM = srcElement;
    }
}

function enable() {
    console.log("Enabled!");
    document.addEventListener('mousemove', handleGPTHover, false);
    document.addEventListener('mousedown', handleGPTClick, false);
    running = true;
}

function disable() {
    console.log("Disabled!");
    document.removeEventListener('mousedown', handleGPTClick, false);
    document.removeEventListener('mousemove', handleGPTHover, false);
    if (document.getElementsByClassName(MOUSE_VISITED_CLASSNAME).length > 0)
    {
      document.getElementsByClassName(MOUSE_VISITED_CLASSNAME)[0].style.border = "0px solid transparent";
    }
    prevDOM.classList.remove(MOUSE_VISITED_CLASSNAME);
    running = false;
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "toggle")
    {
        if (running)
        {
            console.log("[DBG] -> Disabled!");
            disable();
        }
        else
        {
            console.log("[DBG] -> Enabled!");
            enable();
        }
    }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
      text: "OFF",
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle')
  {
    console.log("Toggled!");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggle"});
    })
  }
  console.log(`Command: ${command}`);
});