# Vrchat chrome extension

## Current features

### Login page
- Autofocus on inputs
- Autologin if last session has not expired

### Worlds page
- Fix bug that causes friends not to show if one of them is in a private world
- See what worlds your friends are in and how many people are in that instance
- See who of them are in the same instance

## Using/Developing
Install [node.js](https://nodejs.org)

Run the following inside the project folder
```
# Install required packages
npm install

# Install webpack globally
npm install -g webpack

# If the above doesn't work try adding sudo like so:
sudo npm install -g webpack

# Compile javascript
webpack -p && webpack -p
```
For now the webpack compile needs to be ran twice because the complete script depends on a compiled version of the main.js file

After this just add "dist" folder as a developer plugin in chrome
