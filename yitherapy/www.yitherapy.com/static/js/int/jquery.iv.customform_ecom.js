(function($) {
  var iv_cf_widgets = $('div[block_type="customform"]');
  for (var i=0; i < iv_cf_widgets.length; i++) {
    var iv_cf = $(iv_cf_widgets[i]).children('iv');
    var $div = $(iv_cf_widgets[i]);
    var data = iv_cf.attr('data');
    var block_id = iv_cf.attr('block_id');
    $.ajax({
      type: 'POST',
      url: '/public/customform/js_view', 
      data: {__data: data, __block_id: block_id}, 
      success: function (html) {
        var div = $("<div></div>");
        div.attr('type', 'iv').attr('data', iv_cf.attr('data')).attr('block_id', block_id);
        $div.append(div);
        div.html(html);
      },
      async: false
    });
  }
})(jQuery);
