var NYC = NYC || {};

var hero_img_width=820;
if(typeof hero_type =="undefined"){
	hero_type="";
}
if(hero_type.toLowerCase()=="nostatus"){
	hero_img_width=720;
	document.writeln('<style type="text/css">.module-homepage-hero .content-slider { width: 100%;} .module-homepage-hero .img-container { width: 76.75%;} .module-homepage-hero .richtext {width: 68.292682926829%;} .module-homepage-hero .module-stats {width: 23.25%;}</style>');
}else if(hero_type.toLowerCase()=="nosidebar"){
	hero_img_width=820;
	document.writeln('<style type="text/css">.module-homepage-hero .content-slider { width: 87.234042553191%; float:right;} .module-homepage-hero .img-container { width: 100%;} .module-homepage-hero .richtext {width: 68.292682926829%;} .module-homepage-hero .module-stats {width: 26.829268292683%;}</style>');
}else if(hero_type.toLowerCase()=="piconly"){
	hero_img_width=940;
	document.writeln('<style type="text/css">.module-homepage-hero .content-slider { width: 100%;} .module-homepage-hero .img-container { width: 100%;} .module-homepage-hero .richtext {width: 100%;} .module-homepage-hero .module-stats {width: 23.25%;}</style>');
}else{
	hero_img_width=820;
	document.writeln('<style type="text/css">.module-homepage-hero .content-slider { width: 87.234042553191%; float:right;} .module-homepage-hero .img-container { width: 73.170731707317%;} .module-homepage-hero .richtext {width: 68.292682926829%;} .module-homepage-hero .module-stats {width: 26.829268292683%;}</style>');
}
document.writeln('<style type="text/css">@media (max-width: 767px) { .module-homepage-hero .img-container { width: 100%;} .module-homepage-hero .richtext {width: 100%;} .module-homepage-hero .content-slider { width: 100%;} }</style>');

//document.writeln('<style type="text/css">@media (max-width: 767px) { .module-homepage-hero .img-container { width: 100%;} .module-homepage-hero .richtext {width: 100%;} .module-homepage-hero .content-slider { width: 100%;} }</style>';
/**
 * Class NYC.HomepageHero
 *
 */
