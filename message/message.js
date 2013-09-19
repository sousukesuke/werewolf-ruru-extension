$( function( $ ) {
	$.showMsg = function( msg ) {
		var messages = msg.split( /[\r\n]*#keyframe[\r\n]+/ );

		var body = $( "body" );
		var msgBox = $( "<div class='chat-message-box' style='position:absolute;'></div>" );

		body.append( msgBox );

		var index = 0;
		var msgpool = function() {
			var m;
			do {
				m = messages[index++];
			} while ( m === '' && index <= messages.length );

			if ( index <= messages.length ) {
				msgBox.empty();
				var pre = $( "<pre></pre>" );
				msgBox.append( pre );

				var layerIndex = m.indexOf( "#layer" );
				var layers = undefined;
				if ( layerIndex !== -1 ) {
					layers = m.slice( layerIndex );
					m = m.slice( 0, layerIndex );
				}

				pre.data( "msg", m );

				pre.setupMessage( msgBox, function() {
					msgpool();
				} );

				while ( layers ) {
					layerIndex = layers.slice( 1 ).indexOf( "#layer" ) + 1;
					var layerMessage = layers;
					if ( layerIndex !== 0 ) {
						layerMessage = layers.slice( 0, layerIndex );
						layers = layers.slice( layerIndex );
					} else {
						layers = undefined;
					}
					var layer = layerMessage.match( /#layer[^\r\n0-9]*([0-9]*)[^\r\n]*\r?\n([\s\S]*)/ );
					if ( layer ) {
						var subpre = $( "<pre style='position:absolute;display:none;'></pre>" );
						if ( layer[2] ) {
							msgBox.append( subpre );
							subpre.data( "wait", layer[1] );
							subpre.data( "msg", layer[2] );

							subpre.setupMessageForNoWait( subpre, function( container, pre ) {
								pre.remove();
							} );
						}
					}
				}
			} else {
				msgBox.remove();
			}
		};

		msgpool();
	};

	var searchInt = function( msg, flag, val ) {
		var regex = new RegExp( "#" + flag + "([0-9]+)\r?\n" );
		var fs = msg.match( regex );
		if ( fs ) {
			return parseInt( fs[1] );
		} else {
			return val;
		}
	};

	var searchText = function( msg, flag, val ) {
		var regex = new RegExp( "#" + flag + "(.*)\r?\n" );
		var fs = msg.match( regex );
		if ( fs ) {
			return fs[1].replace( /;+$/, "" );
		} else {
			return val;
		}
	};

	$.fn.setupMessage = function( container, callback ) {
		var pre = this;
		var msg = pre.data( "msg" );

		if ( !msg ) {
			// おそらく keyframe が先に終わった
			console.warn( "an empty msg." );
			return;
		}

		var interval = searchInt( msg, "wait ", 300 );

		var fontSize = searchText( msg, "size ", "24px" );
		var top = searchText( msg, "top ", null );
		var left = searchText( msg, "left ", null );
		var right = searchText( msg, "right ", null );
		var bottom = searchText( msg, "bottom ", null );
		var width = searchText( msg, "width ", null );
		var height = searchText( msg, "height ", null );
		var background = searchText( msg, "bg ", "none" );
		var color = searchText( msg, "\color ", "black" );

		pre.css( "line-height", "1em" );
		pre.css( "font-size", fontSize );

		var css = searchText( msg, "\css ", null );
		if ( css ) {
			var styles = css.split( /\s*;\s*/ );
			for ( var i = 0; i < styles.length; i++ ) {
				var style = styles[i].split( /\s*:\s*/ );
				pre.css( style[0], style[1] );
			}
		}

		msg = msg.replace( /#.*\r?\n/g, "" );

		pre.text( msg );

		container.css( "background", background );
		container.css( "color", color );

		if ( width ) {
			container.css( "width", width );
		}

		if ( height ) {
			container.css( "height", height );
		}

		if ( right ) {
			container.css( "right", right );
		}

		if ( bottom ) {
			container.css( "bottom", bottom );
		}

		var parent = container.parent();

		if ( top ) {
			if ( top.slice( 0, 1 ) === "." ) {
				container.css( "top", ( parent.height() - container.height() ) / 2 + parseInt( top.slice( 1 ) ) );
			} else {
				container.css( "top", top );
			}
		} else if ( !bottom ) {
			container.css( "top", ( parent.height() - container.height() ) / 2 );
		}

		if ( left ) {
			if ( left.slice( 0, 1 ) === "." ) {
				container.css( "left", ( parent.width() - container.width() ) / 2 + parseInt( left.slice( 1 ) ) );
			} else {
				container.css( "left", left );
			}
		} else if ( !right ) {
			container.css( "left", ( parent.width() - container.width() ) / 2 );
		}

		if ( callback ) {
			setTimeout( function() {
				callback( container, pre );
			}, interval );
		}
	};

	$.fn.setupMessageForNoWait = function( container, callback ) {
		var pre = this;
		var wait = pre.data( "wait" );
		setTimeout( function() {
			pre.show();
			pre.setupMessage( container, callback );
		}, wait );
	};
} );
