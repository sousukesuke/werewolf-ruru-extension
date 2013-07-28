$( function() {
	var _RuruExt = function() {
	};

	var defaultColors = [ 'ffffff', 'f2f2f2', 'd8d8d8', 'bfbfbf', 'a5a5a5', '7f7f7f', '000000', '7f7f7f', '595959', '3f3f3f', '262626', '0c0c0c', 'eeece1', 'ddd9c3', 'c4bd97', '938953', '494429', '1d1b10', '1f497d', 'c6d9f0', '8db3e2', '548dd4', '17365d', '0f243e', '4f81bd', 'dbe5f1', 'b8cce4',
			'95b3d7', '366092', '244061', 'c0504d', 'f2dcdb', 'e5b9b7', 'd99694', '953734', '632423', '9bbb59', 'ebf1dd', 'd7e3bc', 'c3d69b', '76923c', '4f6128', '8064a2', 'e5e0ec', 'ccc1d9', 'b2a2c7', '5f497a', '3f3151', '4bacc6', 'dbeef3', 'b7dde8', '92cddc', '31859b', '205867', 'f79646',
			'fdeada', 'fbd5b5', 'fac08f', 'e36c09', '974806', 'c00000', 'ff0000', 'ffc000', 'ffff00', '92d050', '00b050', '00b0f0', '0070c0', '002060', '7030a0' ];

	var cnvrgb = function( rgb ) {
		if ( !rgb ) {
			return;
		} else if ( rgb.indexOf( "rgb" ) === -1 ) {
			return rgb;
		}

		var parts = rgb.match( /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/ );

		delete ( parts[0] );
		for ( var i = 1; i <= 3; ++i ) {
			parts[i] = parseInt( parts[i] ).toString( 16 );
			if ( parts[i].length == 1 )
				parts[i] = '0' + parts[i];
		}
		return '#' + parts.join( '' );
	};

	_RuruExt.prototype = {
		data : {
			installed : false,
			day : undefined,
			prevstatus : "開始前",
			status : undefined,
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
				"占　い" : [ "search", "#4169E1", "#dbeef3", "判定", "占" ],
				"霊　能" : [ "heart", "#c00000", "#dbeef3", "判定", "霊" ],
				"狩　人" : [ "note", "#c00000", "#c3d69b", "対象", "狩" ],
				"共　有" : [ "link", "#4169E1", "#c3d69b", "", "共" ],
				"狂　人" : [ "circle-minus", "#92cddc", "#000000", "", "狂" ],
				"人　狼" : [ "circle-close", "#c00000", "#000000", "", "狼" ],
				"妖　狐" : [ "alert", "#c00000", "#e5b9b7", "", "狐" ],
				"狂信者" : [ "alert", "#92cddc", "#000000", "", "信" ],
				"背徳者" : [ "alert", "#366092", "#e5b9b7", "", "背" ],
				"猫　又" : [ "alert", "#000000", "#9bbb59", "", "猫" ]
			},
			positions : {},
			uraStatus : {
				"村　人" : {
					"bold" : true,
					"italic" : false,
					"line" : false,
					"underline" : false,
					"shadow" : false
				},
				"人　狼" : {
					"bold" : false,
					"italic" : true,
					"line" : false,
					"underline" : false,
					"shadow" : true
				}
			}
		},
		init : function() {
			var _self = this;

			if ( localStorage.installed ) {
				_self.data.hidecnw = localStorage.hidecnw == "true";
				_self.data.showgray = localStorage.showgray == "true";
				_self.data.showuranai = localStorage.showuranai == "true";
				_self.data.reverseLog = localStorage.reverseLog == "true";

				if ( localStorage.defaultPositions ) {
					_self.data.defaultPositions = $.parseJSON( localStorage.defaultPositions );
				}

				if ( localStorage.uraStatus ) {
					_self.data.uraStatus = $.parseJSON( localStorage.uraStatus );
				}

				console.log( "設定読み込み", $.stringify( {
					"観戦OFF" : _self.data.showgray,
					"完グレ強調" : _self.data.showgray,
					"占い強調" : _self.data.showuranai,
					"ログ逆" : _self.data.reverseLog
				} ) );
			} else {
				localStorage.hidecnw = _self.data.hidecnw;
				localStorage.showgray = _self.data.showgray;
				localStorage.showuranai = _self.data.showuranai;
				localStorage.reverseLog = _self.data.reverseLog;

				localStorage.installed = "true";
			}

			_self.data.positions = {};
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
		onPageAction : function( request, sender, sendResponse ) {
			var _self = this;

			if ( request.action === "click" ) {
				if ( !_self.data.installed ) {
					_self.data.installed = true;

					if ( !$( "#SC" ).is( ":checked" ) ) {
						$( "#SC" ).click();
					}

					$( "#messageInput" ).keypress( function( event ) {
						if ( event.ctrlKey && event.which == 10 ) {
							$( "#todob" ).click();
						}
					} );

					_self.install();
				}

				sendResponse( {
					active : _self.data.installed
				} );
			}
		},
		install : function() {
			var _self = this;

			_self.data.status = $( "<span id='ruru-ext-status' reverselog='" + _self.data.reverseLog + "' day='1rdDAY' time='開始前'></span>" ).appendTo( "body" );
			var dispatcher = $( "<button id='ruru-ext-event-dispatcher' style='display:none;'></button>" ).appendTo( "body" );

			var idle = function() {
				_self.onUpdateChat();
			};

			var setup = function() {
				if ( _self.setup() ) {
					_self.onUpdateChat();

					dispatcher.off( "click" );
					dispatcher.on( "click", idle );
				}
			};

			var setupComponent = function() {
				_self.setupComponents();

				dispatcher.off( "click" );

				if ( _self.setup() ) {
					_self.onUpdateChat();

					dispatcher.on( "click", idle );
				} else {
					dispatcher.on( "click", setup );
				}
			};

			dispatcher.on( "click", setupComponent );

			$.get( chrome.extension.getURL( "ruru_ext_install.js" ), function( data ) {

				var head = document.getElementsByTagName( "head" ).item( 0 );

				var scr = document.createElement( "script" );
				scr.setAttribute( "type", "text/javascript" );
				scr.innerText = data;

				head.appendChild( scr );
			} );
		},
		setupComponents : function() {
			var _self = this;

			var balloonContainer = $( "<div style='display:inline-block;width:150px;position:absolute;top:5px;left:5px;'></div>" ).appendTo( "body" );

			_self.data.balloon = function( message ) {
				console.log( message );
				var balloon = $( "<div class='ui-state-highlight ui-corner-all ruru-ext-balloon' style='font-size:11px;margin-bottom:5px;padding:1em;'></div>" ).text( message ).hide();
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

			_self.data.colorDialog = $( "<div style='font-size:11px;'><table class='ui-corner-all' style='width:100%;background:white;'><tbody id='ruru-color-table'></tbody></table></div>" ).appendTo( "body" ).dialog( {
				autoOpen : false,
				minHeight : 490,
				minWidth : 450,
				height : "auto",
				title : "カラー設定",
				open : function() {
					$( ".colorPicker-palette" ).remove();

					var table = $( "#ruru-color-table" );

					table.children().remove();

					table.append( "<tr><td style='padding:1em;border-bottom:solid 1px gray;font-weight:bold;'>役職</td><td style='padding:1em;border-bottom:solid 1px gray;width:130px;'></td><td style='padding:1em;border-bottom:solid 1px gray;width:40px;'></td></tr>" );

					for ( var pos in _self.data.defaultPositions ) {

						var fg = _self.data.defaultPositions[pos][1];
						var bg = _self.data.defaultPositions[pos][2];

						var row = $( "<tr></tr>" ).appendTo( table );
						$( "<td colspan='2' id='position-sample-" + pos + "' class='position-color' pos='" + pos + "' style='padding:0.8em;color:" + fg + ";background-color:" + bg + ";'></td>" ).text( "役職が【" + pos + "】のチャット表示" ).appendTo( row );

						var colors = $( "<td style='text-align:center;'></td>" ).appendTo( row );

						$( '<input type="text" pos="' + pos + '"/>' ).appendTo( colors ).on( "changeColor", function( event, value ) {
							$( "#position-sample-" + $( event.target ).attr( "pos" ) ).css( "color", "#" + value );
						} ).on( "previewColor", function( event, value ) {
							$( "#position-sample-" + $( event.target ).attr( "pos" ) ).css( "color", "#" + value );
						} ).colorPicker( {
							pickerDefault : fg,
							colors : defaultColors
						} );

						$( '<input type="text" pos="' + pos + '"/>' ).appendTo( colors ).on( "changeColor", function( event, value ) {
							$( "#position-sample-" + $( event.target ).attr( "pos" ) ).css( "background-color", "#" + value );
						} ).on( "previewColor", function( event, value ) {
							$( "#position-sample-" + $( event.target ).attr( "pos" ) ).css( "background-color", "#" + value );
						} ).colorPicker( {
							pickerDefault : bg,
							colors : defaultColors
						} );
					}

					table.append( "<tr><td style='padding:1em;border-bottom:solid 1px gray;font-weight:bold;'>判定</td><td style='padding:1em;border-bottom:solid 1px gray;'></td><td style='padding:1em;border-bottom:solid 1px gray;'></td></tr>" );

					var updateJudgeSample = function() {
						for ( var judge in _self.data.uraStatus ) {
							var style = "";
							if ( $( "#judge-sample-bold-" + judge ).is( ":checked" ) ) {
								style = "font-weight:bold;";
							}
							if ( $( "#judge-sample-italic-" + judge ).is( ":checked" ) ) {
								style += "font-style:italic;";
							}
							if ( $( "#judge-sample-line-" + judge ).is( ":checked" ) && $( "#judge-sample-underline-" + judge ).is( ":checked" ) ) {
								style += "text-decoration:line-through underline;";
							} else if ( $( "#judge-sample-line-" + judge ).is( ":checked" ) ) {
								style += "text-decoration:line-through;";
							} else if ( $( "#judge-sample-underline-" + judge ).is( ":checked" ) ) {
								style += "text-decoration:underline;";
							}
							if ( $( "#judge-sample-shadow-" + judge ).is( ":checked" ) ) {
								style += "text-shadow:1px 1px 2px #999;";
							}

							$( "#judgment-sample-" + judge ).attr( "style", "padding-left:0.8em;" + style );
						}
					};

					for ( var judge in _self.data.uraStatus ) {
						var row = $( "<tr></tr>" ).appendTo( table );
						$( "<td id='judgment-sample-" + judge + "' class='judgment-style' judge='" + judge + "' style='padding:0.8em;'></td>" ).text( "判定が【" + judge + "】のチャット表示" ).appendTo( row );

						var styles = $( "<td  colspan='2' style=''></td>" ).appendTo( row );

						$( "<input id='judge-sample-bold-" + judge + "' type='checkbox'><label for='judge-sample-bold-" + judge + "'>太字</label></input>" ).appendTo( styles ).attr( "checked", _self.data.uraStatus[judge]["bold"] ).on( "click", updateJudgeSample );
						$( "<input id='judge-sample-italic-" + judge + "' type='checkbox'><label for='judge-sample-italic-" + judge + "'>斜体</label></input>" ).appendTo( styles ).attr( "checked", _self.data.uraStatus[judge]["italic"] ).on( "click", updateJudgeSample );
						$( "<input id='judge-sample-line-" + judge + "' type='checkbox'><label for='judge-sample-line-" + judge + "'>取消</label></input>" ).appendTo( styles ).attr( "checked", _self.data.uraStatus[judge]["line"] ).on( "click", updateJudgeSample );
						$( "<input id='judge-sample-underline-" + judge + "' type='checkbox'><label for='judge-sample-underline-" + judge + "'>下線</label></input>" ).appendTo( styles ).attr( "checked", _self.data.uraStatus[judge]["underline"] ).on( "click", updateJudgeSample );
						$( "<input id='judge-sample-shadow-" + judge + "' type='checkbox'><label for='judge-sample-shadow-" + judge + "'>影</label></input>" ).appendTo( styles ).attr( "checked", _self.data.uraStatus[judge]["shadow"] ).on( "click", updateJudgeSample );
					}

					updateJudgeSample();

					var button = $( _self.data.colorDialog ).parents( ".ui-dialog:first" ).find( "button:last" );
					button.focus();
				},
				buttons : {
					"Save" : function() {

						$( "#ruru-color-table .position-color" ).each( function( i, sample ) {
							var pos = $( sample ).attr( "pos" );

							var fg = cnvrgb( $( sample ).css( "color" ) );
							var bg = cnvrgb( $( sample ).css( "background-color" ) );

							if ( fg ) {
								_self.data.defaultPositions[pos][1] = fg;
							}
							if ( bg ) {
								_self.data.defaultPositions[pos][2] = bg;
							}

							console.log( pos + " : " + fg + ", " + bg );
						} );

						$( "#ruru-color-table .judgment-style" ).each( function( i, sample ) {
							var judge = $( sample ).attr( "judge" );
							_self.data.uraStatus[judge];

							var bold = $( sample ).css( "font-weight" ) === "bold";
							var italic = $( sample ).css( "font-style" ) === "italic";
							var line = $( sample ).css( "text-decoration" ).indexOf( "line-through" ) !== -1;
							var underline = $( sample ).css( "text-decoration" ).indexOf( "underline" ) !== -1;
							var shadow = $( sample ).css( "text-shadow" ) !== "none";

							_self.data.uraStatus[judge]["bold"] = bold;
							_self.data.uraStatus[judge]["italic"] = italic;
							_self.data.uraStatus[judge]["line"] = line;
							_self.data.uraStatus[judge]["underline"] = underline;
							_self.data.uraStatus[judge]["shadow"] = shadow;

							console.log( judge + " : bold[" + bold + "], italic[" + italic + "], line[" + line + "], underline[" + underline + "], shadow[" + shadow + "], " );
						} );

						localStorage.defaultPositions = $.stringify( _self.data.defaultPositions );
						localStorage.uraStatus = $.stringify( _self.data.uraStatus );

						_self.updateCss();

						_self.data.colorDialog.dialog( "close" );
					},
					"CANCEL" : function() {
						_self.data.colorDialog.dialog( "close" );
					}
				}
			} );

			$( _self.data.colorDialog ).parents( ".ui-dialog:first" ).children( ".ui-dialog-buttonpane:first" ).css( "font-size", "11px" );

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

			for ( var pos in _self.data.positions ) {
				if ( posText.indexOf( _self.data.positions[pos][4] ) === -1 ) {
					delete _self.data.positions[pos];
				}
			}

			$( "#No01 td.name" ).each( function( i, td ) {
				var name = $( ">span:first", td ).text();
				if ( name ) {
					var userid = $( td ).attr( "userid" );
					_self.data.users[userid] = {};
					_self.data.names[name] = userid;
					_self.data.nameMap[userid] = name;
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
			console.log( $.stringify( _self.data.names ) );

			return true;
		},
		onUpdateChat : function() {
			var _self = this;

			_self.data.day = _self.data.status.attr( "day" );
			var time = _self.data.status.attr( "time" );

			if ( _self.data.prevstatus !== time ) {
				_self.data.balloon( time + " になりました" );
			}

			if ( time === "夕刻" && _self.data.prevstatus !== time ) {
				_self.data.balloon( "ログを保存しました 【" + _self.data.day + "】" );
				_self.data.log[_self.data.day] = $( "#No09>table>tbody>tr" ).get();
			}

			_self.data.prevstatus = time;

			if ( _self.data.reverseLog ) {
				var h1 = $( "#chatscr2_1>.d1215" ).height();
				$( '#chatscr2_1' ).scrollTop( h1 );
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
						var white = $( "<ul></ul>" ).appendTo( $( "<li><a href='#'><span class='ui-icon ui-icon-radio-off'></span>村　人</a></li>" ).appendTo( _self.data.menu ) );
						var black = $( "<ul></ul>" ).appendTo( $( "<li><a href='#'><span class='ui-icon ui-icon-bullet'></span>人　狼</a></li>" ).appendTo( _self.data.menu ) );

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

			var optionalMenu = $( "<ul></ul>" ).appendTo( $( "<li id='menu-optional'><a href='#'><span class='ui-icon ui-icon-wrench'></span>表示設定</a></li>" ).appendTo( _self.data.menu ) );

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

			optionalMenu.append( "<hr/>" );
			optionalMenu.append( "<li id='menu-colors'><a href='#'><span class='ui-icon ui-icon-pencil'></span>カラー詳細</a></li>" );
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
				_self.data.users[user]["結果"][targetUser] = "村　人";
			} else if ( action === "menu-judgment-black" ) {
				var targetUser = $( selected ).attr( "userid" );
				_self.data.users[user]["結果"][targetUser] = "人　狼";
			} else if ( action === "menu-target" ) {
				var targetUser = $( selected ).attr( "userid" );
				_self.data.users[user]["結果"][targetUser] = true;
			} else if ( action === "menu-reverse-log" ) {
				_self.data.reverseLog = !_self.data.reverseLog;
				_self.data.status.attr( "reverselog", _self.data.reverseLog );
				_self.data.balloon( "チャット逆 " + ( _self.data.reverseLog ? "ON" : "OFF" ) );
				localStorage.reverseLog = _self.data.reverseLog;
			} else if ( action === "menu-hidecng" ) {
				_self.data.hidecng = !_self.data.hidecng;
				_self.data.balloon( "GM表示 " + ( !_self.data.hidecng ? "ON" : "OFF" ) );
			} else if ( action === "menu-hidecnw" ) {
				_self.data.hidecnw = !_self.data.hidecnw;
				_self.data.balloon( "観戦表示 " + ( !_self.data.hidecnw ? "ON" : "OFF" ) );
				localStorage.hidecnw = _self.data.hidecnw;
			} else if ( action === "menu-showgray" ) {
				_self.data.showgray = !_self.data.showgray;
				_self.data.balloon( "完グレー強調表示 " + ( _self.data.showgray ? "ON" : "OFF" ) );
				localStorage.showgray = _self.data.showgray;
			} else if ( action === "menu-showuranai" ) {
				_self.data.showuranai = !_self.data.showuranai;
				_self.data.balloon( "占い結果強調表示 " + ( _self.data.showuranai ? "ON" : "OFF" ) );
				localStorage.showuranai = _self.data.showuranai;
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
			} else if ( action === "menu-colors" ) {
				_self.data.colorDialog.dialog( "open" );
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

				if ( userData && userData["役職"] ) {
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
								if ( userData["結果"][targetUser] === "村　人" ) {
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

			var uraCount = 0;
			var usersStatus = {};

			for ( var name in _self.data.names ) {
				var user = _self.data.names[name];
				var userData = _self.data.users[user];

				if ( userData && userData["役職"] === "占　い" && !userData["役職解除"] ) {
					uraCount++;
					for ( var targetUser in userData["結果"] ) {
						if ( userData["結果"][targetUser] === "村　人" ) {
							if ( usersStatus[targetUser] ) {
								usersStatus[targetUser]["村　人"]++;
							} else {
								usersStatus[targetUser] = {
									"村　人" : 1,
									"人　狼" : 0
								};
							}
						} else {
							if ( usersStatus[targetUser] ) {
								usersStatus[targetUser]["人　狼"]++;
							} else {
								usersStatus[targetUser] = {
									"村　人" : 0,
									"人　狼" : 1
								};
							}
						}
					}
				}
			}

			var judgmentStyles = {};

			for ( var type in _self.data.uraStatus ) {
				var status = _self.data.uraStatus[type];
				var style = "";
				if ( status["bold"] ) {
					style = "font-weight:bold;";
				}
				if ( status["italic"] ) {
					style += "font-style:italic;";
				}
				if ( status["line"] && status["underline"] ) {
					style += "text-decoration:line-through underline;";
				} else if ( status["line"] ) {
					style += "text-decoration:line-through";
				} else if ( status["underline"] ) {
					style += "text-decoration:underline;";
				}
				if ( status["shadow"] ) {
					style += "text-shadow:1px 1px 2px #999;";
				}
				judgmentStyles[type] = style;
			}

			for ( var name in _self.data.names ) {
				var user = _self.data.names[name];
				var userData = _self.data.users[user];

				var style = "";

				if ( usersStatus[user] && _self.data.showuranai ) {
					for ( var type in judgmentStyles ) {
						if ( usersStatus[user][type] > 0 ) {
							style += judgmentStyles[type];
						}
					}
				}

				if ( userData && userData["役職"] && !userData["役職解除"] ) {
					var cl = _self.data.positions[userData["役職"]][1];
					var bg = _self.data.positions[userData["役職"]][2];
					_self.data.styleSheet.insertRule( "." + user + " {background-color:" + bg + ";color:" + cl + ";" + style + "}" );
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
