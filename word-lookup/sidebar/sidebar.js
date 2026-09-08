//Following steps are required for minimal functionality 
/*
Step 1: Search for the word 
Step 2: Word lookup -> API calls to Dictionary, in case of emergency -> will go into fallback
Step 3: Rendering the results to the user 
Step 4: Submit button -> submits to notion database -> Notion API called 
*/

const container_name = "output-search";
const saveButton = "save-button";
const settingsButton = "submit";
let currentResult = null;
const searchButton = "search-button"


// Wrap DOM selections and listeners inside DOMContentLoaded to prevent null errors
document.addEventListener("DOMContentLoaded", () => {
  const button1 = document.getElementById(saveButton);
  if (button1) {
    button1.addEventListener("click", saveClickHandler);
  }
  const buttonSearch= document.getElementById(searchButton)
  if(buttonSearch){buttonSearch.addEventListener("click", async () => 
  {
    const searchValue = document.getElementById("site-search").value
    handleSearch(searchValue)
  })}
  
  loadSettingsTokens();
  initSaveButton();
});

async function handleSearch(searchedWord) {   
  if (searchedWord === null) { return; }
  

  const trimmed_word = searchedWord.trim().toLowerCase();
    const isValidWord = /^[a-z-']+$/.test(trimmed_word);

    try {
      if (isValidWord) {   
        let parsed_data = await getDefinition(trimmed_word);
        
        if (typeof parsed_data === 'object' && parsed_data !== null) {
          currentResult = parsed_data;
          // Fix: Pass container_name as second argument
          renderDefinition(currentResult, container_name);
        }
      } else {
        throw new Error("Error produced, cannot handle search word");
      }
    } catch (error) {
      if (error.name === "ErrorNormalization") {
        console.error("Cause by normalization problem", error.message);
      } else {
        console.error("Problem was caused by:", error.message);
      }
    }

  
}

async function saveClickHandler() {
  try {
    if (currentResult) {   
      const response = await browser.runtime.sendMessage({
        action: "Save to Notion",
        message: currentResult
      });   
      
      console.log("Received response:", response ? response.reply : "No response");

      // Fix: Keep response evaluation inside block scope
      if (response && (response.status === "success" || response.reply === "Successfully saved to Notion!")) {
        console.log("Success:", response.reply);
      } else {
        console.error("Failed to Save:", response ? response.reply : "Unknown error");
      }
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

function initSaveButton() {
  const saveBtn = document.getElementById("save-settings-btn");
  if (!saveBtn) {
    console.warn("Save button '#save-settings-btn' not found in DOM.");
    return;
  }

  saveBtn.addEventListener("click", async () => {
    try {
      const tokenInput = document.getElementById("notion-token-input");
      const dbInput = document.getElementById("notion-db-input");
      const statusMessage = document.getElementById("status-message");

      const tokenValue = tokenInput ? tokenInput.value.trim() : "";
      const dbValue = dbInput ? dbInput.value.trim() : "";

      if (!tokenValue || !dbValue) {
        console.warn("Please provide both a Notion Token and Database ID.");
        if (statusMessage) statusMessage.textContent = "Please provide both Token and Database ID.";
        return { success: false, message: "Missing required fields." };
      }

      await browser.storage.local.set({
        [window.CONFIG.NOTION_TOKEN_KEY]: tokenValue,
        [window.CONFIG.NOTION_DATABASE_ID_KEY]: dbValue
      });

      console.log("Notion credentials updated in storage.");
      if (statusMessage) statusMessage.textContent = "Settings saved successfully!";

    } catch (error) {
      console.error("Failed to save settings to storage:", error.message);
      const statusMessage = document.getElementById("status-message");
      if (statusMessage) statusMessage.textContent = "Error saving settings.";
      
      return { success: false, error: error.message };
    }
  });
}

async function loadSettingsTokens() {
  try {
    const result = await browser.storage.local.get([
      window.CONFIG.NOTION_TOKEN_KEY,
      window.CONFIG.NOTION_DATABASE_ID_KEY
    ]);

    const tokenInput = document.getElementById("notion-token-input");
    const dbInput = document.getElementById("notion-db-input");

    if (tokenInput && result[window.CONFIG.NOTION_TOKEN_KEY]) {
      tokenInput.value = result[window.CONFIG.NOTION_TOKEN_KEY];
    }
    if (dbInput && result[window.CONFIG.NOTION_DATABASE_ID_KEY]) {
      dbInput.value = result[window.CONFIG.NOTION_DATABASE_ID_KEY];
    }
  } catch (error) {
    console.error("Failed to load settings from storage:", error.message);
  }
}


function renderDefinition(parsedData, container) {
  const elementId = document.getElementById(container);
  if (!elementId) 
    {console.warn(`Container #${container} not found in DOM.`);
    return;
    }
  elementId.replaceChildren();

  buildElement("h1", parsedData.word, elementId);
  buildElement("p", parsedData.definition, elementId);

  if (parsedData.example) {
    buildElement("p", parsedData.example, elementId);
  }
}

function buildElement(tagName, textValue, parent) {
  const el = document.createElement(tagName);
  el.textContent = textValue;
  parent.appendChild(el);
}