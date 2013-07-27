function onRequest( request, sender, sendResponse ) {
	if ( request.action === "init" ) {
		chrome.pageAction.setIcon( {
			tabId : sender.tab.id,
			path : "ruru_default.png"
		} );

		chrome.pageAction.show( sender.tab.id );
	}
	sendResponse( {} );
};

function onPageActionClicked( tab ) {
	chrome.tabs.sendRequest( tab.id, {
		action : "click"
	}, function( response ) {
		chrome.pageAction.setIcon( {
			tabId : tab.id,
			path : response.active ? "ruru_active.png" : "ruru_default.png"
		} );
	} );
}

var updateChatData = {
	action : "updateChat"
};

function onUpdateChat( details ) {
	chrome.tabs.sendRequest( details.tabId, updateChatData );
}

chrome.extension.onRequest.addListener( onRequest );
chrome.pageAction.onClicked.addListener( onPageActionClicked );
chrome.webRequest.onResponseStarted.addListener( onUpdateChat, {
	urls : [ "*://werewolf.ddo.jp/*" ],
	types : [ "xmlhttprequest" ]
} );