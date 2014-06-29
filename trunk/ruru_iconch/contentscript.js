$( function() {
	chrome.extension.onRequest.addListener( function( request, sender, sendResponse ) {
		if ( request.action === "click" ) {
			sendResponse( {
				success : true
			} );
		}
	} );
} );
