# Vrchat chrome extension

## Installation

1. Go to the [latest release](../../releases/latest) and download build.zip
2. Extract the build.zip into a directory
3. Open chrome extension page chrome://extensions/
4. Enable developer mode at the top right corner
5. Click "LOAD UNPACKED" and add the extracted directory

## Current features

![Worlds page image](https://user-images.githubusercontent.com/36522050/43356171-502ffbca-9274-11e8-89b6-0f794d3cdd1e.png)

### Login page
- Autofocus on inputs
- Autologin if last session has not expired

### Worlds page
- Fix bug that causes friends not to show if one of them is in a private world
- See the instance that your friends are in and the other people in that instance

## Installing/Developing from source
Install [node.js](https://nodejs.org)

Run the following inside the project folder
```
# Install required packages
npm install

# Compile javascript
npm run build

# Or run this to automatically compile on file change
npm run watch
```

After this just add "dist" folder as a developer plugin in chrome

## Notice
I am not in any way affiliated with vrchat or anything related to them and not responsible if anything breaks because of this extension.
