
//Following steps are required for minimal functionality 
/*
Step 1: Search for the word 
Step 2: Word lookup -> API calls to Dictionary, in case of emergency -> will go into fallback
Step 3: Rendering the results to the user 
Step 4: Submit button -> submits to notion database -> Notion API called 
*/



async function handleSearch(searchedWord)
{   

    
    // Get through edge cases
    //Edge case #1: If word is not lowercased -> turn it all lower case for ease of search
    //Edge Case#2: If word is null -> return null, prompt user to put string(word) in
    //Edge Case#3: If word is number -> prompt error and ask user to put in a word
    //Edge Case #4: If word is a special character -> prompt error and ask user to put in a word 
    const hasInteger = /\d/.test(searchedWord);
    const checkStrictInteger = /^\d+$/.test(searchedWord);
    const allowed_characters = /[-']/
    const hasTrailingWhiteSpace = /\s$/
    const hasAnyWhiteSpace = /\s/

        //normalization first
        if(!searchedWord.trim().lowerCase())
        {
            searchedWord = searchedWord.trim().lowerCase()
            console.log(new_word)
        }
        if(Number.isInteger(searchedWord) || checkStrictInteger || hasInteger)
        {
            console.error("Word has integer, does not allow for it")
            return
        }
        if(allowed_characters.test(searchedWord) || hasTrailingWhiteSpace.test(searchedWord) || hasAnyWhiteSpace.test(searchedWord)){}else{console.error()
            return} 
        let parsed_data = getDefinition(searchedWord) // once this response is gottenback -> we display it to the user, it is already parsed and normalized data (should be)
        if(typeof parsed_data == 'object' && parsed_data != null)
        {
            renderDefinition(data)
        }
}

function renderDefinition(){}