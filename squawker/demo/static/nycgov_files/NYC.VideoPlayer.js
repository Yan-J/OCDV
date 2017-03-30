var NYC = NYC || {};

/**
 * Class NYC.VideoPlayer
 *
 */
NYC.VideoPlayer = Class.extend({

    self   : this,
    player : {},

    init : function init(options, elem) {
        console.log("init video player");
		
		this.isMobile = window.orientation || Modernizr.touch;
        this.options = $.extend({}, this.options, options);

        this.bindEvents();
    },

    options : {},

    playYouTube : function(videoId) {
        var self = this, 
			width = height = '';
		
		if ( ! this.isMobile)
		{
			width = '720px',
			height = '480px';
		}
		else
		{
			if ($(document).width() < 768) {
				width = '300',
				height = '200';
			}
			else {
				width = '720',
				height = '480';
			}
		}
		
		// Launch Colorbox 
		$.colorbox({ 
			html:function() {
	          return '<div class="youtube-player-container"></div>'; 
	        },
			innerWidth: width, 
			innerHeight: height, 
			iframe: false, 
			transition: "none",
			fixed: false,
			onComplete:function() {
				var $player = $(".youtube-player-container").tubeplayer({
					width: width,
					height: height,
					autoPlay: true,
					allowFullScreen: "true", // true by default, allow user to go full screen
					swfobjectURL: "http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js",
					loadSWFObject: true, // if you include swfobject, set to false
					initialVideo: videoId, // the video that is loaded into the player
					preferredQuality: "default",// preferred quality: default, small, medium, large, hd720
					onPlay: function(id){}, // after the play method is called
					onPause: function(){}, // after the pause method is called
					onStop: function(){}, // after the player is stopped
					onSeek: function(time){}, // after the video has been seeked to a defined point
					onMute: function(){}, // after the player is muted
					onUnMute: function(){} // after the player is unmuted
		        });
			}
		});
    },

    playEmbeddedVideo : function(embedCode) {

		var self = this, 
			width = height = '';
		
		if ( ! this.isMobile) {
			width = '720px',
			height = '480px';
		}
		else {
			if ($(document).width() < 768) {
				width = '300',
				height = '200';
			}
			else {
				width = '720',
				height = '480';
			}
		}

		// Launch Colorbox 
		$.colorbox({ 
			html:function() {
	          return '<div class="youtube-player-container"></div>'; 
	        },
			innerWidth: width, 
			innerHeight: height, 
			iframe: false, 
			transition: "none",
			fixed: false,
			onComplete:function() {
				var videoContainer = $(".youtube-player-container");

				videoContainer.html(embedCode);
				videoContainer.find("iframe").attr("width", width);
				videoContainer.find("iframe").attr("height", height);			
			}
		});


    },
	
    bindEvents : function() {
        var self = this;
		
		// Overflow hooks for colorbox
		$(document).bind('cbox_open', function () {
			$('body').css({ overflow: 'hidden' });
		}).bind('cbox_closed', function () {
			$('body').css({ overflow: 'auto' });
		});
		
		$(".ico-play").on("click", function(e) 
		{
console.log("video player click")
            e.preventDefault();
			
			var videoId = $(this).data("video-id");
			var videoUrl = $(this).data("video-url");

			if( videoId == "" ) {
				//extract video id from youtube url
				if( videoUrl.indexOf("youtube") != -1 ) {
					var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
					var match = videoUrl.match(regExp);
					if (match&&match[2].length==11){
					    videoId = match[2];
					} else{
					    console.log("invalid youtube url");
					}

					if (videoId !== '' && videoId !== undefined ) {
						self.playYouTube(videoId);
					}
				}

			var videoUrl = "<iframe name 'nyctvondemand' src='" + videoUrl + "' width='640' height='360' frameborder='0' scrolling='no'></iframe>";
			self.playEmbeddedVideo(videoUrl);



			}
			
		});
    }

});