NYC.HeroSlideshow = Class.extend({

    heroSlideshow : $(".slides"),
    currentSlide : 0,
    moduleHero : $(".module-homepage-hero"),

    init : function init(options, elem) {

        console.log("init hero slideshow");

		var self = this;
        this.options = $.extend({}, this.options, options); 
        $(".slide").each(function(){
	       	if($(this).find("a").attr("href")&&$(this).find("a").attr("href").length>0){
		       	$(this).addClass("pointerCursor");
	       	}
        });
        self.initRoyalSlider();

    },

    options : {},

    initRoyalSlider : function() {

        var self = this;

        self.moduleHero.show();

        //bind slider events
        $.extend($.rsProto, {
            _initGlobalCaption: function() {
                var rsi = this;
                
                    rsi.ev.on('rsAfterInit', function() {
                        self.bindEvents();
                    });
                    
            }
        });

        $.rsModules.royalSliderAfterInit = $.rsProto._initGlobalCaption;

        var mobileAllowCSS3 = false;
        
        if( Modernizr.mq('(max-width: 479px)') ) {
            mobileAllowCSS3 = true;
        }
		var autoPlay = true;
        if( self.moduleHero.data("autoplay") == "" || self.moduleHero.data("autoplay") == "false" ) {
            autoPlay = false;
        }


        var rsi = $('#content-slider').royalSlider({
            autoHeight: true,
            autoScaleSlider:false,
            arrowsNav: true,
            fadeinLoadedSlide: false,
            sliderDrag : false,
            controlNavigationSpacing: 0,
            controlNavigation: 'bullets',
            navigateByClick:false,
            imageScaleMode: 'none',
            allowCSS3 : mobileAllowCSS3,
            imageAlignCenter:false,
            addActiveClass: true,
            loop: true,
            video: {
              autoHideArrows:true,
              autoHideControlNav:false,
              autoHideBlocks: true
            },
            autoPlay: {
                enabled: false,
                pauseOnHover: true,
                delay:5000
            },
            loopRewind: false,
            numImagesToPreload: 3,
            keyboardNavEnabled: true,
            usePreloader: true,
            imgWidth: hero_img_width,
            imgHeight: 440
        }).data('royalSlider');

        //set bg and logo
        var activeSlide = $("#content-slider").find(".slide").eq(0);            
        if($(".slide").length==1){
	        $(".flex-direction-nav").hide();
        }
        if( self.options.colorTransition ) {
            $(".logo").addClass("logo-transparent").css("display", "block");
            $(".hero-highlighted").css("background-color", activeSlide.data("bg-color"));
            $(".nyc-logo").css("background-color", activeSlide.data("bg-color"));
			$(".nyc-logo-svg-embed").css("background-color", activeSlide.data("bg-color"));

            //publish slide color to alert module
            $.publish("hero-color-change", [ activeSlide.data("bg-color") ]);
        }

        rsi.ev.on('rsBeforeAnimStart', function(event) {

            if( $("html").hasClass("lt-ie9") ) {
                $(".slide").find(".richtext").hide();
            }

            if( self.options.colorTransition ) {
                var nextSlide = rsi.slides[rsi.currSlideId].content;
                
                $(".hero-highlighted").css("background-color", nextSlide.data("bg-color"));
                $(".nyc-logo").css("background-color", nextSlide.data("bg-color"));
				$(".nyc-logo-svg-embed").css("background-color", nextSlide.data("bg-color"));

                //publish slide color to alert module
                $.publish("hero-color-change", [ nextSlide.data("bg-color") ]);
            }

        });
		rsi.ev.on('rsAfterContentSet', function(e) {
console.log($(".rsPlayBtn"));
			$(".rsPlayBtn").click(function(e) {
				e.preventDefault();
				$(this).hide(); 
				var activeSlide = $(".rsActiveSlide");
				if( Modernizr.mq('(min-width: 768px)') ) {
					activeSlide.find(".richtext").fadeOut();
				}     
	        });
        });
        rsi.ev.on('rsSlideClick', function() {
			if($(".rsActiveSlide a")&&$(".rsActiveSlide a").attr("href")){
		        document.location.href=$(".rsActiveSlide a").attr("href");
	        }
        });

        if( $("html").hasClass("lt-ie9") ) {
            rsi.ev.on('rsAfterSlideChange', function(event) {
                $(".slide").find(".richtext").show();
            });
        }

        $('.slider-next').click(function(e) {
            e.preventDefault();
            rsi.next();

            var activeSlide = $(".rsActiveSlide");
            activeSlide.find(".richtext").show();
            $(".rsPlayBtn").show();   
        });
        
        $('.slider-prev').click(function(e) {
            e.preventDefault();
            rsi.prev();

            var activeSlide = $(".rsActiveSlide");
            activeSlide.find(".richtext").show();
            $(".rsPlayBtn").show();   
        });

		//mobile bullets
		var bullets = $(".rsBullets").addClass("visible-phone").detach();
		self.moduleHero.append(bullets);


    },

    bindEvents : function() {

        var self = this;

        $(window).smartresize(function() {  
            self.resizeRoyalSlider();
        });

        //don't resize with older IEs
        if( !$("html").hasClass("lt-ie9") ) {
            self.resizeRoyalSlider();
        }
        /*$(".rsPlayBtn").click(function(e) {
            e.preventDefault();
            $(this).hide(); 

            var activeSlide = $(".rsActiveSlide");
			if( Modernizr.mq('(min-width: 768px)') ) {
				activeSlide.find(".richtext").fadeOut();
            }     
        });*/

    },

    resizeRoyalSlider : function() {

		var self = this;
        var hero = $(".module-homepage-hero");
        var heroWidth = hero.width();
        var slide = hero.find(".slide");
            
        slide.each(function() {        
            if( Modernizr.mq('(max-width: 767px)') ) {
                if( !$(this).hasClass("slide-video") ) {
                    $(this).find(".richtext").width( $(this).find(".img-container").width() - 30 );
                } else {
                    $(this).find(".richtext").width( $(this).width() - 30 );
                }
            }

            if( Modernizr.mq('(min-width: 768px)') ) {
                if( !$(this).hasClass("slide-video") ) {
                    $(this).find(".richtext").width( $(this).find(".img-container").width() - 40 );
                } else {
                    $(this).find(".richtext").width( $(this).width() - 40 );
                }
            }
        });
    }

});
