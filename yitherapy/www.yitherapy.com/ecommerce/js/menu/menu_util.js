// -----------------------------------------------------------------------------
// Utility functions for menu & menuwidget widgets. This file is meant to be
// compatible with published sites as well as within the editor (i.e. this
// file is a way to share/re-use code for menu widgets on published sites or
// within the editor).
// -----------------------------------------------------------------------------
(function($) {
  if (!($.iv)) { $.extend({ iv: {} }); }

  $.fn.iv_menu_util = function(options) {
    return this.each(function() {
      new jQuery.iv.menu_util(this, options);
    });
  };

  $.fn.iv_menu_util_show_sub_menu = function(menu, parent_menu) {
    return this.each(function() {
      jQuery.data(this, 'menu_util').show_sub_menu(menu, parent_menu);
    });
  };

  $.fn.iv_menu_util_hide_sub_menus = function(args) {
    return this.each(function() {
      jQuery.data(this, 'menu_util').hide_sub_menus(args);
    });
  };

  $.fn.iv_menu_util_expand = function(args) {
    return this.each(function() {
      jQuery.data(this, 'menu_util').expand(args);
    });
  };

  $.fn.iv_menu_util_collapse = function(args) {
    return this.each(function() {
      jQuery.data(this, 'menu_util').collapse(args);
    });
  };

  $.fn.iv_menu_util_menu_type = function() {
    return jQuery.data(this[0], 'menu_util').menu_type();
  };

  $.fn.iv_menu_util_in_editor = function(in_editor) {
    return this.each(function() {
      jQuery.data(this, 'menu_util').in_editor(in_editor);
    });
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // Menu Util
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  $.iv.menu_util = function(el, options) {
    jQuery.data(el, 'menu_util', this);

    options = $.extend({
      auto_hide: true,      // auto-hide menu items
      in_editor: false,
      globals:   {
        open_sub_menus:      [],
        current_menu_item:   null,
        current_parent_menu: null,
        hide_timeouts:       []
      }
    }, options);

    var $$                 = $(el); // the menu widget
    var $sub_menus         = null;
    var next_submenu_index = 0;
    var prev_menu_type     = null;
    var menu_types         = {
      phone: 'box_menu'
    };

    // public methods
    this.show_sub_menu  = _show_sub_menu;
    this.hide_sub_menus = _hide_sub_menus;
    this.expand         = _expand;
    this.collapse       = _collapse;
    this.menu_type      = _menu_type;
    this.in_editor      = _in_editor;

    // ---------------------------------------------------------------------------
    function _in_editor(in_editor) {
      if (typeof(in_editor) !== 'undefined') {
        options.in_editor = in_editor;
      }

      return options.in_editor;
    }

    // ---------------------------------------------------------------------------
    function _get_doc_height() {
      if (!options.in_editor) {
        var D = document;
        return Math.max(
          Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
          Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
          Math.max(D.body.clientHeight, D.documentElement.clientHeight)
        );
      }

      return $('#editor_page').height();
    }

    // ---------------------------------------------------------------------------
    function _get_doc_width() {
      if (!options.in_editor) {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      }

      return $('#editor_content').width() - $.iv.scrollbar_width();
    }

    // ---------------------------------------------------------------------------
    function _menu_type() {
      if ($('#__res_main_nav_label', $$).css('display') != 'none') {
        return 'box_menu';
      }

      return 'default';
    }

    // ---------------------------------------------------------------------------
    function _is_using_responsive_menu() {
      if ($$.hasClass('b_menu')) {
        var $breakpoints = jQuery('head meta[name="breakpoints"]');
    
        if ($breakpoints.length == 1) {
          var widths    = $breakpoints.prop('content').split(',');
          var $res_menu = jQuery('#__res_main_nav_label'); // responsive menu label
    
          for (var i=0; i<widths.length; i++) {
            var doc_width = _get_doc_width();
    
            if (doc_width <= widths[i]) {
              if ($res_menu &&
                  $res_menu.length == 1 &&
                  $res_menu.css('display') != 'none') {
                $$.removeClass('default_menu').addClass('box_menu');
                return true;
              }
            }
          }
        }
      }

      $$.removeClass('box_menu').addClass('default_menu');
    
      return false;
    }

    // ---------------------------------------------------------------------------
    function _show_sub_menu(menu, parent_menu) {
      // TODO: Fix this line. Menuwidget submenus do not show!
      if (_is_using_responsive_menu()) { return; }
    
      // clear all timeouts
      while (options.globals.hide_timeouts.length) {
        clearTimeout(options.globals.hide_timeouts.pop());
      }

// COMMENTED: Now using CSS to show/hide submenus
//      // auto-hide menu items
//      if (options.auto_hide) {
//        if (options.globals.open_sub_menus.length) {
//          if (parent_menu == options.globals.current_parent_menu) {
//            var open_sub_menu = options.globals.open_sub_menus.pop();
//            open_sub_menu.css("visibility", "hidden");
//          }
//          else if (!parent_menu) {
//            while (options.globals.open_sub_menus.length) {
//              var open_sub_menu = options.globals.open_sub_menus.pop();
//              open_sub_menu.css("visibility", "hidden");
//            }
//          }
//        }
//      }
    
      // track the current parent menu
      options.globals.current_parent_menu = parent_menu;

      var id                = jQuery(menu).attr("id");
      var ul                = jQuery("#sub_"+id);
      var div_parent        = ul.parents("div:first");
      var padding_left      = parseInt(jQuery(menu).css("padding-left").replace(/px/, ""));
      var padding_right     = parseInt(jQuery(menu).css("padding-right").replace(/px/, ""));
      var padding_top       = parseInt(jQuery(menu).css("padding-top").replace(/px/, ""));
      var padding_bottom    = parseInt(jQuery(menu).css("padding-bottom").replace(/px/, ""));
      var ul_padding_left   = parseInt(ul.css("padding-left").replace(/px/, ""));
      var ul_padding_right  = parseInt(ul.css("padding-right").replace(/px/, ""));
      var ul_padding_top    = parseInt(ul.css("padding-top").replace(/px/, ""));
      var ul_padding_bottom = parseInt(ul.css("padding-bottom").replace(/px/, ""));
      var menu_position     = (ul.attr('menu_position'))?ul.attr('menu_position'):null;

// COMMENTED: Now using CSS to show/hide submenus
//      if (options.auto_hide) {
//        options.globals.open_sub_menus.push(ul);
//      }
    
      if (menu_position == 'top') {
        if (parent_menu) {
          // Sub sub menu & beyond
    
          // if submenu will expand past bottom of the page, move up instead
          if (jQuery(menu).offset().top + jQuery(menu).height() + ul_padding_top + ul_padding_bottom + ul.height() > _get_doc_height()) {
            ul.css("top", jQuery(menu).position().top - ul.height() + jQuery(menu).height() + padding_top + padding_bottom);
          } else {
            ul.css("top", jQuery(menu).position().top - ul_padding_top);
          }
    
          // If submenu goes off screen, move left instead.
          if (jQuery(menu).offset().left + jQuery(menu).width() + padding_left + padding_right + ul.width() > _get_doc_width()) {
            ul.css("left", jQuery(menu).position().left - ul.width());
          }
          else {
            ul.css("left", jQuery(menu).position().left + jQuery(menu).width() + padding_left + padding_right);
          }
        } else {
          // Initial submenu
          var ul_top;
          if (div_parent.css('position')) {
            var li = jQuery(menu);
            // Add 35 from activation bar
            if (li.position().top + li.height() + padding_top + padding_bottom + ul.height() + 35 > _get_doc_height()) {
              ul_top = li.position().top - ul.height();
            } else {
              // Get li height, not div
              ul_top = li.position().top + li.height() + padding_top + padding_bottom;
            }
          }
    
          ul.css("top", ul_top);
          if (jQuery(menu).offset().left - ul_padding_left + ul.width() > _get_doc_width()) {
            // If submenu goes off screen, move left instead.
            ul.css("left", _get_doc_width() - ul.width());
          }
          else {
            ul.css("left", jQuery(menu).position().left - ul_padding_left);
          }
        }
      }
      else if (menu_position == 'left') {
        if (parent_menu) {
          if (jQuery(menu).offset().top + ul_padding_bottom + ul_padding_top + ul.height() > _get_doc_height()) {
    	ul.css("top", jQuery(menu).position().top - ul.height() + jQuery(menu).height() + padding_top + padding_bottom);
          } else {
    	ul.css("top", jQuery(menu).position().top - ul_padding_top);
          }
        }
        else {
          // Initial submenu
          if (jQuery(menu).position().top - padding_top + ul.height() > _get_doc_height()) {
    	ul.css("top", _get_doc_height() - ul.height() - padding_top); 
          } else {
    	ul.css("top", jQuery(menu).position().top);
          }
        }
        if (jQuery(menu).offset().left + jQuery(menu).width() + padding_left + padding_right + ul.width() > _get_doc_width()) {
          ul.css("left", jQuery(menu).position().left - ul.width());
          if (ul.offset().left < 0) { ul.css("left", 0); }
        }
        else {
          ul.css("left", jQuery(menu).position().left + jQuery(menu).width() + padding_left + padding_right);
          if (ul.offset().left + ul.width() > _get_doc_width()) {
            ul.css("left", jQuery(menu).position().left - ul.width());
            if (ul.offset().left < 0) { ul.css("left", 0); }
          }
        }
        //ul.css("left", jQuery(menu).position().left + jQuery(menu).width() + padding_left + padding_right);
      }
      else if (menu_position == 'right') {
        var ul_width = jQuery(ul).width();
        var max_width = 400;
        if (ul_width >= max_width) { ul_width = max_width; jQuery(ul).width(max_width) }
        ul.css("top", jQuery(menu).position().top - ul_padding_top);
        var left;
        if (jQuery(menu).offset().left - ul_width - ul_padding_left - ul_padding_right < 0) {
          left = jQuery(menu).position().left + ul_width + ul_padding_left + ul_padding_right;
        } else {
          left = jQuery(menu).position().left - ul_width - ul_padding_left - ul_padding_right;
        }
        ul.css("left", left);
      }
      else if (menu_position == 'bottom') {
        if (parent_menu) {
          // Sub sub menu & beyond
          ul.css("top", jQuery(menu).position().top - ul.height() + jQuery(menu).height());
          // If submenu goes off screen, move left instead.
          if (jQuery(menu).offset().left + jQuery(menu).width() + padding_left + padding_right + ul.width() > _get_doc_width()) {
            ul.css("left", jQuery(menu).position().left - ul.width());
          }
          else {
            ul.css("left", jQuery(menu).position().left + jQuery(menu).width() + padding_left + padding_right);
          }
        } else {
          // Initial submenu
          var ul_top;
          if (div_parent.css('position')) {
            var li = jQuery(menu);
            ul_top = li.position().top - padding_top - ul.height();
          }
    
          ul.css("top", ul_top);
          if (jQuery(menu).offset().left - ul_padding_left + ul.width() > _get_doc_width()) {
            // If submenu goes off screen, move left instead.
            ul.css("left", _get_doc_width() - ul.width());
          }
          else {
            ul.css("left", jQuery(menu).position().left - ul_padding_left);
          }
        }
      }

// COMMENTED: Now using CSS to show/hide submenus
//      ul.css("visibility", "visible")
      ul.css("position", "absolute")
        .css("z-index", 50000)
        .show();
    
      jQuery('a', ul).css('float', 'none');

      // Handle menus that overlap video widgets
      // ---------------------------------------
      var $sub_menu     = jQuery('.sub_menu', parent_menu);
      var sub_menu_rect = ($sub_menu[0]) ? $sub_menu[0].getBoundingClientRect() : undefined;

      jQuery('div[block_type="video"] video').each(function() {
        var overlap = false;
        if (sub_menu_rect) {
          // Check for overlapping.  If video/menu overlap then
          // force pause.
          var video_rect = this.getBoundingClientRect();
          overlap        = !(sub_menu_rect.right < video_rect.left ||
                           sub_menu_rect.left > video_rect.right ||
                           sub_menu_rect.bottom < video_rect.top ||
                           sub_menu_rect.top > video_rect.bottom);
        }
        if (overlap) {
          jQuery(this).get(0).pause();
        }
      });

      if (!jQuery('div[block_type="video"] video').hasClass('vjs-tech')) {
        jQuery('div[block_type="video"] video').addClass('hidden');
        jQuery('div[block_type="video"] img.video_preview').removeClass('hidden');
      }
      // ---------------------------------------
    }

    // ---------------------------------------------------------------------------
    function _hide_sub_menus(args) {
// COMMENTED: Now using CSS to show/hide submenus
//      if (_is_using_responsive_menu()) { return; }
//
//      args = args || {};
//
//      var now  = args['now'];
//      var time = (now)?1:500;
//
//      options.globals.hide_timeouts.push(setTimeout(function () {
//        if (!options.globals.current_menu_item) {
//          while (options.globals.open_sub_menus.length) {
//            var open_sub_menu = options.globals.open_sub_menus.pop();
//            open_sub_menu.css("visibility", "hidden");
//            jQuery('.video video').removeClass('hidden');
//            jQuery('.video img.video_preview').addClass('hidden');
//          }
//        }
//      }, time));
    }

    // -------------------------------------------------------------------------
    function _expand(args) {
      args = args || {};

      var menu_type = _menu_type();

      if (prev_menu_type !== menu_type) {
        _collapse(args);
        prev_menu_type = menu_type;
      }

      switch(menu_type) {
        case 'box_menu':
          _expand_for_box_menu(args);
          break;
        default:
          _expand_for_default(args);
      }
    }

    // -------------------------------------------------------------------------
    function _expand_for_box_menu(args) {
      args = args || {};

      var $menu     = $$;
      var menu_type = _menu_type();

      if (!$sub_menus) {
        $sub_menus         = $('ul', $menu);
        next_submenu_index = 0;
      }

      var $ul        = null;
      var $prev_ul   = null;
      var prev_index = next_submenu_index - 1;

      // the next ul to show
      if ($sub_menus.length) {
        if ($sub_menus.length - 1 < next_submenu_index) {
          _collapse({
            menu_type:     menu_type,
            keep_submenus: true
          });
        }

        $ul = $($sub_menus[next_submenu_index]);
      }
      else {
        return _collapse({ menu_type: menu_type });
      }

      // the previous ul
      if ($sub_menus.length - 2 >= prev_index) {
        $prev_ul = $($sub_menus[prev_index]);
      }

      if ($ul) {
        var ul_id      = $ul[0].id;
        var $parent_ul = ($ul.hasClass('sub_menu'))?$ul.parents('ul'):null;

        if ($parent_ul && $parent_ul.length > 0) {
          // if the previous ul exists and is not the root ul and is not the
          // same as the parent ul, we need to hide the previous ul and possibly
          // its parents
          if (prev_index !== 0 &&
              $prev_ul &&
              $prev_ul.length > 0 &&
              $parent_ul[0].id !== $prev_ul[0].id) {
            var $cb = $($prev_ul.prevAll('input[type="checkbox"]')[0]);
            $cb.removeAttr('checked');

            var parents = $prev_ul.parents('ul.sub_menu');
            for (var idx=0; idx<parents.length; idx++) {
              if (parents[idx].id !== $parent_ul[0].id) {
                var $cb = $($(parents[idx]).prevAll('input[type="checkbox"]')[0]);
                $cb.removeAttr('checked');
              }
              else {
                break;
              }
            }
          }
        }

        // clear inline styles
        $ul.removeAttr('style');

        // show the next sub menu
        var $cb = $($ul.prevAll('input[type="checkbox"]')[0]);
        $cb.attr('checked', 'checked');

        // show the sub view
        $ul.css('visibility', 'visible');

        next_submenu_index += 1;
      }
    }

    // -------------------------------------------------------------------------
    function _expand_for_default(args) {
      args = args || {};

      var $menu = $$;

      if (!$sub_menus) {
        $sub_menus         = $('ul.sub_menu', $menu);
        next_submenu_index = 0;
      }

      var $ul        = null;
      var $prev_ul   = null;
      var prev_index = next_submenu_index - 1;

      // the next ul to show
      if ($sub_menus.length) {
        if ($sub_menus.length - 1 < next_submenu_index) {
          _collapse({ keep_submenus: true });
        }

        $ul = $($sub_menus[next_submenu_index]);
      }
      else {
        return _collapse();
      }

      // the previous ul
      if ($sub_menus.length - 2 >= prev_index) {
        $prev_ul = $($sub_menus[prev_index]);
      }

      if ($ul) {
        var ul_id       = $ul[0].id;
        var a_id        = ul_id.replace('sub_', '');
        var $submenu    = $('#'+a_id, $menu);
        var parent_menu = null;
        var $parent_ul  = $submenu.parents('ul');

        if ($parent_ul.length > 0) {
          // if the previous ul exists and is not the same as the parent ul,
          // we need to hide the previous ul and possibly its parents
          if ($prev_ul && $prev_ul.length > 0 && $parent_ul[0].id !== $prev_ul[0].id) {
            $prev_ul.hide().css('visibility', '');
            var parents = $prev_ul.parents('ul.sub_menu');
            for (var idx=0; idx<parents.length; idx++) {
              if (parents[idx].id !== $parent_ul[0].id) {
                $(parents[idx]).hide().css('visibility', '');
              }
              else {
                break;
              }
            }
          }

          // get the actual parent element
          if ($parent_ul.hasClass('sub_menu')) {
            var parent_id = $parent_ul[0].id.replace('sub_', '');
            var $parent_menu = $('#'+parent_id, $menu);
            parent_menu = $parent_menu[0];
          }
        }

        // position the next sub menu
        _show_sub_menu($submenu[0], parent_menu);

        // show the sub view
        $ul.css('visibility', 'visible');

        next_submenu_index += 1;
      }
    }

    // -------------------------------------------------------------------------
    function _collapse(args) {
      args = args || {};

      var menu_type = _menu_type();

      switch(menu_type) {
        case 'box_menu':
          _collapse_for_box_menu(args);
          break;
        default:
          _collapse_for_default(args);
      }
    }

    // -------------------------------------------------------------------------
    function _collapse_for_box_menu(args) {
      args = args || {};

      var $menu = $$;

      $('input[type="checkbox"]', $menu).each(function() {
        $(this).removeAttr('checked');
      });

      $('ul li ul', $menu).each(function() {
        $(this).hide().css('visibility', '');
      });

      if (!args['keep_submenus']) { $sub_menus = null; }

      next_submenu_index = 0;
    }

    // -------------------------------------------------------------------------
    function _collapse_for_default(args) {
      args = args || {};

      var $menu = $$;

      // Don't collapse menu trees
      if ($('div.menuwidget_vertical_tree', $menu)[0]) {
        return;
      }
      
      $('ul li ul', $menu).each(function() {
        $(this).hide().css('visibility', '');
      });

      if (!args['keep_submenus']) { $sub_menus = null; }

      next_submenu_index = 0;
    }

    // ---------------------------------------------------------------------------
  };

})(jQuery);
