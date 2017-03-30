var NYC = NYC || {};

/**
 * Class NYC.LoadJSTemplate
 *
 */
NYC.LoadJSTemplate = Class.extend({

    init : function init(options, elem) {

        console.log("init load js template");

        this.options = $.extend({}, this.options, options); 
        this.load();
    },

    options : {},

    
    load : function() { 
        var self = this;

        $.ajax({
            url: self.options.url,
            context: document.body,
            dataType: 'text/x-handlebars-template'
        }).done(function(data) {
            self.options.success(data);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            self.options.success(jqXHR, textStatus, errorThrown);
        });
    }

});



