# SidePanel
Creating a sidepanel that I can use to directly connect to my notion database.
So...I got tired of going back and forth to my Notion everytime i want to take notes, I created this extension on firefox
so that I can directly go to searching for a word or something that needs explaining, put it as the title and then write my explanation underneath which will then 
go to my Notion Database as a Glossary. This was supposed to be the main function but I got sidetracked trying to integrate an api route for getting definitions from
a dictionary
This taught me a lot about javascript/api/backend structures. 
Will maybe try to get this integrated to firefox, will see

## Table Of Contents
- Tech Stack
- Getting Started
- Usage
  - Environment Variables   
- API Reference
- Project Structure
- Contributions
- License
- Contact

### Tech Stack
- HTML - frontend
- CSS - frontend 
- Javascript -backend
- Firefox -browser 

### Getting started

- can do with manifest-verison 2
- git clone
- cd word-lookup
- go to about:debugging
- go to This Firefox
- Load temporary add-on -> then select manifest.json file
- In the integration token, add your Notion workspace token
- In the Database ID, add your database id which is usually the code after the "/" in the link and the last character/number before "?"
- save your credentials and you can start!

### Environment Variables 
- Just need your Notion and Database ID
- I already have the API for the dictionaries but feel free to change yours as you see fit

### JUST NOTE 
- will still make it better in the future, this was just to make my life easier when I'm doing research and taking notes! 
