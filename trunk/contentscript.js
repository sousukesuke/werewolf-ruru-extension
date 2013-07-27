$( function() {
	var _RuruExt = function() {
	};

	_RuruExt.prototype = {
		data : {
			day : undefined,
			prevstatus : 0,
			status : 0,
			users : {},
			names : {},
			nameMap : {},
			step : 0,
			hidecng : false,
			hidecnw : false,
			showgray : false,
			showuranai : true,
			reverseLog : false,
			balloon : undefined,
			menu : undefined,
			styleSheet : undefined,
			logDialog : undefined,
			positionDialog : undefined,
			colorDialog : undefined,
			log : {},
			dialogStyleSheet : undefined,
			defaultPositions : {
				"占　い" : [ "search", "#4169E1", "#E6E6FA", "判定", "占" ],
				"霊　能" : [ "heart", "#DC143C", "#E6E6FA", "判定", "霊" ],
				"狩　人" : [ "note", "#DC143C", "#98fb98", "対象", "狩" ],
				"共　有" : [ "link", "#4169E1", "#98fb98", "", "共" ],
				"狂　人" : [ "circle-minus", "#00FFFF", "#000000", "", "狂" ],
				"人　狼" : [ "circle-close", "#FF0000", "#000000", "", "狼" ],
				"妖　狐" : [ "alert", "#FF0000", "#EEE8AA", "", "狐" ],
				"狂信者" : [ "alert", "#00FFFF", "#000000", "", "信" ],
				"背徳者" : [ "alert", "#00FFFF", "#EEE8AA", "", "背" ],
				"猫　又" : [ "alert", "#FFFF00", "#E6E6FA", "", "猫" ]
			},
			positions : {},
			uraStatus : {
				"村人" : {
					"bold" : true,
					"italic" : false,
					"line" : false,
					"underline" : false,
					"shadow" : false
				},
				"人狼" : {
					"bold" : false,
					"italic" : true,
					"line" : false,
					"underline" : false,
					"shadow" : true
				}
			}
		},
		init : function() {
			// RuruExt.data.step
			// 0 : 無効
			// 1 : プラグイン開始
			// 2 : スタートアップ（UIコンポーネント準備中）
			// 3 : スタートアップ完了
			// 4 : セットアップ（ゲーム開始。ユーザー情報読み込み中）
			// 5 : セットアップ完了

			var _self = this;

			_self.data.positions = _self.data.defaultPositions;

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

			for ( var pos in _self.data.defaultPositions ) {
				_self.data.positions[pos] = _self.data.defaultPositions[pos];
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
			var cls = target.getAttribute( "class" ) + " " + user;
			target.setAttribute( "class", cls );
			target.setAttribute( "userid", user );
		},
		onPageAction : function( request, sender, sendResponse ) {
			var _self = this;

			if ( request.action === "updateChat" ) {
				_self.onUpdateChat();
			} else if ( request.action === "click" ) {
				if ( _self.data.step !== 0 ) {
					sendResponse( {
						active : true
					} );
					return;
				} else {
					_self.data.step = 1;

					if ( !$( "#SC" ).is( ":checked" ) ) {
						$( "#SC" ).click();
					}

					$( "#messageInput" ).keypress( function( event ) {
						if ( event.ctrlKey && event.which == 10 ) {
							$( "#todob" ).click();
						}
					} );

					_self.onUpdateChat();
				}

				sendResponse( {
					active : true
				} );
			}
		},
		startup : function() {
			var _self = this;
			if ( _self.data.step > 2 ) {
				return;
			}

			_self.data.step = 2;

			var balloonContainer = $( "<div style='display:inline-block;width:150px;position:absolute;top:5px;left:5px;'></div>" ).appendTo( "body" );

			_self.data.balloon = function( message ) {
				console.log( message );
				var balloon = $( "<div class='ui-state-highlight ui-corner-all' style='font-size:11px;margin-bottom:5px;padding:1em;'></div>" ).text( message ).hide();
				balloon.prependTo( balloonContainer ).show( "slide", {}, 300, function() {
					setTimeout( function() {
						balloon.fadeOut( "normal", function() {
							balloon.remove();
						} );
					}, 2000 );
				} );
			};

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

			_self.data.positionDialog = $( "<div style='font-size:11px;overflow:auto;' id='ruru-ext-position-dialog'></div>" ).appendTo( "body" ).dialog( {
				autoOpen : false,
				minWidth : uw,
				height : uh,
				title : "内訳",
				position : [ ul, ut ]
			} );

			_self.data.colorDialog = $( "<div style='font-size:11px;overflow-y:scroll;'><table style='width:100%;background:white;'><tbody id='ruru-color-table'></tbody></table></div>" ).appendTo( "body" ).dialog( {
				autoOpen : false,
				minWidth : 450,
				height : 300,
				title : "カラー設定",
				buttons : [ {
					text : "Ok"
				} ]
			} );

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

				var user = $( event.target ).attr( "userid" );

				_self.createMenu( user );

			} ).on( "execmenu", function( event, target ) {
				hidemenu();

				var action = $( event.target ).attr( "id" );
				var user = $( target ).attr( "userid" );

				_self.execAction( user, action, event.target );
			} );

			_self.data.balloon( "コンポーネントロード" );

			_self.data.step = 3;
		},
		setup : function() {
			var _self = this;

			if ( _self.data.step !== 3 ) {
				return;
			}

			_self.data.step = 4;

			var posText = $( "#No00" ).text();
			var from = posText.indexOf( "役職" );
			var to = posText.indexOf( "昼" );
			posText = posText.slice( from, to );

			_self.data.balloon( posText );

			for ( var pos in _self.data.positions ) {
				if ( posText.indexOf( _self.data.positions[pos][4] ) === -1 ) {
					delete _self.data.positions[pos];
				}
			}

			$( "#No01 td" ).each( function( i, td ) {
				var text = $( td ).text();
				if ( _self.data.status === 5 && $( td ).hasClass( "name" ) ) {
					text = $( ">span:first", td ).text();
				}
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
				var checkbox = $( "<input class='dialog-user-checkbox' type='checkbox' id='dialog-checkbox-" + user + "' value='" + user + "' style='vertical-align:sub;'/>" ).attr( "checked", true ).attr( "userid", user );
				var count = $( "<span class='dialog-user-count count-" + user + "' style='display:inline-block;min-width:30px;cursor:pointer;font-weight:bold;'>[0]</span>" ).attr( "userid", user );
				buttonPanel.append( $( "<div style='display:inline-block;white-space:nowrap;'></div>" ).append( checkbox ).append( "<label for='dialog-checkbox-" + user + "' class='" + user + "' style='display:inline-block;min-width:80px;'>" + name + "</label>" ).append( count ) );
			}

			var updateDialogCss = function() {
				for ( var i = _self.data.dialogStyleSheet.cssRules.length - 1; i >= 0; i-- ) {
					_self.data.dialogStyleSheet.deleteRule( i );
				}

				$( "input.dialog-user-checkbox", buttonPanel ).each( function( i, checkbox ) {
					var checked = $( checkbox ).is( ":checked" );
					if ( !checked ) {
						var user = $( checkbox ).attr( "userid" );
						_self.data.dialogStyleSheet.insertRule( "#ruru-log-table ." + user + " {display:none;}" );
					}
				} );
			};

			$( "input.dialog-user-checkbox", buttonPanel ).on( "click", updateDialogCss );

			$( "span.dialog-user-count", buttonPanel ).on( "click", function() {
				var user = $( this ).attr( "userid" );

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

			_self.updateCss();

			_self.data.balloon( "ユーザー把握" );
			console.log( _self.data.names );

			_self.data.step = 5;
		},
		onUpdateChat : function() {
			var _self = this;

			if ( _self.data.step !== 0 ) {
				_self.load();
				_self.reverseChat();
			}
		},
		load : function() {
			var _self = this;

			_self.startup();

			var date = $( "#No08>span" ).text();
			var index = date.indexOf( "\xa0" );
			if ( index !== -1 ) {
				var d1 = date.slice( 0, index );
				var d2 = date.slice( index + 2 );

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

				if ( _self.data.step === 5 ) {
					var tds = $( "#No01 td" ).get();
					for ( var i = 0; i < tds.length; i++ ) {
						var td = tds[i];

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
					}
				} else {
					_self.setup();
				}
			}
		},
		reverseChat : function() {
			var _self = this;

			if ( _self.data.reverseLog ) {
				var tbody = $( "#No09>table>tbody" );
				var mslist = tbody.children().get().reverse();

				if ( _self.data.prevstatus == 1 && _self.data.prevstatus != _self.data.status ) {
					_self.data.log[_self.data.day] = mslist;
				}

				tbody.append( mslist );

				if ( _self.data.step === 5 ) {
					for ( var i = 0; i < mslist.length; i++ ) {
						var row = mslist[i];
						var cn = $( "td.cn>span.name", row );
						if ( cn.length ) {
							var name = cn.text();
							var user = _self.data.names[name];
							$( "td", row ).addClass( user ).attr( "userid", user );
						}
					}
				}

				var h1 = $( "#chatscr2_1>.d1215" ).height();
				$( '#chatscr2_1' ).scrollTop( h1 );
			} else {
				var mslist = $( "#No09>table>tbody>tr" ).get();

				if ( _self.data.prevstatus == 1 && _self.data.prevstatus != _self.data.status ) {
					_self.data.log[_self.data.day] = mslist;
				}

				if ( _self.data.step === 5 ) {
					for ( var i = 0; i < mslist.length; i++ ) {
						var row = mslist[i];
						var cn = $( "td.cn>span.name", row );
						if ( cn.length ) {
							var name = cn.text();
							var user = _self.data.names[name];
							$( "td", row ).addClass( user ).attr( "userid", user );
						}
					}
				}
			}
		},
		createMenu : function( user ) {
			var _self = this;

			if ( user ) {
				var userData = _self.data.users[user];

				var userPosition = userData["役職"];

				if ( userPosition ) {
					var post;
					if ( userData["役職解除"] ) {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-closethick'></span>" + userPosition + "</a></li>" );
					} else {
						post = $( "<li id='menu-toggle-post'><a href='#'><span class='ui-icon ui-icon-check'></span>" + userPosition + "</a></li>" );
					}

					_self.data.menu.append( post );
					_self.data.menu.append( "<hr/>" );

					var postsub = $( "<ul></ul>" ).appendTo( post );

					postsub.append( "<li id='menu-remove-position'><a href='#'><span class='ui-icon ui-icon-close'></span>削除</a></li>" );

					for ( var pos in _self.data.positions ) {
						if ( userPosition === pos ) {
							continue;
						}

						postsub.append( "<li id='menu-position' pos='" + pos + "'><a href='#'><span class='ui-icon ui-icon-" + _self.data.positions[pos][0] + "'></span>" + pos + "</a></li>" );
					}

					if ( _self.data.positions[userPosition][3] === "判定" ) {
						var white = $( "<ul></ul>" ).appendTo( $( "<li><a href='#'><span class='ui-icon ui-icon-radio-off'></span>村人</a></li>" ).appendTo( _self.data.menu ) );
						var black = $( "<ul></ul>" ).appendTo( $( "<li><a href='#'><span class='ui-icon ui-icon-bullet'></span>人狼</a></li>" ).appendTo( _self.data.menu ) );

						for ( var name in _self.data.names ) {
							var targetUser = _self.data.names[name];

							if ( !userData["結果"][targetUser] && targetUser !== user ) {
								$( "<li id='menu-judgment-white'><a href='#'><span class='ui-icon ui-icon-" + _self.data.positions[userPosition][0] + "'></span>" + name + "</a></li>" ).attr( "userid", targetUser ).appendTo( white );
								$( "<li id='menu-judgment-black'><a href='#'><span class='ui-icon ui-icon-" + _self.data.positions[userPosition][0] + "'></span>" + name + "</a></li>" ).attr( "userid", targetUser ).appendTo( black );
							}
						}

						_self.data.menu.append( "<hr/>" );
					} else if ( _self.data.positions[userPosition][3] === "対象" ) {
						var target = $( "<ul></ul>" ).appendTo( $( "<li><a href='#'><span class='ui-icon ui-icon-flag'></span>対象</a></li>" ).appendTo( _self.data.menu ) );

						for ( var name in _self.data.names ) {
							var targetUser = _self.data.names[name];

							if ( targetUser !== user ) {
								$( "<li id='menu-target'><a href='#'><span class='ui-icon ui-icon-" + _self.data.positions[userPosition][0] + "'></span>" + name + "</a></li>" ).attr( "userid", targetUser ).appendTo( target );
							}
						}

						_self.data.menu.append( "<hr/>" );
					}

				} else {
					for ( var pos in _self.data.positions ) {
						_self.data.menu.append( "<li id='menu-position' pos='" + pos + "'><a href='#'><span class='ui-icon ui-icon-" + _self.data.positions[pos][0] + "'></span>" + pos + "</a></li>" );
					}
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
			} else if ( action === "menu-position" ) {
				var pos = $( selected ).attr( "pos" );
				_self.data.users[user] = {};
				_self.data.users[user]["役職"] = pos;
				_self.data.users[user]["役職解除"] = false;
				_self.data.users[user]["結果"] = {};
			} else if ( action === "menu-judgment-white" ) {
				var targetUser = $( selected ).attr( "userid" );
				_self.data.users[user]["結果"][targetUser] = "村人";
			} else if ( action === "menu-judgment-black" ) {
				var targetUser = $( selected ).attr( "userid" );
				_self.data.users[user]["結果"][targetUser] = "人狼";
			} else if ( action === "menu-target" ) {
				var targetUser = $( selected ).attr( "userid" );
				_self.data.users[user]["結果"][targetUser] = true;
			} else if ( action === "menu-reverse-log" ) {
				_self.data.reverseLog = !_self.data.reverseLog;
				_self.data.balloon( "チャット逆 " + ( _self.data.reverseLog ? "ON" : "OFF" ) );
				if ( localStorage ) {
					localStorage.reverseLog = _self.data.reverseLog;
				}
			} else if ( action === "menu-hidecng" ) {
				_self.data.hidecng = !_self.data.hidecng;
				_self.data.balloon( "GM表示 " + ( !_self.data.hidecng ? "ON" : "OFF" ) );
			} else if ( action === "menu-hidecnw" ) {
				_self.data.hidecnw = !_self.data.hidecnw;
				_self.data.balloon( "観戦表示 " + ( !_self.data.hidecnw ? "ON" : "OFF" ) );
				if ( localStorage ) {
					localStorage.hidecnw = _self.data.hidecnw;
				}
			} else if ( action === "menu-showgray" ) {
				_self.data.showgray = !_self.data.showgray;
				_self.data.balloon( "完グレー強調表示 " + ( _self.data.showgray ? "ON" : "OFF" ) );
				if ( localStorage ) {
					localStorage.showgray = _self.data.showgray;
				}
			} else if ( action === "menu-showuranai" ) {
				_self.data.showuranai = !_self.data.showuranai;
				_self.data.balloon( "占い結果強調表示 " + ( _self.data.showuranai ? "ON" : "OFF" ) );
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
			}

			_self.updateCss();
			_self.updatePosition();
		},
		updatePosition : function() {
			var _self = this;

			var dialog = $( "#ruru-ext-position-dialog" ).empty();

			var poselements = {};
			for ( var pos in _self.data.positions ) {
				poselements[pos] = false;
			}

			for ( var name in _self.data.names ) {
				var user = _self.data.names[name];
				var userData = _self.data.users[user];

				if ( userData["役職"] ) {
					var elm;
					if ( !poselements[userData["役職"]] ) {
						elm = $( "<div></div>" );
						poselements[userData["役職"]] = elm;
					} else {
						elm = poselements[userData["役職"]];
					}

					var jg = _self.data.positions[userData["役職"]][3];
					var position = $( "<div class='position'></div>" ).append( "<div style='display:inline-block;min-width:65px;padding:3px;margin-right:5px;' class='position-user " + user + "'>" + name + ( jg ? "&nbsp;&nbsp;：" : "" ) + "</div>" ).appendTo( elm ).attr( "userid", user );
					if ( jg ) {
						var result = $( "<div style='display:inline-block;'></div>" ).appendTo( position );
						if ( jg === "判定" ) {
							for ( var targetUser in userData["結果"] ) {
								if ( userData["結果"][targetUser] === "村人" ) {
									result.append( $(
											"<div style='display:inline-block;padding:3px;margin-right:5px;' class='position-target " + targetUser + "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-radio-off'></span>" + _self.data.nameMap[targetUser] + "</div>" )
											.attr( "userid", targetUser ) );
								} else {
									result.append( $(
											"<div style='display:inline-block;padding:3px;margin-right:5px;' class='position-target " + targetUser + "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-bullet'></span>" + _self.data.nameMap[targetUser] + "</div>" )
											.attr( "userid", targetUser ) );
								}
							}
						} else if ( jg === "対象" ) {
							for ( var targetUser in userData["結果"] ) {
								result.append( $( "<div style='display:inline-block;padding:3px;margin-right:5px;' class='position-target " + targetUser + "'>" + _self.data.nameMap[targetUser] + "</div>" ).attr( "userid", targetUser ) );
							}
						}
					}
				}
			}

			for ( var pos in poselements ) {
				if ( poselements[pos] ) {
					dialog.append( "<h3>" + pos + "</h3>" );
					dialog.append( poselements[pos] );
				}
			}

			$( ".position-user", dialog ).on( "dblclick", function( e ) {
				var delUser;
				if ( $( this ).hasClass( "position" ) ) {
					delUser = $( this ).attr( "userid" );
				} else {
					delUser = $( this ).parents( ".position:first" ).attr( "userid" );
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
				var delTarget = $( this ).attr( "userid" );
				var targetPosition = $( this ).parents( ".position:first" ).attr( "userid" );

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

			if ( _self.data.step === 5 ) {

				var uraCount = 0;
				var usersStatus = {};

				for ( var name in _self.data.names ) {
					var user = _self.data.names[name];
					var userData = _self.data.users[user];

					if ( userData["役職"] === "占　い" && !userData["役職解除"] ) {
						uraCount++;
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
						if ( usersStatus[user]["white"] > 0 ) {
							style += "font-weight:bold;";
						}
						if ( usersStatus[user]["black"] > 0 ) {
							style += "font-style:italic;text-shadow:2px 2px 2px #999;";
						}
					}

					if ( userData["役職"] && !userData["役職解除"] ) {
						var cl = _self.data.positions[userData["役職"]][1];
						var bg = _self.data.positions[userData["役職"]][2];
						_self.data.styleSheet.insertRule( "." + user + " {background-color:" + bg + ";color:" + cl + ";}" );
					} else if ( !usersStatus[user] && _self.data.showgray ) {
						_self.data.styleSheet.insertRule( "." + user + " {background-color:#696969;color:#FFFFFF;}" );
					} else {
						_self.data.styleSheet.insertRule( "." + user + " {" + style + "}" );
					}
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
