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
        return parsingData(data) // return a parsed data

    }
    catch(firstError)
    {   
        console.error(`Could not find due to: ${firstError.message}`)
        try
            {
                let fallback_response = await fetchWrapper(fallbackURL, window.CONFIG.TIMEOUT_FALLBACKDICT, options = {method: 'GET'})
                if(!fallback_response.ok)
                throw new Error("Error produced")

                const fallback_data = await fallback_response.json()
                return parsingData(fallback_data) // return a parsed data
            }
        catch(secondError)
        { // in this case, we have an error where we actually don't find the word, 

            if(secondError.name == "Term not Found")
            {console.error(`Definition not found: ${secondError.message}`)
            const defineError = new Error("Could not find definition for both", {cause:secondError})
            defineError.name = "MissingWord"
            throw defineError
            }
        }
    }

}


async function parsingPrimaryDictData(jsonData)
{
    let data = jsonData
    //Check #1: Is it already parsed data? 
    //Check #2: Is 

    if(data == 'object' && data != null)
    {
        console.error("Data is already parsed")
        return data
    }
    if(data == 'string')
    {
        try{
        return JSON.parse(data)
    }
    catch(error)
    {
        console.error("Data could not be parsed",error.message, {case:error})
        return null
    }
    }
}




//after data is parsed, we save it to notion
// we would need to call the API, requires the api key and api url to do a write operation 
async function writeToNotion(parsedData)
{

}