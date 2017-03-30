var NYC = NYC || {};

/**
 * Class NYC.FindLocalEvents
 *
 * FindLocalEvents
 */
NYC.FindLocalEvents = Class.extend({

    self : this,
    eventMap : {},
    eventsData : {},
    markers : [],
    timefilter : '',
    eventsDetails : {},
    eventsDetailsScrollPane : {},
    eventsDetailRichtext: {},
    infoWindow : {},
    findLocalEventsModule : $(".module-find-local-events"),
    togglefilter : $(".toggle-event-filter"),
    templateData : "",
    eventsDetailTemplate : "",

    init : function(options, elem) {

        var self = this;
        this.options = $.extend({}, this.options, options);
        $("#event-map").html('<img src="/assets/home/images/content/events/NYC-5boros.png" />');

        self.loadJSTemplate();
    },
      
    options : {},

    initModule : function() {

        var self = this;

        self.eventsDetails         = self.findLocalEventsModule.find(".events-detail");
        self.scrollPane            = self.eventsDetails.find(".scroll-pane");
        self.eventsDetailRichtext  = self.eventsDetails.find(".richtext");
        //self.renderMap("ROUTE");
        self.initCustomFormFields();
        self.bindEvents();
		
		// format extended date information
		Handlebars.registerHelper('parse_extended_date', function(extendedDate) {
			var output = "";
				
			if( extendedDate != "" && extendedDate != undefined ) {
				output = '<p class="extended-date">' + extendedDate + '</p>';
			}
				
			return new Handlebars.SafeString(output);
		});

    },

    //load js template
    loadJSTemplate : function() {

        var self = this;
        
        var jsTemplate = new NYC.LoadJSTemplate({
            url: "/assets/home/js/templates/find-local-events.js",
            success : function(data) {
	            if( data == undefined ) return;
                
                var data = data.responseText;

                self.templateData = data;
                self.initModule();
            }
        });

        var jsTemplate = new NYC.LoadJSTemplate({
            url: "/assets/home/js/templates/find-local-events-details.js",
            success : function(data) {
	            
	            var data = data.responseText;
                self.eventsDetailTemplate = data;
            }
        });

    },

    /*renderMap : function(mapType) {

        var self = this;

        switch(mapType) {
            case "ROUTE" :
              var mapTypeId = google.maps.MapTypeId.ROADMAP;
              break;
            case "SATELLITE" :
              var mapTypeId = google.maps.MapTypeId.SATELLITE;
              break;
            case "TERRAIN" :
              var mapTypeId = google.maps.MapTypeId.SATELLITE;
              break;
            default:
              var mapTypeId = google.maps.MapTypeId.ROADMAP;
        }

        var mapOptions = {
            center: new google.maps.LatLng(40.714623, -74.006605),
            zoom: 14,
            disableDefaultUI: true,
            streetViewControl: false,
            zoomControl: true,
            scaleControl: true,
            scrollwheel: false,
            zoomControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            },
            overviewMapControl: false,
            mapTypeId: mapTypeId
        };

        self.infowindow = new google.maps.InfoWindow();
          
        self.eventMap = new google.maps.Map(document.getElementById('event-map'), mapOptions);

    },*/

    initCustomFormFields : function() {

        var self = this;

        self.renderCustomFormFields();  
        
    },

    renderCustomFormFields : function() {

        $('.select-neighborhood').customSelect();
        $('.select-category').customSelect();
    },

    /*renderMarker : function(data, index) {
        
        var self = this;
		var pngIndex = index;
		pngIndex++;
        var markerIcon = "/assets/home/images/global/google-maps-markers/blue/" + pngIndex + ".png";

        var position = new google.maps.LatLng(data.geometry[0].lat, data.geometry[0].lng);

        var marker = new google.maps.Marker({
            icon: markerIcon,
            position: position,
            map: self.eventMap,
            title: data.name,
            href: data.permalink,
            index : index
        });

        //center map around first marker
        if( index == 0 ) self.eventMap.setCenter(position);

        //store markers for later reuse
        self.markers.push(marker);

        //marker hover states
        google.maps.event.addListener(marker, 'mouseover', function(e) {

			var markerIndex = marker.index;
			markerIndex++;
            var markerIconHover = "/assets/home/images/global/google-maps-markers/black/" + markerIndex + ".png";
            marker.setIcon(markerIconHover);
			
			if( $(e.target).selector == "" ) {
				$(".events-list ul li").eq(marker.index).addClass("hover");
			}
        });

        //marker on mouseout state
        google.maps.event.addListener(marker, 'mouseout', function(e) {
 
			var markerIndex = marker.index;
			markerIndex++;
            var markerIconHover = "/assets/home/images/global/google-maps-markers/blue/" + markerIndex + ".png";
            marker.setIcon(markerIconHover);
			
			if( $(e.target).selector == "" ) {
				$(".events-list ul li").eq(marker.index).removeClass("hover");
			}
        });

        var content = "";

        google.maps.event.addListener(marker, 'click', function() {

            if( marker.title != "" ) {
           
                if( marker.href != "" ) {
                    content = '<a href="' + marker.href + '"><strong>' + marker.title + '</strong></a>';
                } else {
                    content = "<strong>" + marker.title + "</strong>";
                }
                
                self.infowindow.setContent(content); 
                self.infowindow.setPosition(marker.position);
                self.infowindow.open(self.eventMap); 

            }
        });
        
    },
	
	removeMarkers: function() {
	
		var self = this;
		
		for( i = 0; i < self.markers.length; i++ ) {
			self.markers[i].setMap(null);
		}
	
	},

    highlightMarker: function(index, e) {

        var self = this;
		
		if(self.markers&& self.markers.length > 0&&self.markers[index] ) {
        	var marker = self.markers[index];
			google.maps.event.trigger(marker, 'mouseover', e);
		}
    },

    unhighlightMarker: function(index, e) {

        var self = this;
		
		if( self.markers&&self.markers.length > 0 && self.markers[index] ) {
        	var marker = self.markers[index];
			google.maps.event.trigger(marker, 'mouseout', e);
		}
    },*/

    closeEventsDetails : function() {

        var self = this;

        self.eventsDetails
            .removeClass("active")
            .css({
            "left" : 140 + "px"
        });

        self.findLocalEventsModule.find(".events-list li.selected").removeClass("selected");

    },

    showEventsDetails : function(data) {

        var self                 = this;
        var eventsMap            = $(".events-map");
        var eventsMapPosition    = eventsMap.position();
        var eventsDetail         = $(".events-detail");

        self.eventsDetails.height(eventsMap.height() + 1);
        self.eventsDetails.width(eventsMap.width() + 1);

        var helpers = function() {
      
            var markerItemIndex = 0;
            var eventItemIndex = 0;
 
            /*Handlebars.registerHelper('marker_location', function(location) {
                if(!location|| location.length == 0 ) return;
                return new Handlebars.SafeString(location[0].lat + "," + location[0].lng);
            });*/
        
        }();

        
        self.eventsDetails.addClass("active");
        self.eventsDetails.css({ "top" : eventsMapPosition.top + "px" });
        
        var source = self.eventsDetailTemplate; //$("#find-local-events-details-template").html();
        var template = Handlebars.compile(source);    
        eventsDetail.find(".richtext").html(template(data));

        //if lng and lat is missing don't render google maps
        /*if(!data.geometry|| data.geometry.length == 0) {
            eventsDetail.find(".google-static-map").hide();
        } else {
            eventsDetail.find(".google-static-map").show();
        }*/
        
        if( $(".events-detail .richtext").height() < 370 ) {
            self.scrollPane.addClass("edge-border");
            eventsDetail.find(".close-events-detail").addClass("edge-border");
        } else {
            self.scrollPane.removeClass("edge-border");
            eventsDetail.find(".close-events-detail").removeClass("edge-border");
        }

        self.eventsDetails.animate({
            "left" : eventsMapPosition.left + "px"
        }, "easeIn", function() {
			self.share=new NYC.InfoShare({}, self.findLocalEventsModule.find("div.event-detail"));
			self.share.reInit();
        });

    },

    filterData : function(data) {

        var self = this;
        var values = $( "#time-slider" ).slider( "values" );
        var searchData = $(".form-find-local-events").serialize();
        self.findLocalEventsModule.find(".btn-view-all").removeClass("active");
        self.findLocalEventsModule.find(".events-loader").show();
		
/*		if( $("#search-date-from").val() != "Select a Date") {
			$(".time-slider-container").show();
		} else {
			$(".time-slider-container").hide();
		}*/
        if (data == 'load') { // on load default to no data
           searchData = 'FindLocalEvents';
        }

        self.eventsFilter.filter(searchData, "GET", function(result) {
            self.findLocalEventsModule.find(".events-loader").hide();
            self.parseData(result);     
        });
    
    },

    parseData : function(data) {

        var self = this;

        //store data for later reuse
        self.eventsData = data;

        //close event details window
        self.closeEventsDetails();

        //deselect selected even item
        self.findLocalEventsModule.find(".events-list li.selected").removeClass("selected");
        
        //self.removeMarkers();

        var helpers = function() {
        
            var markerItemIndex = 0;
            //var markerMapIndex = 0;
            var eventItemIndex = 0;

            Handlebars.registerHelper('marker_index', function() {
                markerItemIndex++;
                return new Handlebars.SafeString(markerItemIndex);
            });
			
			Handlebars.registerHelper('parse_desc', function(desc) {
			
				desc = $.trim(desc);
				//create object and escape string
				var o = { data : '"' + desc + '"' };
				
				output =  $.parseJSON(o.data);


				return new Handlebars.SafeString(output);
            });

			// format event date
			Handlebars.registerHelper('format_date', function(startDate, endDate, timePart, allDay)
			{
			
				var output = "";
				
				if( startDate !== undefined  ) {
					var startDate = startDate.split("T");
					startDate = startDate[0];
					startDate = startDate.replace(/-/g,"/");
				}
				
				if( endDate !== undefined  ) {
					var endDate = endDate.split("T");
					endDate = endDate[0];
					endDate = endDate.replace(/-/g,"/");
					if(timePart.indexOf(dateFormat(endDate, 'mediumDateNoYear'))>-1){
						endDate="";
					}
				}
				
				if( startDate !== undefined  ) {
					output += dateFormat(startDate, 'mediumDateNoYear');
				}	

				if( endDate != "" && endDate !== undefined ) {
					output += " - " + dateFormat(endDate, 'mediumDateNoYear');
				}
				
				if( startDate !== undefined && endDate !== undefined ) {
					if( dateFormat(startDate, 'shortDate') == dateFormat(endDate, 'shortDate') ) {
						output = dateFormat(startDate, 'mediumDateNoYear');
					}
				}
				
				if( timePart != "" && !allDay ) {
					output += ", " + timePart;
				}

				if( allDay ) {
					output += ", All Day Event";
				}
				
				output += "&nbsp;";

				return new Handlebars.SafeString(output);
			});
			

            Handlebars.registerHelper('each_with_index', function(items, options) {
              var output = '';

               //if events api down, items will be null.  Redirect to error page.
              if (items == null) {
				  output = '<li data-index="0" data-location="{marker_location data}" class="event-item clearfix"><div class="event-data"><strong>We&#39;re sorry!</strong><p>No events matched your selection.</p><p>Try broadening your selections or go to the <a class="link-show-all-events" href="/events/events-filter.html">full events list</a></p></div></li>';
                  
				  //reset markers
				  self.removeMarkers();
				  
				  return output;
              }

              var item_count = items.length;

              if (item_count == 0) {
					output = '<li data-index="0" data-location="{marker_location data}" class="event-item clearfix"><div class="event-data"><strong>We&#39;re sorry!</strong><p>No events matched your selection.</p><p>Try broadening your selections or go to the <a class="link-show-all-events" href="/events/events-filter.page">full events list</a></p></div></li>';
                  
					//reset markers
				  //self.removeMarkers();
				  
				  return output;
              }
              var item;

              for (var index = 0; index < item_count; index ++) {
                item = items[index];

                  output = output + options.fn({ item: item, index: index });
              }

              return output;
            });


            Handlebars.registerHelper('event_item_index', function() {    
                return new Handlebars.SafeString(eventItemIndex);
            });

            /*Handlebars.registerHelper('marker_location', function() {
                var item = data.items[markerMapIndex];

                //if lat and lng is not provided don't intialize google maps marker functionality
                if(!item.geometry|| item.geometry.length == 0 ) return;
                self.renderMarker(item, markerMapIndex);
				markerMapIndex++;
            });*/

        }();

        var source = self.templateData; //$("#find-local-events-template").html();
        var template = Handlebars.compile(source);    
        $(".module-find-local-events .events-list ul").html(template(data));

        //show only the first 5
        if( $(window).width() <= 480 ) {
	        
	        if( data.items == undefined ) return;
	        
            if( data.items.length > 4 ) {
                self.findLocalEventsModule.find(".events-list ul li:gt(4)").hide();
                self.findLocalEventsModule.find(".btn-view-all").addClass("active");
            } else {
                self.findLocalEventsModule.find(".events-list ul li").show();
                self.findLocalEventsModule.find(".btn-view-all").removeClass("active");
            }
        }
      
        //render data and reinit scrollbar
        if( $(window).width() > 767 ) {
            self.findLocalEventsModule.find(".events-list").find(".jspContainer").height($(".module-find-local-events").find(".events-list").height());
        }
		
		$(document).on("click", ".link-show-all-events", function(e) {
			e.stopPropagation();
			window.location.href = $(this).attr("href");
			return false;
		});

        self.findLocalEventsModule.find('.event-item').on({
            mouseenter : function(e) {
                var dataIndex = parseInt($(this).data("index"), 10);

                //self.highlightMarker(dataIndex, e);
            },
            mouseleave : function(e) {
                var dataIndex = parseInt($(this).data("index"), 10);

                //self.unhighlightMarker(dataIndex, e);
            },
            click : function(e) {
                var itemIndex = $(this).data("index");
                var eventDetailsData = self.eventsData.items[itemIndex];

                self.findLocalEventsModule.find(".events-list li.selected").removeClass("selected");
                $(this).addClass("selected");

                if( $(window).width() >= 768 && $(window).width() <= 959 ) {  
                    e.preventDefault();         
                    
                    if( $(".event-filters").is(':visible') ) {
                        self.findLocalEventsModule.find(".event-filters").removeClass("active");
                        self.findLocalEventsModule.find(".module-content").removeClass("active");
                        self.findLocalEventsModule.find(".events-detail").removeClass("active");
                        self.togglefilter.text("Show Filters");
                        self.togglefilter.removeClass("active");
                        self.findLocalEventsModule.removeClass("set-overflow");
                        self.showEventsDetails(eventDetailsData);
                    } else {
                        self.showEventsDetails(eventDetailsData);
                    }
                }

                if( $(window).width() > 959 ) {  
                    e.preventDefault();
                    self.showEventsDetails(eventDetailsData);
                }

            }
        });
    },

    bindEvents : function() {

        var self = this;

        self.eventsFilter = new NYC.EventsFilterFindLocalEvents({
            //url : "/events/api/json/search.htm"
              url : ""
        });

        self.infoShare = new NYC.InfoShare({}, self.findLocalEventsModule.find("div.event-detail"));
        // self.infoShare.reInit();

        var datepicker = new NYC.DatePicker({
            el     : $("#search-date-from"),
            useDefaultText : true,
            onSelect : function(date) {
                self.filterData();
            }
        });

        self.findLocalEventsModule.find(".select-neighborhood").change(function() {
            self.filterData();
        });

        self.findLocalEventsModule.find(".select-category").change(function() {
            self.filterData();
        });

        var timeSlider = new NYC.TimeSlider({
            el : $("#time-slider"),
            range : true,
            values: [ 10, 90 ],
            change: function( event, ui ) {
                self.timefilter = "&startTime=" + ui.values[0] + "&endTo=" + ui.values[1];
                self.filterData();
            }
        });

        //on page load get events data
        self.filterData('load');
      
        var eventsMap = $(".events-map");
        var btnFilter = self.togglefilter;
        var eventsDetail = self.findLocalEventsModule.find(".events-detail");

        $(window).smartresize(function(){  

            //adjust event details div
            var eventsMapPosition = eventsMap.position();

            eventsDetail.height(eventsMap.height()).width(eventsMap.width());        
            eventsDetail.css({ "left" : eventsMapPosition.left + "px", "top" : eventsMapPosition.top + "px" });
        
            //Tablet: Remove Scrollbars
            if( $(window).width() <= 767 ) {
                self.closeEventsDetails();
            } 

            //Tablet: On resize hide filters
            self.findLocalEventsModule.find(".module-content").removeClass("active");
            self.findLocalEventsModule.find(".event-filters").removeClass("active");


            //add right side border if no scrollbar is showing up
            if( self.eventsDetailRichtext.height() <= self.eventsDetails.height() ) {
                self.scrollPane.addClass("edge-border");
            } else {
                self.scrollPane.removeClass("edge-border");
            }

            if( $(window).width() >= 768 ) {
                btnFilter.text("Show Filters");
            }  

        });

        $(".close-events-detail").on("click", function(e) {
            e.preventDefault();
            self.closeEventsDetails();
        });

        self.findLocalEventsModule.find(".btn-view-all").on("click", function(e) {
            e.preventDefault();

            self.findLocalEventsModule.find(".events-list ul li:gt(4)").slideDown(
                function() {
                    self.findLocalEventsModule.find(".btn-view-all").removeClass("active");
            });
        });


        $(".toggle-event-filter, .btn-continue").on("click", function(e) {
            e.preventDefault();

            self.toggleFilter();
        });

    },

    toggleFilter : function() {

        var self = this;
        
        var btnFilter = $(".toggle-event-filter");

        if( btnFilter.text() == "Show Filters" ) {
            btnFilter.text("Hide Filters");
            self.findLocalEventsModule.addClass("set-overflow");
        } else {
            btnFilter.text("Show Filters");
            self.findLocalEventsModule.removeClass("set-overflow");
        }

        self.findLocalEventsModule.find(".module-content").toggleClass("active");
        self.findLocalEventsModule.find(".event-filters").toggleClass("active");
        self.findLocalEventsModule.find(".events-detail").removeClass("active");

    }

});
