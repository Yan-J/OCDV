var NYC = NYC || {};

/**
 * Class NYC.FirstVisitAlert
 *
 */
NYC.FirstVisitAlert = Class.extend({

  init : function init(options, elem) {

    console.log("init FirstVisitAlert");

    this.options = $.extend({}, this.options, options); 

    this.isIE7 = ( $('.lt-ie8').length > 0 ) ? true : false;

    this.module = $('div.module-first-visit-alert');

	// Remove to allow banner to stay - VS - 5-13-16
/*    if( NYC.Global.prototype.cookieManager.readCookie('firstVisit') ) {
      // if cookie exists, user has seen first visit alert
      // update to prolong lifespan of cookie
      NYC.Global.prototype.cookieManager.createCookie('firstVisit', true, 1000);
      return false;
    }
    else {
      // show the banner
      var self = this;
      if(self.isIE7 === false)  {
        this.module
          .css({ 'height': 1 }).addClass('active')
          .animate({ 'height': 51 }, 300, function() { self.module.css({ 'height': 'auto' }); });
      }
      else {
        this.module
          .css({ 'height': 1 }).addClass('active')
          .animate({ 'height': 21 }, 300, function() { self.module.css({ 'height': 'auto' }); });
      }

      this.bindEvents();
    }*/
	 var self = this;
      if(self.isIE7 === false)  {
        this.module
          .css({ 'height': 1 }).addClass('active')
          .animate({ 'height': 51 }, 300, function() { self.module.css({ 'height': 'auto' }); });
      }
      else {
        this.module
          .css({ 'height': 1 }).addClass('active')
          .animate({ 'height': 21 }, 300, function() { self.module.css({ 'height': 'auto' }); });
      }

      this.bindEvents();	
  },

  options : {},


  bindEvents : function() {
    var self = this;
    self.module.on('click', 'a.close-button', function(e) {
      e.preventDefault();
      // create the cookie
      NYC.Global.prototype.cookieManager.createCookie('firstVisit', true, 1000);
      // close the banner
      self.module.animate({ 'height': 1 }, 300, function() { self.module.removeClass('active'); });
    });

    //update the bg color based on the hero carousel on homepage
    $.subscribe("hero-color-change", function(e, color) {
	    console.log(color);
      self.module.css({'background-color': self.colorLuminance(color, -0.2) });
      self.module.closest('div.row.first-visit-alert-row').css({'background-color': self.colorLuminance(color, -0.2) });
    });
  },


  // from http://www.sitepoint.com/javascript-generate-lighter-darker-color/
  colorLuminance : function(hex, lum) {
    // validate hex string
    var hex = String(hex).replace(/[^0-9a-f]/gi, '');
    // convert 3 digit hex to 6 digit
    if (hex.length < 6) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    // luminosity +/- percentage
    var lum = lum || 0;
    // convert to decimal and change luminosity
    var rgb = "#"; 
    var c = 0; 
    var i = 0;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i*2,2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00"+c).substr(c.length);
    }
    return rgb;
  }

     
});
