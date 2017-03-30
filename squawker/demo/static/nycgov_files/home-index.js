var NYC = NYC || {};
NYC.Home = {};

/**
* Home Index
*
*/
NYC.Home.Index = (function() {

  var self = this;

  self.init = function init() {
    var self = this;
    self.initModules();
    $("a.main-filter-category").each(function(){
		if($(this).height()>54){
			$(this).css("line-height","16.5px");
		}
	});
  },

  self.initModules = function() {
	  //Add VideoPlayer
	  var videoPlayer= new NYC.VideoPlayer();

    var localEvents = new NYC.FindLocalEvents({
      el : "#module-find-local-events"
    }); 

    //hero slideshow module
    var heroSlideshow = new NYC.HeroSlideshow({
        el : ".module-homepage-hero",
        colorTransition : true
    });

    // Status Update Module
    var statusUpdate = new NYC.StatusUpdate({
		el : ".module-homepage-hero",
		"status" : true
    });

    // 311 Booker
    var Booker = new NYC.Booker(
      {}, 
      $('div.module-three-one-one-menu')
    );
  }

  return self;
}());

$(document).ready(function(){
  NYC.Home.Index.init(); 
});



