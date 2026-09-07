
//Following steps are required for minimal functionality 
/*
Step 1: Search for the word 
Step 2: Word lookup -> API calls to Dictionary, in case of emergency -> will go into fallback
Step 3: Rendering the results to the user 
Step 4: Submit button -> submits to notion database -> Notion API called 
*/


const container_name = "output-search"
async function handleSearch(searchedWord)
{   

    if(searchedWord === null)
    {return}
            //normalization first
    const trimmed_word = searchedWord.trim().toLowerCase()
    // Get through edge cases
    //Edge Case#1: If word is null -> return null, prompt user to put string(word) in
    //Edge case #2: If word is not lowercased -> turn it all lower case for ease of search
    //Edge Case#3: If word is number -> prompt error and ask user to put in a word
    //Edge Case #4: If word is a special character -> prompt error and ask user to put in a word 
    const hasInteger = /\d/.test(trimmed_word);
    // const checkStrictInteger = /^\d+$/.test(trimmed_word);
    const isValidWord = /^[a-z-']+$/.test(trimmed_word)
    // const hasTrailingWhiteSpace = /\s$/
    // const hasAnyWhiteSpace = /\s/



    // if(hasInteger)
    //     {
    //         console.error("Word has integer, does not allow for it")
    //         return
    //     }
    try{
        if(isValidWord)
            {   
                let parsed_data = await getDefinition(trimmed_word) // once this response is gottenback -> we display it to the user, it is already parsed and normalized data (should be)
                if(typeof parsed_data === 'object' && parsed_data !== null)
                    {
                    renderDefinition(parsed_data)
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