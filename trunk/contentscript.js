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
			reverseLog : true,
			baloon : undefined,
			menu : undefined,
			styleSheet : undefined,
			logDialog : undefined,
			positionDialog : undefined,
			log : {},
			dialogStyleSheet : undefined
		},
		init : function() {
			chrome.extension.sendRequest( {
				action : "init"
			}, RuruExt.onInit );
		},
		onInit : function( response ) {
			chrome.extension.onRequest.addListener( RuruExt.onPageAction );
		},
		marking : function( target, user ) {
			$( target ).addClass( user ).data( "user-id", user );
		},
		setup : function() {
			console.log( "start setup" );

			RuruExt.data.loaded = true;

			$( "head" ).append( "<style id='ruru-ext-styles' type='text/css'></style>" );
			$( "head" ).append( "<style id='ruru-ext-dialog-styles' type='text/css'></style>" );
			for ( var i = 0; i < document.styleSheets.length; i++ ) {
				var styleTag = document.styleSheets.item( i ).ownerNode;
				if ( $( styleTag ).attr( "id" ) === "ruru-ext-styles" ) {
					RuruExt.data.styleSheet = document.styleSheets.item( i );
				} else if ( $( styleTag ).attr( "id" ) === "ruru-ext-dialog-styles" ) {
					RuruExt.data.dialogStyleSheet = document.styleSheets.item( i );
				}
			}

			RuruExt.data.logDialog = $( "<div style='font-size:11px;overflow-y:scroll;'><table style='width:100%;background:white;'><tbody id='ruru-log-table'></tbody></table></div>" ).appendTo( "body" ).dialog( {
				autoOpen : false,
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

			RuruExt.data.positionDialog = $( "<div style='font-size:11px;overflow:auto;' id='ruru-ext-position-dialog'></div>" ).appendTo( "body" ).dialog( {
				autoOpen : false,
				minWidth : uw,
				height : uh,
				title : "内訳",
				position : [ ul, ut ]
			} );

			RuruExt.data.baloon = function( message ) {

			};

			RuruExt.data.menu = $( "<ul style='display:none; position:absolute;z-index:6000;font-size:11px;white-space:nowrap;min-width:130px'></ul>" );
			RuruExt.data.menu.appendTo( "body" );
			RuruExt.data.menu.menu();

			var hidemenu = function( event, target ) {
				if ( !event || event.result ) {
					$( document ).off( "mousedown", checkExternalClick );
					RuruExt.data.menu.hide();
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

				$( "li>ul,li>ol", RuruExt.data.menu ).hide();

				RuruExt.data.menu.menu( "destroy" );
				RuruExt.data.menu.empty();
				$( menuTarget ).trigger( "preparemenu" );
				RuruExt.data.menu.menu();
				RuruExt.data.menu.show();

				var wh = $( window ).height();
				var mh = RuruExt.data.menu.height();
				var limitTop = wh - mh - 10;

				RuruExt.data.menu.css( "top", limitTop < event.pageY ? limitTop : event.pageY );
				RuruExt.data.menu.css( "left", event.pageX );

				$( "a", RuruExt.data.menu ).off( "click" );
				$( "a", RuruExt.data.menu ).on( "click", function() {
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

				RuruExt.createMenu( user );

			} ).on( "execmenu", function( event, target ) {
				hidemenu();

				var action = $( event.target ).attr( "id" );
				var user = $( target ).data( "user-id" );

				RuruExt.execAction( user, action, event.target );
			} );

			$( "#No01 td" ).each( function( i, td ) {
				var text = $( td ).text();
				if ( text !== "　" ) {
					var line = Math.floor( i / 6 );
					var position = ( i % 6 );

					switch ( position ) {
					case 0:
						RuruExt.data.users["user-" + ( line * 2 )] = {};
						RuruExt.marking( td, "user-" + ( line * 2 ) );
						break;
					case 1:
						RuruExt.data.names[text] = "user-" + ( line * 2 );
						RuruExt.data.nameMap["user-" + ( line * 2 )] = text;
						RuruExt.marking( td, "user-" + ( line * 2 ) );
						break;
					case 2:
						RuruExt.data.users["user-" + ( ( line * 2 ) + 1 )] = {};
						RuruExt.marking( td, "user-" + ( ( line * 2 ) + 1 ) );
						break;
					case 3:
						RuruExt.data.names[text] = "user-" + ( ( line * 2 ) + 1 );
						RuruExt.data.nameMap["user-" + ( ( line * 2 ) + 1 )] = text;
						RuruExt.marking( td, "user-" + ( ( line * 2 ) + 1 ) );
						break;
					case 4:
						RuruExt.marking( td, "user-" + ( line * 2 ) );
						break;
					case 5:
						RuruExt.marking( td, "user-" + ( ( line * 2 ) + 1 ) );
						break;
					default:
						break;
					}
				}
			} );

			var buttonPanel = $( RuruExt.data.logDialog ).parents( ".ui-dialog:first" ).children( ".ui-dialog-buttonpane:first" ).css( "font-size", "11px" ).empty();

			for ( var name in RuruExt.data.names ) {
				var user = RuruExt.data.names[name];
				var checkbox = $( "<input class='dialog-user-checkbox' type='checkbox' id='dialog-checkbox-" + user + "' value='" + user + "' style='vertical-align:sub;'/>" ).attr( "checked", true ).data( "user-id", user );
				var count = $( "<span class='dialog-user-count count-" + user + "' style='display:inline-block;min-width:30px;cursor:pointer;font-weight:bold;'>[0]</span>" ).data( "user-id", user );
				buttonPanel.append( $( "<div style='display:inline-block;white-space:nowrap;'></div>" ).append( checkbox ).append( "<label for='dialog-checkbox-" + user + "' class='" + user + "' style='display:inline-block;min-width:80px;'>" + name + "</label>" ).append( count ) );
			}

			var updateDialogCss = function() {
				for ( var i = RuruExt.data.dialogStyleSheet.cssRules.length - 1; i >= 0; i-- ) {
					RuruExt.data.dialogStyleSheet.deleteRule( i );
				}

				$( "input.dialog-user-checkbox", buttonPanel ).each( function( i, checkbox ) {
					var checked = $( checkbox ).is( ":checked" );
					if ( !checked ) {
						var user = $( checkbox ).data( "user-id" );
						RuruExt.data.dialogStyleSheet.insertRule( "#ruru-log-table ." + user + " {display:none;}" );
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
		},
		load : function() {
			if ( RuruExt.data.active ) {
				var date = $( "#No08>span" ).text();
				if ( date.match( /([^\s]+)\s+([^\s]+)/ ) ) {
					var d1 = RegExp.$1;
					var d2 = RegExp.$2;

					RuruExt.data.day = d1;
					RuruExt.data.prevstatus = RuruExt.data.status;

					if ( d2 === "開始前" ) {
						RuruExt.data.status = 0;
						return;
					} else if ( d2 === "昼" ) {
						RuruExt.data.status = 1;
					} else if ( d2 === "夕刻" ) {
						RuruExt.data.status = 2;
					} else if ( d2 === "夜" ) {
						RuruExt.data.status = 3;
					} else if ( d2 === "夜明け" ) {
						RuruExt.data.status = 4;
					} else if ( d2 === "ゲーム終了" ) {
						RuruExt.data.status = 5;
					}

					if ( RuruExt.data.loaded ) {
						$( "#No01 td" ).each( function( i, td ) {
							var text = $( td ).text();
							if ( text !== "　" ) {
								var line = Math.floor( i / 6 );
								var position = ( i % 6 );

								switch ( position ) {
								case 0:
								case 1:
								case 4:
									RuruExt.marking( td, "user-" + ( line * 2 ) );
									break;
								case 2:
								case 3:
								case 5:
									RuruExt.marking( td, "user-" + ( ( line * 2 ) + 1 ) );
									break;
								default:
									break;
								}
							}
						} );
					} else {
						RuruExt.setup();
					}
				}
			}
		},
		onPageAction : function( request, sender, sendResponse ) {
			if ( request.action == "updateChat" ) {
				RuruExt.load();
				RuruExt.onUpdateChat();
				sendResponse( {} );
			} else if ( request.action === "click" ) {
				if ( RuruExt.data.active ) {
					return;
				} else {
					RuruExt.data.active = true;
					if ( !$( "#SC" ).is( ":checked" ) ) {
						$( "#SC" ).click();
					}

					if ( !$( "#isSE" ).is( ":checked" ) ) {
						$( "#isSE" ).click();
					}

					$( "#messageInput" ).keypress( RuruExt.onKeyPress );
					RuruExt.load();
					RuruExt.reverseChat();
				}

				sendResponse( {
					active : RuruExt.data.active
				} );

			} else {
				sendResponse( {} );
			}
		},
		onUpdateChat : function() {
			if ( RuruExt.data.active ) {
				RuruExt.reverseChat();
			}
		},
		onKeyPress : function( event ) {
			if ( event.ctrlKey && event.which == 10 ) {
				$( "#todob" ).click();
			}
		},
		reverseChat : function() {
			if ( RuruExt.data.reverseLog ) {
				var tbody = $( "#chatscr2_1>.d1215>span>table>tbody" );
				var mslist = tbody.children().get().reverse();

				if ( RuruExt.data.prevstatus == 1 && RuruExt.data.prevstatus != RuruExt.data.status ) {
					RuruExt.data.log[RuruExt.data.day] = mslist;
				}

				if ( RuruExt.data.loaded ) {
					tbody.empty();
					for ( var i = 0; i < mslist.length; i++ ) {
						var row = mslist[i];
						var cn = $( "td.cn>span.name", row );
						if ( cn.length ) {
							var name = cn.text();
							var user = RuruExt.data.names[name];
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

				if ( RuruExt.data.prevstatus == 1 && RuruExt.data.prevstatus != RuruExt.data.status ) {
					RuruExt.data.log[RuruExt.data.day] = mslist.get();
				}

				if ( RuruExt.data.loaded ) {
					for ( var i = 0; i < mslist.length; i++ ) {
						var row = mslist[i];
						var cn = $( "td.cn>span.name", row );
						if ( cn.length ) {
							var name = cn.text();
							var user = RuruExt.data.names[name];
							$( "td", row ).addClass( user ).data( "user-id", user );
						}
					}
				}
			}
		},
		createMenu : function( user ) {
			if ( user ) {
				var userData = RuruExt.data.users[user];

				if ( userData["役職"] === "占い" ) {
					var post;

					if ( userData["役職解除"] ) {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-closethick'></span>占い</a></li>" );
					} else {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-check'></span>占い</a></li>" );
					}

					RuruExt.data.menu.append( post );
					RuruExt.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
					postsub.append( "<li id='menu-rei'><a href='#'><span class='ui-icon ui-icon-heart'></span>霊能</a></li>" );
					postsub.append( "<li id='menu-kari'><a href='#'><span class='ui-icon ui-icon-note'></span>狩人</a></li>" );
					postsub.append( "<li id='menu-kyo'><a href='#'><span class='ui-icon ui-icon-link'></span>共有</a></li>" );
					postsub.append( "<li id='menu-mad'><a href='#'><span class='ui-icon ui-icon-circle-minus'></span>狂人</a></li>" );
					postsub.append( "<li id='menu-wolf'><a href='#'><span class='ui-icon ui-icon-circle-close'></span>人狼</a></li>" );
					postsub.append( "<li id='menu-fox'><a href='#'><span class='ui-icon ui-icon-alert'></span>狐</a></li>" );

					var white = $( "<ul></ul>" ).appendTo( $( "<li id='menu-ura-white'><a href='#'><span class='ui-icon ui-icon-radio-off'></span>村人</a></li>" ).appendTo( RuruExt.data.menu ) );
					var black = $( "<ul></ul>" ).appendTo( $( "<li id='menu-ura-black'><a href='#'><span class='ui-icon ui-icon-bullet'></span>人狼</a></li>" ).appendTo( RuruExt.data.menu ) );

					for ( var name in RuruExt.data.names ) {
						var targetUser = RuruExt.data.names[name];

						if ( !userData["結果"][targetUser] && targetUser !== user ) {
							$( "<li id='menu-ura-result-white'><a href='#'><span class='ui-icon ui-icon-search'></span>" + name + "</a></li>" ).data( "user-id", targetUser ).appendTo( white );
							$( "<li id='menu-ura-result-black'><a href='#'><span class='ui-icon ui-icon-search'></span>" + name + "</a></li>" ).data( "user-id", targetUser ).appendTo( black );
						}
					}

					RuruExt.data.menu.append( "<hr/>" );

				} else if ( userData["役職"] === "霊能" ) {
					var post;

					if ( userData["役職解除"] ) {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-closethick'></span>霊能</a></li>" );
					} else {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-check'></span>霊能</a></li>" );
					}

					RuruExt.data.menu.append( post );
					RuruExt.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
					postsub.append( "<li id='menu-ura'><a href='#'><span class='ui-icon ui-icon-search'></span>占い</a></li>" );
					postsub.append( "<li id='menu-kari'><a href='#'><span class='ui-icon ui-icon-note'></span>狩人</a></li>" );
					postsub.append( "<li id='menu-kyo'><a href='#'><span class='ui-icon ui-icon-link'></span>共有</a></li>" );
					postsub.append( "<li id='menu-mad'><a href='#'><span class='ui-icon ui-icon-circle-minus'></span>狂人</a></li>" );
					postsub.append( "<li id='menu-wolf'><a href='#'><span class='ui-icon ui-icon-circle-close'></span>人狼</a></li>" );
					postsub.append( "<li id='menu-fox'><a href='#'><span class='ui-icon ui-icon-alert'></span>狐</a></li>" );

					var white = $( "<ul></ul>" ).appendTo( $( "<li id='menu-rei-white'><a href='#'><span class='ui-icon ui-icon-radio-off'></span>村人</a></li>" ).appendTo( RuruExt.data.menu ) );
					var black = $( "<ul></ul>" ).appendTo( $( "<li id='menu-rei-black'><a href='#'><span class='ui-icon ui-icon-bullet'></span>人狼</a></li>" ).appendTo( RuruExt.data.menu ) );

					for ( var name in RuruExt.data.names ) {
						var targetUser = RuruExt.data.names[name];

						if ( !userData["結果"][targetUser] && targetUser !== user && name !== "第一犠牲者" ) {
							$( "<li id='menu-rei-result-white'><a href='#'><span class='ui-icon ui-icon-heart'></span>" + name + "</a></li>" ).data( "user-id", targetUser ).appendTo( white );
							$( "<li id='menu-rei-result-black'><a href='#'><span class='ui-icon ui-icon-heart'></span>" + name + "</a></li>" ).data( "user-id", targetUser ).appendTo( black );
						}
					}

					RuruExt.data.menu.append( "<hr/>" );

				} else if ( userData["役職"] === "狩人" ) {

					var post;

					if ( userData["役職解除"] ) {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-closethick'></span>狩人</a></li>" );
					} else {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-check'></span>狩人</a></li>" );
					}

					RuruExt.data.menu.append( post );
					RuruExt.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
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

					RuruExt.data.menu.append( post );
					RuruExt.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
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

					RuruExt.data.menu.append( post );
					RuruExt.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
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

					RuruExt.data.menu.append( post );
					RuruExt.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
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

					RuruExt.data.menu.append( post );
					RuruExt.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );
					postsub.append( "<li id='menu-ura'><a href='#'><span class='ui-icon ui-icon-search'></span>占い</a></li>" );
					postsub.append( "<li id='menu-rei'><a href='#'><span class='ui-icon ui-icon-heart'></span>霊能</a></li>" );
					postsub.append( "<li id='menu-kari'><a href='#'><span class='ui-icon ui-icon-note'></span>狩人</a></li>" );
					postsub.append( "<li id='menu-kyo'><a href='#'><span class='ui-icon ui-icon-link'></span>共有</a></li>" );
					postsub.append( "<li id='menu-mad'><a href='#'><span class='ui-icon ui-icon-circle-minus'></span>狂人</a></li>" );
					postsub.append( "<li id='menu-wolf'><a href='#'><span class='ui-icon ui-icon-circle-close'></span>人狼</a></li>" );
				} else {
					RuruExt.data.menu.append( "<li id='menu-ura'><a href='#'><span class='ui-icon ui-icon-search'></span>占い</a></li>" );
					RuruExt.data.menu.append( "<li id='menu-rei'><a href='#'><span class='ui-icon ui-icon-heart'></span>霊能</a></li>" );
					RuruExt.data.menu.append( "<li id='menu-kari'><a href='#'><span class='ui-icon ui-icon-note'></span>狩人</a></li>" );
					RuruExt.data.menu.append( "<li id='menu-kyo'><a href='#'><span class='ui-icon ui-icon-link'></span>共有</a></li>" );
					RuruExt.data.menu.append( "<li id='menu-mad'><a href='#'><span class='ui-icon ui-icon-circle-minus'></span>狂人</a></li>" );
					RuruExt.data.menu.append( "<li id='menu-wolf'><a href='#'><span class='ui-icon ui-icon-circle-close'></span>人狼</a></li>" );
					RuruExt.data.menu.append( "<li id='menu-fox'><a href='#'><span class='ui-icon ui-icon-alert'></span>狐</a></li>" );
					RuruExt.data.menu.append( "<hr/>" );
				}
			}

			var logmenu = $( "<li id='menu-log'><a href='#'><span class='ui-icon ui-icon-comment'></span>ログ</a></li>" );
			var logsub = $( "<ul></ul>" ).appendTo( logmenu );

			var haslog = false;
			for ( var day in RuruExt.data.log ) {
				logsub.append( "<li id='menu-log-of-day'><a href='#'><span class='ui-icon ui-icon-comment'></span>" + day + "</a></li>" );
				haslog = true;
				logmenu.data( "last-day", day );
			}

			if ( haslog ) {
				RuruExt.data.menu.append( logmenu );
			}

			RuruExt.data.menu.append( "<li id='menu-person'><a href='#'><span class='ui-icon ui-icon-person'></span>内訳</a></li>" );

			var optionalMenu = $( "<ul></ul>" ).appendTo( $( "<li id='menu-optional'><a href='#'><span class='ui-icon ui-icon-wrench'></span>表示切替</a></li>" ).appendTo( RuruExt.data.menu ) );

			if ( RuruExt.data.showuranai ) {
				optionalMenu.append( "<li id='menu-showuranai'><a href='#'><span class='ui-icon ui-icon-check'></span>占い結果表示</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-showuranai'><a href='#'><span class='ui-icon ui-icon-closethick'></span>占い結果非表示</a></li>" );
			}

			if ( RuruExt.data.showgray ) {
				optionalMenu.append( "<li id='menu-showgray'><a href='#'><span class='ui-icon ui-icon-check'></span>グレー表示</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-showgray'><a href='#'><span class='ui-icon ui-icon-closethick'></span>グレー非表示</a></li>" );
			}

			if ( RuruExt.data.hidecng ) {
				optionalMenu.append( "<li id='menu-hidecng'><a href='#'><span class='ui-icon ui-icon-closethick'></span>GM非表示</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-hidecng'><a href='#'><span class='ui-icon ui-icon-check'></span>GM表示</a></li>" );
			}

			if ( RuruExt.data.hidecnw ) {
				optionalMenu.append( "<li id='menu-hidecnw'><a href='#'><span class='ui-icon ui-icon-closethick'></span>観戦非表示</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-hidecnw'><a href='#'><span class='ui-icon ui-icon-check'></span>観戦表示</a></li>" );
			}

			if ( RuruExt.data.reverseLog ) {
				optionalMenu.append( "<li id='menu-reverse-log'><a href='#'><span class='ui-icon ui-icon-check'></span>チャット反転</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-reverse-log'><a href='#'><span class='ui-icon ui-icon-closethick'></span>チャット切り替え</a></li>" );
			}
		},
		execAction : function( user, action, selected ) {
			if ( action === "menu-toggle-post" ) {
				RuruExt.data.users[user]["役職解除"] = !RuruExt.data.users[user]["役職解除"];
			} else if ( action === "menu-ura" ) {
				RuruExt.data.users[user] = {};
				RuruExt.data.users[user]["役職"] = "占い";
				RuruExt.data.users[user]["役職解除"] = false;
				RuruExt.data.users[user]["結果"] = {};
			} else if ( action === "menu-rei" ) {
				RuruExt.data.users[user] = {};
				RuruExt.data.users[user]["役職"] = "霊能";
				RuruExt.data.users[user]["役職解除"] = false;
				RuruExt.data.users[user]["結果"] = {};
			} else if ( action === "menu-kari" ) {
				RuruExt.data.users[user] = {};
				RuruExt.data.users[user]["役職"] = "狩人";
				RuruExt.data.users[user]["役職解除"] = false;
				RuruExt.data.users[user]["結果"] = {};
			} else if ( action === "menu-kyo" ) {
				RuruExt.data.users[user] = {};
				RuruExt.data.users[user]["役職"] = "共有";
				RuruExt.data.users[user]["役職解除"] = false;
			} else if ( action === "menu-mad" ) {
				RuruExt.data.users[user] = {};
				RuruExt.data.users[user]["役職"] = "狂人";
				RuruExt.data.users[user]["役職解除"] = false;
			} else if ( action === "menu-wolf" ) {
				RuruExt.data.users[user] = {};
				RuruExt.data.users[user]["役職"] = "人狼";
				RuruExt.data.users[user]["役職解除"] = false;
			} else if ( action === "menu-fox" ) {
				RuruExt.data.users[user] = {};
				RuruExt.data.users[user]["役職"] = "狐";
				RuruExt.data.users[user]["役職解除"] = false;
			} else if ( action === "menu-reverse-log" ) {
				RuruExt.data.reverseLog = !RuruExt.data.reverseLog;
			} else if ( action === "menu-hidecng" ) {
				RuruExt.data.hidecng = !RuruExt.data.hidecng;
			} else if ( action === "menu-hidecnw" ) {
				RuruExt.data.hidecnw = !RuruExt.data.hidecnw;
			} else if ( action === "menu-showgray" ) {
				RuruExt.data.showgray = !RuruExt.data.showgray;
			} else if ( action === "menu-showuranai" ) {
				RuruExt.data.showuranai = !RuruExt.data.showuranai;
			} else if ( action === "menu-log" ) {
				var buttonPanel = $( RuruExt.data.logDialog ).parents( ".ui-dialog:first" ).children( ".ui-dialog-buttonpane:first" );
				var day = $( selected ).data( "last-day" );
				RuruExt.data.logDialog.dialog( "option", "title", day );

				$( "#ruru-log-table", RuruExt.data.logDialog ).empty().append( RuruExt.data.log[day] );
				for ( var name in RuruExt.data.names ) {
					var targetUser = RuruExt.data.names[name];

					var count = $( "." + targetUser, RuruExt.data.log[day] ).length / 2;
					$( ".count-" + targetUser, buttonPanel ).text( "[" + count + "]" );
				}

				RuruExt.data.logDialog.dialog( "open" );
			} else if ( action === "menu-log-of-day" ) {
				var day = $( selected ).text();
				RuruExt.data.logDialog.dialog( "option", "title", day );
				$( "#ruru-log-table", RuruExt.data.logDialog ).empty().append( RuruExt.data.log[day] );
				RuruExt.data.logDialog.dialog( "open" );
			} else if ( action === "menu-person" ) {
				RuruExt.data.positionDialog.dialog( "open" );
			} else if ( action === "menu-ura-result-white" ) {
				var targetUser = $( selected ).data( "user-id" );
				RuruExt.data.users[user]["結果"][targetUser] = "村人";
			} else if ( action === "menu-ura-result-black" ) {
				var targetUser = $( selected ).data( "user-id" );
				RuruExt.data.users[user]["結果"][targetUser] = "人狼";
			} else if ( action === "menu-rei-result-white" ) {
				var targetUser = $( selected ).data( "user-id" );
				RuruExt.data.users[user]["結果"][targetUser] = "村人";
			} else if ( action === "menu-rei-result-black" ) {
				var targetUser = $( selected ).data( "user-id" );
				RuruExt.data.users[user]["結果"][targetUser] = "人狼";
			}

			RuruExt.updateCss();
			RuruExt.updatePosition();
		},
		updatePosition : function() {
			var dialog = $( "#ruru-ext-position-dialog" ).empty();

			var uranai = undefined;
			var reinou = undefined;
			var karido = undefined;
			var kyouyu = undefined;
			var kyojin = undefined;
			var jinrou = undefined;
			var kitune = undefined;

			for ( var name in RuruExt.data.names ) {
				var user = RuruExt.data.names[name];
				var userData = RuruExt.data.users[user];

				if ( userData["役職"] === "占い" ) {
					if ( !uranai ) {
						uranai = $( "<div></div>" );
					}
					var result = $( "<div></div>" ).append( "<div style='display:inline-block;minWidth:100px;padding:3px;margin-right:5px;' class='" + user + "'>" + name + "&nbsp;&nbsp;：</div>" ).appendTo( uranai );
					for ( var targetUser in userData["結果"] ) {
						if ( userData["結果"][targetUser] === "村人" ) {
							result.append( "<div style='display:inline-block;minWidth:100px;padding:3px;margin-right:5px;' class='" + targetUser + "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-radio-off'></span>" + RuruExt.data.nameMap[targetUser] + "</div>" );
						} else {
							result.append( "<div style='display:inline-block;minWidth:100px;padding:3px;margin-right:5px;' class='" + targetUser + "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-bullet'></span>" + RuruExt.data.nameMap[targetUser] + "</div>" );
						}
					}
				} else if ( userData["役職"] === "霊能" ) {
					if ( !reinou ) {
						reinou = $( "<div></div>" );
					}
					var result = $( "<div></div>" ).append( "<div style='display:inline-block;minWidth:100px;padding:3px;margin-right:5px;' class='" + user + "'>" + name + "&nbsp;&nbsp;：</div>" ).appendTo( reinou );
					for ( var targetUser in userData["結果"] ) {
						if ( userData["結果"][targetUser] === "村人" ) {
							result.append( "<div style='display:inline-block;minWidth:100px;padding:3px;margin-right:5px;' class='" + targetUser + "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-radio-off'></span>" + RuruExt.data.nameMap[targetUser] + "</div>" );
						} else {
							result.append( "<div style='display:inline-block;minWidth:100px;padding:3px;margin-right:5px;' class='" + targetUser + "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-bullet'></span>" + RuruExt.data.nameMap[targetUser] + "</div>" );
						}
					}
				} else if ( userData["役職"] === "狩人" ) {
					if ( !karido ) {
						karido = $( "<div></div>" );
					}
					karido.append( "<div style='display:inline-block;minWidth:100px;padding:3px;margin-right:5px;' class='" + user + "'>" + name + "</div>" );
				} else if ( userData["役職"] === "共有" ) {
					if ( !kyouyu ) {
						kyouyu = $( "<div></div>" );
					}
					kyouyu.append( "<div style='display:inline-block;minWidth:100px;padding:3px;margin-right:5px;' class='" + user + "'>" + name + "</div>" );
				} else if ( userData["役職"] === "狂人" ) {
					if ( !kyojin ) {
						kyojin = $( "<div></div>" );
					}
					kyojin.append( "<div style='display:inline-block;minWidth:100px;padding:3px;margin-right:5px;' class='" + user + "'>" + name + "</div>" );
				} else if ( userData["役職"] === "人狼" ) {
					if ( !jinrou ) {
						jinrou = $( "<div></div>" );
					}
					jinrou.append( "<div style='display:inline-block;minWidth:100px;padding:3px;margin-right:5px;' class='" + user + "'>" + name + "</div>" );
				} else if ( userData["役職"] === "狐" ) {
					if ( !kitune ) {
						kitune = $( "<div></div>" );
					}
					kitune.append( "<div style='display:inline-block;minWidth:100px;padding:3px;margin-right:5px;' class='" + user + "'>" + name + "</div>" );
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
		},
		updateCss : function() {
			for ( var i = RuruExt.data.styleSheet.cssRules.length - 1; i >= 0; i-- ) {
				RuruExt.data.styleSheet.deleteRule( i );
			}

			var uraCount = 0;
			var usersStatus = {};

			for ( var name in RuruExt.data.names ) {
				uraCount++;
				var user = RuruExt.data.names[name];
				var userData = RuruExt.data.users[user];

				if ( userData["役職"] === "占い" && !userData["役職解除"] ) {
					RuruExt.data.styleSheet.insertRule( "." + user + " {background-color:#E6E6FA;color:#4169E1;}" );
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

			for ( var name in RuruExt.data.names ) {
				var user = RuruExt.data.names[name];
				var userData = RuruExt.data.users[user];

				var style = "";

				if ( usersStatus[user] && RuruExt.data.showuranai ) {
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
					RuruExt.data.styleSheet.insertRule( "." + user + " {background-color:#E6E6FA;color:#4169E1;" + style + "}" );
				} else if ( userData["役職"] === "霊能" && !userData["役職解除"] ) {
					RuruExt.data.styleSheet.insertRule( "." + user + " {background-color:#E6E6FA;color:#DC143C;" + style + "}" );
				} else if ( userData["役職"] === "狩人" && !userData["役職解除"] ) {
					RuruExt.data.styleSheet.insertRule( "." + user + " {background-color:#EEE8AA;color:#DC143C;" + style + "}" );
				} else if ( userData["役職"] === "共有" && !userData["役職解除"] ) {
					RuruExt.data.styleSheet.insertRule( "." + user + " {background-color:#EEE8AA;color:#228B22;" + style + "}" );
				} else if ( userData["役職"] === "狂人" && !userData["役職解除"] ) {
					RuruExt.data.styleSheet.insertRule( "." + user + " {background-color:#000000;color:#00FFFF;" + style + "}" );
				} else if ( userData["役職"] === "人狼" && !userData["役職解除"] ) {
					RuruExt.data.styleSheet.insertRule( "." + user + " {background-color:#000000;color:#FF0000;" + style + "}" );
				} else if ( userData["役職"] === "狐" && !userData["役職解除"] ) {
					RuruExt.data.styleSheet.insertRule( "." + user + " {background-color:#000000;color:#FFFF00;" + style + "}" );
				} else if ( !usersStatus[user] && RuruExt.data.showgray ) {
					RuruExt.data.styleSheet.insertRule( "." + user + " {background-color:#696969;color:#FFFFFF;}" );
				} else {
					RuruExt.data.styleSheet.insertRule( "." + user + " {" + style + "}" );
				}
			}

			if ( RuruExt.data.hidecng ) {
				RuruExt.data.styleSheet.insertRule( ".cng {display:none;}" );
				RuruExt.data.styleSheet.insertRule( ".ccg {display:none;}" );
			}

			if ( RuruExt.data.hidecnw ) {
				RuruExt.data.styleSheet.insertRule( ".cnw {display:none;}" );
				RuruExt.data.styleSheet.insertRule( ".ccw {display:none;}" );
			}
		}
	};

	var RuruExt = new _RuruExt();

	RuruExt.init();
} );
