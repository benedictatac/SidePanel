
//Following steps are required for minimal functionality 
/*
Step 1: Search for the word 
Step 2: Word lookup -> API calls to Dictionary, in case of emergency -> will go into fallback
Step 3: Rendering the results to the user 
Step 4: Submit button -> submits to notion database -> Notion API called 
*/


const container_name = "output-search"
const saveButton = "save-button"
const settingsButton = "settings-button"
let currentResult = null    
const button1 = document.getElementById(saveButton)
const button2 = document.getElementById(settingsButton) 
button1.addEventListener("click", saveClickHandler)
document.addEventListener("DOMContentLoaded", loadSettingsTokens)
document.addEventListener("DOMContentLoaded", initSaveButton);




async function handleSearch(searchedWord)
{   

    if(searchedWord === null)
    {return}
    //normalization first
    const trimmed_word = searchedWord.trim().toLowerCase()
    const isValidWord = /^[a-z-']+$/.test(trimmed_word)

    try{
        if(isValidWord)
            {   
                let parsed_data = await getDefinition(trimmed_word) // once this response is gottenback -> we display it to the user, it is already parsed and normalized data (should be)
                
                if(typeof parsed_data === 'object' && parsed_data !== null)
                    {
                        currentResult = parsed_data
                        renderDefinition(currentResult)
                    }
            }
        else{
            throw new Error("Error produced, cannot handle search word")
        }}
        catch(error)
        {
            if(error.name === "ErrorNormalization")
            {
                console.error("Cause by normalization problem", error.message)
            }
            else{
                console.error("Problem was caused by:", error.message)
            }
        } 
}

async function saveClickHandler()
{
    try{
    if(currentResult)
        {   
            const response = await browser.runtime.sendMessage({
                action: "Save to Notion",
                message: currentResult
            })   
            console.log("Received response:", response.reply);
        }

        if(response.status === "success")
        {
            console.log("Success:", response.reply)
        }
        else{console.error("Failed to Save:", response.reply)}
    }catch(error){    console.error("Error sending message:", error);}
}

function initSaveButton() {
  const saveBtn = document.getElementById("save-settings-btn");
  if (!saveBtn) {
    console.warn("Save button '#save-settings-btn' not found in DOM.");
    return;
  }

  // Attach click listener to trigger the save logic when clicked
  saveBtn.addEventListener("click", async () => {
    try {
      // 1. Get the DOM input elements
      const tokenInput = document.getElementById("notion-token-input");
      const dbInput = document.getElementById("notion-db-input");
      const statusMessage = document.getElementById("status-message");

      // 2. Read and sanitize their values
      const tokenValue = tokenInput ? tokenInput.value.trim() : "";
      const dbValue = dbInput ? dbInput.value.trim() : "";

      // Basic validation check
      if (!tokenValue || !dbValue) {
        console.warn("Please provide both a Notion Token and Database ID.");
        if (statusMessage) statusMessage.textContent = "Please provide both Token and Database ID.";
        return { success: false, message: "Missing required fields." };
      }

      // 3. Save to browser local storage using CONFIG key names
      await browser.storage.local.set({
        [window.CONFIG.NOTION_TOKEN_KEY]: tokenValue,
        [window.CONFIG.NOTION_DATABASE_ID_KEY]: dbValue
      });

      console.log("Notion credentials updated in storage.");
      if (statusMessage) statusMessage.textContent = "Settings saved successfully!";
      
    //   return { success: true, message: "Settings saved!" }; //dead code, not being used anywhere 

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


function renderDefinition(parsedData, container)
{

     //get the id
    const elementId = document.getElementById(container)
    elementId.replaceChildren()

    buildElement("h1", parsedData.word, elementId)
    buildElement("p",parsedData.definition, elementId)

    if(parsedData.example)
    {
        buildElement("p", parsedData.example, elementId)
    }
}


function buildElement(tagName, textValue, parent)
{
    const el = document.createElement(tagName)
    el.textContent = textValue
    parent.appendChild(el)
}

