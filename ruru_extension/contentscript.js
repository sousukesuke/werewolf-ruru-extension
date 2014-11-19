$(function() {

	var _RuruExt = function() {
	};

	var defaultColors = [ 'ffffff', 'f2f2f2', 'd8d8d8', 'bfbfbf', 'a5a5a5',
			'7f7f7f', '000000', '7f7f7f', '595959', '3f3f3f', '262626',
			'0c0c0c', 'eeece1', 'ddd9c3', 'c4bd97', '938953', '494429',
			'1d1b10', '1f497d', 'c6d9f0', '8db3e2', '548dd4', '17365d',
			'0f243e', '4f81bd', 'dbe5f1', 'b8cce4', '95b3d7', '366092',
			'244061', 'c0504d', 'f2dcdb', 'e5b9b7', 'd99694', '953734',
			'632423', '9bbb59', 'ebf1dd', 'd7e3bc', 'c3d69b', '76923c',
			'4f6128', '8064a2', 'e5e0ec', 'ccc1d9', 'b2a2c7', '5f497a',
			'3f3151', '4bacc6', 'dbeef3', 'b7dde8', '92cddc', '31859b',
			'205867', 'f79646', 'fdeada', 'fbd5b5', 'fac08f', 'e36c09',
			'974806', 'c00000', 'ff0000', 'ffc000', 'ffff00', '92d050',
			'00b050', '00b0f0', '0070c0', '002060', '7030a0' ];

	var cnvrgb = function(rgb) {
		if (!rgb) {
			return;
		} else if (rgb.indexOf("rgb") === -1) {
			return rgb;
		}

		var parts = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

		delete (parts[0]);
		for (var i = 1; i <= 3; ++i) {
			parts[i] = parseInt(parts[i]).toString(16);
			if (parts[i].length == 1)
				parts[i] = '0' + parts[i];
		}
		return '#' + parts.join('');
	};

	_RuruExt.prototype = {
		data : {
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
				},
				voteDialog : {}
			},
			logDialog : undefined,
			positionDialog : undefined,
			colorDialog : undefined,
			diaryDialog : undefined,
			grayTableDialog : undefined,
			voteDialog : undefined,
			logTags : [],
			voteCounts : [],
			voteIndex : -1,
			vorteOrder : true,
			dead : {},
			hang : {},
			dialogStyleSheet : undefined,
			defaultPositions : {
				"占　い" : [ "search", "#82cafa", "#ffffff", "判定", "占" ],
				"霊　能" : [ "heart", "#0000a0", "#ffffff", "判定", "霊" ],
				"狩　人" : [ "note", "#a52a2a", "#ffffff", "対象", "狩" ],
				"共　有" : [ "link", "#008000", "#ffffff", "", "共" ],
				"狂　人" : [ "circle-minus", "#faafbe", "#000000", "", "狂" ],
				"人　狼" : [ "circle-close", "#ff0000", "#000000", "", "狼" ],
				"妖　狐" : [ "alert", "#000000", "#ffff00", "", "狐" ],
				"狂信者" : [ "circle-plus", "#ff00ff", "#000000", "", "信" ],
				"背徳者" : [ "info", "#c0c0c0", "#ffff00", "", "背" ],
				"猫　又" : [ "calender", "#8a2be2", "#ffffff", "", "猫" ]
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
			graycolor : "#d3d3d3",
			temporary : {
				selectedLog : -1
			}
		},
		init : function() {
			var _self = this;

			if (localStorage.installed) {
				_self.data.showposition = localStorage.showposition == "true";
				_self.data.hidecnw = localStorage.hidecnw == "true";
				_self.data.showgray = localStorage.showgray == "true";
				_self.data.showuranai = localStorage.showuranai == "true";
				_self.data.reverseLog = localStorage.reverseLog == "true";
				_self.data.showhistory = localStorage.showhistory == "true";

				if (localStorage.defaultPositions) {
					var tmp = $.parseJSON(localStorage.defaultPositions);
					for ( var key in tmp) {
						if (_self.data.defaultPositions[key]) {
							_self.data.defaultPositions[key] = tmp[key];
						}
					}
				}

				if (localStorage.uraStatus) {
					_self.data.uraStatus = $.parseJSON(localStorage.uraStatus);
				}

				if (localStorage.graycolor) {
					_self.data.graycolor = localStorage.graycolor;
				}

				if (localStorage.dialogRects) {
					var tmp = $.parseJSON(localStorage.dialogRects);
					for ( var key in tmp) {
						if (_self.data.dialogRects[key]) {
							_self.data.dialogRects[key] = tmp[key];
						}
					}
				}

				console.log("設定読み込み", $.stringify({
					"観戦OFF" : _self.data.showgray,
					"完グレ強調" : _self.data.showgray,
					"占い強調" : _self.data.showuranai,
					"ログ逆" : _self.data.reverseLog,
					"死亡履歴" : _self.data.showhistory
				}));
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
			for ( var pos in _self.data.defaultPositions) {
				_self.data.positions[pos] = _self.data.defaultPositions[pos];
			}

			_self.data.days = [];
			for (var i = 1; i < 30; i++) {
				_self.data.days.push(_self.ord(i) + "DAY");
			}

			chrome.extension.sendRequest({
				action : "init"
			}, function(responce) {
				_self.onInit(responce);
			});
		},
		onInit : function(response) {
			var _self = this;

			chrome.extension.onRequest.addListener(function(request, sender,
					sendResponse) {
				_self.onPageAction(request, sender, sendResponse);
			});
		},
		onPageAction : function(request, sender, sendResponse) {
			var _self = this;

			if (request.action === "click") {
				if (!_self.data.installed) {
					_self.data.installed = true;

					if (!$("#SC").is(":checked")) {
						$("#SC").click();
					}

					_self.install();
				}

				sendResponse({
					active : _self.data.installed
				});
			}
		},
		reset : function() {
			$(
					"<div id='ruru-reset-dialog'><h3>設定を初期化します。</h3><div>ブラウザに保存されている<strong>「るる鯖拡張プラグイン」の設定</strong>を初期化して、ページの再読み込みを行います。<br/><ul><li>表示設定</li><li>カラー設定</li><li>メモ帳</li><li>ウィンドウ位置</li></ul></div></div>")
					.dialog(
							{
								modal : true,
								title : "初期化確認",
								buttons : {
									OK : function() {
										localStorage.removeItem("installed");
										localStorage
												.removeItem("defaultPositions");
										localStorage.removeItem("uraStatus");
										localStorage.removeItem("graycolor");
										localStorage.removeItem("dialogRects");

										location.reload();
									},
									Cancel : function() {
										$(this).dialog("close");
									}
								},
								close : function() {
									$("#ruru-reset-dialog").parents(
											".ui-dialog:first").remove();
								}
							});
		},
		install : function() {
			var _self = this;

			var installedScript;

			_self.data.status = $("#ruru-ext-status");
			if (installedScript = _self.data.status.length !== 0) {
				_self.data.status.attr("reverselog", _self.data.reverseLog);
			} else {
				_self.data.status = $(
						"<span id='ruru-ext-status' reverselog='"
								+ _self.data.reverseLog
								+ "' useindex='false' day='1rdDAY' time='開始前'></span>")
						.appendTo("body");
			}

			var dispatcher = $("#ruru-ext-event-dispatcher");
			if (dispatcher.length === 0) {
				dispatcher = $(
						"<button id='ruru-ext-event-dispatcher' style='display:none;'></button>")
						.appendTo("body");
			}

			var idle = function() {
				try {
					_self.onUpdateChat();
				} catch (e) {
					console.log("エラーが発生しました。", e);
					throw e;
				}
			};

			var setup = function() {
				try {
					if (_self.setup()) {
						_self.onUpdateChat();

						dispatcher.off("click");
						dispatcher.on("click", idle);
					}
				} catch (e) {
					console.log("エラーが発生しました。", e);
					throw e;
				}
			};

			var setupComponent = function() {
				try {
					_self.setupComponents();

					dispatcher.off("click");

					if (_self.setup()) {
						_self.onUpdateChat();

						dispatcher.on("click", idle);
					} else {
						dispatcher.on("click", setup);
					}
				} catch (e) {
					console.log("エラーが発生しました。", e);
					throw e;
				}
			};

			if (installedScript) {
				setupComponent();
			} else {
				dispatcher.on("click", setupComponent);

				$.get(chrome.extension.getURL("ruru_ext_install.js"), function(
						data) {

					var head = document.getElementsByTagName("head").item(0);

					var scr = document.createElement("script");
					scr.setAttribute("type", "text/javascript");
					scr.innerText = data;

					head.appendChild(scr);
				});
			}
		},
		setupComponents : function() {
			var _self = this;

			var dialogBox = $("<div id='ruru-ext-dialog-box'/>").css({
				"position" : "absolute",
				"left" : "0px",
				"top" : "0px",
				"width" : "0px",
				"height" : "0px",
				"border" : "none",
				"margin" : "0px",
				"padding" : "0px"
			}).appendTo("body");

			// z-indexの計算対象にならないように ラップ
			$("#overDiv").wrap("<div></div>").css("z-index", "9999");

			$("head").append(
					"<style id='ruru-ext-styles' type='text/css'></style>");
			$("head")
					.append(
							"<style id='ruru-ext-dialog-styles' type='text/css'></style>");
			for (var i = 0; i < document.styleSheets.length; i++) {
				var styleTag = document.styleSheets.item(i).ownerNode;
				var styleid = $(styleTag).attr("id");
				if (styleid === "ruru-ext-styles") {
					_self.data.styleSheet = document.styleSheets.item(i);
				} else if (styleid === "ruru-ext-dialog-styles") {
					_self.data.dialogStyleSheet = document.styleSheets.item(i);
				}
			}

			_self.data.logDialog = $(
					"<div style='font-size:11px;overflow:hidden;'><div id='ruru-log-table' style='overflow:hidden;'></div><div id='ruru-log-users'></div></div>")
					.appendTo(dialogBox)
					.dialog(
							{
								appendTo : "#ruru-ext-dialog-box",
								title : "ログ",
								autoOpen : false,
								minWidth : 450,
								width : _self.data.dialogRects.logDialog.width,
								height : _self.data.dialogRects.logDialog.height,
								position : _self.data.dialogRects.logDialog.position,
								open : function() {
									var buttonPanel = $("#ruru-log-users");

									for ( var name in _self.data.names) {
										var targetUserid = _self.data.names[name];

										var count = $("#ruru-log-table .ui-accordion-content-active ."
												+ targetUserid).length / 2;
										$(".count-" + targetUserid, buttonPanel)
												.text("[" + count + "]")
												.css(
														"color",
														count === 0 ? "whitesmoke"
																: (count === 1 ? "red"
																		: "black"));
									}

									_self.refreshLog();

									var accordion = $("#ruru-log-table");

									if (_self.data.temporary.selectedLog !== -1
											&& accordion.accordion("option",
													"active") !== _self.data.temporary.selectedLog) {
										$("#ruru-log-table")
												.accordion(
														"option",
														"active",
														_self.data.temporary.selectedLog);

										// フォーカスが残る 追跡めんどくさい
										accordion.find(".ui-state-focus")
												.removeClass("ui-state-focus");
									}
								},
								resize : function() {
									_self.refreshLog();
								},
								resizeStop : function() {
									_self.saveDialogPosition(this,
											_self.data.dialogRects.logDialog);
								},
								dragStop : function() {
									_self.saveDialogPosition(this,
											_self.data.dialogRects.logDialog);
								}
							});

			$("#ruru-log-table")
					.accordion(
							{
								animate : 100,
								heightStyle : "fill",
								activate : function() {
									var buttonPanel = $("#ruru-log-users");

									for ( var name in _self.data.names) {
										var targetUserid = _self.data.names[name];

										var count = $("#ruru-log-table .ui-accordion-content-active ."
												+ targetUserid).length / 2;
										$(".count-" + targetUserid, buttonPanel)
												.text("[" + count + "]")
												.css(
														"color",
														count === 0 ? "whitesmoke"
																: (count === 1 ? "red"
																		: "black"));
									}
								}
							});

			_self.data.positionDialog = $(
					"<div style='font-size:11px;overflow:auto;' id='ruru-ext-position-dialog'></div>")
					.appendTo(dialogBox)
					.dialog(
							{
								appendTo : "#ruru-ext-dialog-box",
								autoOpen : false,
								title : "内訳",
								width : _self.data.dialogRects.positionDialog.width,
								height : _self.data.dialogRects.positionDialog.height,
								position : _self.data.dialogRects.positionDialog.position,
								resizeStop : function() {
									_self
											.saveDialogPosition(
													this,
													_self.data.dialogRects.positionDialog);
								},
								dragStop : function() {
									_self
											.saveDialogPosition(
													this,
													_self.data.dialogRects.positionDialog);
								}
							});

			_self.data.colorDialog = $(
					"<div style='font-size:11px;'><table class='ui-corner-all' style='width:100%;background:white;'><tbody id='ruru-color-table'></tbody></table></div>")
					.appendTo(dialogBox)
					.dialog(
							{
								appendTo : "#ruru-ext-dialog-box",
								autoOpen : false,
								minHeight : 490,
								minWidth : 450,
								height : "auto",
								title : "カラー設定",
								open : function() {
									$(".colorPicker-palette").remove();

									var table = $("#ruru-color-table");

									table.children().remove();

									table
											.append("<tr><td style='padding:1em;border-bottom:solid 1px gray;font-weight:bold;'>役職</td><td style='padding:1em;border-bottom:solid 1px gray;width:130px;'></td><td style='padding:1em;border-bottom:solid 1px gray;width:40px;'></td></tr>");

									for ( var pos in _self.data.defaultPositions) {

										var fg = _self.data.defaultPositions[pos][1];
										var bg = _self.data.defaultPositions[pos][2];

										var row = $("<tr></tr>")
												.appendTo(table);
										$(
												"<td colspan='2' id='position-sample-"
														+ pos
														+ "' class='position-color' pos='"
														+ pos
														+ "' style='padding:0.8em;color:"
														+ fg
														+ ";background-color:"
														+ bg + ";'></td>")
												.text("役職が【" + pos + "】のチャット表示")
												.appendTo(row);

										var colors = $(
												"<td style='text-align:center;'></td>")
												.appendTo(row);

										$(
												'<input type="text" pos="'
														+ pos + '"/>')
												.appendTo(colors)
												.on(
														"changeColor",
														function(event, value) {
															$(
																	"#position-sample-"
																			+ $(
																					event.target)
																					.attr(
																							"pos"))
																	.css(
																			"color",
																			"#"
																					+ value);
														})
												.on(
														"previewColor",
														function(event, value) {
															$(
																	"#position-sample-"
																			+ $(
																					event.target)
																					.attr(
																							"pos"))
																	.css(
																			"color",
																			"#"
																					+ value);
														}).colorPicker({
													pickerDefault : fg,
													colors : defaultColors
												});

										$(
												'<input type="text" pos="'
														+ pos + '"/>')
												.appendTo(colors)
												.on(
														"changeColor",
														function(event, value) {
															$(
																	"#position-sample-"
																			+ $(
																					event.target)
																					.attr(
																							"pos"))
																	.css(
																			"background-color",
																			"#"
																					+ value);
														})
												.on(
														"previewColor",
														function(event, value) {
															$(
																	"#position-sample-"
																			+ $(
																					event.target)
																					.attr(
																							"pos"))
																	.css(
																			"background-color",
																			"#"
																					+ value);
														}).colorPicker({
													pickerDefault : bg,
													colors : defaultColors
												});
									}

									{
										table
												.append("<tr><td style='padding:1em;border-bottom:solid 1px gray;font-weight:bold;'>グレー表示</td><td style='padding:1em;border-bottom:solid 1px gray;'></td><td style='padding:1em;border-bottom:solid 1px gray;'></td></tr>");

										var bg = _self.data.graycolor;

										var row = $("<tr></tr>")
												.appendTo(table);
										$(
												"<td colspan='2' id='color-gray-sample' style='padding:0.8em;background-color:"
														+ bg + ";'></td>")
												.text("グレーな村人のチャット表示")
												.appendTo(row);

										var colors = $(
												"<td style='text-align:center;'></td>")
												.appendTo(row);

										$('<input type="text"/>')
												.appendTo(colors)
												.on(
														"changeColor",
														function(event, value) {
															$(
																	"#color-gray-sample")
																	.css(
																			"background-color",
																			"#"
																					+ value);
														})
												.on(
														"previewColor",
														function(event, value) {
															$(
																	"#color-gray-sample")
																	.css(
																			"background-color",
																			"#"
																					+ value);
														}).colorPicker({
													pickerDefault : bg,
													colors : defaultColors
												});
									}

									table
											.append("<tr><td style='padding:1em;border-bottom:solid 1px gray;font-weight:bold;'>判定</td><td style='padding:1em;border-bottom:solid 1px gray;'></td><td style='padding:1em;border-bottom:solid 1px gray;'></td></tr>");

									var updateJudgeSample = function() {
										for ( var judge in _self.data.uraStatus) {
											var style = "";
											if ($("#judge-sample-bold-" + judge)
													.is(":checked")) {
												style = "font-weight:bold;";
											}
											if ($(
													"#judge-sample-italic-"
															+ judge).is(
													":checked")) {
												style += "font-style:italic;";
											}
											if ($("#judge-sample-line-" + judge)
													.is(":checked")
													&& $(
															"#judge-sample-underline-"
																	+ judge)
															.is(":checked")) {
												style += "text-decoration:line-through underline;";
											} else if ($(
													"#judge-sample-line-"
															+ judge).is(
													":checked")) {
												style += "text-decoration:line-through;";
											} else if ($(
													"#judge-sample-underline-"
															+ judge).is(
													":checked")) {
												style += "text-decoration:underline;";
											}
											if ($(
													"#judge-sample-shadow-"
															+ judge).is(
													":checked")) {
												style += "text-shadow:1px 1px 2px #999;";
											}

											$("#judgment-sample-" + judge)
													.attr(
															"style",
															"padding-left:0.8em;"
																	+ style);
										}
									};

									for ( var judge in _self.data.uraStatus) {
										var row = $("<tr></tr>")
												.appendTo(table);
										$(
												"<td id='judgment-sample-"
														+ judge
														+ "' class='judgment-style' judge='"
														+ judge
														+ "' style='padding:0.8em;'></td>")
												.text(
														"判定が【" + judge
																+ "】のチャット表示")
												.appendTo(row);

										var styles = $(
												"<td  colspan='2' style=''></td>")
												.appendTo(row);

										$(
												"<input id='judge-sample-bold-"
														+ judge
														+ "' type='checkbox'><label for='judge-sample-bold-"
														+ judge
														+ "'>太字</label></input>")
												.appendTo(styles)
												.attr(
														"checked",
														_self.data.uraStatus[judge]["bold"])
												.on("click", updateJudgeSample);
										$(
												"<input id='judge-sample-italic-"
														+ judge
														+ "' type='checkbox'><label for='judge-sample-italic-"
														+ judge
														+ "'>斜体</label></input>")
												.appendTo(styles)
												.attr(
														"checked",
														_self.data.uraStatus[judge]["italic"])
												.on("click", updateJudgeSample);
										$(
												"<input id='judge-sample-line-"
														+ judge
														+ "' type='checkbox'><label for='judge-sample-line-"
														+ judge
														+ "'>取消</label></input>")
												.appendTo(styles)
												.attr(
														"checked",
														_self.data.uraStatus[judge]["line"])
												.on("click", updateJudgeSample);
										$(
												"<input id='judge-sample-underline-"
														+ judge
														+ "' type='checkbox'><label for='judge-sample-underline-"
														+ judge
														+ "'>下線</label></input>")
												.appendTo(styles)
												.attr(
														"checked",
														_self.data.uraStatus[judge]["underline"])
												.on("click", updateJudgeSample);
										$(
												"<input id='judge-sample-shadow-"
														+ judge
														+ "' type='checkbox'><label for='judge-sample-shadow-"
														+ judge
														+ "'>影</label></input>")
												.appendTo(styles)
												.attr(
														"checked",
														_self.data.uraStatus[judge]["shadow"])
												.on("click", updateJudgeSample);
									}

									updateJudgeSample();

									var button = $(_self.data.colorDialog)
											.parents(".ui-dialog:first").find(
													"button:last");
									button.focus();
								},
								buttons : {
									"Save" : function() {

										$("#ruru-color-table .position-color")
												.each(
														function(i, sample) {
															var pos = $(sample)
																	.attr("pos");

															var fg = cnvrgb($(
																	sample)
																	.css(
																			"color"));
															var bg = cnvrgb($(
																	sample)
																	.css(
																			"background-color"));

															if (fg) {
																_self.data.defaultPositions[pos][1] = fg;
															}
															if (bg) {
																_self.data.defaultPositions[pos][2] = bg;
															}

															console.log(pos
																	+ " : "
																	+ fg + ", "
																	+ bg);
														});

										_self.data.graycolor = cnvrgb($(
												"#color-gray-sample").css(
												"background-color"));

										$("#ruru-color-table .judgment-style")
												.each(
														function(i, sample) {
															var judge = $(
																	sample)
																	.attr(
																			"judge");
															_self.data.uraStatus[judge];

															var bold = $(sample)
																	.css(
																			"font-weight") === "bold";
															var italic = $(
																	sample)
																	.css(
																			"font-style") === "italic";
															var line = $(sample)
																	.css(
																			"text-decoration")
																	.indexOf(
																			"line-through") !== -1;
															var underline = $(
																	sample)
																	.css(
																			"text-decoration")
																	.indexOf(
																			"underline") !== -1;
															var shadow = $(
																	sample)
																	.css(
																			"text-shadow") !== "none";

															_self.data.uraStatus[judge]["bold"] = bold;
															_self.data.uraStatus[judge]["italic"] = italic;
															_self.data.uraStatus[judge]["line"] = line;
															_self.data.uraStatus[judge]["underline"] = underline;
															_self.data.uraStatus[judge]["shadow"] = shadow;

															console
																	.log(judge
																			+ " : bold["
																			+ bold
																			+ "], italic["
																			+ italic
																			+ "], line["
																			+ line
																			+ "], underline["
																			+ underline
																			+ "], shadow["
																			+ shadow
																			+ "], ");
														});

										localStorage.defaultPositions = $
												.stringify(_self.data.defaultPositions);
										localStorage.graycolor = _self.data.graycolor;

										_self.updateCss();

										_self.data.colorDialog.dialog("close");
									},
									"CANCEL" : function() {
										_self.data.colorDialog.dialog("close");
									}
								}
							});

			_self.data.diaryDialog = $(
					"<div style='font-size:11px;overflow:hidden;' id='ruru-ext-rest-dialog'><textarea id='ruru-extension-diary' style='width:100%;height:100%;padding:0px;margin:0px;'></textarea></div>")
					.appendTo(dialogBox)
					.dialog(
							{
								appendTo : "#ruru-ext-dialog-box",
								autoOpen : false,
								title : "日記帳",
								width : _self.data.dialogRects.diaryDialog.width,
								height : _self.data.dialogRects.diaryDialog.height,
								position : _self.data.dialogRects.diaryDialog.position,
								buttons : {
									"Save" : function() {
										var diary = $("#ruru-extension-diary")
												.val();
										localStorage.diaryTemplate = diary;
										console.log("日記帳を保存しました");
									},
									"Load" : function() {
										if (localStorage.diaryTemplate) {
											$("#ruru-extension-diary").val(
													localStorage.diaryTemplate);
											console.log("保存済みの日記帳を読み込みました");
										}
									}
								},
								resizeStop : function() {
									_self.saveDialogPosition(this,
											_self.data.dialogRects.diaryDialog);
								},
								dragStop : function() {
									_self.saveDialogPosition(this,
											_self.data.dialogRects.diaryDialog);
								}
							});

			$("#ruru-extension-diary").on("blur", function() {
				localStorage.diaryBackup = $("#ruru-extension-diary").val();
			});

			if (localStorage.diaryBackup) {
				$("#ruru-extension-diary").val(localStorage.diaryBackup);
				console.log("日記帳のバックアップがありました");
			}

			_self.data.grayTableDialog = $(
					"<div style='font-size:11px;overflow:auto;' id='ruru-ext-gray-table-dialog'><span id='ruru-ext-gray-table-rest' style='margin-right:20px;vertical-align:middle;font-weight:bold;font-size:13px;'></span><input type='checkbox' style='vertical-align:middle;' id='ruru-ext-gray-table-show'/><label style='vertical-align:middle;' for='ruru-ext-gray-table-show'>逝った村は非表示</label><table class='ui-widget-content ui-corner-all'><thead id='ruru-ext-gray-head'></thead><tbody id='ruru-ext-gray-body'></tbody></table></div>")
					.appendTo(dialogBox)
					.dialog(
							{
								appendTo : "#ruru-ext-dialog-box",
								autoOpen : false,
								width : _self.data.dialogRects.grayTableDialog.width,
								height : _self.data.dialogRects.grayTableDialog.height,
								position : _self.data.dialogRects.grayTableDialog.position,
								title : "役職テーブル",
								resizeStop : function() {
									_self
											.saveDialogPosition(
													this,
													_self.data.dialogRects.grayTableDialog);
								},
								dragStop : function() {
									_self
											.saveDialogPosition(
													this,
													_self.data.dialogRects.grayTableDialog);
								}
							});

			$("#ruru-ext-gray-table-show").attr("checked", true).on("click",
					function() {
						_self.updateGrayTable();
					});

			_self.data.voteDialog = $(
					"<div style='font-size:11px;overflow:auto;' id='ruru-ext-vote-dialog'><table class='ui-widget-content ui-corner-all'><thead id='ruru-ext-vote-head'></thead><tbody id='ruru-ext-vote-body'></tbody></table></div>")
					.appendTo(dialogBox)
					.dialog(
							{
								appendTo : "#ruru-ext-dialog-box",
								autoOpen : false,
								width : _self.data.dialogRects.voteDialog.width,
								height : _self.data.dialogRects.voteDialog.height,
								position : _self.data.dialogRects.voteDialog.position,
								title : "投票結果",
								resizeStop : function() {
									_self.saveDialogPosition(this,
											_self.data.dialogRects.voteDialog);
								},
								dragStop : function() {
									_self.saveDialogPosition(this,
											_self.data.dialogRects.voteDialog);
								}
							});

			_self.data.menu = $("<ul id='ruru-ext-menu' style='display:none; position:absolute;z-index:6000;font-size:11px;white-space:nowrap;min-width:130px'></ul>");
			_self.data.menu
					.appendTo("body")
					.wrap(
							"<div style='position:absolute;width:0px;height:0px;top:0px;left:0px;margin:0px;padding:0px;border:none;'></div>");
			_self.data.menu.menu();

			var hidemenu = function(event, target) {
				if (!event || event.result) {
					$(document).off("mousedown", checkExternalClick);
					_self.data.menu.hide();
				}
			};

			var checkExternalClick = function(event) {
				var et = $(event.target);
				if (!et.hasClass("ui-menu")
						&& et.parents(".ui-menu").length == 0) {
					hidemenu();
				}
			};

			$(document)
					.on(
							"contextmenu",
							"#No01 td, #No09 td, #ruru-ext-gray-table-dialog td, #ruru-log-table td, #ruru-ext-vote-dialog td",
							function(event) {
								var menuTarget = event.target;
								var parents = $(menuTarget).parents("td:first");
								if (parents.length) {
									menuTarget = parents.get(0);
								}

								$("li>ul,li>ol", _self.data.menu).hide();

								_self.data.menu.menu("destroy");
								_self.data.menu.empty();
								$(menuTarget).trigger("preparemenu");
								_self.data.menu.menu();
								_self.data.menu.show();

								var wh = $(window).height();
								var mh = _self.data.menu.height();
								var limitTop = wh - mh - 10;

								_self.data.menu.css("top",
										limitTop < event.pageY ? limitTop
												: event.pageY);
								_self.data.menu.css("left", event.pageX);

								$(".ui-menu-item", _self.data.menu)
										.off("click");
								$(".ui-menu-item", _self.data.menu)
										.on(
												"click",
												function() {
													var eventui = $(this);
													if (!eventui
															.hasClass("ui-state-disabled")) {
														eventui.trigger(
																"execmenu",
																menuTarget);
													}

													return false;
												});

								$(document).mousedown(checkExternalClick);

								return false;
							}).on("preparemenu", function(event) {

						var userid = $(event.target).attr("userid");

						try {
							_self.createMenu(event.target, userid);
						} catch (e) {
							console.log("エラーが発生しました。", e);
							throw e;
						}

					}).on("execmenu", function(event, target) {
						hidemenu();

						var action = $(event.target).attr("id");
						var userid = $(target).attr("userid");

						try {
							_self.execAction(userid, action, event.target);
						} catch (e) {
							console.log("エラーが発生しました。", e);
							throw e;
						}
					});

			$(document).on("keypress", function(event) {
				if (event.ctrlKey) {
					if (event.which == 10) {
						$("#todob").click();
						return false;
					} else if (event.which == 28) {
						if (_self.data.logDialog.dialog("isOpen")) {
							_self.data.logDialog.dialog("close");
						} else if (_self.data.logTags.length) {
							_self.data.logDialog.dialog("open");
						}

						$("#messageInput").focus();

						return false;
					} else if (event.which == 32) {
						if (_self.data.diaryDialog.dialog("isOpen")) {
							_self.data.diaryDialog.dialog("close");
							$("#messageInput").focus();
						} else {
							_self.data.diaryDialog.dialog("open");
							$("#ruru-extension-diary").focus();
						}

						return false;
					} else {
						console.log("which" + event.which);
					}
				}
			});

			console.log("コンポーネントロード");

			$(".ui-dialog .ui-dialog-buttonpane").css("font-size", "11px");
		},
		saveDialogPosition : function(dialog, rect) {
			var _self = this;

			var parent = $(dialog).parent(".ui-dialog:first");
			rect.width = parseInt(parent.css("width"));
			rect.height = parseInt(parent.css("height")) + 7;// +ceil(padding&border-width)
			rect.position = {
				"my" : "left top",
				"at" : "left+" + parseInt(parent.css("left")) + " top+"
						+ parseInt(parent.css("top"))
			};

			localStorage.dialogRects = $.stringify(_self.data.dialogRects);
		},
		setup : function() {
			var _self = this;

			if (_self.data.status.attr("time") === "開始前") {
				return false;
			}

			var posText = $("#No00").text();
			var from = posText.indexOf("」村\xa0\xa0定員：");
			from = posText.indexOf("配役", from);
			var to = posText.indexOf("昼", from);
			posText = posText.slice(from, to);

			console.log(posText);

			for ( var pos in _self.data.positions) {
				if (posText.indexOf(_self.data.positions[pos][4]) === -1) {
					delete _self.data.positions[pos];
				}
			}

			$("#No01 td.name").each(function(i, td) {
				var name = $(">span:first", td).text();
				if (name) {
					var userid = $(td).attr("userid");
					_self.data.users[userid] = {
						userid : userid,
						name : name,
						dead : false,
						hang : false,
						vote : []
					};
					_self.data.names[name] = userid;
				}
			});

			var buttonPanel = $("#ruru-log-users");

			for ( var name in _self.data.names) {
				var userid = _self.data.names[name];
				var checkbox = $(
						"<input class='dialog-user-checkbox' type='checkbox' id='dialog-checkbox-"
								+ userid + "' value='" + userid
								+ "' style='vertical-align:sub;'/>").attr(
						"checked", true).attr("userid", userid);
				var count = $(
						"<span class='dialog-user-count count-"
								+ userid
								+ "' style='display:inline-block;min-width:30px;cursor:pointer;font-weight:bold;color:whitesmoke;'>[0]</span>")
						.attr("userid", userid);
				buttonPanel
						.append($(
								"<div style='display:inline-block;white-space:nowrap;'></div>")
								.append(checkbox)
								.append(
										"<label for='dialog-checkbox-"
												+ userid
												+ "' class='"
												+ userid
												+ "' style='display:inline-block;min-width:80px;'>"
												+ name + "</label>").append(
										count));
			}

			var updateDialogCss = function() {
				for (var i = _self.data.dialogStyleSheet.cssRules.length - 1; i >= 0; i--) {
					_self.data.dialogStyleSheet.deleteRule(i);
				}

				$("input.dialog-user-checkbox", buttonPanel).each(
						function(i, checkbox) {
							var checked = $(checkbox).is(":checked");
							if (!checked) {
								var userid = $(checkbox).attr("userid");
								_self.data.dialogStyleSheet.insertRule(
										"#ruru-log-table ." + userid
												+ " {display:none;}", 0);
							}
						});
			};

			$("input.dialog-user-checkbox", buttonPanel).on("click",
					updateDialogCss);

			$("span.dialog-user-count", buttonPanel).on(
					"click",
					function() {
						var userid = $(this).attr("userid");

						$("input.dialog-user-checkbox", buttonPanel)
								.removeAttr("checked", false);

						// $( "#dialog-checkbox-" + userid, buttonPanel ).attr(
						// "checked",
						// true );
						$("#dialog-checkbox-" + userid)[0].checked = true;

						updateDialogCss();
					});

			$("<button>ALL</button>").button().css("margin", "0px").appendTo(
					buttonPanel).on(
					"click",
					function() {
						$("input.dialog-user-checkbox", buttonPanel).each(
								function(i, checkbox) {
									// $( checkbox ).attr( "checked", true );
									checkbox.checked = true;
								});

						updateDialogCss();
					});

			_self.updateCss();

			console.log("ユーザー把握");
			console.log($.stringify(_self.data.names));

			return true;
		},
		onUpdateChat : function() {
			var _self = this;

			_self.data.day = _self.data.status.attr("day");
			var time = _self.data.status.attr("time");

			if (_self.data.time !== time) {
				var tmp = _self.data.day.match(/^([0-9]+)[^0-9]*$/);
				_self.data.dayIndex = parseInt(tmp[1] - 1);
				_self.data.days[_self.data.dayIndex] = _self.data.day;

				console.log(time + " になりました");

				var all = $("#No01 td.name>span").length;
				var dead = $("#No01 td.name>span.dead").length;
				var rest = all - dead;

				var reststep = "" + rest;
				rest -= 2;
				var count = 0;
				while (rest > 0) {
					reststep += " > ";
					reststep += rest;
					rest -= 2;
					count++;
				}

				if ($("#No02>.oc98").text() === "観戦者") {
					$("#ruru-ext-auto-button").show();
				}

				_self.data.positionDialog.dialog("option", "title", "内訳　【 "
						+ reststep + " == " + count + " 】");

				$("#ruru-ext-gray-table-rest").text("吊り数【 " + count + " 】");

				var updateHistory = false;

				if (time === "夕刻") {
					var table = $("#No09>table").clone().css("width", "100%")
							.get();
					$("td.cn", table).removeAttr("onclick");
					_self.data.logTags.push(_self.data.day);
					$("#ruru-log-table")
							.append("<h3>" + _self.data.day + "</h3>")
							.append(
									$(
											"<div style='background:white;padding:0px 2px 20px 2px;overflow-y:scroll;'></div>")
											.append(table));
					_self.refreshLog();

					console.log("ログを保存しました 【" + _self.data.day + "】");
				} else if (time === "昼") {
					var dead = [];
					$("#No09 td.cs>span.death>span.name").each(
							function(i, name) {
								var uuuu = _self.data.names[$(name).text()];
								dead.push(uuuu);
								_self.data.users[uuuu]["dead"] = true;
								updateHistory = true;
							});
					_self.data.dead[_self.data.days[_self.data.dayIndex - 1]] = dead;
				} else if (time === "夜") {
					var hang = [];
					$("#No09 td.cs>span.death>span.name").each(
							function(i, name) {
								var uuuu = _self.data.names[$(name).text()];
								_self.data.users[uuuu]["hang"] = true;
								hang.push(uuuu);
								updateHistory = true;
							});
					_self.data.hang[_self.data.day] = hang;

					var tables;
					if (_self.data.reverseLog) {
						tables = $("#No09 td.cv tbody").get();
					} else {
						tables = $("#No09 td.cv tbody").get().reverse();
					}

					if (tables.length) {
						for (var i = 0; i < tables.length; i++) {
							var voteCount = {
								day : _self.data.day,
								orderCount : tables.length,
								order : i,
								count : {},
							};
							$("tr", tables[i]).each(
									function(i, row) {
										var names = $("span.name", row).get();
										var fromuserid = _self.data.names[$(
												names[0]).text()];
										var touserid = _self.data.names[$(
												names[1]).text()];

										_self.data.users[fromuserid]["vote"]
												.push(touserid);

										if (voteCount.count[touserid]) {
											voteCount.count[touserid]++;
										} else {
											voteCount.count[touserid] = 1;
										}
									});
							_self.data.voteCounts.push(voteCount);
						}

						_self.data.voteIndex = -1;
						_self.data.vorteOrder = true;
						_self.refreshVote();

						console.log("投票結果を保存しました 【" + _self.data.day + "】");
					}
				} else if (time === "夜明け") {
				} else if (time === "ゲーム終了") {
				}

				if (updateHistory && _self.data.showhistory) {
					_self.updateCss();
				}

				_self.updateGrayTable();
			}

			_self.data.time = time;
		},
		refreshLog : function() {
			$("#ruru-log-table").accordion("refresh");
		},
		refreshVote : function() {
			var _self = this;

			if (_self.data.voteCounts.length == 0) {
				return;
			}

			var selectedIndex = _self.data.voteIndex === -1 ? _self.data.voteCounts.length - 1
					: _self.data.voteIndex;

			var votehead = $("#ruru-ext-vote-head").empty();
			var votebody = $("#ruru-ext-vote-body").empty();

			var headtr1 = $("<tr></tr>").appendTo(votehead);
			var headtr2 = $("<tr></tr>").appendTo(votehead);
			if (_self.data.voteIndex === -1) {
				headtr1
						.append("<td class='vote-head-order-reset' rowspan='2' voteorder='-1' style='background-color:lightblue;'></td>");
			} else {
				headtr1
						.append("<td class='vote-head-order-reset' rowspan='2' voteorder='-1'></td>");
			}
			for (var i = 0; i < _self.data.voteCounts.length; i++) {
				var count = _self.data.voteCounts[i];
				if (count.order === 0) {
					headtr1.append("<td class='vote-head-day' colspan='"
							+ count.orderCount + "'>" + count.day + "</td>");
				}

				if (_self.data.voteIndex === i) {
					headtr2.append("<td class='vote-head-order' voteorder='"
							+ i + "' style='background-color:lightblue;'>"
							+ (count.order + 1) + " 回目</td>");
				} else {
					headtr2.append("<td class='vote-head-order' voteorder='"
							+ i + "'>" + (count.order + 1) + " 回目</td>");
				}
			}

			$(
					"#ruru-ext-vote-head td.vote-head-order,#ruru-ext-vote-head td.vote-head-order-reset")
					.on("click", function() {
						var index = parseInt($(this).attr("voteorder"));
						if (_self.data.voteIndex !== index) {
							_self.data.vorteOrder = true;
						} else {
							_self.data.vorteOrder = !_self.data.vorteOrder;
						}
						_self.data.voteIndex = index;
						_self.refreshVote();
					});

			var votes = [];

			var selectedCounts = _self.data.voteCounts[selectedIndex]["count"];

			for ( var userid in _self.data.users) {
				var userData = _self.data.users[userid];
				var vote = userData["vote"];
				var count = selectedCounts[userid] === undefined ? -1
						: selectedCounts[userid];
				var point = parseInt(userid.slice(5)) * -1;

				if (_self.data.voteIndex === -1) {
					point += count * 100000;

					if (vote[selectedIndex]) {
						point += selectedCounts[vote[selectedIndex]] * 10000;
						point += vote[selectedIndex].slice(5) * 100;
					}
				} else {
					if (_self.data.vorteOrder) {
						if (vote[selectedIndex]) {
							point += selectedCounts[vote[selectedIndex]] * 100000;
							point += vote[selectedIndex].slice(5) * 10000;
						}
						if (selectedCounts[userid]) {
							point += selectedCounts[userid] * 100;
						}
					} else {
						point += count * 100000;

						if (vote[selectedIndex]) {
							point += selectedCounts[vote[selectedIndex]] * 10000;
							point += vote[selectedIndex].slice(5) * 100;
						}
					}
				}

				votes.push({
					userid : userid,
					name : userData["name"],
					count : count,
					vote : vote,
					point : point
				});
			}

			votes.sort(function(left, right) {
				return right.point - left.point;
			});

			for (var ii = 0; ii < votes.length; ii++) {
				var userData = votes[ii];
				var userid = userData["userid"];

				var row = $("<tr></tr>").appendTo(votebody);
				row
						.append("<td class='"
								+ userid
								+ " vote-body-user' userid='"
								+ userid
								+ "'>"
								+ userData["name"]
								+ (userData["count"] > 0 ? "<span style='font-weight:bold;float:right;'> ["
										+ userData["count"] + "]"
										: "</span>") + "</td>");
				var vote = userData["vote"];
				for (var i = 0; i < vote.length; i++) {
					var voteuserid = vote[i];
					var cel = $("<td class='" + voteuserid
							+ " vote-body-vote' userid='" + voteuserid
							+ "'></td>");

					var mu = _self.data.users[voteuserid]["vote"][i] === userid;

					if (_self.data.voteCounts[i]["order"] !== 0) {
						if (vote[i - 1] !== voteuserid) {
							if (mu) {
								cel
										.append("<span class='ui-icon ui-icon-transferthick-e-w'></span>");
							} else {
								cel
										.append("<span class='ui-icon ui-icon-arrowreturnthick-1-e'></span>");
							}
						} else if (mu) {
							cel
									.append("<span class='ui-icon ui-icon-transfer-e-w'></span>");
						}
					} else if (mu) {
						cel
								.append("<span class='ui-icon ui-icon-transfer-e-w'></span>");
					}

					cel.append(_self.data.users[voteuserid]["name"]).appendTo(
							row);
				}

				if (vote.length < _self.data.voteCounts.length) {
					row
							.append("<td class='vote-body-vote vote-body-vote-none' colspan='"
									+ (_self.data.voteCounts.length - vote.length)
									+ "'></td>");
				}
			}
		},
		createMenu : function(ui, userid) {
			var _self = this;

			var selection = window.getSelection();
			if (!selection.isCollapsed) {
				_self.data.menu
						.append("<li id='menu-copy'><span class='ui-icon ui-icon-copy'></span>コピー</li>");
				_self.data.menu.append("<hr/>");
			}

			if (userid && _self.data.users[userid]) {
				var userData = _self.data.users[userid];

				var userPosition = userData["役職"];

				if (userPosition) {
					var post;
					if (userData["役職解除"]) {
						post = $("<li id='menu-toggle-post'><span class='ui-icon ui-icon-closethick'></span>"
								+ userPosition + "</li>");
					} else {
						post = $("<li id='menu-toggle-post'><span class='ui-icon ui-icon-check'></span>"
								+ userPosition + "</li>");
					}

					_self.data.menu.append(post);
					_self.data.menu.append("<hr/>");

					var postsub = $("<ul></ul>").appendTo(post);

					postsub
							.append("<li id='menu-remove-position'><span class='ui-icon ui-icon-close'></span>削除</li>");

					for ( var pos in _self.data.positions) {
						if (userPosition === pos) {
							continue;
						}

						postsub.append("<li id='menu-position' pos='" + pos
								+ "'><span class='ui-icon ui-icon-"
								+ _self.data.positions[pos][0] + "'></span>"
								+ pos + "</li>");
					}

					if (_self.data.positions[userPosition][3] === "判定") {
						var white = $("<ul></ul>")
								.appendTo(
										$(
												"<li><span class='ui-icon ui-icon-radio-off'>○</span>村　人</li>")
												.appendTo(_self.data.menu));
						var black = $("<ul></ul>")
								.appendTo(
										$(
												"<li><span class='ui-icon ui-icon-bullet'>●</span>人　狼</li>")
												.appendTo(_self.data.menu));

						for ( var name in _self.data.names) {
							var targetUserid = _self.data.names[name];

							if (!userData["結果"][targetUserid]
									&& targetUserid !== userid) {
								$(
										"<li id='menu-judgment-white'><span class='ui-icon ui-icon-"
												+ _self.data.positions[userPosition][0]
												+ "'></span>" + name + "</li>")
										.attr("userid", targetUserid).appendTo(
												white);
								$(
										"<li id='menu-judgment-black'><span class='ui-icon ui-icon-"
												+ _self.data.positions[userPosition][0]
												+ "'></span>" + name + "</li>")
										.attr("userid", targetUserid).appendTo(
												black);
							}
						}

						_self.data.menu.append("<hr/>");
					} else if (_self.data.positions[userPosition][3] === "対象") {
						var target = $("<ul></ul>")
								.appendTo(
										$(
												"<li><span class='ui-icon ui-icon-flag'></span>対象</li>")
												.appendTo(_self.data.menu));

						for ( var name in _self.data.names) {
							var targetUserid = _self.data.names[name];

							if (targetUserid !== userid) {
								$(
										"<li id='menu-target'><span class='ui-icon ui-icon-"
												+ _self.data.positions[userPosition][0]
												+ "'></span>" + name + "</li>")
										.attr("userid", targetUserid).appendTo(
												target);
							}
						}

						_self.data.menu.append("<hr/>");
					}

				} else {
					for ( var pos in _self.data.positions) {
						_self.data.menu.append("<li id='menu-position' pos='"
								+ pos + "'><span class='ui-icon ui-icon-"
								+ _self.data.positions[pos][0] + "'></span>"
								+ pos + "</li>");
					}
					_self.data.menu.append("<hr/>");
				}
			}

			if ($(ui).hasClass("gray-table-data")) {
				var from = $(ui).attr("fromuserid");
				var to = $(ui).attr("touserid");

				if ($(ui).hasClass("gray-table-data-white")) {
					_self.data.menu
							.append("<li id='menu-gray-table-delete' fromuserid='"
									+ from
									+ "' touserid='"
									+ to
									+ "'><span class='ui-icon ui-icon-close'></span>削除</li>");
					_self.data.menu
							.append("<li id='menu-gray-table-black' fromuserid='"
									+ from
									+ "' touserid='"
									+ to
									+ "'><span class='ui-icon ui-icon-bullet'>●</span>人　狼</li>");
				} else if ($(ui).hasClass("gray-table-data-black")) {
					_self.data.menu
							.append("<li id='menu-gray-table-delete' fromuserid='"
									+ from
									+ "' touserid='"
									+ to
									+ "'><span class='ui-icon ui-icon-close'></span>削除</li>");
					_self.data.menu
							.append("<li id='menu-gray-table-white' fromuserid='"
									+ from
									+ "' touserid='"
									+ to
									+ "'><span class='ui-icon ui-icon-radio-off'>○</span>村　人</li>");
				} else {
					_self.data.menu
							.append("<li id='menu-gray-table-white' fromuserid='"
									+ from
									+ "' touserid='"
									+ to
									+ "'><span class='ui-icon ui-icon-radio-off'>○</span>村　人</li>");
					_self.data.menu
							.append("<li id='menu-gray-table-black' fromuserid='"
									+ from
									+ "' touserid='"
									+ to
									+ "'><span class='ui-icon ui-icon-bullet'>●</span>人　狼</li>");
				}

				_self.data.menu.append("<hr/>");
			}

			if ($("#No01 td." + userid + ".icon.dv").length !== 0) {
				var hangmenu = $(
						"<li id='menu-hang'><span class='ui-icon ui-icon-power'></span>吊り</li>")
						.appendTo(_self.data.menu);
				var deadmenu = $(
						"<li id='menu-dead'><span class='ui-icon ui-icon-scissors'></span>噛み</li>")
						.appendTo(_self.data.menu);
				var hangsub = $("<ul></ul>").appendTo(hangmenu);
				var deadsub = $("<ul></ul>").appendTo(deadmenu);
				for (var i = 0; i <= _self.data.dayIndex; i++) {
					var day = _self.data.days[i];

					if (i !== 0) {
						hangsub
								.append("<li id='menu-input-hang' dayindex='"
										+ i
										+ "'><span class='ui-icon ui-icon-power'></span>"
										+ day + "</li>");
					}
					deadsub
							.append("<li id='menu-input-dead' dayindex='"
									+ i
									+ "'><span class='ui-icon ui-icon-scissors'></span>"
									+ day + "</li>");
				}
				_self.data.menu.append("<hr/>");
			}

			if (_self.data.logTags.length) {
				var logmenu = $(
						"<li id='menu-log'><span class='ui-icon ui-icon-comment'></span>ログ</li>")
						.appendTo(_self.data.menu);
				var logsub = $("<ul></ul>").appendTo(logmenu);

				for (var i = 0; i < _self.data.logTags.length; i++) {
					var day = _self.data.logTags[i];
					logsub
							.append("<li id='menu-log-of-day'><span class='ui-icon ui-icon-comment'></span>"
									+ day + "</li>");
					logmenu.attr("last-day", day);
				}
			}

			if (_self.data.voteCounts.length) {
				_self.data.menu
						.append("<li id='menu-vote'><span class='ui-icon ui-icon-tag'></span>投票結果</li>");
			}

			_self.data.menu
					.append("<li id='menu-person'><span class='ui-icon ui-icon-person'></span>内訳</li>");
			_self.data.menu
					.append("<li id='menu-gray-table'><span class='ui-icon ui-icon-calculator'></span>役職テーブル</li>");
			_self.data.menu
					.append("<li id='menu-diary'><span class='ui-icon ui-icon-pencil'></span>メモ帳</li>");

			var optionalMenu = $("<ul></ul>")
					.appendTo(
							$(
									"<li id='menu-optional'><span class='ui-icon ui-icon-wrench'></span>表示設定</li>")
									.appendTo(_self.data.menu));

			if (_self.data.showposition) {
				optionalMenu
						.append("<li id='menu-showposition'><span class='ui-icon ui-icon-check'></span>役職強調</li>");
			} else {
				optionalMenu
						.append("<li id='menu-showposition'><span class='ui-icon ui-icon-closethick'></span>役職強調切り替え</li>");
			}

			if (_self.data.showuranai) {
				optionalMenu
						.append("<li id='menu-showuranai'><span class='ui-icon ui-icon-check'></span>占い結果強調</li>");
			} else {
				optionalMenu
						.append("<li id='menu-showuranai'><span class='ui-icon ui-icon-closethick'></span>占い結果強調切り替え</li>");
			}

			if (_self.data.showgray) {
				optionalMenu
						.append("<li id='menu-showgray'><span class='ui-icon ui-icon-check'></span>完グレー強調</li>");
			} else {
				optionalMenu
						.append("<li id='menu-showgray'><span class='ui-icon ui-icon-closethick'></span>完グレー強調切り替え</li>");
			}

			if (_self.data.hidecng) {
				optionalMenu
						.append("<li id='menu-hidecng'><span class='ui-icon ui-icon-closethick'></span>GM非表示</li>");
			} else {
				optionalMenu
						.append("<li id='menu-hidecng'><span class='ui-icon ui-icon-check'></span>GM表示</li>");
			}

			if (_self.data.hidecnw) {
				optionalMenu
						.append("<li id='menu-hidecnw'><span class='ui-icon ui-icon-closethick'></span>観戦非表示</li>");
			} else {
				optionalMenu
						.append("<li id='menu-hidecnw'><span class='ui-icon ui-icon-check'></span>観戦表示</li>");
			}

			if (_self.data.reverseLog) {
				optionalMenu
						.append("<li id='menu-reverse-log'><span class='ui-icon ui-icon-check'></span>チャット反転</li>");
			} else {
				optionalMenu
						.append("<li id='menu-reverse-log'><span class='ui-icon ui-icon-closethick'></span>チャット反転切り替え</li>");
			}

			if (_self.data.showhistory) {
				optionalMenu
						.append("<li id='menu-showhistory'><span class='ui-icon ui-icon-check'></span>吊噛表示</li>");
			} else {
				optionalMenu
						.append("<li id='menu-showhistory'><span class='ui-icon ui-icon-closethick'></span>吊噛表示切り替え</li>");
			}

			optionalMenu.append("<hr/>");
			optionalMenu
					.append("<li id='menu-colors'><span class='ui-icon ui-icon-image'></span>カラー詳細</li>");
			optionalMenu
					.append("<li id='menu-reset'><span class='ui-icon ui-icon-alert'></span>設定リセット</li>");
		},
		execAction : function(userid, action, selected) {
			var _self = this;

			if (action === "menu-toggle-post") {
				_self.data.users[userid]["役職解除"] = !_self.data.users[userid]["役職解除"];
			} else if (action === "menu-remove-position") {
				_self.data.users[userid]["役職"] = undefined;
				_self.data.users[userid]["役職解除"] = false;
				_self.data.users[userid]["結果"] = {};
				_self.cleanPositionOrders(userid);
			} else if (action === "menu-position") {
				var pos = $(selected).attr("pos");
				_self.data.users[userid]["役職"] = pos;
				_self.data.users[userid]["役職解除"] = false;
				_self.data.users[userid]["結果"] = {};
				_self.cleanPositionOrders(userid);
				_self.data.positionOrders[pos].push(userid);
			} else if (action === "menu-judgment-white") {
				var targetUserid = $(selected).attr("userid");
				_self.data.users[userid]["結果"][targetUserid] = "村　人";
			} else if (action === "menu-judgment-black") {
				var targetUserid = $(selected).attr("userid");
				_self.data.users[userid]["結果"][targetUserid] = "人　狼";
			} else if (action === "menu-target") {
				var targetUserid = $(selected).attr("userid");
				_self.data.users[userid]["結果"][targetUserid] = true;
			} else if (action === "menu-reverse-log") {
				_self.data.reverseLog = !_self.data.reverseLog;
				_self.data.status.attr("reverselog", _self.data.reverseLog);
				console.log("チャット逆 " + (_self.data.reverseLog ? "ON" : "OFF"));
				localStorage.reverseLog = _self.data.reverseLog;
			} else if (action === "menu-hidecng") {
				_self.data.hidecng = !_self.data.hidecng;
				console.log("GM表示 " + (!_self.data.hidecng ? "ON" : "OFF"));
			} else if (action === "menu-hidecnw") {
				_self.data.hidecnw = !_self.data.hidecnw;
				console.log("観戦表示 " + (!_self.data.hidecnw ? "ON" : "OFF"));
				localStorage.hidecnw = _self.data.hidecnw;
			} else if (action === "menu-showposition") {
				_self.data.showposition = !_self.data.showposition;
				console.log("役職強調表示 "
						+ (_self.data.showposition ? "ON" : "OFF"));
				localStorage.showposition = _self.data.showposition;
			} else if (action === "menu-showgray") {
				_self.data.showgray = !_self.data.showgray;
				console.log("完グレー強調表示 " + (_self.data.showgray ? "ON" : "OFF"));
				localStorage.showgray = _self.data.showgray;
			} else if (action === "menu-showuranai") {
				_self.data.showuranai = !_self.data.showuranai;
				console.log("占い結果強調表示 "
						+ (_self.data.showuranai ? "ON" : "OFF"));
				localStorage.showuranai = _self.data.showuranai;
			} else if (action === "menu-showhistory") {
				_self.data.showhistory = !_self.data.showhistory;
				console
						.log("吊噛履歴表示 "
								+ (_self.data.showhistory ? "ON" : "OFF"));
				localStorage.showhistory = _self.data.showhistory;
			} else if (action === "menu-log") {
				var day = $(selected).attr("last-day");

				var index = _self.data.logTags.indexOf(day);

				if (index !== -1) {
					_self.data.temporary.selectedLog = index;
				}

				if (_self.data.logDialog.dialog("isOpen")) {
					$("#ruru-log-table").accordion("option", "active",
							_self.data.temporary.selectedLog);
				} else {
					_self.data.logDialog.dialog("open");
				}

			} else if (action === "menu-vote") {
				_self.data.voteDialog.dialog("open");
			} else if (action === "menu-log-of-day") {
				var day = $(selected).text();

				var index = _self.data.logTags.indexOf(day);

				if (index !== -1) {
					_self.data.temporary.selectedLog = index;
				}

				if (_self.data.logDialog.dialog("isOpen")) {
					$("#ruru-log-table").accordion("option", "active",
							_self.data.temporary.selectedLog);
				} else {
					_self.data.logDialog.dialog("open");
				}
			} else if (action === "menu-person") {
				_self.data.positionDialog.dialog("open");
			} else if (action === "menu-diary") {
				_self.data.diaryDialog.dialog("open");
			} else if (action === "menu-gray-table") {
				_self.data.grayTableDialog.dialog("open");
			} else if (action === "menu-colors") {
				_self.data.colorDialog.dialog("open");
			} else if (action === "menu-input-dead") {
				var dayindex = parseInt($(selected).attr("dayindex"));
				var day = _self.data.days[dayindex];
				_self.cleanDead(userid);

				var dead = _self.data.dead[day];
				if (dead && dead.length !== 0) {
					dead.push(userid);
				} else {
					dead = [ userid ];
				}

				_self.data.users[userid]["dead"] = true;
				_self.data.users[userid]["hang"] = false;

				_self.data.dead[day] = dead;
			} else if (action === "menu-input-hang") {
				var dayindex = parseInt($(selected).attr("dayindex"));
				var day = _self.data.days[dayindex];
				_self.cleanDead(userid);

				var hang = _self.data.hang[day];
				if (hang && hang.length !== 0) {
					hang.push(userid);
				} else {
					hang = [ userid ];
				}

				_self.data.users[userid]["hang"] = true;
				_self.data.users[userid]["dead"] = false;

				_self.data.hang[day] = hang;
			} else if (action === "menu-gray-table-delete") {
				var from = $(selected).attr("fromuserid");
				var to = $(selected).attr("touserid");

				delete _self.data.users[from]["結果"][to];
			} else if (action === "menu-gray-table-black") {
				var from = $(selected).attr("fromuserid");
				var to = $(selected).attr("touserid");

				_self.data.users[from]["結果"][to] = "人　狼";
			} else if (action === "menu-gray-table-white") {
				var from = $(selected).attr("fromuserid");
				var to = $(selected).attr("touserid");

				_self.data.users[from]["結果"][to] = "村　人";
			} else if (action === "menu-reset") {
				_self.reset();
			} else if (action === "menu-copy") {
				var text = document.getSelection().toString();
				chrome.extension.sendRequest({
					action : "copy",
					text : text
				}, function(responce) {
				});
			}

			_self.updateCss();
			_self.updatePosition();
		},
		cleanDead : function(userid) {
			var _self = this;

			for ( var day in _self.data.dead) {
				var dead = _self.data.dead[day];
				if (dead && dead.indexOf) {
					var index = dead.indexOf(userid);
					if (index != -1) {
						dead.splice(index, 1);
					}
				}
			}

			for ( var day in _self.data.hang) {
				var hang = _self.data.hang[day];
				if (hang && hang.indexOf) {
					var index = hang.indexOf(userid);
					if (index != -1) {
						hang.splice(index, 1);
					}
				}
			}
		},
		cleanPositionOrders : function(userid) {
			var _self = this;

			for ( var position in _self.data.positionOrders) {
				var order = _self.data.positionOrders[position];
				if (order && order.indexOf) {
					var index = order.indexOf(userid);
					if (index != -1) {
						order.splice(index, 1);
					}
				}
			}
		},
		updatePosition : function() {
			var _self = this;

			var delim = "";

			var dialog = $("#ruru-ext-position-dialog").empty();

			for ( var pos in _self.data.positionOrders) {
				var order = _self.data.positionOrders[pos];

				if (order.length !== 0) {
					dialog.append(delim);
					delim = "<br/>";

					dialog.append("<h3>" + pos + "</h3>");

					var elm = $("<div pos='" + pos + "'></div>").appendTo(
							dialog);

					for (var i = 0; i < order.length; i++) {
						var userid = order[i];
						var userData = _self.data.users[userid];
						var name = userData["name"];

						var jg = _self.data.positions[userData["役職"]][3];
						var position = $("<div class='position'></div>")
								.append(
										"<div style='display:inline-block;min-width:50px;padding:3px;margin-right:3px;' class='position-user "
												+ userid
												+ "'>"
												+ name
												+ "</div>").append(
										jg ? "&nbsp;&nbsp;：" : "")
								.appendTo(elm).attr("userid", userid);
						if (jg) {
							var result = $(
									"<div style='display:inline-block;'></div>")
									.appendTo(position);
							if (jg === "判定") {
								for ( var targetUserid in userData["結果"]) {
									if (userData["結果"][targetUserid] === "村　人") {
										result
												.append($(
														"<div style='display:inline-block;padding:3px;margin-right:3px;' class='position-target "
																+ targetUserid
																+ "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-radio-off'>　　○</span>"
																+ _self.data.users[targetUserid]["name"]
																+ "</div>")
														.attr("userid",
																targetUserid));
									} else {
										result
												.append($(
														"<div style='display:inline-block;padding:3px;margin-right:3px;' class='position-target "
																+ targetUserid
																+ "'><span style='display:inline-block;vertical-align:middle;' class='ui-icon ui-icon-bullet'>　　●</span>"
																+ _self.data.users[targetUserid]["name"]
																+ "</div>")
														.attr("userid",
																targetUserid));
									}
								}
							} else if (jg === "対象") {
								for ( var targetUserid in userData["結果"]) {
									result
											.append($(
													"<div style='display:inline-block;padding:3px;margin-right:3px;' class='position-target "
															+ targetUserid
															+ "'>"
															+ _self.data.users[targetUserid]["name"]
															+ "</div>").attr(
													"userid", targetUserid));
								}
							}
						}
					}

					elm.sortable({
						update : function() {
							var pos = $(this).attr("pos");
							var order = [];

							$(".position-user", this).each(
									function(i, div) {
										var userid = undefined;
										if ($(div).hasClass("position")) {
											userid = $(div).attr("userid");
										} else {
											userid = $(div).parents(
													".position:first").attr(
													"userid");
										}

										order.push(userid);
									});

							_self.data.positionOrders[pos] = order;
						}
					});
					elm.disableSelection();
				}
			}

			$(".position-user", dialog).on(
					"dblclick",
					function(e) {
						var delUserid;
						if ($(this).hasClass("position")) {
							delUserid = $(this).attr("userid");
						} else {
							delUserid = $(this).parents(".position:first")
									.attr("userid");
						}

						if (delUserid) {
							_self.data.users[delUserid]["役職"] = undefined;
							_self.data.users[delUserid]["役職解除"] = false;
							_self.data.users[delUserid]["結果"] = {};

							_self.cleanPositionOrders(delUserid);

							_self.updateCss();
							_self.updatePosition();
						}
					});

			$(".position-target", dialog)
					.on(
							"dblclick",
							function(e) {
								var delTarget = $(this).attr("userid");
								var targetPosition = $(this).parents(
										".position:first").attr("userid");

								if (delTarget && targetPosition) {
									delete _self.data.users[targetPosition]["結果"][delTarget];

									_self.updateCss();
									_self.updatePosition();
								}
							});

			_self.updateGrayTable();
		},
		updateGrayTable : function() {
			var showAll = !$("#ruru-ext-gray-table-show").is(":checked");

			var _self = this;

			var tableHead = $("#ruru-ext-gray-head").empty();
			var tableBody = $("#ruru-ext-gray-body").empty();

			var headRow = $("<tr></tr>").append("<td>　</td>").appendTo(
					tableHead);

			var uranais = _self.data.positionOrders["占　い"];
			var uranaiUsers = [];
			for (var i = 0; i < uranais.length; i++) {
				var userData = _self.data.users[uranais[i]];
				if (!userData["役職解除"]) {
					headRow.append("<td class='" + uranais[i]
							+ " gray-table-head' userid='" + uranais[i] + "'>"
							+ userData["name"] + "</td>");
					uranaiUsers.push(userData);
				}
			}

			var reis = _self.data.positionOrders["霊　能"];
			var reiUsers = [];
			for (var i = 0; i < reis.length; i++) {
				var userData = _self.data.users[reis[i]];
				if (!userData["役職解除"]) {
					headRow.append("<td class='" + reis[i]
							+ " gray-table-head' userid='" + reis[i] + "'>"
							+ userData["name"] + "</td>");
					reiUsers.push(userData);
				}
			}

			for ( var userid in _self.data.users) {
				var userData = _self.data.users[userid];

				var bodyRow = $("<tr></tr>");
				bodyRow.append("<td class='" + userid + "' userid='" + userid
						+ "'>" + userData["name"] + "</td>");

				var black = false;

				for (var j = 0; j < uranaiUsers.length; j++) {
					var col = $(
							"<td class='gray-table-data' fromuserid='"
									+ uranaiUsers[j]["userid"] + "' touserid='"
									+ userid + "'></td>").appendTo(bodyRow);

					var result = uranaiUsers[j]["結果"][userid];
					if (result === "人　狼") {
						col
								.append("<span class='ui-icon ui-icon-bullet' style='display:inline-block;'>●</span>");
						col.addClass("gray-table-data-black");
						black = true;
					} else if (result === "村　人") {
						col
								.append("<span class='ui-icon ui-icon-radio-off' style='display:inline-block;'>○</span>");
						col.addClass("gray-table-data-white");
					} else if (uranaiUsers[j]["userid"] == userid) {
						col.text("-");
					}

					if (userData["hang"] || userData["dead"]) {
						col.css("background", "#ddd");
					}
				}

				for (var j = 0; j < reiUsers.length; j++) {
					var col = $(
							"<td class='gray-table-data' fromuserid='"
									+ reiUsers[j]["userid"] + "' touserid='"
									+ userid + "'></td>").appendTo(bodyRow);

					var result = reiUsers[j]["結果"][userid];
					if (result === "人　狼") {
						col
								.append("<span class='ui-icon ui-icon-bullet' style='display:inline-block;'>●</span>");
						col.addClass("gray-table-data-black");
						black = true;
					} else if (result === "村　人") {
						col
								.append("<span class='ui-icon ui-icon-radio-off' style='display:inline-block;'>○</span>");
						col.addClass("gray-table-data-white");
					} else if (reiUsers[j]["userid"] == userid) {
						col.text("-");
					}

					if (userData["hang"] || userData["dead"]) {
						col.css("background", "#ddd");
					}
				}

				if (showAll || black
						|| (!userData["hang"] && !userData["dead"])) {
					tableBody.append(bodyRow);
				}
			}
		},
		updateCss : function() {
			var _self = this;

			for (var i = _self.data.styleSheet.cssRules.length - 1; i >= 0; i--) {
				_self.data.styleSheet.deleteRule(i);
			}

			var uraCount = 0;
			var usersStatus = {};

			for ( var name in _self.data.names) {
				var userid = _self.data.names[name];
				var userData = _self.data.users[userid];

				if (userData && userData["役職"] === "占　い" && !userData["役職解除"]) {
					uraCount++;
					for ( var targetUserid in userData["結果"]) {
						if (userData["結果"][targetUserid] === "村　人") {
							if (usersStatus[targetUserid]) {
								usersStatus[targetUserid]["村　人"]++;
							} else {
								usersStatus[targetUserid] = {
									"村　人" : 1,
									"人　狼" : 0
								};
							}
						} else {
							if (usersStatus[targetUserid]) {
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

			for ( var type in _self.data.uraStatus) {
				var status = _self.data.uraStatus[type];
				var style = "";
				if (status["bold"]) {
					style = "font-weight:bold;";
				}
				if (status["italic"]) {
					style += "font-style:italic;";
				}
				if (status["line"] && status["underline"]) {
					style += "text-decoration:line-through underline;";
				} else if (status["line"]) {
					style += "text-decoration:line-through;";
				} else if (status["underline"]) {
					style += "text-decoration:underline;";
				}
				if (status["shadow"]) {
					style += "text-shadow:1px 1px 2px #999;";
				}
				judgmentStyles[type] = style;
			}

			for ( var name in _self.data.names) {
				var userid = _self.data.names[name];
				var userData = _self.data.users[userid];

				var style = "";

				if (usersStatus[userid] && _self.data.showuranai) {
					for ( var type in judgmentStyles) {
						if (usersStatus[userid][type] > 0) {
							style += judgmentStyles[type];
						}
					}
				}

				if (_self.data.showposition && userData && userData["役職"]
						&& !userData["役職解除"]) {
					var cl = _self.data.positions[userData["役職"]][1];
					var bg = _self.data.positions[userData["役職"]][2];
					_self.data.styleSheet.insertRule("." + userid
							+ " {background-color:" + bg + ";color:" + cl + ";"
							+ style + "}", 0);
				} else if (style === "" && _self.data.showgray) {
					_self.data.styleSheet.insertRule("." + userid
							+ " {background-color:" + _self.data.graycolor
							+ ";}", 0);
				} else {
					_self.data.styleSheet.insertRule("." + userid + " {"
							+ style + "}", 0);
				}
			}

			if (_self.data.hidecng) {
				_self.data.styleSheet.insertRule(".cng {display:none;}", 0);
				_self.data.styleSheet.insertRule(".ccg {display:none;}", 0);
			}

			if (_self.data.hidecnw) {
				_self.data.styleSheet.insertRule(".cnw {display:none;}", 0);
				_self.data.styleSheet.insertRule(".ccw {display:none;}", 0);
			}

			if (_self.data.showhistory) {
				var bgi = chrome.extension.getURL("claw.png");
				for ( var key in _self.data.dead) {
					var dead = _self.data.dead[key];
					for (var i = 0; i < dead.length; i++) {
						_self.data.styleSheet
								.insertRule(
										"#No01 td."
												+ dead[i]
												+ ".icon div:before {content: '"
												+ key
												+ "';font-size: 10px;background-color: red;padding: 2px 5px;color:white;position:absolute;left:0px;}",
										0);
						_self.data.styleSheet
								.insertRule(
										"#No01 td.name."
												+ dead[i]
												+ " {background-image:url("
												+ bgi
												+ ");background-repeat:no-repeat;background-position:right top;}",
										0);
						_self.data.styleSheet
								.insertRule(
										"#ruru-ext-position-dialog div."
												+ dead[i]
												+ " {background-image:url("
												+ bgi
												+ ");background-repeat:no-repeat;background-position:right top;}",
										0);
						_self.data.styleSheet
								.insertRule(
										"#ruru-log-users label."
												+ dead[i]
												+ " {background-image:url("
												+ bgi
												+ ");background-repeat:no-repeat;background-position:right top;}",
										0);
						_self.data.styleSheet
								.insertRule(
										"#ruru-ext-gray-table-dialog td."
												+ dead[i]
												+ " {background-image:url("
												+ bgi
												+ ");background-repeat:no-repeat;background-position:right top;}",
										0);
						_self.data.styleSheet
								.insertRule(
										"#ruru-ext-vote-dialog td."
												+ dead[i]
												+ " {background-image:url("
												+ bgi
												+ ");background-repeat:no-repeat;background-position:right top;}",
										0);
					}
				}

				for ( var key in _self.data.hang) {
					var hang = _self.data.hang[key];
					for (var i = 0; i < hang.length; i++) {
						_self.data.styleSheet
								.insertRule(
										"#No01 td."
												+ hang[i]
												+ ".icon div:before {content: '"
												+ key
												+ "';font-size: 10px;background-color: blue;padding: 2px 5px;color:white;position:absolute;left:0px;}",
										0);
					}
				}
			}
		},
		ord : function(count) {
			switch (count % 10) {
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

	var RuruExt = new _RuruExt();

	RuruExt.init();
});
