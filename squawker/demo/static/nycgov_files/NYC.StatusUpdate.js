var NYC = NYC || {};

/**
 * Class NYC.StatusUpdate
 *
 */
NYC.StatusUpdate = Class.extend({

    iOS: (navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false),

    init: function init(options, elem) {

        console.log("\t init StatusUpdate");
        
        this.element = elem;
        this.options = $.extend({}, this.options, options);
        this.pageId = this.options.el;
        this.statusMini=document.location.href.indexOf("/311/")==-1&&$(this.pageId).width()<713;
        this.notify = $('.notify-container');
        this.holidays = $('.holidays-container');
        this.service = $('.service-container');
        this.panelItems = $('.nav-section-header');
        this.statusPanel = $('.status-panel');
        this.statusLoader = $('.status-loader');
        this.notifyLoader = $('.notify-loader');
        this.holidayLoader = $('.holiday-loader');
        this.subnavItem = $('.sub-nav a');
        this.subnav = $('.sub-nav');
        this.month = $('.datepicker .month');
        this.day = $('.day');
        this.calBtns = $('.cal-arrows a');
        this.btnDatePicker = $("#btnDatePicker");
        this.holidayList = $('#holiday-list');
        this.notifyList = $('#notify-list');
        this.months_array = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        this.hiddenMonth = $('input[name=hidden-month]');
        this.hiddenYear = $('input[name=hidden-year]');
        this.templateData = "";

        // Status data object
        this.statusItems = {};
        this.templateData = "";
        this.templateDataMini = "";

        this.tmplService = "";
        this.tmplNotify = "";
        this.tmplHolidays = "";
        this.tmplServiceStatus = "";

        this.loadJSTemplate();
        this.bindEvents();
    },

    options: {},

    //load js template
    loadJSTemplate: function () {
        var self = this;
        var now = new Date();
        var url = "";

        if (self.options.status) {
	        if(self.statusMini){
                var jsTemplate = new NYC.LoadJSTemplate({
	                url: "/assets/home/js/templates/status-mini.js",
	                success: function (data) {
	                    var data = data.responseText;
	                    self.tmplService = data;
	                    self.getDatafeedStatus("load", now);
	                }
	            });
	        }else{
	            var jsTemplate = new NYC.LoadJSTemplate({
	                url: "/assets/home/js/templates/status.js",
	                success: function (data) {
	                    var data = data.responseText;
	                    self.tmplService = data;
	                    self.getDatafeedStatus("load", now);
	                }
	            });
            }
        }

        if (self.options.notify) {
            var jsTemplate = new NYC.LoadJSTemplate({
                url: "/assets/home/js/templates/notify.js",
                success: function (data) {
                    var data = data.responseText;
                    self.tmplNotify = data;
                    self.getDatafeedNotify();
                }
            });
        }

        if (self.options.mta) {
            var jsTemplate = new NYC.LoadJSTemplate({
                url: "/assets/home/js/templates/service-status.js",
                success: function (data) {
                    var data = data.responseText;

                    $("body").append(data);
                    self.getDatafeedMTA();
                }
            });
        }

        if (self.options.holidays) {
            var jsTemplate = new NYC.LoadJSTemplate({
                url: "/assets/home/js/templates/holidays.js",
                success: function (data) {
                    var data = data.responseText;
                    self.tmplHolidays = data;
                    self.getDatafeedHolidays();
                }
            });
        }

    },

    getDatafeedStatus: function (type, date) {
        var self = this;

        // Init Status feed
        self.datafeedStatus = new NYC.Status({});

        var today = new Date();       
        var endDate = "";		
        var data = {
            startDate: dateFormat(date, "shortDateUnformatted"),
            endDate: endDate
        }

        // Get Status Data
        self.datafeedStatus.getfeed(data, "GET", function (result) {

            var items = result.status.items,
                day, month, year;

            switch (type) {

				case "load":
					day = date.getDate().toString();
					month = date.getMonth() + 1;
					year = date.getFullYear();

					if (day.length == 1) {
						day = "0" + day;
					}

					if (month.toString().length == 1) {
						month = "0" + month;
					}
					break;

				case "datepicker":
					day = date.day;
					month = date.month;
					year = date.year;
					break;
            }

            if (items !== undefined) {
				$(".status-container").removeClass("error");
                self.statusItems = items;
                self.parseDataFeedStatus(day, month, year);
            } else {
                $(".module-status-panel .status-loader").hide();
                $(".status-container").addClass("error").text("Unable to retrieve 311 Status.");
            }
        });
    },

    parseDataFeedStatus: function (day, month, year) {
			
        var self = this;
        var items = self.statusItems;

        var itemYear = {},
            itemMonth = {},
            itemDay = {};

		if( items.length > 0 ) {
        
			// Get data for date
			for (x = 0; x < items.length; x++) {
				itemYear[x] = items[x].today_id.substring(0, 4);
				itemMonth[x] = items[x].today_id.substring(4, 6);
				itemDay[x] = items[x].today_id.substring(6, 8);
				Handlebars.registerHelper('parse_status_info', function(theType, theIcon, theStatus, theDetails) {
					var output = "";
					var theImg="";
					if(theType.toLowerCase()=="asp"||theType.toLowerCase().indexOf("parking")>-1){
						theType="Alternate Side Parking";
					}
					if(theIcon&&theIcon.length>=0){
						theImg='<img src="'+theIcon+'" alt="'+theType+'">';
					}
					if(theType.toLowerCase()=="notes"){
						output=output+'<div class="span12 data"><div class="inner">'+theDetails+'</div></div>';
					}else if(theType.toLowerCase()=="override"){
						output=output+'<div class="span5 notice override">'+theImg+'</div><div class="data hidden-desktop"><span>'+theDetails+'</span></div><div class="span7 data"><div class="inner">'+theDetails+'</div></div>';
					}else{
						output=output+'<div class="span5 notice">'+theImg+'<div class="data"><span>'+theType+'</span><span class="alert">'+theStatus+'</span></div></div><div class="span7 data"><div class="inner">'+theDetails+'</div></div>';
					}
					return new Handlebars.SafeString(output);
				});
				Handlebars.registerHelper('parse_status_info_mini', function(theType, theIcon, theStatus, theDetails) {
					if(theType.toLowerCase()=="asp"||theType.toLowerCase().indexOf("parking")>-1){
						theType="Alternate Side Parking";
					}
					var output = "";
					var theImg="";
					if(theIcon&&theIcon.length>=0){
						theImg='<img src="'+theIcon+'" alt="'+theType+'">';
					}
					if(theType.toLowerCase()=="notes"){
						output=output+'<div class="data"><span class="inner">'+theDetails+'</span></div>';
					}else if(theType.toLowerCase()=="override"){
						output=output+'<div class="notice override"><div class="status-icon">'+theImg+'</div><div class="mini-data"><span class="mini-data-type">'+theDetails+'</span></div></div>';
					}else{
						output=output+'<div class="notice"><div class="status-icon">'+theImg+'</div><div class="mini-data"><span class="mini-data-type">'+theType+'</span><span class="alert">'+theStatus+'</span></div></div>';
					}
					return new Handlebars.SafeString(output);
				});
				// Hide loader
				self.statusLoader.hide();

				var template = self.tmplService; //self.templateData; //$('#status-template').html();
				var render = Handlebars.compile(template);
				var theHtml=render(items[x]);
					
				if (self.statusMini) {
					// parse mini status panel
					/*var template = self.templateDataMini; //$('#status-template-mini').html();
					var render = Handlebars.compile(template);*/

					$('#status-panel-mini').html(render(items[x]));
					$('#status-panel-mini').removeClass('hidden');
				}else{
				// Add rendered data to DOM
					self.statusPanel.html(render(items[x]));
					self.statusPanel.removeClass('hidden');
				}
			}
		} else {

			// Hide loader
            self.statusLoader.hide();
			console.log("no status data available");
			
			return;
			
        }
    },

    getDatafeedHolidays: function () {
        var self = this;

        // Init Holiday feed
        self.datafeedHolidays = new NYC.Holidays({});

        // Get Holiday Data
        self.datafeedHolidays.getfeed('', "GET", function (result) {
			
			self.holidays.find("#holiday-list").removeClass("error");
			
			//on error
			if( result.error != undefined ) {	
				self.holidays.find(".holiday-loader").remove();
				self.holidays.find(".inner").removeClass("hidden");
				self.holidays.find("#holiday-list").addClass("error").html("<li>Unable to retrieve Holidays. Please try again later.</li>");
				return;
			}
			
            var template = self.tmplHolidays; //$('#holiday-template').html();
            var render = Handlebars.compile(template);

            // Hide loader // show list 
            self.holidayLoader.hide();
            $('.holidays-container .inner').removeClass('hidden');

            // Add rendered data to DOM
            self.holidayList.html(render(result));
        });
    },

    getDatafeedNotify: function () {
        var self = this;

        // Init Notify feed
        self.datafeedNotify = new NYC.Notify({});

        // Get Notify Data
        self.datafeedNotify.getfeed('', "GET", function (result) {
		
		console.log("---- notify result ----");
		
            var template = self.tmplNotify; //$('#notify-template').html();
            var render = Handlebars.compile(template);

            // Hide loader
            self.notifyLoader.hide();

            // Add rendered data to DOM
            self.notifyList.html(render(result));
        });
    },

    getDatafeedMTA: function () {
        var self = this;

        // Init MTA data feed
        self.mta = new NYC.Mta({});

        self.mta.getServiceStatus(function (data) {
            var helpers = function () {
                // helper for parsing borough icon
                Handlebars.registerHelper('parse_subway', function (name) {
                    var img = '<img src="/assets/home/images/modules/status-update/sw-' + name.toLowerCase() + '.png" alt="">';
                    return new Handlebars.SafeString(img);
                });

                // helper for rail service class
                Handlebars.registerHelper('parse_class', function (index) {
                    var x = parseInt(index, 10) + 1;
                    var output = 'railSquare' + x;

                    return new Handlebars.SafeString(output);
                });

                // helper for metro rail service class
                Handlebars.registerHelper('parse_class_metro', function (name) {
                    var output = 'railSquareBlank';

                    switch (name) {

                    case 'Hudson':
                        output = 'railSquare12';
                        break;

                    case 'Harlem':
                        output = 'railSquare13';
                        break;

                    case 'New Haven':
                        output = 'railSquare14';
                        break;

                    case 'Pascack Valley':
                        output = 'railSquare15';
                        break;

                    case 'Port Jervis':
                        output = 'railSquare16';
                        break;
                    }

                    return new Handlebars.SafeString(output);
                });

                // helper for parsing status class
                Handlebars.registerHelper('parse_status', function (status) {
                    var output = 'good';

                    switch (status) {

                    case 'PLANNED WORK':
                        output = 'work';
                        break;

                    case 'SERVICE CHANGE':
                        output = 'alert';
                        break;

                    case 'SANDY REROUTE':
                        output = 'alert';
                        break;

                    case 'DELAYS':
                        output = 'alert';
                        break;
                    }

                    return new Handlebars.SafeString(output);
                });
            }();

            // Load JS template
            var templateSubway = $('#service-subway').html();
            var templateBus = $('#service-bus').html();
            var templateBt = $('#service-bt').html();
            var templateLirr = $('#service-lirr').html();
            var templateMetro = $('#service-metro').html();

            // Render template
            var templateRenderSubway = Handlebars.compile(templateSubway);
            var templateRenderBus = Handlebars.compile(templateBus);
            var templateRenderBt = Handlebars.compile(templateBt);
            var templateRenderLirr = Handlebars.compile(templateLirr);
            var templateRenderMetro = Handlebars.compile(templateMetro);

            // Hide loader // show list 
            $('.service-loader').hide();
            $('.service-container .inner').removeClass('hidden');

            // Add rendered data to DOM
            $('#subway-status-list').html(templateRenderSubway(data));
            $('#bus-status-list').html(templateRenderBus(data));
            $('#bt-status-list').html(templateRenderBt(data));
            $('#bt-status-list-aux').html(templateRenderBt(data));
            $('#lirr-status-list').html(templateRenderLirr(data));
            $('#lirr-status-list-aux').html(templateRenderLirr(data));
            $('#metro-status-list').html(templateRenderMetro(data));
            $('#metro-status-list-aux').html(templateRenderMetro(data));
        });
    },

    subNavItems: function (item) {
        var self = this;
        var id = $(item).attr('id');

        if (!$(item).hasClass('active')) {
            if ($(item).hasClass('groupuno')) {
                // Hide open panels
                $('.service-container .scroll').hide();

                // Remove active class
                $('.service-container .sub-nav a').removeClass('active');
            }

            if ($(item).hasClass('groupdos')) {
                // Hide open panels
                $('.service-container-aux .scroll').hide();

                // Remove active class
                $('.service-container-aux .sub-nav a').removeClass('active');
            }

            // Set new active item
            $(item).addClass('active');

            // Open active panel
            switch (id) {
            case 'bus-service':
                $('#transit-bus').show();
                break;

            case 'subway-service':
                $('#transit-subway').show();
                break;

            case 'rail-service':
                $('#transit-rail').show();
                break;

            case 'railaux-service':
                $('#transit-railaux').show();
                break;

            case 'bt-service':
                $('#transit-bt').show();
                break;

            case 'btaux-service':
                $('#transit-btaux').show();
                break;
            }
        }
    },

    navItems: function (item) {
        var self = this;
        var id = $(item).attr('id');

        if (!$(item).hasClass('active')) {
            $(item).addClass('active');

            switch (id) {
            case "navServiceStatus":
                self.service.slideDown("fast");
                self.service.removeClass('closed');
                break;

            case "navHolidays":
                self.holidays.slideDown("fast");
                self.service.removeClass('closed');
                break;

            case "navNotify":
                self.notify.slideDown("fast");
                self.notify.removeClass('closed');
                break;
            }
        } else {
            $(item).removeClass('active');

            switch (id) {
            case "navServiceStatus":
                self.service.slideUp("fast");
                self.service.addClass('closed');
                break;

            case "navHolidays":
                self.holidays.slideUp("fast");
                self.holidays.addClass('closed');
                break;

            case "navNotify":
                self.notify.slideUp("fast");
                self.notify.addClass('closed');
                break;
            }
        }
    },

    changeDay: function (btn) {
        var self = this;

        var c_day = parseInt(self.day.html(), 10),
            c_month = parseInt(self.hiddenMonth.val(), 10),
            c_year = parseInt(self.hiddenYear.val(), 10),
            num_days_month = self.daysInMonth(c_month, c_year),
            days_last_month = '';

        if ($(btn).hasClass('next')) {
            nextday = c_day + 1;

            if (nextday > num_days_month) {
                nextday = 1;
                if (c_month == 11) {
                    c_month = 0;
                    c_year = c_year + 1;
                } else {
                    c_month += 1;
                }
            }
        } else {
            nextday = c_day - 1;
            if (nextday == 0) {
                // Get num days previous month
                if (c_month == 0) {
                    nextday = 31;
                    c_month = 11;
                    c_year = c_year - 1;
                } else {
                    nextday = self.daysInMonth(c_month - 1, c_year);
                    c_month = c_month - 1;
                }
            }
        }

        if (nextday < 10) {
            nextday = "0" + nextday;
        }

        // Date array for data parse
        var parseDate = {
            day: nextday,
            month: c_month + 1,
            year: c_year
        }

        // Set display date
        self.month.html(self.months_array[c_month]);
        self.day.html(nextday);

        // Set hidden
        self.hiddenMonth.val(c_month);
        self.hiddenYear.val(c_year);

        // Reload display
        self.reloadStatusPanel(parseDate);
    },

    daysInMonth: function (m, y) {
        switch (m) {
        case 1:
            return (y % 4 == 0 && y % 100) || y % 400 == 0 ? 29 : 28;
            break;

        case 8:
        case 3:
        case 5:
        case 10:
            return 30;
            break;

        default:
            return 31;
            break
        }
    },

    parseSelectedDay: function (date) {
        var self = this,
            hiddenMonth = hiddenYear = displayMonth = displayDay = '';

            var datepart = date.split(" ");

            var months = {
                Jan: 1,
                Feb: 2,
                Mar: 3,
                Apr: 4,
                May: 5,
                Jun: 6,
                Jul: 7,
                Aug: 8,
                Sep: 9,
                Oct: 10,
                Nov: 11,
                Dec: 12
            };

            // Set hidden vars
            hiddenMonth = (months[datepart[0]] - 1);
            hiddenYear = datepart[2];

            // Set display date
            displayMonth = datepart[0].toUpperCase();
            displayDay = datepart[1].replace(/,/g, '').toUpperCase();

            // Date array for data parse
            var parseDate = {
                day: datepart[1].replace(/,/g, ''),
                month: months[datepart[0]],
                year: datepart[2]
            }
			
			var parseDate = new Date(parseDate.month + "/" + parseDate.day + "/" + parseDate.year);


        // Set hidden
        self.hiddenMonth.val(hiddenMonth);
        self.hiddenYear.val(hiddenYear);

        // Set display date
        self.month.html(displayMonth);
        self.day.html(displayDay);

        // Reload display
        self.reloadStatusPanel(parseDate);
    },

    reloadStatusPanel: function (parseDate) {
        var self = this;

        // Hide Status Panel
        self.statusPanel.addClass('hidden');

        /*if (self.pageId == '.module-homepage-hero') {
            $('#status-panel-mini').addClass('hidden');
        }*/

        // Show loader
        self.statusLoader.show();

        // Parse data feed
        self.getDatafeedStatus("datepicker", parseDate);

    },

    resizeElements: function () {
        var self = this;

        // Reset panels
        if ($(window).width() > 767 && (self.pageId !== '.module-homepage-hero')) {
            // deactivate nav links
            self.panelItems.removeClass('active');

            // close notify-container
            if (self.notify.hasClass('closed')) {
                self.notify.css('display', 'block');
                self.notify.removeClass('closed');
            }
            // close holidays-container
            if (self.holidays.hasClass('closed')) {
                self.holidays.css('display', 'block');
                self.holidays.removeClass('closed');
            }
            // close service-container
            if (self.service.hasClass('closed')) {
                self.service.css('display', 'block');
                self.service.removeClass('closed');
            }
        } else {
            if (self.pageId !== '.module-homepage-hero') {
                // Remove block style
                if (!$('#navServiceStatus').hasClass('active')) {
                    self.service.removeAttr('style');
                }

                if (!$('#navHolidays').hasClass('active')) {
                    self.holidays.removeAttr('style');
                }

                if (!$('#navNotify').hasClass('active')) {
                    self.notify.removeAttr('style');
                }
            }
        }
    },

    bindEvents: function () {

        var self = this;

        // Datepicker
        var datepickerFrom = new NYC.DatePicker({
            el: $("#btnDatePicker"),
            onSelect: function (date) {
                self.parseSelectedDay(date);
            }
        });

        if (self.statusMini) {
            // Datapicker Home/index page
            var datepickerFromMini = new NYC.DatePicker({
                el: $("#btnDatePickerMini"),
                onSelect: function (date) {
                    $('#status-panel-mini').addClass('hidden');
                    self.parseSelectedDay(date);
                }
            });
        }

        self.calBtns.on('click', function (e) {
            e.preventDefault();
            self.changeDay(this);
        })

        // Get today
        var now = new Date();

        // Set page date
        if (!self.iOS) {
            var date = self.btnDatePicker.val().split(" "),
                day = date[1].replace(/,/g, '').toUpperCase();

            if (day.length == 1)
                day = "0" + day;

            self.month.html(date[0].toUpperCase());
            self.day.html(day);
        } else {
            day = now.getDate(),
            month = now.getMonth();

            if (day < 10)
                day = "0" + day;

            self.month.html(self.months_array[month]);
            self.day.html(day);
        }

        // Set hidden vals
        self.hiddenMonth.val(now.getMonth());
        self.hiddenYear.val(now.getFullYear());

        // Sub nav (transit panels)
        self.subnavItem.click(function (e) {
            e.preventDefault();
            self.subNavItems(this);
        });

        // Panel open / close 
        self.panelItems.click(function (e) {
            e.preventDefault();
            if ($(window).width() < 768) {
                self.navItems(this);
            }
        });

        // Resize on page load
        self.resizeElements();

        // Carousel activation
        $(window).smartresize(function () {
            self.resizeElements();
        });
    }

});