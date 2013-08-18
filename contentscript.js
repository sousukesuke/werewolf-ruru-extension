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
			hidecng : false,
			hidecnw : false,
			showgray : false,
			showposition : true,
			showuranai : true,
			reverseLog : false,
			showhistory : true,
			balloon : undefined,
			menu : undefined,
			styleSheet : undefined,
			dialogRects : {
				logDialog : {
					width : 570,
					height : 600
				},
				positionDialog : {},
				diaryDialog : {
					height : 300
				},
				grayTableDialog : {
					width : 390,
					height : 300
				}
			},
			logDialog : undefined,
			positionDialog : undefined,
			colorDialog : undefined,
			diaryDialog : undefined,
			grayTableDialog : undefined,
			logTags : [],
			dead : {},
			hang : {},
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
			positionOrders : {
				"占　い" : [],
				"霊　能" : [],
				"狩　人" : [],
				"共　有" : [],
				"狂　人" : [],
				"人　狼" : [],
				"妖　狐" : [],
				"狂信者" : [],
				"背徳者" : [],
				"猫　又" : []
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
			},
			graycolor : "#d8d8d8",
			temporary : {
				selectedLog : -1
			}
		},
		init : function() {
			var _self = this;

			if ( localStorage.installed ) {
				_self.data.showposition = localStorage.showposition == "true";
				_self.data.hidecnw = localStorage.hidecnw == "true";
				_self.data.showgray = localStorage.showgray == "true";
				_self.data.showuranai = localStorage.showuranai == "true";
				_self.data.reverseLog = localStorage.reverseLog == "true";
				_self.data.showhistory = localStorage.showhistory == "true";

				if ( localStorage.defaultPositions ) {
					var tmp = $.parseJSON( localStorage.defaultPositions );
					for ( var key in tmp ) {
						if ( _self.data.defaultPositions[key] ) {
							_self.data.defaultPositions[key] = tmp[key];
						}
					}
				}

				if ( localStorage.uraStatus ) {
					_self.data.uraStatus = $.parseJSON( localStorage.uraStatus );
				}

				if ( localStorage.graycolor ) {
					_self.data.graycolor = localStorage.graycolor;
				}

				if ( localStorage.dialogRects ) {
					_self.data.dialogRects = $.parseJSON( localStorage.dialogRects );
				}

				console.log( "設定読み込み", $.stringify( {
					"観戦OFF" : _self.data.showgray,
					"完グレ強調" : _self.data.showgray,
					"占い強調" : _self.data.showuranai,
					"ログ逆" : _self.data.reverseLog,
					"死亡履歴" : _self.data.showhistory
				} ) );
			} else {
				localStorage.showposition = _self.data.showposition;
				localStorage.hidecnw = _self.data.hidecnw;
				localStorage.showgray = _self.data.showgray;
				localStorage.showuranai = _self.data.showuranai;
				localStorage.reverseLog = _self.data.reverseLog;
				localStorage.showhistory = _self.data.showhistory;

				localStorage.installed = "true";
			}

			_self.data.positions = {};
			for ( var pos in _self.data.defaultPositions ) {
				_self.data.positions[pos] = _self.data.defaultPositions[pos];
			}

			_self.data.days = [];
			for ( var i = 1; i < 30; i++ ) {
				var ord = "" + i;
				switch ( ord % 10 ) {
				case 1:
					ord += "stDAY";
					break;
				case 2:
					ord += "ndDAY";
					break;
				case 3:
					ord += "rdDAY";
					break;
				default:
					ord += "thDAY";
				}
				_self.data.days.push( ord );
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

					_self.install();
				}

				sendResponse( {
					active : _self.data.installed
				} );
			}
		},
		reset : function() {
			$( "<div id='ruru-reset-dialog'><h3>設定を初期化します。</h3><div>ブラウザに保存されている<strong>「るる鯖拡張プラグイン」の設定</strong>を初期化して、ページの再読み込みを行います。<br/><ul><li>表示設定</li><li>カラー設定</li><li>メモ帳</li><li>ウィンドウ位置</li></ul></div></div>" ).dialog( {
				modal : true,
				title : "初期化確認",
				buttons : {
					OK : function() {
						localStorage.removeItem( "installed" );
						localStorage.removeItem( "defaultPositions" );
						localStorage.removeItem( "uraStatus" );
						localStorage.removeItem( "graycolor" );
						localStorage.removeItem( "dialogRects" );

						location.reload();
					},
					Cancel : function() {
						$( this ).dialog( "close" );
					}
				},
				close : function() {
					$( "#ruru-reset-dialog" ).parents( ".ui-dialog:first" ).remove();
				}
			} );
		},
		install : function() {
			var _self = this;

			_self.data.status = $( "<span id='ruru-ext-status' reverselog='" + _self.data.reverseLog + "' day='1rdDAY' time='開始前'></span>" ).appendTo( "body" );
			var dispatcher = $( "<button id='ruru-ext-event-dispatcher' style='display:none;'></button>" ).appendTo( "body" );

			var idle = function() {
				try {
					_self.onUpdateChat();
				} catch ( e ) {
					_self.data.balloon( "エラーが発生しました。", true );
					console.error( e );
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
					console.error( e );
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
					console.error( e );
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

			_self.data.balloon = function( message, alert, html ) {
				var balloon = $( "<div class='ui-corner-all ruru-ext-balloon' style='font-size:11px;margin-bottom:5px;padding:1em;'></div>" ).addClass( alert ? "ui-state-error" : "ui-state-highligh" ).hide();

				balloon.addClass( alert ? "ui-state-error" : "ui-state-highlight" );

				if ( html ) {
					balloon.html( message );
				} else {
					console.log( message );
					balloon.text( message );
				}

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

			_self.data.logDialog = $( "<div style='font-size:11px;overflow:hidden;'><div id='ruru-log-table' style='overflow:hidden;'></div><div id='ruru-log-users'></div></div>" ).appendTo( "body" ).dialog( {
				title : "ログ",
				autoOpen : false,
				minWidth : 450,
				width : _self.data.dialogRects.logDialog.width,
				height : _self.data.dialogRects.logDialog.height,
				position : _self.data.dialogRects.logDialog.position,
				open : function() {
					var buttonPanel = $( "#ruru-log-users" );

					for ( var name in _self.data.names ) {
						var targetUserid = _self.data.names[name];

						var count = $( "#ruru-log-table .ui-accordion-content-active ." + targetUserid ).length / 2;
						$( ".count-" + targetUserid, buttonPanel ).text( "[" + count + "]" );
					}

					_self.refreshLog();

					var accordion = $( "#ruru-log-table" );

					if ( _self.data.temporary.selectedLog !== -1 && accordion.accordion( "option", "active" ) !== _self.data.temporary.selectedLog ) {
						$( "#ruru-log-table" ).accordion( "option", "active", _self.data.temporary.selectedLog );

						// フォーカスが残る 追跡めんどくさい
						accordion.find( ".ui-state-focus" ).removeClass( "ui-state-focus" );
					}
				},
				resize : function() {
					_self.refreshLog();
				},
				resizeStop : function() {
					_self.saveDialogPosition( this, _self.data.dialogRects.logDialog );
				},
				dragStop : function() {
					_self.saveDialogPosition( this, _self.data.dialogRects.logDialog );
				}
			} );

			$( "#ruru-log-table" ).accordion( {
				animate : 100,
				heightStyle : "fill",
				activate : function() {
					var buttonPanel = $( "#ruru-log-users" );

					for ( var name in _self.data.names ) {
						var targetUserid = _self.data.names[name];

						var count = $( "#ruru-log-table .ui-accordion-content-active ." + targetUserid ).length / 2;
						$( ".count-" + targetUserid, buttonPanel ).text( "[" + count + "]" );
					}
				}
			} );

			_self.data.positionDialog = $( "<div style='font-size:11px;overflow:auto;' id='ruru-ext-position-dialog'></div>" ).appendTo( "body" ).dialog( {
				autoOpen : false,
				title : "内訳",
				width : _self.data.dialogRects.positionDialog.width,
				height : _self.data.dialogRects.positionDialog.height,
				position : _self.data.dialogRects.positionDialog.position,
				resizeStop : function() {
					_self.saveDialogPosition( this, _self.data.dialogRects.positionDialog );
				},
				dragStop : function() {
					_self.saveDialogPosition( this, _self.data.dialogRects.positionDialog );
				}
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

					{
						table.append( "<tr><td style='padding:1em;border-bottom:solid 1px gray;font-weight:bold;'>グレー表示</td><td style='padding:1em;border-bottom:solid 1px gray;'></td><td style='padding:1em;border-bottom:solid 1px gray;'></td></tr>" );

						var bg = _self.data.graycolor;

						var row = $( "<tr></tr>" ).appendTo( table );
						$( "<td colspan='2' id='color-gray-sample' style='padding:0.8em;background-color:" + bg + ";'></td>" ).text( "グレーな村人のチャット表示" ).appendTo( row );

						var colors = $( "<td style='text-align:center;'></td>" ).appendTo( row );

						$( '<input type="text"/>' ).appendTo( colors ).on( "changeColor", function( event, value ) {
							$( "#color-gray-sample" ).css( "background-color", "#" + value );
						} ).on( "previewColor", function( event, value ) {
							$( "#color-gray-sample" ).css( "background-color", "#" + value );
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

						_self.data.graycolor = cnvrgb( $( "#color-gray-sample" ).css( "background-color" ) );

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
						localStorage.graycolor = _self.data.graycolor;

						_self.updateCss();

						_self.data.colorDialog.dialog( "close" );
					},
					"CANCEL" : function() {
						_self.data.colorDialog.dialog( "close" );
					}
				}
			} );

			_self.data.diaryDialog = $( "<div style='font-size:11px;overflow:hidden;' id='ruru-ext-rest-dialog'><textarea id='ruru-extension-diary' style='width:100%;height:100%;padding:0px;margin:0px;'></textarea></div>" ).appendTo( "body" ).dialog( {
				autoOpen : false,
				title : "日記帳",
				width : _self.data.dialogRects.diaryDialog.width,
				height : _self.data.dialogRects.diaryDialog.height,
				position : _self.data.dialogRects.diaryDialog.position,
				buttons : {
					"Save" : function() {
						var diary = $( "#ruru-extension-diary" ).val();
						localStorage.diaryTemplate = diary;
						_self.data.balloon( "日記帳を保存しました" );
					},
					"Load" : function() {
						if ( localStorage.diaryTemplate ) {
							$( "#ruru-extension-diary" ).val( localStorage.diaryTemplate );
							_self.data.balloon( "保存済みの日記帳を読み込みました" );
						}
					}
				},
				resizeStop : function() {
					_self.saveDialogPosition( this, _self.data.dialogRects.diaryDialog );
				},
				dragStop : function() {
					_self.saveDialogPosition( this, _self.data.dialogRects.diaryDialog );
				}
			} );

			$( "#ruru-extension-diary" ).on( "blur", function() {
				localStorage.diaryBackup = $( "#ruru-extension-diary" ).val();
			} );

			if ( localStorage.diaryBackup ) {
				$( "#ruru-extension-diary" ).val( localStorage.diaryBackup );
				_self.data.balloon( "日記帳のバックアップがありました" );
			}

			_self.data.grayTableDialog = $(
					"<div style='font-size:11px;overflow:auto;' id='ruru-ext-gray-table-dialog'><span id='ruru-ext-gray-table-rest' style='margin-right:20px;vertical-align:middle;font-weight:bold;font-size:13px;'></span><input type='checkbox' style='vertical-align:middle;' id='ruru-ext-gray-table-show'/><label style='vertical-align:middle;' for='ruru-ext-gray-table-show'>逝った村は非表示</label><table class='ui-widget-content ui-corner-all'><thead id='ruru-ext-gray-head'></thead><tbody id='ruru-ext-gray-body'></tbody></table></div>" )
					.appendTo( "body" ).dialog( {
						autoOpen : false,
						width : _self.data.dialogRects.grayTableDialog.width,
						height : _self.data.dialogRects.grayTableDialog.height,
						position : _self.data.dialogRects.grayTableDialog.position,
						title : "役職テーブル",
						resizeStop : function() {
							_self.saveDialogPosition( this, _self.data.dialogRects.grayTableDialog );
						},
						dragStop : function() {
							_self.saveDialogPosition( this, _self.data.dialogRects.grayTableDialog );
						}
					} );

			$( "#ruru-ext-gray-table-show" ).attr( "checked", true ).on( "click", function() {
				_self.updateGrayTable();
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

			$( document ).on( "contextmenu", "#No01 td, #No09 td, #ruru-ext-gray-table-dialog td, #ruru-log-table td", function( event ) {
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

				var userid = $( event.target ).attr( "userid" );

				try {
					_self.createMenu( event.target, userid );
				} catch ( e ) {
					_self.data.balloon( "エラーが発生しました。", true );
					console.error( e );
				}

			} ).on( "execmenu", function( event, target ) {
				hidemenu();

				var action = $( event.target ).attr( "id" );
				var userid = $( target ).attr( "userid" );

				try {
					_self.execAction( userid, action, event.target );
				} catch ( e ) {
					_self.data.balloon( "エラーが発生しました。", true );
					console.error( e );
				}
			} );

			$( document ).on( "keypress", function( event ) {
				if ( event.ctrlKey ) {
					if ( event.which == 10 ) {
						$( "#todob" ).click();
						return false;
					} else if ( event.which == 28 ) {
						if ( _self.data.logDialog.dialog( "isOpen" ) ) {
							_self.data.logDialog.dialog( "close" );
						} else if ( _self.data.logTags.length ) {
							_self.data.logDialog.dialog( "open" );
						}

						$( "#messageInput" ).focus();

						return false;
					} else if ( event.which == 32 ) {
						if ( _self.data.diaryDialog.dialog( "isOpen" ) ) {
							_self.data.diaryDialog.dialog( "close" );
							$( "#messageInput" ).focus();
						} else {
							_self.data.diaryDialog.dialog( "open" );
							$( "#ruru-extension-diary" ).focus();
						}

						return false;
					} else {
						console.log( "which" + event.which );
					}
				}
			} );

			_self.data.balloon( "コンポーネントロード" );

			if ( _self.data.debug ) {
				_self.setupDebugComponents();
			}

			$( ".ui-dialog .ui-dialog-buttonpane" ).css( "font-size", "11px" );
		},
		saveDialogPosition : function( dialog, rect ) {
			var _self = this;

			rect.width = $( dialog ).dialog( "option", "width" );
			rect.height = $( dialog ).dialog( "option", "height" );
			rect.position = $( dialog ).dialog( "option", "position" );

			localStorage.dialogRects = $.stringify( _self.data.dialogRects );
		},
		setupDebugComponents : function() {
			var _self = this;

			var debugPanel = $( "<div style='font-size:10px;position:absolute;right:10px;bottom:10px;z-index:1000;'></div>" ).appendTo( "body" );

			$( "<button style='display:block;'>ログ保存</button>" ).button( {
				icons : {
					primary : "ui-icon-disk"
				},
				text : false
			} ).on( "click", function() {
				var title = "DEBUG : " + new Date().getTime();

				var table = $( "#No09>table" ).clone().css( "width", "100%" ).get();
				$( "td.cn", table ).removeAttr( "onclick" );
				_self.data.logTags.push( title );
				$( "#ruru-log-table" ).append( "<h3>" + title + "</h3>" ).append( $( "<div style='background:white;padding:0px 2px 20px 2px;overflow-y:scroll;'></div>" ).append( table ) );

				_self.refreshLog();
			} ).appendTo( debugPanel );

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

			for ( var pos in _self.data.positions ) {
				if ( posText.indexOf( _self.data.positions[pos][4] ) === -1 ) {
					delete _self.data.positions[pos];
				}
			}

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

			var buttonPanel = $( "#ruru-log-users" );

			for ( var name in _self.data.names ) {
				var userid = _self.data.names[name];
				var checkbox = $( "<input class='dialog-user-checkbox' type='checkbox' id='dialog-checkbox-" + userid + "' value='" + userid + "' style='vertical-align:sub;'/>" ).attr( "checked", true ).attr( "userid", userid );
				var count = $( "<span class='dialog-user-count count-" + userid + "' style='display:inline-block;min-width:30px;cursor:pointer;font-weight:bold;'>[0]</span>" ).attr( "userid", userid );
				buttonPanel.append( $( "<div style='display:inline-block;white-space:nowrap;'></div>" ).append( checkbox ).append( "<label for='dialog-checkbox-" + userid + "' class='" + userid + "' style='display:inline-block;min-width:80px;'>" + name + "</label>" ).append( count ) );
			}

			var updateDialogCss = function() {
				for ( var i = _self.data.dialogStyleSheet.cssRules.length - 1; i >= 0; i-- ) {
					_self.data.dialogStyleSheet.deleteRule( i );
				}

				$( "input.dialog-user-checkbox", buttonPanel ).each( function( i, checkbox ) {
					var checked = $( checkbox ).is( ":checked" );
					if ( !checked ) {
						var userid = $( checkbox ).attr( "userid" );
						_self.data.dialogStyleSheet.insertRule( "#ruru-log-table ." + userid + " {display:none;}" );
					}
				} );
			};

			$( "input.dialog-user-checkbox", buttonPanel ).on( "click", updateDialogCss );

			$( "span.dialog-user-count", buttonPanel ).on( "click", function() {
				var userid = $( this ).attr( "userid" );

				$( "input.dialog-user-checkbox", buttonPanel ).removeAttr( "checked", false );

				// $( "#dialog-checkbox-" + userid, buttonPanel ).attr(
				// "checked",
				// true );
				$( "#dialog-checkbox-" + userid )[0].checked = true;

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

			if ( _self.data.time !== time ) {
				var tmp = _self.data.day.match( /^([0-9]+)[^0-9]*$/ );
				_self.data.dayIndex = parseInt( tmp[1] - 1 );
				_self.data.days[_self.data.dayIndex] = _self.data.day;

				_self.data.balloon( time + " になりました" );

				var all = $( "#No01 td.name>span" ).length;
				var dead = $( "#No01 td.name>span.dead" ).length;
				var rest = all - dead;

				var reststep = "" + rest;
				rest -= 2;
				var count = 0;
				while ( rest > 0 ) {
					reststep += " > ";
					reststep += rest;
					rest -= 2;
					count++;
				}

				_self.data.positionDialog.dialog( "option", "title", "内訳　【 " + reststep + " == " + count + " 】" );

				$( "#ruru-ext-gray-table-rest" ).text( "吊り数【 " + count + " 】" );

				var updateHistory = false;

				if ( time === "夕刻" ) {
					_self.data.balloon( "ログを保存しました 【" + _self.data.day + "】" );
					var table = $( "#No09>table" ).clone().css( "width", "100%" ).get();
					$( "td.cn", table ).removeAttr( "onclick" );
					_self.data.logTags.push( _self.data.day );
					$( "#ruru-log-table" ).append( "<h3>" + _self.data.day + "</h3>" ).append( $( "<div style='background:white;padding:0px 2px 20px 2px;overflow-y:scroll;'></div>" ).append( table ) );
					_self.refreshLog();
				} else if ( time === "昼" ) {
					var dead = [];
					$( "#No09 td.cs>span.death>span.name" ).each( function( i, name ) {
						var uuuu = _self.data.names[$( name ).text()];
						dead.push( uuuu );
						_self.data.users[uuuu]["dead"] = true;
						updateHistory = true;
					} );
					_self.data.dead[_self.data.days[_self.data.dayIndex - 1]] = dead;
				} else if ( time === "夜" ) {
					var hang = [];
					$( "#No09 td.cs>span.death>span.name" ).each( function( i, name ) {
						var uuuu = _self.data.names[$( name ).text()];
						_self.data.users[uuuu]["hang"] = true;
						hang.push( uuuu );
						updateHistory = true;
					} );
					_self.data.hang[_self.data.day] = hang;
				} else if ( time === "夜明け" ) {
				} else if ( time === "ゲーム終了" ) {
				}

				if ( updateHistory && _self.data.showhistory ) {
					_self.updateCss();
				}

				_self.updateGrayTable();
			}

			_self.data.time = time;

			if ( _self.data.reverseLog ) {
				var h1 = $( "#chatscr2_1>.d1215" ).height();
				$( '#chatscr2_1' ).scrollTop( h1 );
			}
		},
		refreshLog : function() {
			$( "#ruru-log-table" ).accordion( "refresh" );
		},
		createMenu : function( ui, userid ) {
			var _self = this;

			if ( userid ) {
				var userData = _self.data.users[userid];

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
							var targetUserid = _self.data.names[name];

							if ( !userData["結果"][targetUserid] && targetUserid !== userid ) {
								$( "<li id='menu-judgment-white'><a href='#'><span class='ui-icon ui-icon-" + _self.data.positions[userPosition][0] + "'></span>" + name + "</a></li>" ).attr( "userid", targetUserid ).appendTo( white );
								$( "<li id='menu-judgment-black'><a href='#'><span class='ui-icon ui-icon-" + _self.data.positions[userPosition][0] + "'></span>" + name + "</a></li>" ).attr( "userid", targetUserid ).appendTo( black );
							}
						}

						_self.data.menu.append( "<hr/>" );
					} else if ( _self.data.positions[userPosition][3] === "対象" ) {
						var target = $( "<ul></ul>" ).appendTo( $( "<li><a href='#'><span class='ui-icon ui-icon-flag'></span>対象</a></li>" ).appendTo( _self.data.menu ) );

						for ( var name in _self.data.names ) {
							var targetUserid = _self.data.names[name];

							if ( targetUserid !== userid ) {
								$( "<li id='menu-target'><a href='#'><span class='ui-icon ui-icon-" + _self.data.positions[userPosition][0] + "'></span>" + name + "</a></li>" ).attr( "userid", targetUserid ).appendTo( target );
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

			if ( $( ui ).hasClass( "gray-table-data" ) ) {
				var from = $( ui ).attr( "fromuserid" );
				var to = $( ui ).attr( "touserid" );

				if ( $( ui ).hasClass( "gray-table-data-white" ) ) {
					_self.data.menu.append( "<li id='menu-gray-table-delete' fromuserid='" + from + "' touserid='" + to + "'><a href='#'><span class='ui-icon ui-icon-close'></span>削除</a></li>" );
					_self.data.menu.append( "<li id='menu-gray-table-black' fromuserid='" + from + "' touserid='" + to + "'><a href='#'><span class='ui-icon ui-icon-bullet'></span>人　狼</a></li>" );
				} else if ( $( ui ).hasClass( "gray-table-data-black" ) ) {
					_self.data.menu.append( "<li id='menu-gray-table-delete' fromuserid='" + from + "' touserid='" + to + "'><a href='#'><span class='ui-icon ui-icon-close'></span>削除</a></li>" );
					_self.data.menu.append( "<li id='menu-gray-table-white' fromuserid='" + from + "' touserid='" + to + "'><a href='#'><span class='ui-icon ui-icon-radio-off'></span>村　人</a></li>" );
				} else {
					_self.data.menu.append( "<li id='menu-gray-table-white' fromuserid='" + from + "' touserid='" + to + "'><a href='#'><span class='ui-icon ui-icon-radio-off'></span>村　人</a></li>" );
					_self.data.menu.append( "<li id='menu-gray-table-black' fromuserid='" + from + "' touserid='" + to + "'><a href='#'><span class='ui-icon ui-icon-bullet'></span>人　狼</a></li>" );
				}

				_self.data.menu.append( "<hr/>" );
			}

			if ( $( "#No01 td." + userid + ".icon.dv" ).length !== 0 ) {
				var hangmenu = $( "<li id='menu-hang'><a href='#'><span class='ui-icon ui-icon-power'></span>吊り</a></li>" ).appendTo( _self.data.menu );
				var deadmenu = $( "<li id='menu-dead'><a href='#'><span class='ui-icon ui-icon-scissors'></span>噛み</a></li>" ).appendTo( _self.data.menu );
				var hangsub = $( "<ul></ul>" ).appendTo( hangmenu );
				var deadsub = $( "<ul></ul>" ).appendTo( deadmenu );
				for ( var i = 0; i <= _self.data.dayIndex; i++ ) {
					var day = _self.data.days[i];

					if ( i !== 0 ) {
						hangsub.append( "<li id='menu-input-hang' dayindex='" + i + "'><a href='#'><span class='ui-icon ui-icon-power'></span>" + day + "</a></li>" );
					}
					deadsub.append( "<li id='menu-input-dead' dayindex='" + i + "'><a href='#'><span class='ui-icon ui-icon-scissors'></span>" + day + "</a></li>" );
				}
				_self.data.menu.append( "<hr/>" );
			}

			if ( _self.data.logTags.length ) {
				var logmenu = $( "<li id='menu-log'><a href='#'><span class='ui-icon ui-icon-comment'></span>ログ</a></li>" ).appendTo( _self.data.menu );
				var logsub = $( "<ul></ul>" ).appendTo( logmenu );

				for ( var i = 0; i < _self.data.logTags.length; i++ ) {
					var day = _self.data.logTags[i];
					logsub.append( "<li id='menu-log-of-day'><a href='#'><span class='ui-icon ui-icon-comment'></span>" + day + "</a></li>" );
					logmenu.attr( "last-day", day );
				}
			}

			_self.data.menu.append( "<li id='menu-person'><a href='#'><span class='ui-icon ui-icon-person'></span>内訳</a></li>" );
			_self.data.menu.append( "<li id='menu-gray-table'><a href='#'><span class='ui-icon ui-icon-calculator'></span>役職テーブル</a></li>" );
			_self.data.menu.append( "<li id='menu-diary'><a href='#'><span class='ui-icon ui-icon-pencil'></span>メモ帳</a></li>" );

			var optionalMenu = $( "<ul></ul>" ).appendTo( $( "<li id='menu-optional'><a href='#'><span class='ui-icon ui-icon-wrench'></span>表示設定</a></li>" ).appendTo( _self.data.menu ) );

			if ( _self.data.showposition ) {
				optionalMenu.append( "<li id='menu-showposition'><a href='#'><span class='ui-icon ui-icon-check'></span>役職強調</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-showposition'><a href='#'><span class='ui-icon ui-icon-closethick'></span>役職強調切り替え</a></li>" );
			}

			if ( _self.data.showuranai ) {
				optionalMenu.append( "<li id='menu-showuranai'><a href='#'><span class='ui-icon ui-icon-check'></span>占い結果強調</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-showuranai'><a href='#'><span class='ui-icon ui-icon-closethick'></span>占い結果強調切り替え</a></li>" );
			}

			if ( _self.data.showgray ) {
				optionalMenu.append( "<li id='menu-showgray'><a href='#'><span class='ui-icon ui-icon-check'></span>完グレー強調</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-showgray'><a href='#'><span class='ui-icon ui-icon-closethick'></span>完グレー強調切り替え</a></li>" );
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
				optionalMenu.append( "<li id='menu-reverse-log'><a href='#'><span class='ui-icon ui-icon-closethick'></span>チャット反転切り替え</a></li>" );
			}

			if ( _self.data.showhistory ) {
				optionalMenu.append( "<li id='menu-showhistory'><a href='#'><span class='ui-icon ui-icon-check'></span>吊噛表示</a></li>" );
			} else {
				optionalMenu.append( "<li id='menu-showhistory'><a href='#'><span class='ui-icon ui-icon-closethick'></span>吊噛表示切り替え</a></li>" );
			}

			optionalMenu.append( "<hr/>" );
			optionalMenu.append( "<li id='menu-colors'><a href='#'><span class='ui-icon ui-icon-image'></span>カラー詳細</a></li>" );
			optionalMenu.append( "<li id='menu-reset'><a href='#'><span class='ui-icon ui-icon-alert'></span>設定リセット</a></li>" );
		},
		execAction : function( userid, action, selected ) {
			var _self = this;

			if ( action === "menu-toggle-post" ) {
				_self.data.users[userid]["役職解除"] = !_self.data.users[userid]["役職解除"];
			} else if ( action === "menu-remove-position" ) {
				_self.data.users[userid]["役職"] = undefined;
				_self.data.users[userid]["役職解除"] = false;
				_self.data.users[userid]["結果"] = {};
				_self.cleanPositionOrders( userid );
			} else if ( action === "menu-position" ) {
				var pos = $( selected ).attr( "pos" );
				_self.data.users[userid]["役職"] = pos;
				_self.data.users[userid]["役職解除"] = false;
				_self.data.users[userid]["結果"] = {};
				_self.cleanPositionOrders( userid );
				_self.data.positionOrders[pos].push( userid );
			} else if ( action === "menu-judgment-white" ) {
				var targetUserid = $( selected ).attr( "userid" );
				_self.data.users[userid]["結果"][targetUserid] = "村　人";
			} else if ( action === "menu-judgment-black" ) {
				var targetUserid = $( selected ).attr( "userid" );
				_self.data.users[userid]["結果"][targetUserid] = "人　狼";
			} else if ( action === "menu-target" ) {
				var targetUserid = $( selected ).attr( "userid" );
				_self.data.users[userid]["結果"][targetUserid] = true;
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
			} else if ( action === "menu-showposition" ) {
				_self.data.showposition = !_self.data.showposition;
				_self.data.balloon( "役職強調表示 " + ( _self.data.showposition ? "ON" : "OFF" ) );
				localStorage.showposition = _self.data.showposition;
			} else if ( action === "menu-showgray" ) {
				_self.data.showgray = !_self.data.showgray;
				_self.data.balloon( "完グレー強調表示 " + ( _self.data.showgray ? "ON" : "OFF" ) );
				localStorage.showgray = _self.data.showgray;
			} else if ( action === "menu-showuranai" ) {
				_self.data.showuranai = !_self.data.showuranai;
				_self.data.balloon( "占い結果強調表示 " + ( _self.data.showuranai ? "ON" : "OFF" ) );
				localStorage.showuranai = _self.data.showuranai;
			} else if ( action === "menu-showhistory" ) {
				_self.data.showhistory = !_self.data.showhistory;
				_self.data.balloon( "吊噛履歴表示 " + ( _self.data.showhistory ? "ON" : "OFF" ) );
				localStorage.showhistory = _self.data.showhistory;
			} else if ( action === "menu-log" ) {
				var day = $( selected ).attr( "last-day" );

				var index = _self.data.logTags.indexOf( day );

				if ( index !== -1 ) {
					_self.data.temporary.selectedLog = index;
				}

				_self.data.logDialog.dialog( "open" );
			} else if ( action === "menu-log-of-day" ) {
				var day = $( selected ).text();

				var index = _self.data.logTags.indexOf( day );

				if ( index !== -1 ) {
					_self.data.temporary.selectedLog = index;
				}

				_self.data.logDialog.dialog( "open" );
			} else if ( action === "menu-person" ) {
				_self.data.positionDialog.dialog( "open" );
			} else if ( action === "menu-diary" ) {
				_self.data.diaryDialog.dialog( "open" );
			} else if ( action === "menu-gray-table" ) {
				_self.data.grayTableDialog.dialog( "open" );
			} else if ( action === "menu-colors" ) {
				_self.data.colorDialog.dialog( "open" );
			} else if ( action === "menu-input-dead" ) {
				var dayindex = parseInt( $( selected ).attr( "dayindex" ) );
				var day = _self.data.days[dayindex];
				_self.cleanDead( userid );

				var dead = _self.data.dead[day];
				if ( dead && dead.length !== 0 ) {
					dead.push( userid );
				} else {
					dead = [ userid ];
				}

				_self.data.users[userid]["dead"] = true;
				_self.data.users[userid]["hang"] = false;

				_self.data.dead[day] = dead;
			} else if ( action === "menu-input-hang" ) {
				var dayindex = parseInt( $( selected ).attr( "dayindex" ) );
				var day = _self.data.days[dayindex];
				_self.cleanDead( userid );

				var hang = _self.data.hang[day];
				if ( hang && hang.length !== 0 ) {
					hang.push( userid );
				} else {
					hang = [ userid ];
				}

				_self.data.users[userid]["hang"] = true;
				_self.data.users[userid]["dead"] = false;

				_self.data.hang[day] = hang;
			} else if ( action === "menu-gray-table-delete" ) {
				var from = $( selected ).attr( "fromuserid" );
				var to = $( selected ).attr( "touserid" );

				delete _self.data.users[from]["結果"][to];
			} else if ( action === "menu-gray-table-black" ) {
				var from = $( selected ).attr( "fromuserid" );
				var to = $( selected ).attr( "touserid" );

				_self.data.users[from]["結果"][to] = "人　狼";
			} else if ( action === "menu-gray-table-white" ) {
				var from = $( selected ).attr( "fromuserid" );
				var to = $( selected ).attr( "touserid" );

				_self.data.users[from]["結果"][to] = "村　人";
			} else if ( action === "menu-reset" ) {
				_self.reset();
			}

			_self.updateCss();
			_self.updatePosition();
		},
		cleanDead : function( userid ) {
			var _self = this;

			for ( var day in _self.data.dead ) {
				var dead = _self.data.dead[day];
				if ( dead && dead.indexOf ) {
					var index = dead.indexOf( userid );
					if ( index != -1 ) {
						dead.splice( index, 1 );
					}
				}
			}

			for ( var day in _self.data.hang ) {
				var hang = _self.data.hang[day];
				if ( hang && hang.indexOf ) {
					var index = hang.indexOf( userid );
					if ( index != -1 ) {
						hang.splice( index, 1 );
					}
				}
			}
		},
		cleanPositionOrders : function( userid ) {
			var _self = this;

			for ( var position in _self.data.positionOrders ) {
				var order = _self.data.positionOrders[position];
				if ( order && order.indexOf ) {
					var index = order.indexOf( userid );
					if ( index != -1 ) {
						order.splice( index, 1 );
					}
				}
			}
		},
		updatePosition : function() {
			var _self = this;

			var dialog = $( "#ruru-ext-position-dialog" ).empty();

			for ( var pos in _self.data.positionOrders ) {
				var order = _self.data.positionOrders[pos];

				if ( order.length !== 0 ) {
					dialog.append( "<h3>" + pos + "</h3>" );

					var elm = $( "<div pos='" + pos + "'></div>" ).appendTo( dialog );

					for ( var i = 0; i < order.length; i++ ) {
						var userid = order[i];
						var userData = _self.data.users[userid];
						var name = userData["name"];

						var jg = _self.data.positions[userData["役職"]][3];
						var position = $( "<div class='position'></div>" ).append( "<div style='display:inline-block;min-width:50px;padding:3px;margin-right:3px;' class='position-user " + userid + "'>" + name + "</div>" ).append( jg ? "&nbsp;&nbsp;：" : "" ).appendTo( elm ).attr( "userid", userid );
						if ( jg ) {
							var result = $( "<div style='display:inline-block;'></div>" ).appendTo( position );
							if ( jg === "判定" ) {
								for ( var targetUserid in userData["結果"] ) {
									if ( userData["結果"][targetUserid] === "村　人" ) {
										result.append( $(
												"<div style='display:inline-block;padding:3px;margin-right:3px;' class='position-target " + targetUserid + "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-radio-off'></span>" + _self.data.users[targetUserid]["name"]
														+ "</div>" ).attr( "userid", targetUserid ) );
									} else {
										result.append( $(
												"<div style='display:inline-block;padding:3px;margin-right:3px;' class='position-target " + targetUserid + "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-bullet'></span>" + _self.data.users[targetUserid]["name"]
														+ "</div>" ).attr( "userid", targetUserid ) );
									}
								}
							} else if ( jg === "対象" ) {
								for ( var targetUserid in userData["結果"] ) {
									result.append( $( "<div style='display:inline-block;padding:3px;margin-right:3px;' class='position-target " + targetUserid + "'>" + _self.data.users[targetUserid]["name"] + "</div>" ).attr( "userid", targetUserid ) );
								}
							}
						}
					}

					elm.sortable( {
						update : function() {
							var pos = $( this ).attr( "pos" );
							var order = [];

							$( ".position-user", this ).each( function( i, div ) {
								var userid = undefined;
								if ( $( div ).hasClass( "position" ) ) {
									userid = $( div ).attr( "userid" );
								} else {
									userid = $( div ).parents( ".position:first" ).attr( "userid" );
								}

								order.push( userid );
							} );

							_self.data.positionOrders[pos] = order;
						}
					} );
					elm.disableSelection();
				}
			}

			$( ".position-user", dialog ).on( "dblclick", function( e ) {
				var delUserid;
				if ( $( this ).hasClass( "position" ) ) {
					delUserid = $( this ).attr( "userid" );
				} else {
					delUserid = $( this ).parents( ".position:first" ).attr( "userid" );
				}

				if ( delUserid ) {
					_self.data.users[delUserid]["役職"] = undefined;
					_self.data.users[delUserid]["役職解除"] = false;
					_self.data.users[delUserid]["結果"] = {};

					_self.cleanPositionOrders( delUserid );

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

			_self.updateGrayTable();
		},
		updateGrayTable : function() {
			var showAll = !$( "#ruru-ext-gray-table-show" ).is( ":checked" );

			var _self = this;

			var tableHead = $( "#ruru-ext-gray-head" ).empty();
			var tableBody = $( "#ruru-ext-gray-body" ).empty();

			var headRow = $( "<tr></tr>" ).append( "<td>　</td>" ).appendTo( tableHead );

			var uranais = _self.data.positionOrders["占　い"];
			var uranaiUsers = [];
			for ( var i = 0; i < uranais.length; i++ ) {
				var userData = _self.data.users[uranais[i]];
				if ( !userData["役職解除"] ) {
					headRow.append( "<td class='" + uranais[i] + " gray-table-head' userid='" + uranais[i] + "'>" + userData["name"] + "</td>" );
					uranaiUsers.push( userData );
				}
			}

			var reis = _self.data.positionOrders["霊　能"];
			var reiUsers = [];
			for ( var i = 0; i < reis.length; i++ ) {
				var userData = _self.data.users[reis[i]];
				if ( !userData["役職解除"] ) {
					headRow.append( "<td class='" + reis[i] + " gray-table-head' userid='" + reis[i] + "'>" + userData["name"] + "</td>" );
					reiUsers.push( userData );
				}
			}

			for ( var userid in _self.data.users ) {
				var userData = _self.data.users[userid];

				var bodyRow = $( "<tr></tr>" );
				bodyRow.append( "<td class='" + userid + "' userid='" + userid + "'>" + userData["name"] + "</td>" );

				var black = false;

				for ( var j = 0; j < uranaiUsers.length; j++ ) {
					var col = $( "<td class='gray-table-data' fromuserid='" + uranaiUsers[j]["userid"] + "' touserid='" + userid + "'></td>" ).appendTo( bodyRow );

					var result = uranaiUsers[j]["結果"][userid];
					if ( result === "人　狼" ) {
						col.append( "<span class='ui-icon ui-icon-bullet' style='display:inline-block;'></span>" );
						col.addClass( "gray-table-data-black" );
						black = true;
					} else if ( result === "村　人" ) {
						col.append( "<span class='ui-icon ui-icon-radio-off' style='display:inline-block;'></span>" );
						col.addClass( "gray-table-data-white" );
					} else if ( uranaiUsers[j]["userid"] == userid ) {
						col.text( "-" );
					}

					if ( userData["hang"] || userData["dead"] ) {
						col.css( "background-color", "#fdeada" );
					}
				}

				for ( var j = 0; j < reiUsers.length; j++ ) {
					var col = $( "<td class='gray-table-data' fromuserid='" + reiUsers[j]["userid"] + "' touserid='" + userid + "'></td>" ).appendTo( bodyRow );

					var result = reiUsers[j]["結果"][userid];
					if ( result === "人　狼" ) {
						col.append( "<span class='ui-icon ui-icon-bullet' style='display:inline-block;'></span>" );
						col.addClass( "gray-table-data-black" );
						black = true;
					} else if ( result === "村　人" ) {
						col.append( "<span class='ui-icon ui-icon-radio-off' style='display:inline-block;'></span>" );
						col.addClass( "gray-table-data-white" );
					} else if ( reiUsers[j]["userid"] == userid ) {
						col.text( "-" );
					}

					if ( userData["hang"] || userData["dead"] ) {
						col.css( "background-color", "#fdeada" );
					}
				}

				if ( showAll || black || ( !userData["hang"] && !userData["dead"] ) ) {
					tableBody.append( bodyRow );
				}
			}
		},
		updateCss : function() {
			var _self = this;

			for ( var i = _self.data.styleSheet.cssRules.length - 1; i >= 0; i-- ) {
				_self.data.styleSheet.deleteRule( i );
			}

			var uraCount = 0;
			var usersStatus = {};

			for ( var name in _self.data.names ) {
				var userid = _self.data.names[name];
				var userData = _self.data.users[userid];

				if ( userData && userData["役職"] === "占　い" && !userData["役職解除"] ) {
					uraCount++;
					for ( var targetUserid in userData["結果"] ) {
						if ( userData["結果"][targetUserid] === "村　人" ) {
							if ( usersStatus[targetUserid] ) {
								usersStatus[targetUserid]["村　人"]++;
							} else {
								usersStatus[targetUserid] = {
									"村　人" : 1,
									"人　狼" : 0
								};
							}
						} else {
							if ( usersStatus[targetUserid] ) {
								usersStatus[targetUserid]["人　狼"]++;
							} else {
								usersStatus[targetUserid] = {
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
				var userid = _self.data.names[name];
				var userData = _self.data.users[userid];

				var style = "";

				if ( usersStatus[userid] && _self.data.showuranai ) {
					for ( var type in judgmentStyles ) {
						if ( usersStatus[userid][type] > 0 ) {
							style += judgmentStyles[type];
						}
					}
				}

				if ( _self.data.showposition && userData && userData["役職"] && !userData["役職解除"] ) {
					var cl = _self.data.positions[userData["役職"]][1];
					var bg = _self.data.positions[userData["役職"]][2];
					_self.data.styleSheet.insertRule( "." + userid + " {background-color:" + bg + ";color:" + cl + ";" + style + "}" );
				} else if ( style === "" && _self.data.showgray ) {
					_self.data.styleSheet.insertRule( "." + userid + " {background-color:" + _self.data.graycolor + ";}" );
				} else {
					_self.data.styleSheet.insertRule( "." + userid + " {" + style + "}" );
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

			if ( _self.data.showhistory ) {
				var bgi = chrome.extension.getURL( "claw.png" );
				for ( var key in _self.data.dead ) {
					var dead = _self.data.dead[key];
					for ( var i = 0; i < dead.length; i++ ) {
						_self.data.styleSheet.insertRule( "#No01 td." + dead[i] + ".icon div:after {content: '" + key + "';font-size: 10px;background-color: red;padding: 2px 5px;color:white;}" );
						_self.data.styleSheet.insertRule( "#No01 td.name." + dead[i] + " {background-image:url(" + bgi + ");background-repeat:no-repeat;background-position:right top;}" );
						_self.data.styleSheet.insertRule( "#ruru-ext-position-dialog div." + dead[i] + " {background-image:url(" + bgi + ");background-repeat:no-repeat;background-position:right top;}" );
						_self.data.styleSheet.insertRule( "#ruru-log-users label." + dead[i] + " {background-image:url(" + bgi + ");background-repeat:no-repeat;background-position:right top;}" );
						_self.data.styleSheet.insertRule( "#ruru-ext-gray-table-dialog td." + dead[i] + " {background-image:url(" + bgi + ");background-repeat:no-repeat;background-position:right top;}" );
					}
				}

				for ( var key in _self.data.hang ) {
					var hang = _self.data.hang[key];
					for ( var i = 0; i < hang.length; i++ ) {
						_self.data.styleSheet.insertRule( "#No01 td." + hang[i] + ".icon div:after {content: '" + key + "';font-size: 10px;background-color: blue;padding: 2px 5px;color:white;}" );
					}
				}
			}
		}
	};

	var RuruExt = new _RuruExt();

	RuruExt.init();
} );
