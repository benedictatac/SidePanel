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
        let response = fetchWrapper(primaryURL, window.CONFIG.DEFAULT_TIMEOUT_PRIMARYDICT, options = {method: 'GET'})
        return response.json()
        
    }
    catch(firstError)
    {   
        console.error(`Could not find due to: ${firstError.message}`)
        try
            {
                let fallback_response = fetchWrapper(fallbackURL, window.CONFIG.TIMEOUT_FALLBACKDICT, options = {method: 'GET'})
                return fallback_response.json()
            }
        catch(secondError)
        { // in this case, we have an error where we actually don't find the word, 
            console.error(`Definition not found: ${secondError.message}`)
            const defineError = new Error("Could not find definition for both", {cause:secondError})
            defineError.name = "MissingWord"
            throw defineError
        }
    }


}
