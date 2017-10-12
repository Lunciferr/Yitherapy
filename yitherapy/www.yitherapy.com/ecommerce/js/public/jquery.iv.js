// ===========================================================
// NOTE: ALL JQUERY IN THIS FILE MUST BE NO CONFLICT
// ===========================================================
(function(jQuery) {
  if(!(jQuery.iv)){
    jQuery.extend({ iv: {} });
  }

  // ===========================================================
  // START PHOTOGALLERY
  // ===========================================================
  jQuery.fn.iv_photogallery = function(options) {
    return this.each(function() {
      new jQuery.iv.photogallery(this, options);
    });
  }

  jQuery.iv.photogallery = function(el, options) {

/*
    options = jQuery.extend({ 
      // gallery id
      photogallery_id             : null,
  
      // Data Vars
      display_options             : null,
      image_list                  : null,
      gallery_dropdowns           : null,

      // Button Names
      left_button_name            : null,
      right_button_name           : null,
      pause_button_name           : null, 

      // Container names
      order_num_container_name    : null,
      images_container_name       : null,
      ul_name                     : null,
      description_container_name  : null,
      p_name                      : null,
      loading_container_name      : null,

      current_page_num_name       : null,
      max_page_num_name           : null,
      show_description            : null,
      autoplay                    : null,
      type                        : null,

      txtImage                    : null,
      txtOf                       : null

    }, options);

*/

      photogallery_id             : null;
      display_options             : null;
      image_list                  : null;
      gallery_dropdowns           : null;
      left_button_name            : null;
      right_button_name           : null;
      pause_button_name           : null;
      order_num_container_name    : null;
      images_container_name       : null;
      ul_name                     : null;
      description_container_name  : null;
      p_name                      : null;
      loading_container_name      : null;
      current_page_num_name       : null;
      max_page_num_name           : null;
      show_description            : null;
      autoplay                    : null;
      type                        : null;
      txtImage                    : null;
      txtOf                       : null;


    // This will append it to the overall div.
    jQuery.data(el, 'photogallery_' + options.photogallery_id, this);

    // Start vars
    var $$                      = jQuery(el);

    // rot_ctr1_bod_ctr3_bod_wrp1_blk3_blk2    
    var $parent_div             = $$.parent().parent();

    // Containers
    var $images_container       = jQuery('div.' + options.images_container_name, $$);
    var $ul_container           = jQuery('ul.' + options.ul_name, $$);
    var $description_container  = jQuery('div.' + options.description_container_name, $$);
    var $p_container            = jQuery('p.' + options.p_name, $$);
    var $loading_container      = jQuery('div.' + options.loading_container_name, $$);
    var $order_num_container    = jQuery('#' + options.order_num_container_name, $$);

    // Need to know current_page_number and total_pages
    var $pagination_container           = jQuery('div.pagination_container', $$);
    var $pagination_current_container   = jQuery('span.pagination_current', $$);
    var $pagination_total_container     = jQuery('span.pagination_total', $$);

    var $current_page_num_container     = jQuery('#' + options.current_page_num_name, $$);
    var $max_page_num_container         = jQuery('#' + options.max_page_num_name, $$);

    var $pagination_controls_container  = jQuery('div.pagination_controls', $$);
    var $images_showing_start_container = jQuery('span.images_showing_start', $$);
    var $images_showing_end_container   = jQuery('span.images_showing_end', $$);
    var $main_image_container           = jQuery('div.images_container', $$);

    // Buttons
    var $left_button           = jQuery('span.' + options.left_button_name, $$);
    var $right_button          = jQuery('span.' + options.right_button_name, $$);
    var $pause_button          = jQuery('span.' + options.pause_button_name, $$);

    // Data 
    var photogallery_id       = options.photogallery_id;
    var display_options       = JSON.parse(options.display_options);
    var image_list            = JSON.parse(options.image_list);
    var gallery_dropdowns     = JSON.parse(options.gallery_dropdowns);

    // 1 == Yes, 2 == No
    var show_description      = options.show_description;
    var autoplay              = options.autoplay;

    //------------------------------------------------
    // Figure out the base uri to use
    //------------------------------------------------
    var type                  = options.type;
    var base_uri;               
    var mode                  = '_unpublished/';

    if(image_list.length > 0){
      var first_hash = image_list[0];

      if(type == 'live'){
        base_uri                = first_hash['publish_url'];
        mode                    = '';
      }

      if(type == 'preview'){
        base_uri                = first_hash['preview_url'];
        mode                    = '_preview/';
      }

      if(type == 'final_design'){
        base_uri              = first_hash['final_design_url'];
        mode                  = '_finaldesign/';
      }

    }
    //------------------------------------------------


/*
    // Debug area, used to see if the list can handle 1 item.
    var temp_image_list = new Array(); 
    jQuery.each(image_list, function(cnt, image_hash) { 
      //if(cnt != 0){
      if(cnt < 7){
        temp_image_list[cnt] = image_list[cnt];
      }
    });
    image_list = temp_image_list;
*/

    // Other Vars
    var max_order_num         = image_list.length || 0; 
    var current_order_num     = $order_num_container.val();
    var current_page_num      = $current_page_num_container.val();
    var max_page_num          = $max_page_num_container.val();
    var locked                = 0;
    var $preview_window       = null;
    var paused                = 1; // We start off paused
    var images_showing_start  = parseInt($images_showing_start_container.html());
    var images_showing_end    = parseInt($images_showing_end_container.html());

    // Find the gallery name
    var gallery_type_selected     = display_options['gallery_type_selected'];
    var gallery_type_display_name = gallery_dropdowns['gallery_types'][gallery_type_selected].toLowerCase();
    var regex                     = new RegExp(/\s+/g);
    var gallery_name              = gallery_type_display_name.replace(regex, "_");

    // -----------------------------------------------------------------------------
    // LIGHTBOX SECTION
    // Please note that this plugin has been modified slightly from the original
    // plugin that is available at: http://leandrovieira.com/projects/jquery/lightbox/
    // I took out all the english text. so Next/Back are arrows, Close is an X .. ect..
    // -----------------------------------------------------------------------------
    var raw_gallery_name      = gallery_dropdowns['gallery_types'][gallery_type_selected];
    var large_image_style     = display_options[raw_gallery_name]['large_image_style'];

    // Init the photogallery
    switch(gallery_name){

      case ('single_image') :
        init_single_image();
      break;
      
      case ('grid') :
        init_grid();
      break;

      case ('filmstrip_1') :
        init_filmstrip(gallery_name);
      break;

      case ('filmstrip_2') :
        init_filmstrip(gallery_name);
      break;
  
      case ('slideshow_2') :
        // Placeholder - this is actually taken care of in the mason file.
      break;

      case ('slideshow_1') :
        init_slideshow_1();
        if(autoplay == '1'){

          // this is to get the initial autoplay to pause long enough to see first image.
          var delay_seconds       = display_options[raw_gallery_name]['delay'] || '5'; // 5 secs default.
          var delay_milliseconds  = delay_seconds * 1000;
          if(delay_milliseconds < 850){ delay_milliseconds = '850'; }
          setTimeout( function() { _start(); }, delay_milliseconds);
        }
      break;
    }

    // ========================================================================= 
    // SINGLE IMAGE
    // ========================================================================= 
    function init_single_image(){
      _reset_position();

      // We hide the gallery with the loading screen.
      $loading_container.show();

      // We'll see if there is an image list
      if(image_list.length > 0){

        // Set button triggers
        // ---------------------------------------------------------------------------
        $left_button.unbind('click').click( function() {
          _move('left', 'single_image');
          return false;
        });

        $right_button.unbind('click').click( function() {
           _move('right', 'single_image');
          return false;
        });

        // Decide if we show the buttons right away
        // ---------------------------------------------------------------------------
        if(current_order_num > 0 && max_order_num > 1){
          $right_button.show()
        }

        if( (current_order_num < (max_order_num - 1)) && (!(current_order_num == 0)) ){
          $left_button.show()
        }
      }

      $loading_container.hide();
    };

    // ========================================================================= 
    // GRID
    // ========================================================================= 
    function init_grid() {
      _reset_position();

      // We hide the gallery with the loading screen.
      //$loading_container.show();

      if(large_image_style == 1){
        // Set the pop-up type
        jQuery("img", $images_container).each(function(cnt) {
          var image_hash = image_list[cnt];
          jQuery(this).click(function() { 
            _preview(image_hash); 
            return false;
          });
        });
      }
      else{
        // This will use animated lightbox.
        jQuery(function() {
        // jQuery('#photogallery_container_<% $photogallery_id %> img[rel*="lightbox"]').lightBox(lightbox_hash); 
          var lightbox_hash = {
            txtImage        : options.txtImage,
            txtOf           : options.txtOf,
            showDescription : show_description,
            parent_div_id   : 'photogallery_' + options.photogallery_id
          };
          jQuery('img[rel*="lightbox"]', $$).lightBox(lightbox_hash);
        });
      }

      // Now we need to know which controls to activate
      var $current_page = jQuery('li.page_selected', $ul_container);

      if($current_page.next().length){
        $right_button.unbind('click').css("color" , "blue").click( function() {
          _move_grid('right');
          return false;
        });
      }
      else{
        $right_button.css("color" , "black");
        $right_button.unbind('click');
      }

      if($current_page.prev().length){
        $left_button.unbind('click').css("color" , "blue").click( function() {
          _move_grid('left');
          return false;
        });
      }
      else{
        $left_button.css("color", "black");
        $left_button.unbind('click');
      }

      $loading_container.hide();
    }

    // ========================================================================= 
    // SLIDESHOW
    // ========================================================================= 
    function init_slideshow_1(){
      _reset_position();

      // We hide the gallery with the loading screen.
      $loading_container.show();

      // We'll see if there is an image list
      if(image_list.length > 0){

        // Set button triggers
        // ---------------------------------------------------------------------------
        $pause_button.unbind('click').click( function() {
          _pause();
          return false;
        });

        $right_button.unbind('click').click( function() {
           _start();
          return false;
        });

/*
        // If we're not on the first image, we'll scroll to it. 
        // ---------------------------------------------------------------------------
        if(current_order_num != 0){
          var find_list_item  = "li:eq(" + current_order_num + ")";
          var $selected_image = jQuery(find_list_item, $ul_container);

          // This is to make sure the images are hidden till 
          // we've scrolled to the selected image.
          var loading_function = function(){
            $loading_container.hide();
          }
          $images_container.scrollTo( $selected_image, 800, loading_function); 
        }
*/
      }

      $loading_container.hide();

    };

    // ========================================================================= 
    // FILMSTRIP 1 & 2
    // ========================================================================= 
    function init_filmstrip(gallery_name) {
      _reset_position();
      $loading_container.show();

      if(image_list.length > 0){

        if(gallery_name == 'filmstrip_1'){

          // Set the pop-up type
          jQuery("img", $images_container).each(function(cnt) {
            var image_hash = image_list[cnt];

            jQuery(this).click(function() { 
              // This will show the large picture on the top frame 
              _filmstrip_1_preview(image_hash); 

              // Move the selected image class to the new image 
              jQuery('li.img_selected', $$).removeClass('img_selected');

              // Set the new img selected  
              jQuery(this).parent().parent().addClass('img_selected');
              $order_num_container.val(cnt);

              return false;
            });
          });
        }
        else if (gallery_name == 'filmstrip_2'){

          // Set the pop-up type
          // Testing purposes, large image style #2 doesn't work yet
          // large_image_style = 1;

          if(large_image_style == 1){

            jQuery("img", $images_container).each(function(cnt) {
              var image_hash = image_list[cnt];
              jQuery(this).click(function() { 

                _filmstrip_2_preview(image_hash); 

                // Move the selected image class to the new image 
                jQuery('li.img_selected', $$).removeClass('img_selected');

                // Set the new img selected  
                jQuery(this).parent().parent().addClass('img_selected');
                $order_num_container.val(cnt);

                return false;
              });
            });

          }
          else{
            // This will use animated lightbox.
            jQuery(function() {
              // jQuery('#photogallery_container_<% $photogallery_id %> img[rel*="lightbox"]').lightBox(lightbox_hash); 
              var lightbox_hash = {
                txtImage        : options.txtImage,
                txtOf           : options.txtOf,
                showDescription : show_description,
                parent_div_id   : 'photogallery_' + options.photogallery_id
              };
  
              jQuery('img[rel*="lightbox"]', $$).lightBox(lightbox_hash); 
            });
          }
        }


        // Now we need to know which controls to activate
        var $current_page = jQuery('li.page_selected', $ul_container);

        // Right Button
        if($current_page.next().length){
          $right_button.unbind('click').click( function() {
            _move_grid('right');
            return false;
          });
        }
        else{
          $right_button.unbind('click');
        }

        // Left Button
        if($current_page.prev().length){
          $left_button.unbind('click').click( function() {
            _move_grid('left');
            return false;
          });
        }
        else{
          $left_button.unbind('click');
        }

        // $pagination_controls_container.show();
      }

      $loading_container.hide();
    }

    // ======================================================================== 
    // FUNCTIONS
    // ========================================================================= 
    function _reset_position(){
      current_page_num = 1;
      $current_page_num_container.val(current_page_num);
      current_order_num = 0;
      $order_num_container.val(current_order_num);
    }

    function _start(){
      // Unbind the start button, to stop start spamming.
      $right_button.unbind('click');

      // Set our flag
      paused = 0;

      // Switch the button icons
      $right_button.hide();
      $pause_button.show();

      // When a user hits the play button, we want to move to the next pic right away.
      // We just have to see if we're at the last image, or not.
      if($order_num_container.val() < max_order_num - 1){
        _move('right', 'slideshow_1');
      }
      else{
        _move_to_first();  
      }

      // This sets the timer for the rotation. 
      var delay_seconds       = display_options[raw_gallery_name]['delay'] || '5'; // 5 secs default.
      var delay_milliseconds  = delay_seconds * 1000;      

      // Bug fix for setting delay to zero
      if(delay_milliseconds < 850){ delay_milliseconds = '850'; }

      setInterval( function() {
        if(paused == 0){
          // We want to make sure they don't click anything while we're in the process of moving
          $pause_button.unbind('click');

          // Decide where to move to 
          if($order_num_container.val() == max_order_num - 1){
            _move_to_first();
          }
          else{
            _move('right', 'slideshow_1');
          }

          // Now that we're out the movement, set the click event again.   
          $pause_button.click( function() {
            _pause();
            return false;
          });        

        };

      }, delay_milliseconds);
    }

    // --------------------------------------------------------------------------
    function _move_to_first(){
      // clear the selected class  
      var current_image = jQuery('li.img_selected', $ul_container);
      current_image.removeClass('img_selected');

      // set the order num back to zero
      $order_num_container.val(0);

      // find the first li container
      var $selected_image = jQuery("li:eq(0)", $ul_container);

      // reassign the selected class to new image 
      $selected_image.addClass('img_selected');

      // Set the image description if there is any.
      var image_hash = image_list[0];

      // Set the description 
      if(image_hash.description){
        $p_container.fadeOut('slow', function() {
          $p_container.html(image_hash.description)
        }).fadeIn('slow');
      }
      else{
        $p_container.fadeOut('slow', function(){
          $p_container.empty();
        });
      }

      var loading_function = function(){
        $loading_container.hide();
      }

      // now we scroll to the first item.
      $loading_container.show();
      $images_container.scrollTo( $selected_image, 800, loading_function);
    }

    // --------------------------------------------------------------------------
    function _pause(){
      // unbind the pause button, to keep from spamming it.
      $pause_button.unbind('click');

      $right_button.unbind('click').click( function() {
         _unpause();
        return false;
      });

      // Set our flag
      paused = 1;
    
      // Switch the button icons 
      $pause_button.hide();
      $right_button.show(); 
    }

    // --------------------------------------------------------------------------
    function _unpause(){
      // unbind the pause button, to keep from spamming it.
      $right_button.unbind('click');

      $pause_button.unbind('click').click( function() {
         _pause();
        return false;
      });

      // Set our flag
      paused = 0;

      // Switch the button icons 
      $pause_button.show();
      $right_button.hide();
    }


    // --------------------------------------------------------------------------
    function _move_grid(dir){
      // alert("locked: " + locked);
      // alert("dir: " + dir);
      // alert("current_page_num / max_page_num: " + current_page_num + "/" + max_page_num);

      // While we're trying to load pictures, we'll need to lock people out of moving around. 
      if( 
          (locked) ||
          ( current_page_num == 1 && dir == 'left') || 
          ( (max_page_num == current_page_num) && dir == 'right') 
        ){
        return(1);
      }

      // Set the lock.
      locked = 1;

      // see what page number we're current on.
      var $next_page   = null;
      var new_page_num = current_page_num;

      // Get the current selected item (with selected class), if none was found, get the first item  
      // var current_page = jQuery('li.page_selected', $ul_container).length ? jQuery('li.selected', $ul_container) : jQuery('li:first', $ul_container);  
      var $current_page = jQuery('li.page_selected', $ul_container);  

      var new_images_showing_start  = 0;
      var new_images_showing_end    = 0;
 
      // use prev and next to determine increment or decrement  
      // because the controls disappear, i don't do checking to see if there is a next or prev.
      if (dir == 'left') {  
        $next_page = $current_page.prev();
        new_page_num--;

        // Find out how many images are showing.
        var img_array = jQuery('img', $next_page);
        new_images_showing_start  = parseInt(images_showing_start) - img_array.length; 
        new_images_showing_end    = parseInt(images_showing_start) - 1;
      } 
      else {  
        $next_page = $current_page.next();  
        new_page_num++;

        var img_array = jQuery('img', $next_page);
        new_images_showing_start  = parseInt(images_showing_end) + 1;
        new_images_showing_end    = parseInt(images_showing_end) + img_array.length;
      }  
 
      // Set the number of images 
      $images_showing_start_container.html(new_images_showing_start);
      images_showing_start = new_images_showing_start;

      $images_showing_end_container.html(new_images_showing_end);
      images_showing_end = new_images_showing_end;
 
      // Set our new array number
      $current_page_num_container.val(new_page_num);
      current_page_num = new_page_num

      //clear the selected class  
      $current_page.removeClass('page_selected'); 

      //reassign the selected class to new image 
      $next_page.addClass('page_selected');  

      // We scroll to the next image, and We use the function to 
      // make sure that the lock isn't set to zero before it's finished scrolling.
      var lock_function = function(){ locked = 0; };
      $images_container.scrollTo($next_page, 800, lock_function);

      // Set the buttons again
      if($next_page.next().length){
        $right_button.unbind('click').css("color" , "blue").click( function() {
          _move_grid('right');
          return false;
        });
      }
      else{
        $right_button.css("color" , "black");
        $right_button.unbind('click');
      }

      if($next_page.prev().length){
        $left_button.unbind('click').css("color" , "blue").click( function() {
          _move_grid('left');
          return false;
        });
      }
      else{
        $left_button.unbind('click').css("color", "black");
      }
    }

    // --------------------------------------------------------------------------
    function _filmstrip_1_preview(image_hash) {

      var src                 = null;
      var publish_url         = image_hash.publish_url;
      var original_image_path = image_hash.original_image_path;

      // console.log(display_options);

      var widget_height       = display_options['Filmstrip 1']['widget_height'];
      var widget_widget       = display_options['Filmstrip 1']['widget_width'];

      var max_image_height    = display_options['Filmstrip 1']['max_image_height'];
      var max_image_width     = display_options['Filmstrip 1']['max_image_width'];
      var bg_color            = display_options['Filmstrip 1']['bg_color'];
      var preexisting         = display_options['preexisting'];
      var regex               = new RegExp(/#/);
      bg_color                = bg_color.replace(regex, "");

      //console.log(display_options);

      var new_image_name      = image_hash.original_image_name;
      var file_extension      = new_image_name.split('.').pop();

      if(preexisting == 1){
       var regx = new RegExp('.' + file_extension);
       new_image_name = new_image_name.replace(regx, ".png");
      }

      if(original_image_path  != ''){
        src = publish_url + mode + original_image_path + '/_imagecache/P=W' + max_image_width + ',H' + max_image_height + ',F,B' + bg_color + '/' + image_hash.original_image_name;
        if(preexisting == 1){
          src = publish_url + mode + original_image_path + '/_imagecache/P=W' + max_image_width + ',H' + max_image_height + ',F,O' + file_extension + '/' + new_image_name;
        }
      }
      else{
        src = publish_url + mode + '_imagecache/P=W' + max_image_width + ',H' + max_image_height + ',F,B' + bg_color + '/' + image_hash.original_image_name;
        if(preexisting == 1){
          src = publish_url + mode + '_imagecache/P=W' + max_image_width + ',H' + max_image_height + ',F,O' + file_extension + '/' + new_image_name;
        }
      }

      if(image_hash.filecabinet_file_id.match(/^l_/)){
        src = publish_url +'_imagecache/P=W' + max_image_width + ',H' + max_image_height + ',L,F,B' + bg_color + '/' + image_hash.original_image_name;
      }
      
      var description     = image_hash.description;
      var image_url_link  = image_hash.image_url_link;

      var image_attributes ={
        id      : "photogallery_image_" + image_hash.filecabinet_file_id,
        src     : src
      };

      // Create the image!  
      var $img  = jQuery('<img style="padding:0px; margin:0px; max-height:' + max_image_height + 'px;max-width:' + max_image_width + 'px" height="' + max_image_height + 'px" width="' + max_image_width + 'px"></img>').attr(image_attributes);

      var $top_main_image_container = jQuery('div.main_image_container', $$);

      // JH - 12/04/2009 - Had to do a quick switcharoo to populate the inner container instead of the main one..
      var $main_image_container  = jQuery('div.sub_image_container', $top_main_image_container);

      // target Links
      if(image_url_link){
        var url_link        = image_url_link;
        var prefix          = '';
        var target          = '_self';

        if(!(image_url_link.match(/http:\/\//) || image_url_link.match(/https:\/\//))){
          prefix = 'http://';
        }

        if(image_hash.click_option == 2){
          target            = '_blank'; 
        }

        var $anchor       = jQuery('<a style="text-decoration:none;" href="' + prefix + url_link + '" target="' + target + '"></a>'); 

        // do a switcharoo
        $anchor.html($img);
        $img = $anchor;
      }
      else{
        //$img.appendTo($align_div);
      }

      $main_image_container.empty();
      $main_image_container.html($img);

      // Set the description if there is one.
      if(description && (show_description == 1)){
        $description_container.empty();
        $description_container.html('<p style="padding:0px; height:30px; overflow-x: hidden; overflow-y: auto; margin:0px;">' + description + '</p>');
      }
      else{
        if(show_description == 1){
          $description_container.html('<p style="padding:0px; margin:0px; height:30px; overflow-x: hidden; overflow-y: auto;"></p>');
        }
        else{
          $description_container.html('<p style="padding:0px; margin:0px; height:30px; overflow-x: hidden; overflow-y: auto; display:none;"></p>');
        }
      }
    }

    // --------------------------------------------------------------------------
    function _filmstrip_2_preview(image_hash) {
      // Fix eventually.
      _preview(image_hash);
    }


    // --------------------------------------------------------------------------
    function _preview(image_hash) {
      // This function creates the pop-up window that shows the full image
      var img_loader    = new Image();

      if(base_uri == null){ base_uri = first_hash['publish_url'] + "_unpublished/"; }

      img_loader.onload = function() { _center_preview(image_hash, img_loader); };

      if(image_hash.original_image_path){
        img_loader.src    = base_uri + image_hash.original_image_path + '/_imagecache/' + image_hash.original_image_name;
      }
      else{
        img_loader.src    = base_uri + '_imagecache/' + image_hash.original_image_name;
      }

      if(image_hash.filecabinet_file_id.match(/^l_/)){
        img_loader.src    = base_uri + '_imagecache/P=L/' + image_hash.original_image_name;
      } 

      jQuery('<div></div>').addClass('photogallery_overlay').addClass('photogallery_thumbnail_overlay').css('z-index', 10100).appendTo('body').unbind('click').click(_close_preview);
    }

    // --------------------------------------------------------------------------
    function _center_preview(image_hash, img_loader) {

      if(base_uri == null){ base_uri = first_hash['publish_url'] + "/_unpublished/"; }

      img_loader.onload = null;

      var image_path    = base_uri + '_imagecache/' + image_hash.original_image_name;

      if(image_hash.original_image_path){
        image_path      = base_uri + image_hash.original_image_path + "/_imagecache/" + image_hash.original_image_name;
      }

      if(image_hash.filecabinet_file_id.match(/^l_/)){
        image_path      = base_uri + '_imagecache/P=L/' + image_hash.original_image_name;
      }

      var description   = image_hash.description;

      // Hack to force preview window to be recreated
      if($preview_window){ $preview_window == null; }

      // If the preview div doesn't exist, lets create it
      if(!$preview_window) {

        $preview_window             = jQuery('<div class="photogallery_preview_window" style="font-size:0px"><img></img></div>').appendTo('body');
        var $preview_close          = jQuery('<div class="photogallery_preview_close"></div>');
        var $description_container  = jQuery('<div class="photogallery_preview_description"></div>');

        // Pull all the global css 
        var d_font          = $parent_div.css('font-family');
        var d_font_color    = $parent_div.css('color');
        var d_font_size     = $parent_div.css('font-size');
        var d_font_weight   = $parent_div.css('font-weight');
        var d_font_style    = $parent_div.css('font-style');
        var d_font_variant  = $parent_div.css('font-variant');
        var d_text_align    = $parent_div.css('text-align');
        var d_text_decor    = $parent_div.css('text-decoration');
        var d_text_trans    = $parent_div.css('text-transform');
        var d_white_space   = $parent_div.css('white-space');
         
        if(d_font)        { $description_container.css('font-family', d_font); }
        if(d_font_color)  { $description_container.css('color', d_font_color);}
        if(d_font_size)   { $description_container.css('font-size', d_font_size);}
        if(d_font_weight) { $description_container.css('font-weight', d_font_weight);}
        if(d_font_style)  { $description_container.css('font-style', d_font_style);}
        if(d_font_variant){ $description_container.css('font-variant', d_font_variant);}
        if(d_text_align)  { $description_container.css('text-align', d_text_align);}
        if(d_text_decor)  { $description_container.css('text-decoration', d_text_decor);}
        if(d_text_trans)  { $description_container.css('text-transform', d_text_trans);}
        if(d_white_space) { $description_container.css('white-space', d_white_space);}

        // assemble the divs
        $preview_close.appendTo($preview_window);
        $description_container.appendTo($preview_window);

        // Assign the close button
        jQuery('div.photogallery_preview_close', $preview_window).unbind('click').click(_close_preview);
      }

      var div_width = img_loader.width - 20;

      // Set the description
      if(description && show_description == 1){
        jQuery('div.photogallery_preview_description', $preview_window).html('<p style="padding:0px; width:' + div_width + 'px; height:auto; margin:0px;">' + description + '</p>');
      }
      else{
        if(show_description == 1){
          jQuery('div.photogallery_preview_description', $preview_window).html('<p style="padding:0px; width:' + div_width + 'px; height:auto; margin:0px;"></p>');
        }
        else{
          jQuery('div.photogallery_preview_description', $preview_window).html('<p style="padding:0px; width:' + div_width + 'px; height:auto; margin:0px; display:none;"></p>');
        }
      }

      var img_x = img_loader.width;
      var img_y = img_loader.height;

      if(img_x == null){ img_x = 400; }
      if(img_y == null){ img_y = 400; }

      var x     = jQuery(window).width();
      var y     = jQuery(window).height();

      if(img_y > y) {
        img_y = y - 40;
      } 

      jQuery('img', $preview_window).attr('src', image_path).unbind('click').click(_close_preview).attr('height', img_y);
      // jQuery('img', $preview_window).attr('src', image_path).unbind('click').click(_close_preview);

      var left = 0 - (parseInt($preview_window.width()) / 2);
      var top  = 0 - (parseInt($preview_window.height()) / 2);

      if(jQuery.browser.msie && (jQuery.browser.version < 7)) {
        top += jQuery(window).scrollTop();
        jQuery('select').hide();
      }

      $preview_window.css({ 'margin-top': top + 'px', 'margin-left': left + 'px' }).show();
    }

    // --------------------------------------------------------------------------
    function _close_preview() {
      if($preview_window){
        $preview_window.hide();
      }
      jQuery('div.photogallery_thumbnail_overlay').remove();
    }

    // function to produce full size images
    // --------------------------------------------------------------------------
    function generate_image(image_hash) {

      // Fix the path
      var src = base_uri + "/" + image_hash.original_image_path + "/" + image_hash.original_image_name;

      var image_hash ={
        id      : "photogallery_image_" + image_hash.filecabinet_file_id,
        // alt     : image_hash.original_image_name,
        src     : src
      };

      // Create the image!
      var $img  = jQuery('<img style="padding:5px;"></img>').attr(image_hash);  

      return($img);
    }

    // function to produce the thumbnails 
    // --------------------------------------------------------------------------
    function generate_thumbnail(image_hash) {

      // Fix the path
      var src         = base_uri + image_hash.thumbnail_thumb_path;
      var image_name  = image_hash.original_image_name;
      var image_desc  = image_hash.description;
      var image_path  = base_uri + image_hash.original_image_path + "/" + image_hash.original_image_name;
      var image_id    = "photogallery_image_" + image_hash.filecabinet_file_id;

      var image_attributes ={
        id      : image_id,
        src     : src
      };

      if(image_desc){
        image_attributes['title'] = image_desc;  
      }
      else{
        image_attributes['title'] = image_name;  
      } 
 
      // altered href to be https
      var $img  = jQuery('<img rel="lightbox[gallery]" href="' + image_path + '"></img>').attr(image_attributes);

      return($img);
    }

    // --------------------------------------------------------------------------
    function _move(dir, gallery_type) {
        //window.console.log("-----------------------------------");
        //window.console.log(dir);
        //window.console.log(locked);
        //window.console.log(gallery_type);
        //window.console.log(current_order_num);
        //window.console.log(max_order_num);
        //window.console.log("-----------------------------------");

      // While we're trying to load pictures, we'll need to lock people out of moving around. 
      if( 
          (locked) ||
          ( current_order_num == 0 && dir == 'left') || 
          ( (max_order_num == current_order_num) && dir == 'right') 
        ){
        //window.console.log("got caught!");
        return(1);
      }

      // Set the lock.
      locked = 1;

      // see what image number we're current on.
      current_order_num = $order_num_container.val();
      var next_image    = null;
      var new_order_num = current_order_num;

      // Get the current selected item (with selected class), if none was found, get the first item  
      // var current_image = jQuery('li.selected', $ul_container).length ? jQuery('li.selected', $ul_container) : jQuery('li:first', $ul_container);  
      var current_image = jQuery('li.img_selected', $ul_container);  
 
      // use prev and next to determine increment or decrement  
      // because the controls disappear, i don't do checking to see if there is a next or prev.
      if (dir == 'left') {  
        next_image = current_image.prev();
        new_order_num--;
        current_order_num--;
      } 
      else {  
        next_image = current_image.next();  
        new_order_num++;
        current_order_num++;
      }  
  
      // Set our new array number
      $order_num_container.val(new_order_num);

      //clear the selected class  
      current_image.removeClass('img_selected'); 

      //reassign the selected class to new image 
      next_image.addClass('img_selected');  

      // We scroll to the next image, and We use the function to 
      // make sure that the lock isn't set to zero before it's finished scrolling.
      var lock_function = function(){ locked = 0; };
      $images_container.scrollTo(next_image, 800, lock_function);

      // Set the image description if there is any.
      var image_hash = image_list[new_order_num];

      // Set the description 
      if(gallery_type != 'grid'){
        if(image_hash.description){
          if(show_description == 1){
            $p_container.fadeOut('slow', function() {
              $p_container.html(image_hash.description)
            }).fadeIn('slow');
          }
        }
        else{
          $p_container.fadeOut('slow', function(){ 
            $p_container.empty(); 
          });
        }
      }

      // Set the buttons again
      if( (gallery_type != 'slideshow_1') && (gallery_type != 'grid') ){
        if(next_image.next().length){
          $right_button.show(); 
        }
        else{
          $right_button.hide();
        }

        if(next_image.prev().length){
          $left_button.show();
        }
        else{
          $left_button.hide();
        }
      }
    }  
  }
  // ==========================================================
  // END PHOTOGALLERY
  // ==========================================================


  // ===========================================================
  // START SOCIALNETWORK
  // ===========================================================
  jQuery.fn.iv_socialnetwork = function(options) {
    return this.each(function() {
      new jQuery.iv.socialnetwork(this, options);
    });
  }

  jQuery.iv.socialnetwork = function(el, options) {

    options = jQuery.extend({
      name              : null,
      id                : null,
      url               : null,
      path              : null,
      title             : null,
      browser           : null,
      ws_name           : null
    }, options);

    // This will append it to the overall div.
    jQuery.data(el, options.name + '_' + options.id, this);

    var $$                = jQuery(el);
    var socialnetwork_id  = options.id;
    var name              = options.name;
    var url               = options.url;
    var path              = options.path;
    var $img              = jQuery('img', $$);
    var div_ident         = options.name + '_' + options.id;
    //var title             = jQuery('title').text();
    var title             = options.title;
    var ws_name           = options.ws_name;


    // this is the list of following social networks:
    //  socialnetwork   : Share on Facebook
    //  socialnetwork5  : Buzz This
    //  socialnetwork3  : Share on Twitter
    //  socialnetwork6  : Share on Plurk


    // SHARE ON FACEBOOK
    if( (name == 'socialnetwork') || (name == 'socialnetwork5') ){

      var target            = '_blank';
      //var target            = 'new';

      if(name == 'socialnetwork'){
        var $anchor = jQuery('<a target="' + target + '" style="text-decoration:none; padding:0px; margin:0px; border:0px; display:block;" href="http://www.facebook.com/share.php?u=' + url  + '"></a>');    
        $anchor.html($img);
        $$.empty();
        $$.html($anchor);
      }
      else{ // Buzz This

        //alert("title: " + title);
        //alert("url:   " + url); 
        //alert("ws_name: " + ws_name);

        // fixes a bug with ie.
        //if(!(title)){
        // title = options.title;
        //  alert("title changed to: " + title);
        //}

        // Remove slash for path.
        var regex = /\//;
        path = path.replace(regex, ""); 

        // Format will be (  websitename - pagename - url+path )
        var append = 'url=' + url;
        append = append + '&srcURL=' + url;

        if(title){
          if(title.match(ws_name)){
            append = append + '&title=' + title;
            append = append + '&srcTitle=' + title;
          }
          else{
            append = append + '&title=' + ws_name + ' - ' + title;
            append = append + '&srcTitle=' + ws_name + ' - ' + title;
          }
        }
        else{
          if(ws_name){
            append = append + '&title=' + ws_name;
            append = append + '&srcTitle=' + ws_name;
          }
          else{
            append = append + '&title=' + url;
            append = append + '&srcTitle=' + url;
          }
        }



        //var $anchor = jQuery('<a target="_blank" style="text-decoration:none; padding:0px; margin:0px; border:0px; display:block;" href="http://www.google.com/reader/link?' + append + '"></a>');
        var $anchor = jQuery('<a target="_blank" style="text-decoration:none; padding:0px; margin:0px; border:0px; display:block;" href="http://www.google.com/buzz/post?' + append + '"></a>');

        $anchor.html($img);
        $$.empty();
        $$.html($anchor);
      }
    }
    else{ 

      url = decodeURI(url);

      // This section contains socialnetworks that require 
      // bitly to shorten thier urls 
      // ----------------------------------------------------
      // Generate the bit.ly url
      //    if you need login into to the account, ask Bryan
      //    you can find the api key by going to: http://bit.ly/account/your_api_key
      // ----------------------------------------------------
      var defaults = {
        version:    '2.0.1',
        login:      'ivenue',
        apiKey:     'R_064320bbb6b53267e152fa2317b0e72b',
        history:    '0',
        longUrl:    url
      };

      // create the url.
      var daurl = "https://api-ssl.bit.ly/shorten?"
        +"version="+defaults.version
        +"&longUrl="+defaults.longUrl
        +"&login="+defaults.login
        +"&apiKey="+defaults.apiKey
        +"&history="+defaults.history
        +"&format=json&callback=?";

      // get the data!
      jQuery.getJSON(daurl, function(data){

        var data_errorCode = data.errorCode;
        var error_message;
        var short_url;

        // Lets see if there are any errors.
        if(data_errorCode > 0){
          var error_message = data.errorMessage;
        } 
        else{
          var results_errorCode = data.results[defaults.longUrl].errorCode;

          if(results_errorCode > 0){
            error_message = data.results[defaults.longUrl].errorMessage; 
          } 
          else{
            short_url = data.results[defaults.longUrl].shortUrl;
          }
        }

        // Now generate the html 
        if(error_message){
          // If for some reason we hit errors, we'll set it as a click function.  :(
          $img.click( function() {
            alert(error_message);
            return false;
          });
        }
        else{
          var target  = '_blank';
          var $anchor = null;
          //var target    = 'new';

          // SHARE ON TWITTER
          if(name == 'socialnetwork3'){
            // If we have no errors, and we get our short url, we'll go ahead and set the anchor.
            var $anchor = jQuery('<a target="' + target + '" style="text-decoration:none; padding:0px; margin:0px; border:0px; display:block;" href="http://twitter.com/home/?status=' + short_url + '"></a>');
          }
          else{
          // SHARE ON PLURK
          // socialnetwork6 
            //var $anchor = jQuery('<a target="' + target + '" style="text-decoration:none; padding:0px; margin:0px; border:0px; display:block;" href="http://www.plurk.com/?qualifier=shares&status=' + short_url + '"></a>');
            var $anchor = jQuery('<a target="' + target + '" style="text-decoration:none; padding:0px; margin:0px; border:0px; display:block;" href="http://www.plurk.com/m?qualifier=shares&content=' + short_url + '"></a>');
          }

          $anchor.html($img);
          $$.empty();
          $$.html($anchor);
        }

      });

    }
  }
  // ===========================================================
  // END SOCIALNETWORK
  // ===========================================================
  jQuery.fn.iv_unselectable = function() {
    return(this.each(function() {
      jQuery(this)
        .css('-moz-user-select', 'none')      // FF
        .css('-khtml-user-select', 'none')    // Safari, Google Chrome
        .css('-o-user-select', 'none')        // Opera
        .css('user-select', 'none');          // CSS 3

      if (jQuery.browser.msie) {                   // IE
        jQuery(this).each(function() {
          this.ondrag        = function() { return(false); };
          this.onselectstart = function() { return(false); };
        });
      }
      else if(jQuery.browser.opera) {
        jQuery(this).attr('unselectable', 'on');
      }
    }));
  };
  //---------------------------------------------------------------------------
  // Sets an initial text to a text input area.  Once the text area receives
  // focus the text will be cleared.
  //---------------------------------------------------------------------------
  // Use placeholder attribute instead
  //---------------------------------------------------------------------------
/*  jQuery.fn.iv_initial_text = function(options) {
    return(this.each(function() {
      new jQuery.iv.initial_text(this, options);
    }));
  } 

  jQuery.iv.initial_text = function(el, options) {
    var options = jQuery.extend({
      initial_text: ''
    }, options);

    var $$ = jQuery(el);

    $$.focus(function() {
      if($$.val() == options.initial_text) { $$.val(''); }
    });

    $$.blur(function() {
      if($$.val() == '') { $$.val(options.initial_text); }
    }).trigger('blur');
  }*/
  //---------------------------------------------------------------------------
})(jQuery);

