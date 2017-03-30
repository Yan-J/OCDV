var NYC = NYC || {};

/**
 *
 * Class NYC.EventsFilterFindLocalEvents
 *   Invoked from NYC.FindLocalEvents.js and events-filter.js
 *   Based on data, build the events service url with appropriate query string
 *  returns JSON object
 **/
NYC.EventsFilterFindLocalEvents = Class.extend({

	init : function init(options, elem) {

	console.log("init events filter");
	this.options = $.extend({}, this.options, options);
},

/**
 * Find Local Events
 * 1) Initial load - display featured events
 * 2) User filters search by changing any of other form controls.  Display all events.
              Invokes url -> /events/api/json/search.htm?sort=DATE[parms]
 *
 **/
filter : function(data, type, callback) {

	    var urlPrefix = '/calendar/api/json/';
     console.log('data:' + data);

        if (data == 'FindLocalEvents') {
               console.log('load');
                   var myUrl = urlPrefix + 'search.htm';
                  console.log('calling : ' + myUrl);
                   //Now we have the full url to make the ajax call
        $.ajax({
                url: myUrl,
                type: type,
                context: document.body
        }).done(function(result) {
                callback(result);
        }).fail(function(jqXHR, textStatus, errorThrown) {
                callback(jqXHR, textStatus, errorThrown);
        });

           console.log("returned");

           return;
        }

        console.log("user change");

	var myUrl = urlPrefix + 'search.htm';
	var queryString = '';
	var eventName;
	var dateFrom = '';
	var dateTo = '';
	var timeFrom = '';
	var timeTo = '';
	var zip = '';
	var IsEndofDay = false;
	var fromAMPM = "AM";
	var toAMPM = "PM";
	var hourFrom = '';
	var minFrom = '';
	var boroughsValue = '';
	var categoriesValue = '';

	var cleanDate = function (strDate) {
		strDate = strDate.replace(/%2C/g,'');
		strDate = strDate.replace(/\+/g,'/');
		strDate = strDate.replace(/Jan/,'01');
		strDate = strDate.replace(/Feb/,'02');
		strDate = strDate.replace(/Mar/,'03');
		strDate = strDate.replace(/Apr/,'04');
		strDate = strDate.replace(/May/,'05');
		strDate = strDate.replace(/Jun/,'06');
		strDate = strDate.replace(/Jul/,'07');
		strDate = strDate.replace(/Aug/,'08');
		strDate = strDate.replace(/Sep/,'09');
		strDate = strDate.replace(/Oct/,'10');
		strDate = strDate.replace(/Nov/,'11');
		strDate = strDate.replace(/Dec/,'12');
		return strDate;
	};

				     		// Code appends hidden time values on find local events so initialize their default values
        		// default start/end time will be 8:00am/8:00 pm  and will be initialized by HUGE.
        		console.log('filter search: data:' + data);
        	        // initialize time from 12 am & time to 11:59 pm
        		if (data.indexOf("&timeFrom=&timeTo=") > 0) {
				//if (data.indexOf("&startTime=&endTime=") > 0) {
        			//data += "&timeFrom=8&timeTo=20";
        			//data = data.replace("&timeFrom=&timeTo=", "&timeFrom=3.5&timeTo=21.5");

        			data = data.replace("&timeFrom=&timeTo=", "&timeFrom=0&timeTo=24");
					//data = data.replace("&startTime=&endTime=", "&timeFrom=0&timeTo=24");
            }

        		//Event API requires date parameters to be in java simple date format MM/dd/yyyy HH:mm ampm
        		//e.g. search.htm?startDate=04/26/2013 09:00 AM&endDate=04/26/2013 10:00 PM

        		// Start get startDate, endDate, timeFrom, timeTo, zip.
        	     //begin date time logic

        		// Also to handle checkboxes which result in multiple parameters (e.g. boroughs, categories), build string so we can build correct value later
        		// e.g. Given data: ...&boroughs=Mn&boroughs=Bk...  Event API expects &boroughs=Mn,Bk
        		var arrayData = data.split('&');
        		var multipleParamData = '';
        		var param;
        		var validEventSearchParam = new RegExp(/^(range-from|range-to|timeFrom|timeTo|categories|zip|boroughs)=.*/);
        		for (var j=0; j < arrayData.length; j++) {
        			param = arrayData[j];
        			if (validEventSearchParam.test(param)) {
        				//we don't want duplicates such as timeTo timeFrom
        				if (multipleParamData.indexOf(param) < 0) {
        					// capture dates, times and zip
        					if (param.indexOf("range-from") > -1) {
        						dateFrom = param.replace(/range-from=(.*)$/, "$1");
        						dateFrom = cleanDate(dateFrom);
        					}
        					else if (param.indexOf("range-to") > -1) {
        						dateTo = param.replace(/range-to=(.*)$/, "$1");
        						dateTo = cleanDate(dateTo);
        					}else if (param.indexOf("timeFrom") > -1) {
        						timeFrom = param.replace(/timeFrom=(.*)$/, "$1");
        					}else if (param.indexOf("timeTo") > -1) {
        						timeTo = param.replace(/timeTo=(.*)$/, "$1");
        					} else if (param.indexOf("zip") > -1) {
        						zip = param.replace(/zip=(.*)$/, "$1");
        						if (zip == 'Zipcode') // placeholder value is Zipcode so replace it
        							zip = '';
        					}
        					// boroughs and categories may have multiple occurrences so we build multipleParamData to handle it later
        					multipleParamData = multipleParamData + "&" + param;
        				}
        			}
		  } // end inner else
		//}// end outer else
		// if dateTo isn't defined, we're being called from find local events which searches on current date only
		if (dateTo == '')
			dateTo = dateFrom;

		//start handle time
		hourFrom = timeFrom.replace(/^([0-9]+)[\.0-9]+/i, "$1");

		// startDate Time.  Extract the HH and mm
		var firstIndexDot = timeFrom.indexOf('.');
		if (firstIndexDot > 0) {
			hourFrom = timeFrom.substring(0, firstIndexDot);
			minFrom = "30";
		} else {
			hourFrom = timeFrom;
			minFrom = "00";
		}
		if (hourFrom < 10) {
			hourFrom = "0" + hourFrom;
                        // API doesn't accept 00:00
                        if (hourFrom == '00')
                           hourFrom = 12;
		}
                if (hourFrom >= 13) {
                    hourFrom = hourFrom - 12;
                }
console.log("hourFrom: " + hourFrom);
		// endDate Time.  Extract the HH and mm
		firstIndexDot = timeTo.indexOf('.');
		if (firstIndexDot > 0) {
			hourTo = timeTo.substring(0, firstIndexDot);
			minTo = "30";
		} else {
			hourTo = timeTo;
			minTo = "00";
		}
		// If hour is before 12, set AM.
		if (hourTo < 12) {
			toAMPM = "AM";
		}

		if (hourTo >= 13) {
			if (hourTo == 24) {// handle special case 12 PM should be 11:59 pm
				IsEndofDay = true;
			}
			hourTo = hourTo - 12;
		}
		if (hourTo < 10) {
			hourTo = "0" + hourTo;
		}

		fromAMPM = "AM";
		toAMPM = "PM";
		if (timeFrom >= 12) {
			fromAMPM = "PM";
		}
		/*Handle case where end time is 12:00 am.
	      Just set hour min to 11:59 PM so we don't need to modify date*/
		if (IsEndofDay) {
			hourTo = "11";
			minTo = "59";
		}
		if (timeTo < 12) {
			toAMPM = "AM";
		}
		timeFrom = hourFrom + ":" + minFrom;
		timeTo = hourTo + ":" + minTo;
		//end handle time

		//Now we have all values needed to build the date in java simple date format MM/dd/yyyy hh:mm AM
		var startDateValue = "startDate=" + dateFrom + " " + "12:00" + " " + "AM";
		var endDateValue = "endDate=" + dateTo + " " + "11:59" + " " + "PM";

		console.log('startDateValue ' + startDateValue);
		console.log('endDateValue ' + endDateValue);

		var NoDateSelected = new RegExp(/^Select.*/);

		//Init query string with startDate or EndDate or empty string.
		if (!NoDateSelected.test(dateFrom) && !NoDateSelected.test(dateTo))
			  queryString = startDateValue + "&" + endDateValue;
		else if (!NoDateSelected.test(dateFrom))
			  queryString = startDateValue;
		else if (!NoDateSelected.test(dateTo))
			  queryString = endDateValue;

		//if (queryString.length == 0)
		//	 queryString = '?';

		console.log('init queryString: ' + queryString);

		// end date time logic

		//Handle boroughs/categories.  Condense multiple values into comma delimited.
		var arrayParams = multipleParamData.split("&");
		var boroughsValue = '';
		var categoriesValue = '';
		for (var j=0; j < arrayParams.length; j++) {
			var param = arrayParams[j];
			if (param.indexOf("boroughs=") == 0) {
				tmp = param.replace(/^boroughs=(.*)$/, "$1");
				boroughsValue = boroughsValue + tmp + ",";
				tmp = "";
			} else if (param.indexOf("categories=") == 0) {
				tmp = param.replace(/^categories=(.*)$/, "$1");
				categoriesValue = categoriesValue + tmp + "&categories=";
				tmp = "";
			}
		}
		// trim any trailing comma (,) if needed
		boroughsValue = boroughsValue.replace(/,$/, '');
		categoriesValue = categoriesValue.replace(/,$/, '');

		// replace any trailing "&categories="
		categoriesValue = categoriesValue.replace(/&categories=$/, '');

		//Handle category
		if (categoriesValue != '') {
			if (queryString != '')
			   queryString = queryString + "&categories=" + categoriesValue;
			else
				 queryString = "categories=" + categoriesValue;
    }

		if (boroughsValue != '') {
			if (boroughsValue == 'any') {
				boroughsValue = "Bx,Bk,Mn,Qu,SI,Ot";
			}
			if (queryString != '')
				queryString = queryString + "&boroughs=" + boroughsValue;
			else
				queryString = "boroughs=" + boroughsValue;
		}

    //Always sort by date, otherwise all parameters are ignored as per event api.
		queryString = queryString + "&sort=DATE&pageNumber=1";

	myUrl = myUrl + '?' + queryString;
	console.log(myUrl);

	//Now we have the full url to make the ajax call
	$.ajax({
		url: myUrl,
		type: type,
		context: document.body
	}).done(function(result) {
		callback(result);
	}).fail(function(jqXHR, textStatus, errorThrown) {
		callback(jqXHR, textStatus, errorThrown);
	});
}
});
