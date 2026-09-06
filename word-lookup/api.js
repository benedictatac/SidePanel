// file that contains the api call for Notion and the Dictionary 





async function fetchWrapper(URL, timeout = 5000, options = Object)
{
    //Step 1: Crteate controller which will cancel the whole process using .abort()
    const controller = AbortController()

    //Step 2: Scheduling the cancel, give it to variable we can use to cancel the countdown if it does not reach 0 
    const timerID = setTimeout(() => {
        controller.abort()
    }, timeout);

    
    //step3: get response using fetch
    try{
    const response = await fetch(URL,
        {...options, 
            signal: controller.signal
        })

        if (response != null)
        {
            clearTimeout(timerID)
        }

        return response
    }

    catch(error)
    {   
        if (error.name === "AbortError")
            {
                console.error(`Request timed out after:`,  timeout, "ms:", URL)
                const timeoutError = new Error("Request timed out", {cause:error})
                timeoutError.name = "TimeoutError"
                throw timeoutError
            }
        else{
            console.error(`Network error:`, error.message)
        }
    }
    finally{clearTimeout()}
}



async function getDefinition(word)
{
    const primaryURL = `${window.CONFIG.DICTIONARY_API}/${encodedURIComponent(word)}`
    const fallbackURL = `${window.CONFIG.fallbackURL}/${encodedURIComponent(word)}`

    try
    {   
        let response = await fetchWrapper(primaryURL, window.CONFIG.DEFAULT_TIMEOUT_PRIMARYDICT, options = {method: 'GET'})
        
        if(!response.ok)
            throw new Error("Error produced")

        const data = await response.json()
        let normalizedData = normalizingPrimaryDict(data)
        if(typeof normalizedData == "undefined")
            {
                const undefinedError =  new Error("Parsed data was undefined")
                undefinedError.name = "UndefinedError"
                throw undefinedError
            }// return a parsed and normalized data
        else{ return normalizedData} 
    }
    catch(firstError)
    {   
        if(firstError.name === "UndefinedError")
            console.error(`Could not find due to: ${firstError.message}`)
        else{
            console.error("Parsed Data gave error", firstError.message)
        }
        try
            {
                let fallback_response = await fetchWrapper(fallbackURL, window.CONFIG.TIMEOUT_FALLBACKDICT, options = {method: 'GET'})
                if(!fallback_response.ok)
                throw new Error("Error produced")
                
                const fallback_data = await fallback_response.json()
                if(typeof normalizingSecondaryDict(fallback_data) === "undefined")
                    {
                        const fallbackError = new Error("Secondary Dict Data was undefined")
                        fallbackError.name = "SecondDictUndefinedError"
                        throw fallbackError

                    } // return a parsed and normalized data
                else{return normalizingSecondaryDict(fallback_data)}
            }
        catch(secondError)
        { // in this case, we have an error where we actually don't find the word, 

            if(secondError.name == "Term not Found")
            {console.error(`Definition not found: ${secondError.message}`), {cause:secondError}}
            if(secondError.name == "SecondDictUndefinedError")
            {console.error(`Secondary Dict was also undefined, ${secondError.message}`)}
        }
    }

}


function normalizingPrimaryDict(objectData, searchedWord)
{
    let data = objectData
   try{
        const root = data?.[0]
        
        const targetShape =
        {
            word: root.word || searchedWord, 
            definition: definition || "", 
            example: root.meanings?.[0]?.definitions?.[0]?.example || "", 
        }

    return targetShape;
    }catch(error)
    {

        console.error("Error extracting targetShape:",  error.message)

    }   
}

function normalizingSecondaryDict(objectData, searchedWord)
{
        let data = objectData

    try{
        const root = data.en[0] 


        const targetShape = {
            word: searchedWord,
            definition: root.definitions?.[0]?.definition, 
            example: root.definitions?.[0]?.examples?.[0]?.example, 
            }

    return targetShape;}
    catch(error){
  
        console.error("Error extracting targetShape", error.message)}
}



//after data is parsed, we save it to notion
// we would need to call the API, requires the api key and api url to do a write operation 
async function writeToNotion(parsedData)
{

}


function stripHtmlContent(htmlValue)
{
    const throwaway = document.createElement("span")
    throwaway.innerHTML = htmlValue
    return throwaway.textContent 
}