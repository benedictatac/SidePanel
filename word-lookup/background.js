

browser.runtime.onMessage.addListener(handleMessage)


async function handleMessage(message, sender, sendResponse)
{

        if(message.action == "Save to Notion")
        {   
            const result = await browser.storage.local.get([window.CONFIG.NOTION_TOKEN_KEY, window.CONFIG.NOTION_DATABASE_ID_KEY])
            const notionId = result[window.CONFIG.NOTION_TOKEN_KEY]
            const dbId = result[window.CONFIG.NOTION_DATABASE_ID_KEY] 


            //validate keys before making POST request
            if(!notionId || !dbId)
            {
                return ({status: "error", reply:"Missing Notion Token or Dastabase ID in the storage"})
            }
            
            const notionPayload = {
                parent:{database_id: dbId}, 
                properties: {
                // Title column (e.g., "Word")
                "Word": {
                title: [
                    { text: { content: message.message.word } }
                ]
                },
                // Rich Text column (e.g., "Definition")
                "Definition": {
                rich_text: [
                    { text: { content: message.message.definition } }
                ]
                },
                // Rich Text column (e.g., "Example")
                "Example": {
                rich_text: [
                    { text: { content: message.message.example || "" } }
                ]
                }
            }
            };

        console.log("Notion Payload:", notionPayload)

        try{
        const response = await fetchWrapper(window.CONFIG.NOTION_API_URL, options = {
            method:"POST", 
            headers:
            {  "Authorization": `Bearer ${notionId}`,
                'Notion-Version': '2022-06-28', // Required by Notion
                "Content-Type": "application/json"
            }, 
            body: JSON.stringify(notionPayload)})

        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Send success response back to saveClickHandler
      return({ reply: "Successfully saved to Notion!" });
    } catch (error) {
      console.error("Could not write to Notion Page:", error.message);
      return({ reply: "Failed to save to Notion", error: error.message });
    }
    return true
}}


