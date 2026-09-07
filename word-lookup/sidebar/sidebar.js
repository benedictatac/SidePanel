
//Following steps are required for minimal functionality 
/*
Step 1: Search for the word 
Step 2: Word lookup -> API calls to Dictionary, in case of emergency -> will go into fallback
Step 3: Rendering the results to the user 
Step 4: Submit button -> submits to notion database -> Notion API called 
*/


const container_name = "output-search"
const save_button = "save-button"
let currentResult = null    
const button = document.getElementById(saveButton)
button.addEventListener("click", saveClickHandler)
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
                message: currentResult
            })   
            console.log("Received response:", response.reply);
        }
    }catch(error){    console.error("Error sending message:", error);}
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

