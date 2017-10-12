// -------------------------------------------
// This file is for website menu blocks
//   It is needed for the display on published sites
//   This only works for single menus.  Will need to be changed for menu widgets
// -------------------------------------------

var _iv_menu_globals = {
  open_sub_menus:      [],
  current_menu_item:   null,
  current_parent_menu: null,
  hide_timeouts:       [],
  prev_window_width:   0
};

// wait until the DOM is ready before creating objects
jQuery(document).ready(function() {
  // all menu and menuwidget widgets should have menu_util objects
  jQuery('div.b_menu').iv_menu_util({ globals: _iv_menu_globals });
  jQuery('div.b_menuwidget').iv_menu_util({ globals: _iv_menu_globals });
});

// Helper function used by the dimensions and offset modules
function num(elem, prop) {
  return elem[0] && parseInt( jQuery.css(elem[0], prop, true), 10 ) || 0;
}

function _on_responsive_resize() {
  var $res_menu = jQuery('#__res_main_nav_label'); // responsive menu label

  if ($res_menu && $res_menu.length == 1 && _iv_menu_globals.prev_window_width != jQuery(window).width()) {
    jQuery('ul li ul', $res_menu.parent()).hide();
    jQuery('input[type="checkbox"]:checked', $res_menu.parent()).prop('checked', false);
  }
}

function _init_responsive_menu() {
  var $res_menu = jQuery('#__res_main_nav_label'); // responsive menu label

  _iv_menu_globals.prev_window_width = jQuery(window).width();

  if ($res_menu && $res_menu.length == 1) {
    jQuery(window).unbind('resize', _on_responsive_resize).resize(_on_responsive_resize);

    var clear_styles = function($obj) {
      $obj.parent().find('ul').removeAttr('style');
      $obj.parent().find('ul li').removeAttr('style');
      $obj.parent().find('ul li a').removeAttr('style');
    };

    $res_menu.unbind().click(function() { clear_styles(jQuery(this)); });

    jQuery('.res_main_nav_label_child', $res_menu.parent()).unbind().click(function() {
      clear_styles(jQuery(this));
    });
  }
}

function _show_sub_menu(menu, parent_menu) {
  var widget_div = (jQuery(menu).parents('.b_menu')[0])
                    ?jQuery(menu).parents('.b_menu')[0]
                    :jQuery(menu).parents('.b_menuwidget')[0];
  jQuery(widget_div).iv_menu_util_show_sub_menu(menu, parent_menu);
}

function _hide_sub_menus(now) {
  jQuery('div.b_menu').each(function() {
    jQuery(this).iv_menu_util_hide_sub_menus({
      now: now
    });
  });
  jQuery('div.b_menuwidget').each(function() {
    jQuery(this).iv_menu_util_hide_sub_menus({
      now: now
    });
  });
}
