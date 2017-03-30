var NYC = NYC || {};

/**
 * Class NYC.Booker
 *
 * Modified by C.James 7/31/2014 to remove duplicate calls to content api & add webtrends tagging on services
 * Modified by David Sinner (WT) 9/8/2014 to update webtrends multitrack calls to set diff dcsid for 311 minibooker pages on nyc.gov
 * Modified by D. Jung 3/3/16 to use correct jquery selector after new html structure for 311 subheader component.
 *
 */
NYC.Booker = Class.extend({
	
	//Define mobile device type	
	iOS : ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false ),
	droid : ( navigator.userAgent.match(/(Android|android)/i) ? true : false ),

    init: function init(options, jqElem) {

        this.options = $.extend({}, this.options, options);

        // module element
        this.element = jqElem;

        // functionality flags
        this.isMobile = window.orientation || Modernizr.touch;
        this.isIE8 = ($('.lt-ie9').length > 0 && $('.lt-ie8').length < 1) ? true : false;
        this.isIE7 = ($('.lt-ie8').length > 0) ? true : false;
        //this.isYellowBooker = this.element.hasClass('module-three-one-one-menu-yellow'); Old style
        this.isYellowBooker=document.location.href.indexOf("/311/index.page")>-1; // to get the height slide to work

        // path constants
        this.rootServiceUrl = '/311_contentapi/services/';
        this.rootDataExtension = '.json';
        this.captchaPublicKey = "6LcmfNESAAAAADLfXuprBbgteVnCruh8RAVC3hO7";
		this.bookerJSON = "/311_contentapi/booker.json";

        // cached jquery objects
        this.bookerLinksContainer = this.element.find('#booker-links'); //YELLOW COLUMN OF LINKS
        this.bookerLinks = this.bookerLinksContainer.find('a.button-link-arrow'); //LINKS IN YELLOW COLUMN
        
        this.booker = this.element.find('#booker'); //CONTAINER FOR CONTENT, SLIDES OPEN/CLOSED
        this.booker.data('origRowHeight', this.booker.closest('div.row').outerHeight()); // for expanding/contracting module on yellow menu page
        this.bookerSectionContainers = this.booker.find('div.request-container'); //DIVS TO HOLD EACH TOPIC
        this.loader = this.booker.find('div.loader'); //ajax loader gif
        this.tmplGetAddressInfo = "";
        this.tmplSecondaryMenu = "";
        this.tmplServiceRequest = "";
        this.captchaContainer = $(".captcha-container");
        this.app_key = "120637279206F6620";
        this.api_url = ""; //"http://csgeo-dev-web.csc.nycnet";

        // animation speed constant
        this.transitionSpeed = 400;
        this.timer;
		

        //stringify json in templates for adding to data-services...
        Handlebars.registerHelper('json', function (context) {
            return JSON.stringify(context);
        });
		

		// format service request date
		Handlebars.registerHelper('parse_service_request_date', function(date) {
			var output = "";
				
			var date = new Date(date  + 1000*3600);
			output = dateFormat(date, 'shortDate')
			return new Handlebars.SafeString(output);
		});
		
		
		this.initGetAddressInfoHelpers();
		this.setBookerUrls();
        this.loadJSTemplate();
        this.bindEvents();
        //alert('init passed bindEvents');

        //set error fields
        this.setErrorFields();
        console.log('Done init fn');
		
    },
	
	setBookerUrls: function() {
		var self = this;
				
		$("#booker-links a").each(function(index) {
			if($(this).data("targetid")&& $(this).data("targetid") == "download_311_app"){
				if (self.iOS) {
					$(this).attr("href", "https://itunes.apple.com/us/app/nyc-311/id324897619?mt=8");
					$(this).addClass("exitlink")
				}else if (self.droid){
					$(this).attr("href", "https://play.google.com/store/apps/details?id=gov.nyc.doitt.ThreeOneOne");
					$(this).addClass("exitlink")
				} else {					
				$(this).attr("href", "/nyc-resources/service/5460/311-mobile-app");
				}
			}else if($(this).data("targetid")&& $(this).data("targetid") != "") {
				$(this).attr("href", "/311/minibooker.page#" + $(this).data("targetid"));
			}
		});
		
	},
	
	initGetAddressInfoHelpers: function() {

		//get address info helpers
		Handlebars.registerHelper('parse_precinct', function (precinct) {
			var output = '';
			
			if( precinct != "") {
				output = "Precinct " + precinct;
			}
			
			return new Handlebars.SafeString(output);
		});
		
		Handlebars.registerHelper('parse_borough', function (boroughCode) {
			var output = '';
			
			switch(boroughCode) {
				case "2":
					output = "Bronx";
					break;
				case "3": 
					output = "Brooklyn";
					break;
				case "1":
					output = "Manhattan";
					break;
				case "4":
					output = "Queens";
					break;
				case "5":
					output = "Staten Island";
					break;	
			}

			return new Handlebars.SafeString(output);
		});
		
		Handlebars.registerHelper('parse_sanitation',function(pickup){
			return new Handlebars.SafeString(NYC311Utils.expandSanitationCode(pickup));
		});
		Handlebars.registerHelper('parse_routing',function(district, section){
return("Routing time data: District="+district+" &amp; section="+section);
		});
	},

    setErrorFields: function () {

        var self = this;
        var error = $('<div class="error hidden"></div>');

        //check status
        var requestContainer = $("#check_status");
		
		error.insertBefore( requestContainer.find("#booker-check-status-request-number") );
		error.insertBefore( requestContainer.find('button[type="submit"]') );
		//requestContainer.find("#booker-check-status-request-number").prepend(error);
        //requestContainer.find('button[type="submit"]').prepend(error);

    },
	
    //load js template
    loadJSTemplate: function () {

        var self = this;

        var jsTemplate = new NYC.LoadJSTemplate({
            url: "/assets/home/js/templates/three-one-one-menu/secondary-menu.js",
            success: function (data) {
                var data = data.responseText;
                self.tmplSecondaryMenu = data;
            }
        });

        var jsTemplate = new NYC.LoadJSTemplate({
            url: "/assets/home/js/templates/three-one-one-menu/get-address-info.js",
            success: function (data) {
                var data = data.responseText;
                self.tmplGetAddressInfo = data;
            }
        });

        var jsTemplate = new NYC.LoadJSTemplate({
            url: "/assets/home/js/templates/three-one-one-menu/service-request.js",
            success: function (data) {
                var data = data.responseText;
                self.tmplServiceRequest = data;
            }
        });
    },

    options: {},

    // request json to populate left column of booker panel
    getBookerLeftColContentData: function (target) {
        var self = this;
        var data;
        // data is cached on the element (target)
        // no need to load > once
        if (target.data('content')) {
            self.openBooker(target);
        } else {

            var jsonUrl = self.bookerJSON;
            
            $.getJSON(jsonUrl, function (e) {
                data = e[0];
                dataContentUrl = target.data("contenturl");

                //find matching topic_id inside the json
                $.each(e, function (key, val) {
                    var obj = val;

                    if (obj.topic_id == dataContentUrl) {
                        data = obj;
                        return;
                    }
                });

                target.data('content', data);
                self.renderBookerLeftColContent(target);
            });
        }
    }, // getBookerLeftColContentData

    // populate left column of booker panel
    renderBookerLeftColContent: function (target) {
        //alert('renderBookerLeftColContent');
        var self = this;
        var data = target.data('content');

        var helpers = function () {
            Handlebars.registerHelper('format_id', function (id) {
                if (id == "") return;
                return id.replace(".", "");
            });
        }();

        var leftCol = $('#' + target.data('targetid')).find('div.left-col div.content');

        if (data.topics && data.topics.length > 0) {
            var html = "";
            for (i = 0; i < data.topics.length; i++) {
                var hasSubTopics = false;
                var services = '';

                // if the option should show subtopics (secondary select elements)
                if (data.topics[i].topics && data.topics[i].topics.length > 0) {
                    hasSubTopics = true;
                    var selectSource = self.tmplSecondaryMenu;
                    var selectTemplate = Handlebars.compile(selectSource);
                    leftCol.find('form').append(selectTemplate(data.topics[i]));
                }
                // if the option should call services
                if (data.topics[i].services && data.topics[i].services.length > 0) {
                    services = JSON.stringify(data.topics[i].services);
                }

                // generate the options for the select element
                var topicID = data.topics[i].id.replace(".", "");
                html += ' <option id="option-' + topicID + '" value="" data-subtopics="' + hasSubTopics + '" data-services=\'' + services + '\'>' + data.topics[i].label + '</option>';
            }
            leftCol.find('select.primary').append(html);
        }
        self.openBooker(target);
    }, // renderBookerLeftColContent

    getRightColServices: function (target) {
        var self = this;
        var services = target.data('services');
        var requestCount = 0;
        var responses = [];
        // hide the CTA, show the loader
        self.bookerSectionContainers.filter('.active').find('div.right-col h5.booker-cta').addClass('hidden');
        self.loader.show();
        requestJson();

        // handle multiple json requests per option
        function requestJson() {
            console.log('json: ', self.rootServiceUrl + services[requestCount].service_id + self.rootDataExtension);


            $.ajax({
                url: self.rootServiceUrl + services[requestCount].service_id + self.rootDataExtension,
                type: "GET",
                dataType: 'json'
            }).done(function (e) {

                var data = e[0];
                responses.push(data);
                if (requestCount < services.length - 1) {
                    requestCount++;
                    requestJson();
                } else {
                    self.loader.hide();
                    self.renderRightColServices(target, responses);
                }
            }).error(function (jqXHR, textStatus, errorThrown) {

                console.log("-------------- error --------------");
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                var contentContainer = self.bookerSectionContainers.find('div.right-col div.content');

                self.loader.hide();
				
				contentContainer.find('h5.booker-cta').addClass('hidden');
				contentContainer.find('h5.booker-error').removeClass('hidden');
				contentContainer.find('h5.booker-error').text('Server error. Please try again later.');
            });

            //removed - causing duplicate calls to be made
            /*$.getJSON(self.rootServiceUrl + services[requestCount].service_id + self.rootDataExtension, function (e) {
                var data = e[0];
                responses.push(data);
                if (requestCount < services.length - 1) {
                    requestCount++;
                    requestJson();
                } else {
                    self.loader.hide();
                    self.renderRightColServices(target, responses);
                }
            });*/
        }
    }, // getRightColServices

    renderRightColServices: function (target, data) {
        var self = this;
        // console.log('renderRightColServices: ', 'target: ', target, 'data: ', data);
        var contentContainer = self.bookerSectionContainers.filter('.active').find('div.right-col div.content');
        var html = '';
        // render multiple responses
		var i = 0;
		
            html += '<div id="response-' + data[i].id + '" class="response">';
            html += ' <em>' + data[i].service_name + '</em>';
            html += ' <hr class="module-divider summary-divider" />';
            html += ' ' + data[i].description_html;
            // LINKS
            if (data[i].web_actions && data[i].web_actions.length > 0) {
                html += ' <ul class="web_actions">';
                for (var j = 0; j < data[i].web_actions.length; j++) {
                    html += '   <li>';
                    if (data[i].web_actions[j].url !== '') {
                        html += '   <a href="' + data[i].web_actions[j].url + '">' + data[i].web_actions[j].label + '</a>';
                    } else {
                        html += '   <p class="richtext">' + data[i].web_actions[j].label + '</p>';
                    }
                    html += '   </li>';
                }
                html += ' </ul> <!-- /.web_actions -->';
            }
            // RELATED SERVICES
            if (data[i].services && data[i].services.length > 0) {
                html += ' <ul class="faq">';
                html += '   <li><h6><label class="small-label">You May Also Be Interested In</label></h6></li>';
                for (var j = 0; j < data[i].services.length; j++) {
                    html += '   <li>';
                    html += '   <a href="/nyc-resources/service/' + data[i].services[j].simple_id + '/svc">' + data[i].services[j].service_name + '</a>';
                    html += '   </li>';
                }
                html += ' </ul> <!-- /.svcs -->';
            }
            // FAQ
            if (data[i].faqs && data[i].faqs.length > 0) {
                html += ' <ul class="faq">';
                html += '   <li><h6><label class="small-label">Related Faqs</label></h6></li>';
                for (var j = 0; j < data[i].faqs.length; j++) {
                    html += '   <li>';
                    if (data[i].faqs[j].url !== '') {
                        html += '   <a href="/nyc-resources/faq/' + data[i].faqs[j].simple_id + '/faq">' + data[i].faqs[j].question + '</a>';
                    } else {
                        html += '   <strong>' + data[i].faqs[j].question + '</strong>';
                    }
                    html += '   </li>';
                }
                html += ' </ul> <!-- /.faqs -->';
            }
            
            html += '</div> <!-- /#response-' + data[i].id + ' -->';

            //Added in logic for webtrends tracking of when services are rendered
            var url_friendly_name = data[i].service_name.toLowerCase();
            url_friendly_name = url_friendly_name.replace(/\s/g,"-");
            url_friendly_name = '/' + url_friendly_name.replace(/[^a-zA-Z0-9\-]/g, '');
            data[i].url = data[i].url.replace(/\/service$/, url_friendly_name);
            // dcsMultiTrack("WT.ti","311 Booker: " + data[i].service_name,"DCS.dcsuri","/booker/service"+ data[i].url,"DCSext.s_311_sid", data[i].id, "DCSext.serviceName", data[i].service_name);
	    // Updated to send to 311 dcsid
			var dcsid_val="abcdefghijklmnopqrstuvwxyz0123";
			if (on_nyc_gov) {
				dcsid_val = "dcswcfico00000s9aoilr1pxj_4w3r";
			} else if (on_test_nyc_gov) {
				dcsid_val = "dcso2qd9f00000g8hrwwtc44o_8h1s";
			}
            Webtrends.multiTrack({
            argsa: ["WT.ti","311 Booker: " + data[i].service_name,"DCS.dcsuri","/booker/service"+ data[i].url,"DCSext.s_311_sid", data[i].id, "DCSext.serviceName", data[i].service_name,"WT.dl", "0", "DCSext.goog_trans", ""],
            transform:function(d,o){Webtrends.dcsidSave = d.dcsid;d.dcsid=dcsid_val},
            finish:function(d,o){d.dcsid = Webtrends.dcsidSave}
        });

        //}

        contentContainer
            .html('')
            .html(html)
            .removeClass('hidden')
            .scrollTop(0)
            .closest('div.right-col')
            .addClass('active populated')
            .find('h5.booker-cta')
            .addClass('hidden');
    }, // renderRightColServices

    bindEvents: function () {
        //alert('in BindEvents fn');
        var self = this;
        var win = $(window);

        self.bookerLinksContainer.on('click', 'a.button-link-arrow', function (e) {
			// yellow buttons menu
            var target = $(e.currentTarget);
            //Added in logic for webtrends tracking of when user clicks on buttons
			if (target.data("targetid") && target.data("targetid") !== "make_a_complaint" && target.data("targetid") !== "make_a_payment") {
				var greg_friendly_name = target.data("targetid").replace(/_/g," ");
                // dcsMultiTrack("WT.ti","311 Booker: " + greg_friendly_name, "DCS.dcsuri","/booker/" + target.data("targetid"), "DCSext.s_311_sid", "", "DCSext.serviceName", "");
		// Updated to send to 311 dcsid
		var dcsid_val="abcdefghijklmnopqrstuvwxyz0123";
		if (on_nyc_gov) {
			dcsid_val = "dcswcfico00000s9aoilr1pxj_4w3r";
		} else if (on_test_nyc_gov) {
			dcsid_val = "dcso2qd9f00000g8hrwwtc44o_8h1s";
		}
		Webtrends.multiTrack({
            argsa: ["WT.ti","311 Booker: " + greg_friendly_name, "DCS.dcsuri","/booker/" + target.data("targetid"), "DCSext.s_311_sid", "", "DCSext.serviceName", "", "WT.dl", "0", "DCSext.goog_trans", ""],
            transform:function(d,o){Webtrends.dcsidSave = d.dcsid;d.dcsid=dcsid_val},
            finish:function(d,o){d.dcsid = Webtrends.dcsidSave}
        });
            }
            // only work on tablet landscape and up sized screens
            if ((target.data("targetid") && target.data("targetid") !== "download_311_app")&&(self.isIE8 === false && Modernizr.mq('(max-width: 959px)') === false) || (self.isIE8 === true && win.innerWidth() > 959)) {
                self.stepBack();

                // if there's dynamic content for the left column
                if (target.data("contenturl") && target.data("contenturl") !== "" && !target.hasClass("exitlink")) {
                    e.preventDefault();
                    self.getBookerLeftColContentData(target);
                } else if (target.data("targetid") && target.data("targetid") !== "") {
                    e.preventDefault();
                    self.openBooker(target);
                }
            }
            // otherwise just use the href to call the minibooker
            //alert('out bindEvents fn');
        });


        // close button
        self.booker.on('click', 'a.close-button', function (e) {
            e.preventDefault();
            // if an article or other content is present in right-col, 
            // act like "back" button, show previous content
            if (self.bookerSectionContainers.filter('.active').find('div.right-col').hasClass('active')) {
                self.stepBack();
            } else {
                // otherwise, close the booker
                self.closeBooker();
            }
        });

        // primary selects
        self.booker.on('change', 'select.primary', function (e) {
            var target = $(e.currentTarget).find(':selected');
            // escape if option is disabled
            if (target.attr('disabled') == 'disabled') {
                return false;
            }

            var targetForm = target.closest('form');
            // hide any visible secondary elements
            targetForm.find('.secondary').hide();
            self.resetArticle();
            // reset secondary selects to default values
            var selects = targetForm.find('select.secondary');
            if (selects.length > 0) {
                for (var i = 0; i < selects.length; i++) {
                    selects[i].selectedIndex = 0;
                }
            };
            // end point, load content

            if (target.data('services') && target.data('services') !== '') {
                self.getRightColServices(target);
            } else {
                // get appropriate secondary elements with id
                var secondary = targetForm.find('select[data-id="select-' + target.attr('id') + '"]');
                // don't show secondary label if there's no relevant form input
                if (secondary.length > 0) {
                    // show label
                    targetForm.find('label.secondary[data-id="select-' + target.attr('id') + '"]').show();
                    // find secondary select with data-type that matches primary select's value
                    secondary.show();
                }
            }
        });




        // secondary selects
        self.booker.on('change', 'select.secondary', function (e) {
            var target = $(e.currentTarget).find(':selected');
            // escape if option is disabled
            if (target.attr('disabled') == 'disabled') {
                return false;
            }
            // console.log(target.data('services'));
            if (target.data('services') && target.data('services') !== '') {
                self.getRightColServices(target);
            }
        });



        // Get Address Info form submit
        self.booker.on('submit', 'form#booker-address-form', function (e) {
            e.preventDefault();
            var target = $(e.currentTarget);
            var formData = target.serialize();
            var formDataObj = target.serializeArray();
            var numberField = target.find('#booker-address-form-number');
            var streetField = target.find('#booker-address-form-street');
			
			//in case the suggested dropdown is visible use the suggested address
			if( !target.find(".booker-address-select-suggested").hasClass("hidden") ) {
				streetField = target.find(".booker-address-select-suggested");
				target.find('#booker-address-form-street').val(streetField.val());
			}
			
            var boroughSelect = target.find('#booker-address-form-borough');
			
			//hide suggested address dropdown
			$(".booker-address-label-suggested").addClass("hidden");
			$(".booker-address-select-suggested").addClass("hidden");
			
			var boroughCode = 0;
		
			switch(boroughSelect.val()) {
				case "Bronx":
					boroughCode = 2;
					break;
				case "Brooklyn": 
					boroughCode = 3;
					break;
				case "Manhattan":
					boroughCode = 1;
					break;
				case "Queens":
					boroughCode = 4;
					break;
				case "Staten Island":
					boroughCode = 5;
					break;	
			}
			
			//geosupportReturnCode
            //check if both fields are completed
            if ((numberField.val() && numberField.val().trim() !== '') && (streetField.val() && streetField.val().trim() !== '') && (boroughSelect.val() && boroughSelect.val().trim() !== '')) {
                $.ajax({
                    url: self.api_url + "/nycproxy/geoclient/v1/address.json.htm?houseNumber=" + numberField.val() + "&street=" + streetField.val() + "&borough=" + boroughCode + "&app_id=311booker&app_key=" + self.app_key,
                    dataType: 'json'
                }).done(function (e) {
					var data = e;
					//multiple addresses found / show suggested address dropdown
					if( data.address.geosupportReturnCode == "EE" ) {
						var numberOfStreetCodesAndNamesInList = parseInt(data.address.numberOfStreetCodesAndNamesInList, 10);;

						var options = "";
						for(var i = 1; i <= numberOfStreetCodesAndNamesInList; i++ ) {
							var street = "streetName" + i;
							options += '<option value="' + data.address[street] + '">' + data.address[street] + '</option>';
						}
						
						$(".booker-address-select-suggested").html(options).removeClass("hidden");
						$(".booker-address-label-suggested").removeClass("hidden");
						
						return;
					
					}else if(parseInt(data.address.geosupportReturnCode)>1){
						var contentContainer = self.bookerSectionContainers.filter('.active').find('div.right-col div.content');
						contentContainer.html('');
                    	contentContainer.html("<h6>"+data.address.houseNumber+" "+data.address.firstStreetNameNormalized+", "+data.address.firstBoroughName+"</h6><br><b style='color:#cc0000;'>"+data.address.message+"</b>").removeClass('hidden');
						contentContainer.closest('div.right-col').addClass('active').find('h5.booker-cta').addClass('hidden');
					}else{
	                    //add form name/values to data obj
	                    for (var i = 0; i < formDataObj.length; i++) {
	                        data[formDataObj[i].name] = formDataObj[i].value;
	                    }
	                    $.ajax({
					       url:"/apps/311utils/routingTime?district="+data.address.sanitationDistrict+"&section="+data.address.sanitationCollectionSchedulingSectionAndSubsection,
					       type:"GET",
					       dataType: "json"
	       
	                    }).done(function (e){
		                    $.extend(true,data,e);
							console.log("---- output ----");
							console.log(data);
							
		
		                    var contentContainer = self.bookerSectionContainers.filter('.active').find('div.right-col div.content');
		                    var source = self.tmplGetAddressInfo;
		                    var template = Handlebars.compile(source);
		                    // clear content
		                    contentContainer.html('');
		                    // populate template and show it
		                    contentContainer
		                        .html(template(data))
		                        .removeClass('hidden');
		                    // hide CTA
		                    contentContainer
		                        .closest('div.right-col')
		                        .addClass('active')
		                        .find('h5.booker-cta')
		                        .addClass('hidden');
	                    }).error(function (xhr, status, errorThrown) {
		                    console.log(xhr);
		                    console.log(status);
		                    console.log(errorThrown);
		                });
					}
                }).error(function (xhr, status, errorThrown) {
                    console.log(xhr);
                    console.log(status);
                    console.log(errorThrown);
                });
            } else {
                // prevent form submit if either field is empty
                return false;
            }
        });


        //Check Status
        self.booker.on('click', 'form#check-status-form button.submit', function (e) {
            e.preventDefault();

            //self.validateCaptcha();
            self.getServiceRequestStatus();

        });
        self.booker.on('click', 'form#check-status-form button.reset', function (e) {
			//Recaptcha.reload();
	        $(".request-container .left-col .error").addClass("hidden");
	        $("#sr_error").html("").hide();
			self.bookerSectionContainers.filter('.active').find('div.right-col div.content').html("<h6>Check the status of an existing 311 Service Request</h6>");
        });

        //window resizing
        win.smartresize(function () {
            if (self.booker.find('div.request-container.active').length > 0) {
                if ((self.isIE8 === false && Modernizr.mq('(max-width: 959px)')) || (self.isIE8 === true && win.innerWidth() < 959)) { //mobile size
                    if (self.isYellowBooker) {
                        self.booker.closest('div.row').css('height', 'auto');
                        self.booker.data({
                            'origRowHeight': self.booker.closest('div.row').outerHeight()
                        });
                    }
                    // to trigger close booker
                    self.booker.find('a.close-button').trigger('click');
                }
            }
        });

    }, //bindEvents

    /*validateCaptcha: function () {

        var self = this;
        var contentContainer = self.bookerSectionContainers.filter('.active').find('div.right-col div.content');
        var challengeToken = Recaptcha.get_challenge();;
        var userAnswer = Recaptcha.get_response();
        var publicKey = self.captchaPublicKey;
        var debug = true;
        var errorCode = "";
		
		$(".request-container .left-col .error").addClass('hidden');

        $.ajax({
            url: "/apps/doittcaptchaservice/doittCaptchaService",
            type: "POST",
            data: {
                challenge_token: challengeToken,
                user_answer: userAnswer,
                public_key: publicKey,
                dataType: 'json',
                json: true
            }
        }).done(function (response) {
            Recaptcha.reload();
            //var response = $.parseJSON(response);

            if (response.captchaResult == "true") {
                console.log("inside true");
                self.getServiceRequestStatus();
            } else {
                console.log("----- captcha error ------");
                console.log(response);

                if (debug) {
                    errorCode = response.errorCode;
                }
				
				contentContainer.find('h5.booker-cta').addClass('hidden');

				var errorMessage = "";
                if (response.errorCode == "incorrect-captcha-sol") {
                    errorMessage = "CAPTCHA answer is incorrect.";
                } else if (response.errorCode == "captcha-not-reachable") {
                    errorMessage = "CAPTCHA Service unavailable. Please try again later.";
                } else if (response.errorCode == "invalid-token") {
                    errorMessage = "Invalid token. Please try again later.";
                } else {
                    errorMessage = "System error. Please try again later.";
                }
				
				$(".request-container .left-col .error").removeClass('hidden').addClass("red_error").text(errorMessage);
				
				contentContainer.find('h5.booker-cta').addClass('hidden');
				contentContainer.find('h5.booker-error').removeClass('hidden');
				contentContainer.find('h5.booker-error').text(errorMessage + ' ' + errorCode);
            }

        }).error(function (jqXHR, textStatus, errorThrown) {
            Recaptcha.reload();
	        console.log("----- captcha service down ------");
            console.log(textStatus);
			
			contentContainer.find('h5.booker-cta').addClass('hidden');
			contentContainer.find('h5.booker-error').removeClass('hidden');
			contentContainer.find('h5.booker-error').text('System error. Please try again later.');
        });

    },*/

    getServiceRequestStatus: function () {

        var self = this;
        var contentContainer = self.bookerSectionContainers.filter('.active').find('div.right-col div.content');
        var serviceRequestNumber = $("#booker-check-status-request-number");
        var ERROR = "Unable to check your status. Please try again later.";
		var recaptchaResponse=$("#g-recaptcha-response").val();
		var hasErrors=false;

        if (serviceRequestNumber.val() == "") {
            $("#sr_error").html("Service Request number is required.").show();
            hasErrors=true;
        }else{
            $("#sr_error").html("").hide();
        }
        if(recaptchaResponse==""){
            $("#captcha_error").html("Check the box").show();
            hasErrors=true;
        }else{
            $("#captcha_error").html("").hide();
        }
        if(hasErrors){
	        return;
        }

        $.ajax({
            url: "/apps/311api/srlookup/",
            type:"POST",
            data: {
	            serviceRequestNumber: serviceRequestNumber.val(),
	            "g-recaptcha-response": recaptchaResponse
	        },
            dataType: 'json'
        }).done(function (data) {
			//var data=$.parseJSON(response);
            if (data.error != undefined) {
               contentContainer.html("<b>Status for this Service Request is not available</b><br><br>Please check the number and re-enter it. It may take up to 24 hours for the status of new requests to become available.");
            }else{
	            var source = self.tmplServiceRequest;
	            var template = Handlebars.compile(source);
	            var theText='<h6>Service Request #'+data.threeOneOneSRLookupResponse[0].serviceRequestNumber+'</h6>';
	            for(var i=0;i<data.threeOneOneSRLookupResponse.length;i++){
		            theText=theText+template(data.threeOneOneSRLookupResponse[i]);
		            if(i<data.threeOneOneSRLookupResponse.length-1){
			            theText=theText+'<hr>';
		            }
	            }
	            // clear content
	            contentContainer.html('');
	            // populate template and show it
	            contentContainer.html(theText);
	        }
        }).error(function (jqXHR, textStatus, errorThrown) {
            console.log("----- service request error ------");
            console.log(jqXHR);

            var response = $.parseJSON(jqXHR.responseText);

            contentContainer.find('h5.booker-cta').addClass('hidden');
			contentContainer.find('h5.booker-error').removeClass('hidden');
			contentContainer.find('h5.booker-error').text(response.error.errorMessage);

        });

    },

    resetForm: function () {
        //find visible form
        var targetForm = this.bookerSectionContainers.filter('.active').find('form');
        if (targetForm.length > 0) {
            //reset form values
            targetForm.find('select, input').val('');
            //reset all selects to default values
            var selects = targetForm.find('select');
            if (selects.length > 0) {
                for (var i = 0; i < selects.length; i++) {
                    selects[i].selectedIndex = 0;
                }
            };
            //hide secondary elements
            targetForm.find('label.secondary, select.secondary, input.secondary').hide();
        }
    }, // resetForm

    resetArticle: function () {
        var targetArticle = this.bookerSectionContainers.filter('.active').find('div.right-col').not('.prepopulated');
        if (targetArticle.length > 0) {
            //clear content, hide container
            targetArticle
                .removeClass('active populated')
                .find('div.content')
                .html('').scrollTop(0).addClass('hidden');
            //show CTA
            targetArticle.find('h5.booker-cta').removeClass('hidden');
        }
    }, // resetArticle

    stepBack: function () {
        var self = this;
        self.resetForm();
        self.resetArticle();
    }, // stepBack

    openBooker: function (target) {
        //alert('in openBooker fn');
        var self = this;
        var isAlreadyOpen = (self.booker.find('div.request-container.active').length > 0) ? true : false;
        //reinitialize active form
        self.resetForm();
        //un-highlight other active button
        self.bookerLinks.removeClass('active');
        //highlight clicked button
        target.addClass('active');
        // remove reference to previously active section
        self.bookerSectionContainers.removeClass('active');
        //to be safe, hide all booker sections
        self.bookerSectionContainers.hide();
        //activate requested booker
        self.booker
            .find($('#' + target.data('targetid')))
            .show().addClass('active');

        //skip this if the booker is already active
        if (isAlreadyOpen === false) {
            if (!self.isIE7) {
                //slide booker open
                self.booker.show()
                    .animate({
                        'left': '0px'
                    }, self.transitionSpeed);
            } else {
                //IE7 needs to slide a little bit further...
                self.booker.show()
                    .animate({
                        'left': '17px'
                    }, self.transitionSpeed);
            }

            if (self.isYellowBooker) {
                // height of the booker on the 311 homepage needs to adjust vertically
                var bookerHeight = self.booker.height();
                var origHeight = self.booker.closest('div.row').outerHeight();
                var newHeight = origHeight + ((bookerHeight + self.booker.position().top) - origHeight);
               self.booker.data({
                    'origRowHeight': origHeight,
                    'expandedRowHeight': newHeight
                });
                if (newHeight > origHeight) {
                    self.booker.closest('div.row')
                        .animate({
                            'height': newHeight
                        }, self.transitionSpeed, function () {
                            self.element.find('#top-requests-header, #top-requests-links').css('visibility', 'hidden');
                        });
                } else {
                    self.timer = window.setTimeout(function () {
                        self.element.find('#top-requests-header, #top-requests-links').css('visibility', 'hidden');
                        clearTimeout(self.timer);
                    }, self.transitionSpeed);
                }
                self.bookerLinksContainer.css('height', bookerHeight);
            }
        } // end isAlreadyOpen
    }, // openBooker

    closeBooker: function () {
        var self = this;
        clearTimeout(self.timer); //make sure visibility timer is cleared
        //slide booker closed
        self.booker.animate({
            'left': '-100%'
        }, self.transitionSpeed, function () {
            //hide booker and active section in booker
            self.booker.hide()
                .find('div.request-container.active')
                .hide().removeClass('active');
            //un-hilight button
            self.bookerLinks.removeClass('active');
            self.stepBack();

            if (self.isYellowBooker) {
                //reset height of container
                self.booker.closest('div.row')
                    .animate({
                        'height': self.booker.data('origRowHeight')
                    }, (self.transitionSpeed / 2), function () {
                        self.bookerLinksContainer.css('height', 'auto');
                        $(this).css('height', 'auto');
                    });
            }
        });
        if (self.isYellowBooker) {
            self.timer = window.setTimeout(function () {
                self.element.find('#top-requests-header, #top-requests-links').css('visibility', 'visible');
                clearTimeout(self.timer);
            }, self.transitionSpeed / 2.5);
        }
    } // closeBooker

});