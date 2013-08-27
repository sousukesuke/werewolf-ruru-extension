$( function() {
	var result_auto_org = result_auto;

	var status = $( "#ruru-ext-status" );
	var eventDispatcher = $( "#ruru-ext-event-dispatcher" );

	var day = undefined;
	var time = undefined;
	var step = 0;

	var names = {};

	var checkDate = function( date ) {
		if ( date ) {
			date = date.slice( date.indexOf( ">" ) + 1, date.indexOf( "</" ) );
			var index = date.indexOf( "&nbsp;" );
			if ( index !== -1 ) {
				day = date.slice( 0, index );
				time = date.slice( index + 12 );
				status.attr( "day", day );
				status.attr( "time", time );
			}
		} else {
			date = $( "#No08>span:first" ).text();
			if ( date ) {
				var index = date.indexOf( "\xa0" );
				if ( index !== -1 ) {
					day = date.slice( 0, index );
					time = date.slice( index + 2 );
					status.attr( "day", day );
					status.attr( "time", time );
				}
			}
		}

		if ( step === 0 && time !== "開始前" ) {
			step = 1;
		}
	};

	var mark = function( target, user ) {
		var cls = target.getAttribute( "class" ) + " " + user;
		target.setAttribute( "class", cls );
		target.setAttribute( "userid", user );
	};

	var marking = function() {
		if ( step === 3 ) {
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
						mark( td, "user-" + ( line * 2 ) );
						break;
					case 2:
					case 3:
					case 5:
						mark( td, "user-" + ( ( line * 2 ) + 1 ) );
						break;
					default:
						break;
					}
				}
			}
		} else if ( step === 1 ) {
			step = 2;

			var tds = $( "#No01 td" ).get();
			for ( var i = 0; i < tds.length; i++ ) {
				var td = tds[i];

				var text = $( td ).text();
				if ( time === "ゲーム終了" && $( td ).hasClass( "name" ) ) {
					text = $( ">span:first", td ).text();
				}

				if ( text !== "　" ) {
					var line = Math.floor( i / 6 );
					var position = ( i % 6 );

					switch ( position ) {
					case 0:
						mark( td, "user-" + ( line * 2 ) );
						break;
					case 1:
						names[text] = "user-" + ( line * 2 );
						mark( td, "user-" + ( line * 2 ) );
						break;
					case 2:
						mark( td, "user-" + ( ( line * 2 ) + 1 ) );
						break;
					case 3:
						names[text] = "user-" + ( ( line * 2 ) + 1 );
						mark( td, "user-" + ( ( line * 2 ) + 1 ) );
						break;
					case 4:
						mark( td, "user-" + ( line * 2 ) );
						break;
					case 5:
						mark( td, "user-" + ( ( line * 2 ) + 1 ) );
						break;
					default:
						break;
					}
				}
			}

			step = 3;
		} else {
			var icons = $( "#No01 td.icon" ).get();
			var tds = $( "#No01 td.val" ).get();
			for ( var i = 0; i < tds.length; i++ ) {
				var td = $( tds[i] );

				if ( td.text() !== "　" ) {
					var icon = $( icons[i] );

					td.attr( "onclick", icon.attr( "onclick" ) );
					td.attr( "onmouseout", "nd();" );
				}
			}
		}

		if ( status.attr( "reverselog" ) === "true" ) {
			var tbody = $( "#No09>table>tbody" );
			var mslist = tbody.children().get().reverse();

			tbody.append( mslist );

			if ( step === 3 ) {
				for ( var i = 0; i < mslist.length; i++ ) {
					var row = mslist[i];
					var cn = $( "td.cn:first>span.name", row );
					if ( cn.length !== 0 ) {
						var name = cn.text();
						var user = names[name];
						cn.parent().addClass( user ).attr( "userid", user ).next().addClass( user ).attr( "userid", user );
					}
				}
			}

			var h1 = $( "#chatscr2_1>.d1215" ).height();
			$( '#chatscr2_1' ).scrollTop( h1 );
		} else {
			var mslist = $( "#No09>table>tbody>tr" ).get();

			if ( step === 3 ) {
				for ( var i = 0; i < mslist.length; i++ ) {
					var row = mslist[i];
					var cn = $( "td.cn:first>span.name", row );
					if ( cn.length !== 0 ) {
						var name = cn.text();
						var user = names[name];
						cn.parent().addClass( user ).attr( "userid", user ).next().addClass( user ).attr( "userid", user );
					}
				}
			}
		}
	};

	result_auto = function( obj ) {
		checkDate( obj.dayTimeInfo );

		result_auto_org( obj );

		if ( day !== "開始前" ) {
			marking();
		}

		eventDispatcher.click();
	};

	checkDate();
	marking();

	eventDispatcher.click();
} );
