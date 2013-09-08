function onRequest( request, sender, sendResponse ) {
	if ( request.action === "init" ) {
		chrome.pageAction.setIcon( {
			tabId : sender.tab.id,
			path : "ruru_default.png"
		} );

		chrome.pageAction.show( sender.tab.id );
	} else if ( request.action === "copy" ) {
		var textarea = $( "<textarea>" ).appendTo( "body" ).val( request.text ).focus().select();

		document.execCommand( "Copy", false, null );

		textarea.remove();
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

chrome.extension.onRequest.addListener( onRequest );
chrome.pageAction.onClicked.addListener( onPageActionClicked );
