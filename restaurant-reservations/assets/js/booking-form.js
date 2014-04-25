/* Javascript for Restaurant Reservations booking form */
jQuery(document).ready(function ($) {

	/**
	 * Show the message field on the booking form
	 */
	$( '.rtb-booking-form .add-message a' ).click( function() {
		$(this).hide();
		$(this).parent().siblings( '.message' ).addClass( 'message-open' );

		return false;
	});

	/**
	 * Enable datepickers on load
	 */
	if ( typeof rtb_pickadate !== 'undefined' ) {

		// Declare datepicker
		var $date_input = $( '#rtb-date' ).pickadate({
			format: rtb_pickadate.date_format,
			min: true,
			container: 'body',
		});

		// Declare timepicker
		var $time_input = $( '#rtb-time' ).pickatime({
			format: rtb_pickadate.time_format,
		});

		var datepicker = $date_input.pickadate( 'picker' );
		var timepicker = $time_input.pickatime( 'picker' );

		// Pass conditional configuration parameters
		// @todo set timepicker interval
		if ( rtb_pickadate.disable_dates.length ) {
			datepicker.set( 'disable', rtb_pickadate.disable_dates );
		}

		datepicker.on( {
			close: function() {
				rtb_update_timepicker_range();
			}
		});
	}

	// Update the timepicker's range based on the currently selected date
	function rtb_update_timepicker_range() {

		// Reset enabled/disabled rules on this timepicker
		timepicker.set( 'enable', false );
		timepicker.set( 'disable', false );

		var selected_date = new Date( datepicker.get() );
		var selected_date_year = selected_date.getFullYear();
		var selected_date_month = selected_date.getMonth();
		var selected_date_date = selected_date.getDate();

		// Declaring the first element true inverts the timepicker settings. All
		// times subsequently declared are valid. Any time that doesn't fall
		// within those declarations is invalid.
		// See: http://amsul.ca/pickadate.js/time.htm#disable-times-all
		var valid_times = [ { from: [0, 0], to: [24, 0] } ];

		// Check if this date is an exception to the rules
		if ( typeof rtb_pickadate.schedule_closed != 'undefined' ) {

			var excp_date = [];
			var excp_start_date = [];
			var excp_start_time = [];
			var excp_end_date = [];
			var excp_end_time = [];
			for ( var closed_key in rtb_pickadate.schedule_closed ) {

				excp_date = new Date( rtb_pickadate.schedule_closed[closed_key].date );
				if ( excp_date.getFullYear() == selected_date_year &&
						excp_date.getMonth() == selected_date_month &&
						excp_date.getDate() == selected_date_date
						) {

					// Closed all day
					if ( typeof rtb_pickadate.schedule_closed[closed_key].time == 'undefined' ) {
						timepicker.set( 'disable', [ true ] );

						return;
					}

					if ( typeof rtb_pickadate.schedule_closed[closed_key].time.start !== 'undefined' ) {
						excp_start_date = new Date( '1 January 2000 ' + rtb_pickadate.schedule_closed[closed_key].time.start );
						excp_start_time = [ excp_start_date.getHours(), excp_start_date.getMinutes() ];
					} else {
						excp_start_time = [ 0, 0 ]; // Start of the day
					}

					if ( typeof rtb_pickadate.schedule_closed[closed_key].time.end !== 'undefined' ) {
						excp_end_date = new Date( '1 January 2000 ' + rtb_pickadate.schedule_closed[closed_key].time.end );
						excp_end_time = [ excp_end_date.getHours(), excp_end_date.getMinutes() ];
					} else {
						excp_end_time = [ 24, 0 ]; // End of the day
					}

					valid_times.push( { from: excp_start_time, to: excp_end_time, inverted: true } );
				}
			}

			excp_date = excp_start_date = excp_start_time = excp_end_date = excp_end_time = null;

			// Exit early if this date is an exception
			if ( valid_times.length > 1 ) {
				timepicker.set( 'disable', valid_times );

				return;
			}
		}

		// Get any rules which apply to this weekday
		if ( typeof rtb_pickadate.schedule_open != 'undefined' ) {

			var selected_date_weekday = selected_date.getDay();

			var weekdays = {
				sunday: 0,
				monday: 1,
				tuesday: 2,
				wednesday: 3,
				thursday: 4,
				friday: 5,
				saturday: 6,
			};

			var rule_start_date = [];
			var rule_start_time = [];
			var rule_end_date = [];
			var rule_end_time = [];
			for ( var open_key in rtb_pickadate.schedule_open ) {

				if ( typeof rtb_pickadate.schedule_open[open_key].weekdays !== 'undefined' ) {
					for ( var weekdays_key in rtb_pickadate.schedule_open[open_key].weekdays ) {
						if ( weekdays[weekdays_key] == selected_date_weekday ) {

							// Closed all day
							if ( typeof rtb_pickadate.schedule_open[open_key].time == 'undefined' ) {
								timepicker.set( 'disable', [ true ] );

								return;
							}

							if ( typeof rtb_pickadate.schedule_open[open_key].time.start !== 'undefined' ) {
								rule_start_date = new Date( '1 January 2000 ' + rtb_pickadate.schedule_open[open_key].time.start );
								rule_start_time = [ rule_start_date.getHours(), rule_start_date.getMinutes() ];
							} else {
								rule_start_time = [ 0, 0 ]; // Start of the day
							}

							if ( typeof rtb_pickadate.schedule_open[open_key].time.end !== 'undefined' ) {
								rule_end_date = new Date( '1 January 2000 ' + rtb_pickadate.schedule_open[open_key].time.end );
								rule_end_time = [ rule_end_date.getHours(), rule_end_date.getMinutes() ];
							} else {
								rule_end_time = [ 24, 0 ]; // End of the day
							}

							valid_times.push( { from: rule_start_time, to: rule_end_time, inverted: true } );

						}
					}
				}
			}

			rule_start_date = rule_start_time = rule_end_date = rule_end_time = null;

			// Pass any valid times located
			if ( valid_times.length > 1 ) {
				timepicker.set( 'disable', valid_times );

				return;
			}

		}

		// Set it to always open if no rules have been defined
		timepicker.set( 'enable', true );
		timepicker.set( 'disable', false );

		return;
	}

});