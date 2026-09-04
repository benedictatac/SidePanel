// file that contains the api call for Notion and the Dictionary 

const baseURL = "DICTIONARY_API = https://api.dictionaryapi.dev/api/v2/entries/en"
const baseURL_fallback = " https://en.wiktionary.org/api/rest_v1/page/definition/"




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
