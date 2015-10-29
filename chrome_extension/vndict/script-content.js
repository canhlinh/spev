function tryConnectExtension(cookie, extensionId){
    extension.id = extensionId;
    extension.port = chrome.runtime.connect(extension.id);
    if (null === extension.port){
        sendErrorToWebPage("Cannot connect to extension with ID: " + extension.id);
        extension.id = null;
        extension.port = null;
        return false;
    }
    extension.port.onMessage.addListener(onExtensionMessage);
    extension.port.onDisconnect.addListener(onExtensionDisconnected);
    sendToWebPage({ cookie: cookie,
                    command: "EXTENSION_CONNECTION_CHANGE",
                    data: { "extensionID": extension.id, "isConnected": true }});
    return true;
}

function sendToExtension(message){
    if (extension.port !== null){
        extension.port.postMessage(message);
    } else{
        sendErrorToWebPage("Extension is not connected. Message cannot be sent.");
    }
}