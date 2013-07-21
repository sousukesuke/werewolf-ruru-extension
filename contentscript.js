$( function() {
	var _RuruExt = function() {
	};

	_RuruExt.prototype = {
		data : {
			active : false,
			day : undefined,
			prevstatus : 0,
			status : 0,
			users : {},
			names : {},
			nameMap : {},
			loaded : false,
			hidecng : false,
			hidecnw : false,
			showgray : false,
			showuranai : true,
			reverseLog : false,
			baloon : undefined,
			menu : undefined,
			styleSheet : undefined,
			logDialog : undefined,
			positionDialog : undefined,
			log : {},
			dialogStyleSheet : undefined
		},
		init : function() {
			var _self = this;

			if ( localStorage ) {
				if ( localStorage.installed ) {
					_self.data.hidecnw = localStorage.hidecnw == "true";
					_self.data.showgray = localStorage.showgray == "true";
					_self.data.showuranai = localStorage.showuranai == "true";
					_self.data.reverseLog = localStorage.reverseLog == "true";

					console.log( "設定読み込み", {
						"観戦OFF" : _self.data.showgray,
						"完グレ強調" : _self.data.showgray,
						"占い強調" : _self.data.showuranai,
						"ログ逆" : _self.data.reverseLog
					} );
				} else {
					localStorage.hidecnw = _self.data.hidecnw;
					localStorage.showgray = _self.data.showgray;
					localStorage.showuranai = _self.data.showuranai;
					localStorage.reverseLog = _self.data.reverseLog;

					localStorage.installed = "true";
				}
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
		marking : function( target, user ) {
			$( target ).addClass( user ).data( "user-id", user );
		},
		setup : function() {
			var _self = this;

			console.log( "ツール開始" );

			_self.data.loaded = true;

			$( "head" ).append( "<style id='ruru-ext-styles' type='text/css'></style>" );
			$( "head" ).append( "<style id='ruru-ext-dialog-styles' type='text/css'></style>" );
			for ( var i = 0; i < document.styleSheets.length; i++ ) {
				var styleTag = document.styleSheets.item( i ).ownerNode;
				if ( $( styleTag ).attr( "id" ) === "ruru-ext-styles" ) {
					_self.data.styleSheet = document.styleSheets.item( i );
				} else if ( $( styleTag ).attr( "id" ) === "ruru-ext-dialog-styles" ) {
					_self.data.dialogStyleSheet = document.styleSheets.item( i );
				}
			}

			_self.data.logDialog = $( "<div style='font-size:11px;overflow-y:scroll;'><table style='width:100%;background:white;'><tbody id='ruru-log-table'></tbody></table></div>" ).appendTo( "body" ).dialog( {
				// autoOpen : false,
				minWidth : 450,
				height : 600,
				buttons : [ {
					text : "Ok"
				} ]
			} );

			var userBox = $( ".d1>.d12>.d122>.d1221" );
			var uo = userBox.offset();
			var uw = userBox.width() - 20;
			var ul = uo.left + 10;
			var uh = $( window ).height() - userBox.height() - uo.top - 20;
			if ( uh < 250 ) {
				uh = 250;
			}
			var ut = $( window ).height() - uh - 10;

			_self.data.positionDialog = $( "<div style='font-size:11px;overflow:auto;' id='ruru-ext-position-dialog'></div>" ).appendTo( "body" ).dialog( {
				autoOpen : false,
				minWidth : uw,
				height : uh,
				title : "内訳",
				position : [ ul, ut ]
			} );

			_self.data.baloon = function( message ) {

			};

			_self.data.menu = $( "<ul style='display:none; position:absolute;z-index:6000;font-size:11px;white-space:nowrap;min-width:130px'></ul>" );
			_self.data.menu.appendTo( "body" );
			_self.data.menu.menu();

			var hidemenu = function( event, target ) {
				if ( !event || event.result ) {
					$( document ).off( "mousedown", checkExternalClick );
					_self.data.menu.hide();
				}
			};

			var checkExternalClick = function( event ) {
				var et = $( event.target );
				if ( !et.hasClass( "ui-menu" ) && et.parents( ".ui-menu" ).length == 0 ) {
					hidemenu();
				}
			};

			$( document ).on( "contextmenu", "#No01 td, #No09 td", function( event ) {
				var menuTarget = event.target;
				var parents = $( menuTarget ).parents( "td:first" );
				if ( parents.length ) {
					menuTarget = parents.get( 0 );
				}

				$( "li>ul,li>ol", _self.data.menu ).hide();

				_self.data.menu.menu( "destroy" );
				_self.data.menu.empty();
				$( menuTarget ).trigger( "preparemenu" );
				_self.data.menu.menu();
				_self.data.menu.show();

				var wh = $( window ).height();
				var mh = _self.data.menu.height();
				var limitTop = wh - mh - 10;

				_self.data.menu.css( "top", limitTop < event.pageY ? limitTop : event.pageY );
				_self.data.menu.css( "left", event.pageX );

				$( "a", _self.data.menu ).off( "click" );
				$( "a", _self.data.menu ).on( "click", function() {
					var eventui = $( this ).parent( ":first" );
					if ( !eventui.hasClass( "ui-state-disabled" ) ) {
						eventui.trigger( "execmenu", menuTarget );
					}

					return false;
				} );

				$( document ).mousedown( checkExternalClick );

				return false;
			} ).on( "preparemenu", function( event ) {

				var user = $( event.target ).data( "user-id" );

				_self.createMenu( user );

			} ).on( "execmenu", function( event, target ) {
				hidemenu();

				var action = $( event.target ).attr( "id" );
				var user = $( target ).data( "user-id" );

				_self.execAction( user, action, event.target );
			} );

			$( "#No01 td" ).each( function( i, td ) {
				var text = $( td ).text();
				if ( text !== "　" ) {
					var line = Math.floor( i / 6 );
					var position = ( i % 6 );

					switch ( position ) {
					case 0:
						_self.data.users["user-" + ( line * 2 )] = {};
						_self.marking( td, "user-" + ( line * 2 ) );
						break;
					case 1:
						_self.data.names[text] = "user-" + ( line * 2 );
						_self.data.nameMap["user-" + ( line * 2 )] = text;
						_self.marking( td, "user-" + ( line * 2 ) );
						break;
					case 2:
						_self.data.users["user-" + ( ( line * 2 ) + 1 )] = {};
						_self.marking( td, "user-" + ( ( line * 2 ) + 1 ) );
						break;
					case 3:
						_self.data.names[text] = "user-" + ( ( line * 2 ) + 1 );
						_self.data.nameMap["user-" + ( ( line * 2 ) + 1 )] = text;
						_self.marking( td, "user-" + ( ( line * 2 ) + 1 ) );
						break;
					case 4:
						_self.marking( td, "user-" + ( line * 2 ) );
						break;
					case 5:
						_self.marking( td, "user-" + ( ( line * 2 ) + 1 ) );
						break;
					default:
						break;
					}
				}
			} );

			var buttonPanel = $( _self.data.logDialog ).parents( ".ui-dialog:first" ).children( ".ui-dialog-buttonpane:first" ).css( "font-size", "11px" ).empty();

			for ( var name in _self.data.names ) {
				var user = _self.data.names[name];
				var checkbox = $( "<input class='dialog-user-checkbox' type='checkbox' id='dialog-checkbox-" + user + "' value='" + user + "' style='vertical-align:sub;'/>" ).attr( "checked", true ).data( "user-id", user );
				var count = $( "<span class='dialog-user-count count-" + user + "' style='display:inline-block;min-width:30px;cursor:pointer;font-weight:bold;'>[0]</span>" ).data( "user-id", user );
				buttonPanel.append( $( "<div style='display:inline-block;white-space:nowrap;'></div>" ).append( checkbox ).append( "<label for='dialog-checkbox-" + user + "' class='" + user + "' style='display:inline-block;min-width:80px;'>" + name + "</label>" ).append( count ) );
			}

			var updateDialogCss = function() {
				for ( var i = _self.data.dialogStyleSheet.cssRules.length - 1; i >= 0; i-- ) {
					_self.data.dialogStyleSheet.deleteRule( i );
				}

				$( "input.dialog-user-checkbox", buttonPanel ).each( function( i, checkbox ) {
					var checked = $( checkbox ).is( ":checked" );
					if ( !checked ) {
						var user = $( checkbox ).data( "user-id" );
						_self.data.dialogStyleSheet.insertRule( "#ruru-log-table ." + user + " {display:none;}" );
					}
				} );
			};

			$( "input.dialog-user-checkbox", buttonPanel ).on( "click", updateDialogCss );

			$( "span.dialog-user-count", buttonPanel ).on( "click", function() {
				var user = $( this ).data( "user-id" );

				$( "input.dialog-user-checkbox", buttonPanel ).removeAttr( "checked", false );

				// $( "#dialog-checkbox-" + user, buttonPanel ).attr( "checked",
				// true );
				$( "#dialog-checkbox-" + user )[0].checked = true;

				updateDialogCss();
			} );

			$( "<button>ALL</button>" ).button().css( "margin", "0px" ).appendTo( buttonPanel ).on( "click", function() {
				$( "input.dialog-user-checkbox", buttonPanel ).each( function( i, checkbox ) {
					// $( checkbox ).attr( "checked", true );
					checkbox.checked = true;
				} );

				updateDialogCss();
			} );

			console.log( "ユーザー把握", _self.data.names );
		},
		load : function() {
			var _self = this;

			if ( _self.data.active ) {
				var date = $( "#No08>span" ).text();
				if ( date.match( /([^\s]+)\s+([^\s]+)/ ) ) {
					var d1 = RegExp.$1;
					var d2 = RegExp.$2;

					_self.data.day = d1;
					_self.data.prevstatus = _self.data.status;

					if ( d2 === "開始前" ) {
						_self.data.status = 0;
						return;
					} else if ( d2 === "昼" ) {
						_self.data.status = 1;
					} else if ( d2 === "夕刻" ) {
						_self.data.status = 2;
					} else if ( d2 === "夜" ) {
						_self.data.status = 3;
					} else if ( d2 === "夜明け" ) {
						_self.data.status = 4;
					} else if ( d2 === "ゲーム終了" ) {
						_self.data.status = 5;
					}

					if ( _self.data.loaded ) {
						$( "#No01 td" ).each( function( i, td ) {
							var text = $( td ).text();
							if ( text !== "　" ) {
								var line = Math.floor( i / 6 );
								var position = ( i % 6 );

								switch ( position ) {
								case 0:
								case 1:
								case 4:
									_self.marking( td, "user-" + ( line * 2 ) );
									break;
								case 2:
								case 3:
								case 5:
									_self.marking( td, "user-" + ( ( line * 2 ) + 1 ) );
									break;
								default:
									break;
								}
							}
						} );
					} else {
						_self.setup();
						_self.updateCss();
					}
				}
			}
		},
		onPageAction : function( request, sender, sendResponse ) {
			var _self = this;

			if ( request.action == "updateChat" ) {
				_self.load();
				_self.onUpdateChat();
				sendResponse( {} );
			} else if ( request.action === "click" ) {
				if ( _self.data.active ) {
					return;
				} else {
					_self.data.active = true;
					if ( !$( "#SC" ).is( ":checked" ) ) {
						$( "#SC" ).click();
					}

					$( "#messageInput" ).keypress( function( event ) {
						if ( event.ctrlKey && event.which == 10 ) {
							$( "#todob" ).click();
						}
					} );

					_self.load();
					_self.reverseChat();
				}

				sendResponse( {
					active : _self.data.active
				} );

			} else {
				sendResponse( {} );
			}
		},
		onUpdateChat : function() {
			var _self = this;

			if ( _self.data.active ) {
				_self.reverseChat();
			}
		},
		reverseChat : function() {
			var _self = this;

			if ( _self.data.reverseLog ) {
				var tbody = $( "#chatscr2_1>.d1215>span>table>tbody" );
				var mslist = tbody.children().get().reverse();

				if ( _self.data.prevstatus == 1 && _self.data.prevstatus != _self.data.status ) {
					_self.data.log[_self.data.day] = mslist;
				}

				if ( _self.data.loaded ) {
					tbody.empty();
					for ( var i = 0; i < mslist.length; i++ ) {
						var row = mslist[i];
						var cn = $( "td.cn>span.name", row );
						if ( cn.length ) {
							var name = cn.text();
							var user = _self.data.names[name];
							$( "td", row ).addClass( user ).data( "user-id", user );
						}
						tbody.append( row );
					}
				} else {
					tbody.empty().append( mslist );
				}

				var h1 = $( "#chatscr2_1>.d1215" ).height() + 100;
				$( '#chatscr2_1' ).scrollTop( h1 );
			} else {
				var mslist = $( "#chatscr2_1>.d1215>span>table>tbody>tr" );

				if ( _self.data.prevstatus == 1 && _self.data.prevstatus != _self.data.status ) {
					_self.data.log[_self.data.day] = mslist.get();
				}

				if ( _self.data.loaded ) {
					for ( var i = 0; i < mslist.length; i++ ) {
						var row = mslist[i];
						var cn = $( "td.cn>span.name", row );
						if ( cn.length ) {
							var name = cn.text();
							var user = _self.data.names[name];
							$( "td", row ).addClass( user ).data( "user-id", user );
						}
					}
				}
			}
		},
		createMenu : function( user ) {
			var _self = this;

			if ( user ) {
				var userData = _self.data.users[user];

				if ( userData["役職"] === "占い" ) {
					var post;

					if ( userData["役職解除"] ) {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-closethick'></span>占い</a></li>" );
					} else {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-check'></span>占い</a></li>" );
					}

					_self.data.menu.append( post );
					_self.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
					postsub.append( "<li id='menu-remove-position'><a href='#'><span class='ui-icon ui-icon-close'></span>削除</a></li>" );
					postsub.append( "<li id='menu-rei'><a href='#'><span class='ui-icon ui-icon-heart'></span>霊能</a></li>" );
					postsub.append( "<li id='menu-kari'><a href='#'><span class='ui-icon ui-icon-note'></span>狩人</a></li>" );
					postsub.append( "<li id='menu-kyo'><a href='#'><span class='ui-icon ui-icon-link'></span>共有</a></li>" );
					postsub.append( "<li id='menu-mad'><a href='#'><span class='ui-icon ui-icon-circle-minus'></span>狂人</a></li>" );
					postsub.append( "<li id='menu-wolf'><a href='#'><span class='ui-icon ui-icon-circle-close'></span>人狼</a></li>" );
					postsub.append( "<li id='menu-fox'><a href='#'><span class='ui-icon ui-icon-alert'></span>狐</a></li>" );

					var white = $( "<ul></ul>" ).appendTo( $( "<li id='menu-ura-white'><a href='#'><span class='ui-icon ui-icon-radio-off'></span>村人</a></li>" ).appendTo( _self.data.menu ) );
					var black = $( "<ul></ul>" ).appendTo( $( "<li id='menu-ura-black'><a href='#'><span class='ui-icon ui-icon-bullet'></span>人狼</a></li>" ).appendTo( _self.data.menu ) );

					for ( var name in _self.data.names ) {
						var targetUser = _self.data.names[name];

						if ( !userData["結果"][targetUser] && targetUser !== user ) {
							$( "<li id='menu-ura-result-white'><a href='#'><span class='ui-icon ui-icon-search'></span>" + name + "</a></li>" ).data( "user-id", targetUser ).appendTo( white );
							$( "<li id='menu-ura-result-black'><a href='#'><span class='ui-icon ui-icon-search'></span>" + name + "</a></li>" ).data( "user-id", targetUser ).appendTo( black );
						}
					}

					_self.data.menu.append( "<hr/>" );

				} else if ( userData["役職"] === "霊能" ) {
					var post;

					if ( userData["役職解除"] ) {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-closethick'></span>霊能</a></li>" );
					} else {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-check'></span>霊能</a></li>" );
					}

					_self.data.menu.append( post );
					_self.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
					postsub.append( "<li id='menu-remove-position'><a href='#'><span class='ui-icon ui-icon-close'></span>削除</a></li>" );
					postsub.append( "<li id='menu-ura'><a href='#'><span class='ui-icon ui-icon-search'></span>占い</a></li>" );
					postsub.append( "<li id='menu-kari'><a href='#'><span class='ui-icon ui-icon-note'></span>狩人</a></li>" );
					postsub.append( "<li id='menu-kyo'><a href='#'><span class='ui-icon ui-icon-link'></span>共有</a></li>" );
					postsub.append( "<li id='menu-mad'><a href='#'><span class='ui-icon ui-icon-circle-minus'></span>狂人</a></li>" );
					postsub.append( "<li id='menu-wolf'><a href='#'><span class='ui-icon ui-icon-circle-close'></span>人狼</a></li>" );
					postsub.append( "<li id='menu-fox'><a href='#'><span class='ui-icon ui-icon-alert'></span>狐</a></li>" );

					var white = $( "<ul></ul>" ).appendTo( $( "<li id='menu-rei-white'><a href='#'><span class='ui-icon ui-icon-radio-off'></span>村人</a></li>" ).appendTo( _self.data.menu ) );
					var black = $( "<ul></ul>" ).appendTo( $( "<li id='menu-rei-black'><a href='#'><span class='ui-icon ui-icon-bullet'></span>人狼</a></li>" ).appendTo( _self.data.menu ) );

					for ( var name in _self.data.names ) {
						var targetUser = _self.data.names[name];

						if ( !userData["結果"][targetUser] && targetUser !== user && name !== "第一犠牲者" ) {
							$( "<li id='menu-rei-result-white'><a href='#'><span class='ui-icon ui-icon-heart'></span>" + name + "</a></li>" ).data( "user-id", targetUser ).appendTo( white );
							$( "<li id='menu-rei-result-black'><a href='#'><span class='ui-icon ui-icon-heart'></span>" + name + "</a></li>" ).data( "user-id", targetUser ).appendTo( black );
						}
					}

					_self.data.menu.append( "<hr/>" );

				} else if ( userData["役職"] === "狩人" ) {

					var post;

					if ( userData["役職解除"] ) {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-closethick'></span>狩人</a></li>" );
					} else {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-check'></span>狩人</a></li>" );
					}

					_self.data.menu.append( post );
					_self.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
					postsub.append( "<li id='menu-remove-position'><a href='#'><span class='ui-icon ui-icon-close'></span>削除</a></li>" );
					postsub.append( "<li id='menu-ura'><a href='#'><span class='ui-icon ui-icon-search'></span>占い</a></li>" );
					postsub.append( "<li id='menu-rei'><a href='#'><span class='ui-icon ui-icon-heart'></span>霊能</a></li>" );
					postsub.append( "<li id='menu-kyo'><a href='#'><span class='ui-icon ui-icon-link'></span>共有</a></li>" );
					postsub.append( "<li id='menu-mad'><a href='#'><span class='ui-icon ui-icon-circle-minus'></span>狂人</a></li>" );
					postsub.append( "<li id='menu-wolf'><a href='#'><span class='ui-icon ui-icon-circle-close'></span>人狼</a></li>" );
					postsub.append( "<li id='menu-fox'><a href='#'><span class='ui-icon ui-icon-alert'></span>狐</a></li>" );
				} else if ( userData["役職"] === "共有" ) {

					var post;

					if ( userData["役職解除"] ) {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-closethick'></span>共有</a></li>" );
					} else {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-check'></span>共有</a></li>" );
					}

					_self.data.menu.append( post );
					_self.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
					postsub.append( "<li id='menu-remove-position'><a href='#'><span class='ui-icon ui-icon-close'></span>削除</a></li>" );
					postsub.append( "<li id='menu-ura'><a href='#'><span class='ui-icon ui-icon-search'></span>占い</a></li>" );
					postsub.append( "<li id='menu-rei'><a href='#'><span class='ui-icon ui-icon-heart'></span>霊能</a></li>" );
					postsub.append( "<li id='menu-kari'><a href='#'><span class='ui-icon ui-icon-note'></span>狩人</a></li>" );
					postsub.append( "<li id='menu-mad'><a href='#'><span class='ui-icon ui-icon-circle-minus'></span>狂人</a></li>" );
					postsub.append( "<li id='menu-wolf'><a href='#'><span class='ui-icon ui-icon-circle-close'></span>人狼</a></li>" );
					postsub.append( "<li id='menu-fox'><a href='#'><span class='ui-icon ui-icon-alert'></span>狐</a></li>" );
				} else if ( userData["役職"] === "狂人" ) {

					var post;

					if ( userData["役職解除"] ) {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-closethick'></span>狂人</a></li>" );
					} else {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-check'></span>狂人</a></li>" );
					}

					_self.data.menu.append( post );
					_self.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
					postsub.append( "<li id='menu-remove-position'><a href='#'><span class='ui-icon ui-icon-close'></span>削除</a></li>" );
					postsub.append( "<li id='menu-ura'><a href='#'><span class='ui-icon ui-icon-search'></span>占い</a></li>" );
					postsub.append( "<li id='menu-rei'><a href='#'><span class='ui-icon ui-icon-heart'></span>霊能</a></li>" );
					postsub.append( "<li id='menu-kari'><a href='#'><span class='ui-icon ui-icon-note'></span>狩人</a></li>" );
					postsub.append( "<li id='menu-kyo'><a href='#'><span class='ui-icon ui-icon-link'></span>共有</a></li>" );
					postsub.append( "<li id='menu-wolf'><a href='#'><span class='ui-icon ui-icon-circle-close'></span>人狼</a></li>" );
					postsub.append( "<li id='menu-fox'><a href='#'><span class='ui-icon ui-icon-alert'></span>狐</a></li>" );
				} else if ( userData["役職"] === "人狼" ) {

					var post;

					if ( userData["役職解除"] ) {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-closethick'></span>人狼</a></li>" );
					} else {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-check'></span>人狼</a></li>" );
					}

					_self.data.menu.append( post );
					_self.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
					postsub.append( "<li id='menu-remove-position'><a href='#'><span class='ui-icon ui-icon-close'></span>削除</a></li>" );
					postsub.append( "<li id='menu-ura'><a href='#'><span class='ui-icon ui-icon-search'></span>占い</a></li>" );
					postsub.append( "<li id='menu-rei'><a href='#'><span class='ui-icon ui-icon-heart'></span>霊能</a></li>" );
					postsub.append( "<li id='menu-kari'><a href='#'><span class='ui-icon ui-icon-note'></span>狩人</a></li>" );
					postsub.append( "<li id='menu-kyo'><a href='#'><span class='ui-icon ui-icon-link'></span>共有</a></li>" );
					postsub.append( "<li id='menu-mad'><a href='#'><span class='ui-icon ui-icon-circle-minus'></span>狂人</a></li>" );
					postsub.append( "<li id='menu-fox'><a href='#'><span class='ui-icon ui-icon-alert'></span>狐</a></li>" );
				} else if ( userData["役職"] === "狐" ) {

					var post;

					if ( userData["役職解除"] ) {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-closethick'></span>狐</a></li>" );
					} else {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-check'></span>狐</a></li>" );
					}

					_self.data.menu.append( post );
					_self.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
					postsub.append( "<li id='menu-remove-position'><a href='#'><span class='ui-icon ui-icon-close'></span>削除</a></li>" );
					postsub.append( "<li id='menu-ura'><a href='#'><span class='ui-icon ui-icon-search'></span>占い</a></li>" );
					postsub.append( "<li id='menu-rei'><a href='#'><span class='ui-icon ui-icon-heart'></span>霊能</a></li>" );
					postsub.append( "<li id='menu-kari'><a href='#'><span class='ui-icon ui-icon-note'></span>狩人</a></li>" );
					postsub.append( "<li id='menu-kyo'><a href='#'><span class='ui-icon ui-icon-link'></span>共有</a></li>" );
					postsub.append( "<li id='menu-mad'><a href='#'><span class='ui-icon ui-icon-circle-minus'></span>狂人</a></li>" );
					postsub.append( "<li id='menu-wolf'><a href='#'><span class='ui-icon ui-icon-circle-close'></span>人狼</a></li>" );
				} else {
					_self.data.menu.append( "<li id='menu-ura'><a href='#'><span class='ui-icon ui-icon-search'></span>占い</a></li>" );
					_self.data.menu.append( "<li id='menu-rei'><a href='#'><span class='ui-icon ui-icon-heart'></span>霊能</a></li>" );
					_self.data.menu.append( "<li id='menu-kari'><a href='#'><span class='ui-icon ui-icon-note'></span>狩人</a></li>" );
					_self.data.menu.append( "<li id='menu-kyo'><a href='#'><span class='ui-icon ui-icon-link'></span>共有</a></li>" );
					_self.data.menu.append( "<li id='menu-mad'><a href='#'><span class='ui-icon ui-icon-circle-minus'></span>狂人</a></li>" );
					_self.data.menu.append( "<li id='menu-wolf'><a href='#'><span class='ui-icon ui-icon-circle-close'></span>人狼</a></li>" );
					_self.data.menu.append( "<li id='menu-fox'><a href='#'><span class='ui-icon ui-icon-alert'></span>狐</a></li>" );
					_self.data.menu.append( "<hr/>" );
				}
			}

			var logmenu = $( "<li id='menu-log'><a href='#'><span class='ui-icon ui-icon-comment'></span>ログ</a></li>" );
			var logsub = $( "<ul></ul>" ).appendTo( logmenu );

			var haslog = false;
			for ( var day in _self.data.log ) {
				logsub.append( "<li id='menu-log-of-day'><a href='#'><span class='ui-icon ui-icon-comment'></span>" + day + "</a></li>" );
				haslog = true;
				logmenu.data( "last-day", day );
			}

			if ( haslog ) {
				_self.data.menu.append( logmenu );
			}

			_self.data.menu.append( "<li id='menu-person'><a href='#'><span class='ui-icon ui-icon-person'></span>内訳</a></li>" );

			var optionalMenu = $( "<ul></ul>" ).appendTo( $( "<li id='menu-optional'><a href='#'><span class='ui-icon ui-icon-wrench'></span>表示切替</a></li>" ).appendTo( _self.data.menu ) );

			if ( _self.data.showuranai ) {
				optionalMenu.append( "<li id='menu-showuranai'><a href='#'><span class='ui-icon ui-icon-check'></span>占い結果表示</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-showuranai'><a href='#'><span class='ui-icon ui-icon-closethick'></span>占い結果非表示</a></li>" );
			}

			if ( _self.data.showgray ) {
				optionalMenu.append( "<li id='menu-showgray'><a href='#'><span class='ui-icon ui-icon-check'></span>グレー表示</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-showgray'><a href='#'><span class='ui-icon ui-icon-closethick'></span>グレー非表示</a></li>" );
			}

			if ( _self.data.hidecng ) {
				optionalMenu.append( "<li id='menu-hidecng'><a href='#'><span class='ui-icon ui-icon-closethick'></span>GM非表示</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-hidecng'><a href='#'><span class='ui-icon ui-icon-check'></span>GM表示</a></li>" );
			}

			if ( _self.data.hidecnw ) {
				optionalMenu.append( "<li id='menu-hidecnw'><a href='#'><span class='ui-icon ui-icon-closethick'></span>観戦非表示</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-hidecnw'><a href='#'><span class='ui-icon ui-icon-check'></span>観戦表示</a></li>" );
			}

			if ( _self.data.reverseLog ) {
				optionalMenu.append( "<li id='menu-reverse-log'><a href='#'><span class='ui-icon ui-icon-check'></span>チャット反転</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-reverse-log'><a href='#'><span class='ui-icon ui-icon-closethick'></span>チャット切り替え</a></li>" );
			}
		},
		execAction : function( user, action, selected ) {
			var _self = this;

			if ( action === "menu-toggle-post" ) {
				_self.data.users[user]["役職解除"] = !_self.data.users[user]["役職解除"];
			} else if ( action === "menu-remove-position" ) {
				_self.data.users[user]["役職"] = undefined;
				_self.data.users[user]["役職解除"] = false;
				_self.data.users[user]["結果"] = {};
			} else if ( action === "menu-ura" ) {
				_self.data.users[user] = {};
				_self.data.users[user]["役職"] = "占い";
				_self.data.users[user]["役職解除"] = false;
				_self.data.users[user]["結果"] = {};
			} else if ( action === "menu-rei" ) {
				_self.data.users[user] = {};
				_self.data.users[user]["役職"] = "霊能";
				_self.data.users[user]["役職解除"] = false;
				_self.data.users[user]["結果"] = {};
			} else if ( action === "menu-kari" ) {
				_self.data.users[user] = {};
				_self.data.users[user]["役職"] = "狩人";
				_self.data.users[user]["役職解除"] = false;
				_self.data.users[user]["結果"] = {};
			} else if ( action === "menu-kyo" ) {
				_self.data.users[user] = {};
				_self.data.users[user]["役職"] = "共有";
				_self.data.users[user]["役職解除"] = false;
			} else if ( action === "menu-mad" ) {
				_self.data.users[user] = {};
				_self.data.users[user]["役職"] = "狂人";
				_self.data.users[user]["役職解除"] = false;
			} else if ( action === "menu-wolf" ) {
				_self.data.users[user] = {};
				_self.data.users[user]["役職"] = "人狼";
				_self.data.users[user]["役職解除"] = false;
			} else if ( action === "menu-fox" ) {
				_self.data.users[user] = {};
				_self.data.users[user]["役職"] = "狐";
				_self.data.users[user]["役職解除"] = false;
			} else if ( action === "menu-reverse-log" ) {
				_self.data.reverseLog = !_self.data.reverseLog;
				if ( localStorage ) {
					localStorage.reverseLog = _self.data.reverseLog;
				}
			} else if ( action === "menu-hidecng" ) {
				_self.data.hidecng = !_self.data.hidecng;
			} else if ( action === "menu-hidecnw" ) {
				_self.data.hidecnw = !_self.data.hidecnw;
				if ( localStorage ) {
					localStorage.hidecnw = _self.data.hidecnw;
				}
			} else if ( action === "menu-showgray" ) {
				_self.data.showgray = !_self.data.showgray;
				if ( localStorage ) {
					localStorage.showgray = _self.data.showgray;
				}
			} else if ( action === "menu-showuranai" ) {
				_self.data.showuranai = !_self.data.showuranai;
				if ( localStorage ) {
					localStorage.showuranai = _self.data.showuranai;
				}
			} else if ( action === "menu-log" ) {
				var buttonPanel = $( _self.data.logDialog ).parents( ".ui-dialog:first" ).children( ".ui-dialog-buttonpane:first" );
				var day = $( selected ).data( "last-day" );
				_self.data.logDialog.dialog( "option", "title", day );

				$( "#ruru-log-table", _self.data.logDialog ).empty().append( _self.data.log[day] );
				for ( var name in _self.data.names ) {
					var targetUser = _self.data.names[name];

					var count = $( "." + targetUser, _self.data.log[day] ).length / 2;
					$( ".count-" + targetUser, buttonPanel ).text( "[" + count + "]" );
				}

				_self.data.logDialog.dialog( "open" );
			} else if ( action === "menu-log-of-day" ) {
				var buttonPanel = $( _self.data.logDialog ).parents( ".ui-dialog:first" ).children( ".ui-dialog-buttonpane:first" );
				var day = $( selected ).text();
				_self.data.logDialog.dialog( "option", "title", day );
				$( "#ruru-log-table", _self.data.logDialog ).empty().append( _self.data.log[day] );

				for ( var name in _self.data.names ) {
					var targetUser = _self.data.names[name];

					var count = $( "." + targetUser, _self.data.log[day] ).length / 2;
					$( ".count-" + targetUser, buttonPanel ).text( "[" + count + "]" );
				}

				_self.data.logDialog.dialog( "open" );
			} else if ( action === "menu-person" ) {
				_self.data.positionDialog.dialog( "open" );
			} else if ( action === "menu-ura-result-white" ) {
				var targetUser = $( selected ).data( "user-id" );
				_self.data.users[user]["結果"][targetUser] = "村人";
			} else if ( action === "menu-ura-result-black" ) {
				var targetUser = $( selected ).data( "user-id" );
				_self.data.users[user]["結果"][targetUser] = "人狼";
			} else if ( action === "menu-rei-result-white" ) {
				var targetUser = $( selected ).data( "user-id" );
				_self.data.users[user]["結果"][targetUser] = "村人";
			} else if ( action === "menu-rei-result-black" ) {
				var targetUser = $( selected ).data( "user-id" );
				_self.data.users[user]["結果"][targetUser] = "人狼";
			}

			_self.updateCss();
			_self.updatePosition();
		},
		updatePosition : function() {
			var _self = this;

			var dialog = $( "#ruru-ext-position-dialog" ).empty();

			var uranai = undefined;
			var reinou = undefined;
			var karido = undefined;
			var kyouyu = undefined;
			var kyojin = undefined;
			var jinrou = undefined;
			var kitune = undefined;

			for ( var name in _self.data.names ) {
				var user = _self.data.names[name];
				var userData = _self.data.users[user];

				if ( userData["役職"] === "占い" ) {
					if ( !uranai ) {
						uranai = $( "<div></div>" );
					}
					var position = $( "<div class='position'></div>" ).append( "<div style='display:inline-block;min-width:65px;padding:3px;margin-right:5px;' class='position-user " + user + "'>" + name + "&nbsp;&nbsp;：</div>" ).appendTo( uranai ).data( "user-id", user );
					var result = $( "<div style='display:inline-block;'></div>" ).appendTo( position );
					for ( var targetUser in userData["結果"] ) {
						if ( userData["結果"][targetUser] === "村人" ) {
							result.append( $( "<div style='display:inline-block;padding:3px;margin-right:5px;' class='position-target " + targetUser + "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-radio-off'></span>" + _self.data.nameMap[targetUser] + "</div>" )
									.data( "user-id", targetUser ) );
						} else {
							result.append( $( "<div style='display:inline-block;padding:3px;margin-right:5px;' class='position-target " + targetUser + "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-bullet'></span>" + _self.data.nameMap[targetUser] + "</div>" )
									.data( "user-id", targetUser ) );
						}
					}
				} else if ( userData["役職"] === "霊能" ) {
					if ( !reinou ) {
						reinou = $( "<div></div>" );
					}
					var position = $( "<div class='position'></div>" ).append( "<div style='display:inline-block;min-width:65px;padding:3px;margin-right:5px;' class='position-user " + user + "'>" + name + "&nbsp;&nbsp;：</div>" ).appendTo( reinou ).data( "user-id", user );
					var result = $( "<div style='display:inline-block;'></div>" ).appendTo( position );
					for ( var targetUser in userData["結果"] ) {
						if ( userData["結果"][targetUser] === "村人" ) {
							result.append( $( "<div style='display:inline-block;padding:3px;margin-right:5px;' class='position-target " + targetUser + "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-radio-off'></span>" + _self.data.nameMap[targetUser] + "</div>" )
									.data( "user-id", targetUser ) );
						} else {
							result.append( $( "<div style='display:inline-block;padding:3px;margin-right:5px;' class='position-target " + targetUser + "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-bullet'></span>" + _self.data.nameMap[targetUser] + "</div>" )
									.data( "user-id", targetUser ) );
						}
					}
				} else if ( userData["役職"] === "狩人" ) {
					if ( !karido ) {
						karido = $( "<div></div>" );
					}
					karido.append( $( "<div style='display:inline-block;min-width:65px;padding:3px;margin-right:5px;' class='position position-user " + user + "'>" + name + "</div>" ).data( "user-id", user ) );
				} else if ( userData["役職"] === "共有" ) {
					if ( !kyouyu ) {
						kyouyu = $( "<div></div>" );
					}
					kyouyu.append( $( "<div style='display:inline-block;min-width:65px;padding:3px;margin-right:5px;' class='position position-user " + user + "'>" + name + "</div>" ).data( "user-id", user ) );
				} else if ( userData["役職"] === "狂人" ) {
					if ( !kyojin ) {
						kyojin = $( "<div></div>" );
					}
					kyojin.append( $( "<div style='display:inline-block;min-width:65px;padding:3px;margin-right:5px;' class='position position-user " + user + "'>" + name + "</div>" ).data( "user-id", user ) );
				} else if ( userData["役職"] === "人狼" ) {
					if ( !jinrou ) {
						jinrou = $( "<div></div>" );
					}
					jinrou.append( $( "<div style='display:inline-block;min-width:65px;padding:3px;margin-right:5px;' class='position position-user " + user + "'>" + name + "</div>" ).data( "user-id", user ) );
				} else if ( userData["役職"] === "狐" ) {
					if ( !kitune ) {
						kitune = $( "<div></div>" );
					}
					kitune.append( $( "<div style='display:inline-block;min-width:65px;padding:3px;margin-right:5px;' class='position position-user " + user + "'>" + name + "</div>" ).data( "user-id", user ) );
				}
			}

			if ( uranai ) {
				dialog.append( "<h3>占い</h3>" );
				dialog.append( uranai );
			}
			if ( reinou ) {
				dialog.append( "<h3>霊能</h3>" );
				dialog.append( reinou );
			}
			if ( karido ) {
				dialog.append( "<h3>狩人</h3>" );
				dialog.append( karido );
			}
			if ( kyouyu ) {
				dialog.append( "<h3>共有</h3>" );
				dialog.append( kyouyu );
			}
			if ( kyojin ) {
				dialog.append( "<h3>狂人</h3>" );
				dialog.append( kyojin );
			}
			if ( jinrou ) {
				dialog.append( "<h3>人狼</h3>" );
				dialog.append( jinrou );
			}
			if ( kitune ) {
				dialog.append( "<h3>狐</h3>" );
				dialog.append( kitune );
			}

			$( ".position-user", dialog ).on( "dblclick", function( e ) {
				var delUser;
				if ( $( this ).hasClass( "position" ) ) {
					delUser = $( this ).data( "user-id" );
				} else {
					delUser = $( this ).parents( ".position:first" ).data( "user-id" );
				}

				if ( delUser ) {
					_self.data.users[delUser]["役職"] = undefined;
					_self.data.users[delUser]["役職解除"] = false;
					_self.data.users[delUser]["結果"] = {};

					_self.updateCss();
					_self.updatePosition();
				}
			} );

			$( ".position-target", dialog ).on( "dblclick", function( e ) {
				var delTarget = $( this ).data( "user-id" );
				var targetPosition = $( this ).parents( ".position:first" ).data( "user-id" );

				if ( delTarget && targetPosition ) {
					delete _self.data.users[targetPosition]["結果"][delTarget];

					_self.updateCss();
					_self.updatePosition();
				}
			} );
		},
		updateCss : function() {
			var _self = this;

			for ( var i = _self.data.styleSheet.cssRules.length - 1; i >= 0; i-- ) {
				_self.data.styleSheet.deleteRule( i );
			}

			var uraCount = 0;
			var usersStatus = {};

			for ( var name in _self.data.names ) {
				uraCount++;
				var user = _self.data.names[name];
				var userData = _self.data.users[user];

				if ( userData["役職"] === "占い" && !userData["役職解除"] ) {
					_self.data.styleSheet.insertRule( "." + user + " {background-color:#E6E6FA;color:#4169E1;}" );
					for ( var targetUser in userData["結果"] ) {
						if ( userData["結果"][targetUser] === "村人" ) {
							if ( usersStatus[targetUser] ) {
								usersStatus[targetUser]["white"]++;
							} else {
								usersStatus[targetUser] = {
									"white" : 1,
									"black" : 0
								};
							}
						} else {
							if ( usersStatus[targetUser] ) {
								usersStatus[targetUser]["black"]++;
							} else {
								usersStatus[targetUser] = {
									"white" : 0,
									"black" : 1
								};
							}
						}
					}
				}
			}

			for ( var name in _self.data.names ) {
				var user = _self.data.names[name];
				var userData = _self.data.users[user];

				var style = "";

				if ( usersStatus[user] && _self.data.showuranai ) {
					if ( usersStatus[user]["white"] === uraCount ) {
						style += "font-weight:bold;";
					} else if ( usersStatus[user]["black"] === uraCount ) {
						style += "font-style:italic;text-decoration:underline;";
					} else {
						if ( usersStatus[user]["white"] > 0 ) {
							style += "font-weight:bold;";
						}
						if ( usersStatus[user]["black"] > 0 ) {
							style += "font-style:italic;";
						}
					}
				}

				if ( userData["役職"] === "占い" && !userData["役職解除"] ) {
					_self.data.styleSheet.insertRule( "." + user + " {background-color:#E6E6FA;color:#4169E1;" + style + "}" );
				} else if ( userData["役職"] === "霊能" && !userData["役職解除"] ) {
					_self.data.styleSheet.insertRule( "." + user + " {background-color:#E6E6FA;color:#DC143C;" + style + "}" );
				} else if ( userData["役職"] === "狩人" && !userData["役職解除"] ) {
					_self.data.styleSheet.insertRule( "." + user + " {background-color:#EEE8AA;color:#DC143C;" + style + "}" );
				} else if ( userData["役職"] === "共有" && !userData["役職解除"] ) {
					_self.data.styleSheet.insertRule( "." + user + " {background-color:#EEE8AA;color:#228B22;" + style + "}" );
				} else if ( userData["役職"] === "狂人" && !userData["役職解除"] ) {
					_self.data.styleSheet.insertRule( "." + user + " {background-color:#000000;color:#00FFFF;" + style + "}" );
				} else if ( userData["役職"] === "人狼" && !userData["役職解除"] ) {
					_self.data.styleSheet.insertRule( "." + user + " {background-color:#000000;color:#FF0000;" + style + "}" );
				} else if ( userData["役職"] === "狐" && !userData["役職解除"] ) {
					_self.data.styleSheet.insertRule( "." + user + " {background-color:#000000;color:#FFFF00;" + style + "}" );
				} else if ( !usersStatus[user] && _self.data.showgray ) {
					_self.data.styleSheet.insertRule( "." + user + " {background-color:#696969;color:#FFFFFF;}" );
				} else {
					_self.data.styleSheet.insertRule( "." + user + " {" + style + "}" );
				}
			}

			if ( _self.data.hidecng ) {
				_self.data.styleSheet.insertRule( ".cng {display:none;}" );
				_self.data.styleSheet.insertRule( ".ccg {display:none;}" );
			}

			if ( _self.data.hidecnw ) {
				_self.data.styleSheet.insertRule( ".cnw {display:none;}" );
				_self.data.styleSheet.insertRule( ".ccw {display:none;}" );
			}
		}
	};

	var RuruExt = new _RuruExt();

	RuruExt.init();
} );
