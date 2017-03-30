var NYC = NYC || {};

/**
 * Class NYC.Status
 *
 */
NYC.Status = Class.extend({

    init: function init(options, elem) {

        console.log("init Status datafeed");
        this.options = $.extend({}, this.options, options);

    },

    getfeed: function (data, type, callback) {

        var self = this;
        var url = "/apps/311api/municipalservices/";

        if (data.startDate == "" && data.endDate == "") {
            console.log("Please provide a valid start or end date");
            return;
        }

        if (data.startDate != "") {
            url += "?startDate=" + data.startDate;
        }

        if (data.endDate != "") {
            url += "&endDate=" + data.endDate;
        }

        $.ajax({
            url: url,
            dataType: 'json',
            context: document.body
        }).done(function (result) {

            var data = {
                "status": result
            };

            callback(data);
        }).error(function (xhr, ajaxOptions, thrownError) {
            console.log("----- ERROR ----------");
            console.log(xhr.status);
            console.log(thrownError);

            var error = {
                xhr: xhr,
                ajaxOptions: ajaxOptions,
                thrownError: thrownError
            };

            var data = {
                "status": error
            };

            callback(data);


        });
    }
});