var NYC = NYC || {};

/**
 * Class NYC.TimeSlider
 *
 */
NYC.TimeSlider = Class.extend({

    init : function init(options, elem) {

        console.log("init time slider");

        this.options = $.extend({}, this.options, options); 
      
        this.render();
    },

    options : {},

    render : function() {

        var self = this;

        self.options.el.slider({
            range: true,
            /*values: [ 10, 90 ],
            step: 2.083, //convert 100 to 48 steps */
            values: [ 0, 23 ],
            step: 1,
            max: 23,
            change: function( event, ui ) {
                
                //set hidden input fields
                $(".time-slider-from").val(ui.values[0]);
                $(".time-slider-to").val(ui.values[1]);
                
                self.options.change(event, ui);
                console.log('TimeSlider Change: ', ui);
            }
        });

        self.options.el.after('<input type="hidden" name="timeFrom" class="time-slider-from" value=""/><input type="hidden" name="timeTo" class="time-slider-to" value=""/>');
    }

});



