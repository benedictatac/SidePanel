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
    const primaryURL = `${window.CONFIG.DICTIONARY_API}/${encodeURIComponent(word)}`
    const fallbackURL = `${window.CONFIG.fallbackURL}/${encodeURIComponent(word)}`

    try
    {   
        let response = await fetchWrapper(primaryURL, window.CONFIG.DEFAULT_TIMEOUT_PRIMARYDICT, options = {method: 'GET'})
        
        if(!response.ok)
            throw new Error("Error produced")

        const data = await response.json()
        let normalizedData = normalizingPrimaryDict(data, word)
        return normalizedData
    }
    catch(firstError)
        {   
            console.error("Parsed Data gave error", firstError.message)           
        try
            {
                let fallback_response = await fetchWrapper(fallbackURL, window.CONFIG.TIMEOUT_FALLBACKDICT, options = {method: 'GET'})
                if(!fallback_response.ok)
                throw new Error("Error produced")
                
                const fallback_data = await fallback_response.json()
                let finalResult = normalizingSecondaryDict(fallback_data, word) 
                 return finalResult
            }
        catch(secondError)
        { // in this case, we have an error where we actually don't find the word, 
            console.error("Could not Normalize Word", secondError.message)
            const finalResultError = new Error(`Error in normalizing data`, {cause:secondError})
            finalResultError.name = "ErrorNormalization"
            throw finalResultError
        }}
    }




function normalizingPrimaryDict(objectData, searchedWord)
{
        let data = objectData
        const root = data?.[0] // return undefined in case it cannot get the data 
        const targetShape =
        {
            word: root.word || searchedWord, 
            definition: root.meanings?.[0].definitions?.[0]?.definition || "", 
            example: root.meanings?.[0]?.definitions?.[0]?.example || "", 
        }
    return targetShape;
}

function normalizingSecondaryDict(objectData, searchedWord)
{
        let data = objectData

        const root = data?.en?.[0]
        const targetShape = {
                word: searchedWord,
                definition: stripHtmlContent(root.definitions?.[0]?.definition || ""), 
                example: stripHtmlContent(root.definitions?.[0]?.examples?.[0]?.example || ""), 
                }
                return targetShape}

function stripHtmlContent(htmlValue)
{
    const throwaway = document.createElement("span")
    throwaway.innerHTML = htmlValue
    return throwaway.textContent 
}