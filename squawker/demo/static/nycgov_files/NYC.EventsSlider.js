var NYC = NYC || {};

/**
 * Class NYC.Slider
 *
 * Events Slider
 */
NYC.EventsSlider = Class.extend({

    self : this,
    eventsSlides : {},
    slideContent : {},
    scrollPane   : {},
    infoShare        : {},
    moduleEvents : {},
    windowSizeHasChanged : false,
    resizeCounter : 0,

    init : function init(options, elem) {

        console.log("init events slider class");
        
        this.options = $.extend({}, this.options, options); 
        this.render();
        this.resize();
        this.bindEvents();
      
    },
    
    options : {
        el      : "#events-slider",
        close   : { 
            el : ".slider-close",
            animate : ""
        },
        show : {
            animate : ""
        },
        slideTo : 0
    },

    render : function render() {

        var self = this;

        self.eventsSlider  = $(self.options.el);
        self.eventsSlides  = self.eventsSlider.find(".slides");
        self.slideContent  = self.eventsSlider.find(".slide-content");
        self.scrollPane    = self.slideContent.find(".scroll-pane");
        self.moduleEvents  = $(".module-events");

        //init carousel
        self.eventsSlides.carouFredSel({
            infinite  : true,
            swipe     : true,
            items     : 1,
            auto    : false,
            prev  : { 
                button  : self.eventsSlider.find(".slider-prev"),
                key   : "left",
                onAfter : function(n) {
                    
                    //get current slide and set link category to active
                    var currentSlide = $(n.items.visible).data("slide");
                    $(".module-events-categories a").removeClass("active");
                    $(".module-events-categories").find("a[data-slide='" + currentSlide + "']").addClass("active");

                    
                    self.infoShare = new NYC.InfoShare();
                    // ReInit share buttons
                    self.infoShare.reInit();

                    
                }
            },
            next  : { 
                button  : self.eventsSlider.find(".slider-next"),
                key   : "right",
                onAfter : function(n) {
                    
                    //get current slide and set link category to active
                    var currentSlide = $(n.items.visible).data("slide");

                    $(".module-events-categories a").removeClass("active");
                    $(".module-events-categories").find("a[data-slide='" + currentSlide + "']").addClass("active");
                    
                }
            }
        });
    },

    /* recalculate event slider sizes */
    resize: function resize() {

        var self = this;
        var moduleEvents = self.moduleEvents;
        var imgLargeHeight = moduleEvents.find(".featured-event-large img").height();
        var imgLargeWidth = moduleEvents.find(".featured-event-large img").width();
        var eventsSliderActive = $(".events-slider.active");

        eventsSliderActive.find(".featured-image img").height(imgLargeHeight).width(imgLargeWidth);
        eventsSliderActive.find(".slide-hero-image").height(imgLargeHeight).width(imgLargeWidth);
      
        $(".caroufredsel_wrapper").height(460).width(940);
        $(".slides").height(460).width(10000);

        eventsSliderActive.find(".slide-content").width(moduleEvents.width() - imgLargeWidth - 40).height(imgLargeHeight - 40);
        eventsSliderActive.find(".scroll-pane").width(moduleEvents.width() - imgLargeWidth - 40).height(imgLargeHeight - 40);
        
    },

    /* bind event slider events */
    bindEvents: function() {
      
        var self = this;
        
        $(self.options.el).find(self.options.close.el).on("click", function(e) {
            e.preventDefault();

            self.hide($(this));
        });

        $(window).smartresize(function(e) {
            if( $(window).width() < 960 ) {
                self.eventsSlider.removeClass("active");
            }
        }, 100);
        
    },

    slideTo: function slideTo(slide) {

        var self = this;
        eventsSlides.trigger("slideTo", slide);

    },

    /* on click show slide detail info */
    show: function show(opts) {

        var self = this;

        if( self.options.show.animate == "slideDown") {
            if( !$(self.options.el).hasClass("active") ) {
                $(self.options.el).addClass("active");
                $(self.options.el).animate({
                    height:460
                }, "fast", function() {
                    $("#events-slider-content-bottom .slider-close").show();
                });

            }
        } else {
            $(self.options.el).addClass("active");//.show();
        }

        if( opts != undefined && !isNaN(opts.slide) ) self.eventsSlides.trigger( 'slideTo', [ opts.slide, 0, true, { fx: 'none' } ] );
     
    },

    /* hide event slider */
    hide: function(obj) {

        var slider = obj.parent().parent().attr("id");
    
        var self = this;
        $(self.options.el).removeClass("active");

        if( slider == "events-slider-content-bottom") {
            $(".module-events-categories a").removeClass("active");
            $("#events-slider-content-bottom").height(0);
            $("#events-slider-content-bottom .slider-close").hide();
        }
    }

});
