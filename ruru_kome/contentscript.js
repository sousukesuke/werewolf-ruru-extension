$( function() {

	var _RuruKome = function() {
	};

	_RuruKome.prototype = {
		data : {
			debug : true,
			installed : false,
			days : undefined,
			day : undefined,
			dayIndex : 0,
			time : "開始前",
			status : undefined,
			users : {},
			names : {},
			step : 0,
			balloon : undefined,
			temporary : {
				selectedLog : -1
			}
		},
		init : function() {
			var _self = this;

			_self.data.days = [];
			for ( var i = 1; i < 30; i++ ) {
				_self.data.days.push( _self.ord( i ) + "DAY" );
			}

			chrome.extension.sendRequest( {
				action : "init"
			}, function( responce ) {
				_self.onInit( responce );
			} );
		},
		onInit : function( response ) {
			var _self = this;

			chrome.extension.onRequest.addListener( function( request, sender, sendResponse ) {
				_self.onPageAction( request, sender, sendResponse );
			} );
		},
		onPageAction : function( request, sender, sendResponse ) {
			var _self = this;

			if ( request.action === "click" ) {
				if ( !_self.data.installed ) {
					_self.data.installed = true;

					_self.install();
				}

				sendResponse( {
					active : _self.data.installed
				} );
			}
		},
		install : function() {
			var _self = this;

			var installedScript;

			_self.data.status = $( "#ruru-ext-status" );
			if ( installedScript = _self.data.status.length !== 0 ) {
				_self.data.status.attr( "useindex", "true" );
			} else {
				_self.data.status = $( "<span id='ruru-ext-status' reverselog='false' useindex='true' day='1rdDAY' time='開始前'></span>" ).appendTo( "body" );
			}

			var dispatcher = $( "#ruru-ext-event-dispatcher" );
			if ( dispatcher.length === 0 ) {
				dispatcher = $( "<button id='ruru-ext-event-dispatcher' style='display:none;'></button>" ).appendTo( "body" );
			}

			var idle = function() {
				try {
					_self.onUpdateChat();
				} catch ( e ) {
					_self.data.balloon( "エラーが発生しました。", true );
					throw e;
				}
			};

			var setup = function() {
				try {
					if ( _self.setup() ) {
						_self.onUpdateChat();

						dispatcher.off( "click" );
						dispatcher.on( "click", idle );
					}
				} catch ( e ) {
					_self.data.balloon( "エラーが発生しました。", true );
					throw e;
				}
			};

			var setupComponent = function() {
				try {
					_self.setupComponents();

					dispatcher.off( "click" );

					if ( _self.setup() ) {
						_self.onUpdateChat();

						dispatcher.on( "click", idle );
					} else {
						dispatcher.on( "click", setup );
					}
				} catch ( e ) {
					_self.data.balloon( "エラーが発生しました。", true );
					throw e;
				}
			};

			dispatcher.on( "click", setupComponent );

			if ( installedScript ) {
				$( "#messageInput" ).val( "" );
				$( "#todob" ).click();
			} else {
				$.get( chrome.extension.getURL( "ruru_ext_install.js" ), function( data ) {

					var head = document.getElementsByTagName( "head" ).item( 0 );

					var scr = document.createElement( "script" );
					scr.setAttribute( "type", "text/javascript" );
					scr.innerText = data;

					head.appendChild( scr );
				} );
			}
		},
		setupComponents : function() {
			var _self = this;

			var balloonContainer = $( "<div style='display:inline-block;width:150px;position:absolute;bottom:5px;left:5px;'></div>" ).appendTo( "body" );

			_self.data.balloon = function( message, alert, html ) {
				var balloon = $( "<div class='ui-corner-all ruru-kome-balloon'></div>" ).addClass( alert ? "ui-state-error" : "ui-state-highligh" ).hide();

				balloon.addClass( alert ? "ui-state-error" : "ui-state-highlight" );

				if ( html ) {
					balloon.html( message );
				} else {
					console.log( message );
					balloon.text( message );
				}

				balloon.appendTo( balloonContainer ).show( "slide", {}, 300, function() {
					setTimeout( function() {
						balloon.fadeOut( "normal", function() {
							balloon.remove();
						} );
					}, 2000 );
				} );
			};

			$( "#messageInput" ).on( "keypress", function( event ) {
				if ( event.ctrlKey && event.which == 32 ) {
					return false;
				}
			} );

			_self.data.balloon( "コンポーネントロード" );

			if ( _self.data.debug ) {
				_self.setupDebugComponents();
			}
		},
		setupDebugComponents : function() {
			var _self = this;

			var debugPanel = $( "#ruru-ext-debug-container" );
			if ( debugPanel.length === 0 ) {
				debugPanel = $( "<div id='ruru-ext-debug-container' style='font-size:10px;position:absolute;right:10px;bottom:10px;z-index:1010;'></div>" ).appendTo( "body" );
			}

			var aaaauto = "none";

			var autoUpdate = function() {
				if ( $( "#messageInput" ).val().length ) {
					clearInterval( aaaauto );
					aaaauto = "none";
					_self.data.balloon( "自動更新解除" );
				} else {
					_self.data.balloon( "自動更新中", true );
					$( "#todob" ).click();
				}
			};

			$( "<button style='display:block;'>自動更新</button>" ).button( {
				icons : {
					primary : "ui-icon-refresh"
				},
				text : false
			} ).on( "click", function() {
				if ( aaaauto === "none" ) {
					$( "#todob" ).click();

					aaaauto = setInterval( autoUpdate, 10000 );
					_self.data.balloon( "自動更新ON", true );
				} else {
					clearInterval( aaaauto );
					aaaauto = "none";
					_self.data.balloon( "自動更新解除" );
				}
			} ).on( "mouseleave", function() {
				if ( aaaauto !== "none" ) {
					clearInterval( aaaauto );
					aaaauto = "none";
					_self.data.balloon( "自動更新解除" );
				}
			} ).appendTo( debugPanel );

			$( document ).on( "keydown", function() {
				if ( aaaauto !== "none" ) {
					clearInterval( aaaauto );
					aaaauto = "none";
					_self.data.balloon( "自動更新解除" );
				}
			} );

			_self.data.balloon( "デバッグ機能有効", true );
		},
		setup : function() {
			var _self = this;

			if ( _self.data.status.attr( "time" ) === "開始前" ) {
				return false;
			}

			var posText = $( "#No00" ).text();
			var from = posText.indexOf( "」村\xa0\xa0定員：" );
			from = posText.indexOf( "役職", from );
			var to = posText.indexOf( "昼", from );
			posText = posText.slice( from, to );

			_self.data.balloon( posText );

			$( "#No01 td.name" ).each( function( i, td ) {
				var name = $( ">span:first", td ).text();
				if ( name ) {
					var userid = $( td ).attr( "userid" );
					_self.data.users[userid] = {
						userid : userid,
						name : name,
						dead : false,
						hang : false
					};
					_self.data.names[name] = userid;
				}
			} );

			_self.data.balloon( "ユーザー把握" );
			console.log( $.stringify( _self.data.names ) );

			return true;
		},
		onUpdateChat : function() {
			var _self = this;

			_self.data.day = _self.data.status.attr( "day" );
			var time = _self.data.status.attr( "time" );

			if ( _self.data.time !== time ) {
				var tmp = _self.data.day.match( /^([0-9]+)[^0-9]*$/ );
				_self.data.dayIndex = parseInt( tmp[1] - 1 );
				_self.data.days[_self.data.dayIndex] = _self.data.day;

				if ( time === "夕刻" ) {
				} else if ( time === "昼" ) {
				} else if ( time === "夜" ) {
				} else if ( time === "夜明け" ) {
				} else if ( time === "ゲーム終了" ) {
				}
			}

			_self.data.time = time;
		},
		ord : function( count ) {
			switch ( count % 10 ) {
			case 1:
				return count + "st";
			case 2:
				return count + "nd";
			case 3:
				return count + "rd";
			default:
				return count + "th";
			}
		}
	};

	var RuruKome = new _RuruKome();

	RuruKome.init();
} );
