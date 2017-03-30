var NYC = NYC || {};

/**
 * Class NYC.Datepicker
 *
 */
NYC.DatePicker = Class.extend({

    iOS : ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false ),

    init : function init(options, elem) {

        console.log("init calendar");

        this.options = $.extend({}, this.options, options); 
      
        this.render();
        this.bindEvents();
    },

    options : {},

    render : function() {

        var self = this;

        // Set calendar type
       /* if (self.iOS) 
		{
            self.options.el.attr('type', 'date').val('mm/dd/yyyy');

            self.options.el.on("change", function(e) {
                var iosdate = $(this).val();
				console.log("ios capture date: " + iosdate);				
				var idate = new Date(iosdate +'T00:00:00-04:00');
				var new_iosdate = (idate.getMonth() + 1) + '/' + idate.getDate() + '/' +  idate.getFullYear();
				console.log("api formated date: " + new_iosdate);

				self.options.onSelect(new_iosdate);
            });
        } 
		else 
		{*/
            self.options.el.datepicker({
                dateFormat : "M dd, yy",
                showOtherMonths: true,
                firstDay:0,
                selectOtherMonths: true,
                onSelect: function(date) {
                    self.options.onSelect(date);
                }
            });

            $.datepicker.setDefaults( $.datepicker.regional["en-GB"]);

            if ( self.options.useDefaultText != undefined ) 
			{
                self.options.el.val("Select a Date");
            } 
			else 
			{
                self.options.el.val(self.getCurrentDate(0));
            }
        //}
    },

    getCurrentDate : function(range) {

        var self = this;

        var m_names = new Array("January", "February", "March", 
          "April", "May", "June", "July", "August", "September", 
          "October", "November", "December");

        var now = new Date(),
          day = now.getDate()+range,
          today = '';

        /*if (self.iOS) {
          month = (now.getMonth() + 1);
          
          if (month < 10)
            month = "0" + month;

          if (day < 10)
            day = "0" + day;

		  month = (m_names[now.getMonth()]).slice(0, 3);
          //today = now.getFullYear() + '-' + month + '-' + day;
          today = month +' '+ day + ', '+ now.getFullYear();
		  console.log("ios date: " + today);
        } else {*/
          month = (m_names[now.getMonth()]).slice(0, 3);
          today = month +' '+ day + ', '+ now.getFullYear();
  		//}

        return today;
    },
	
	validateRange : function(toDate, fromDate) {
	
		var t = new Date(toDate),
			f = new Date(fromDate),
			range = (t <= f) ? true : false;
		
		return range;
	},
	
    bindEvents : function() {

        var self = this;
        var datePickerContainer = self.options.el.closest(".datepicker-container");

        datePickerContainer.on("click", function(e) {

            if ( $(e.target).hasClass("ico-date") ) {
                self.options.el.focus();
            }
        });
		
		datePickerContainer.on("change", function(e) {
			if( $(this).val() == "" ) {
				self.options.el.val("Select a Date");
			}
		});
    }
});
