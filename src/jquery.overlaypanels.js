/*
 *  Project: Overlay Panels
 *  Description: Triggers the display of an overlay with panels appearing on top of it. Alternative to modals when you need more than one window.
 *  Author: Michael Haggerty <mhaggerty@trellon.com>
 *  License: GPL
 */
;(function ( $, window, document, undefined ) {
    /**
     * Default Variables: sorted by purpose
     * 
     * mainOverlay: Unique ID for the element for the overlay. If it does not exist, it will be created. 
     * opPanelOne: Unique ID for the first panel. If it does not exist, it will be created.
     * opPanelTwo: Unique ID for the second panel. If it does not exist, it will be created..
     * overlayContainer: Where to place the overlay. Valid options are 'element' and a CSS selector.
     *   - 'element' places the overlay containers just after the element.
     *   - A valid CSS selector places the overlay contaners just after the CSS selector.
     * overlayCover: Where are we placing the panels? It should always appear on top of the overlayCover element. This could be an element in the page or it could be the window itself
     *   - @todo: This might be repetitive. Consider combining with overlayContainer.
     * opPanelOnePos: Tells the plugin where to position the first panel. Can be 'element' or a valid CSS selector.
     * 
     */
    var pluginName = "overlaypanels",
        defaults = {
        mainOverlay:        'opOverlay',            // id for the overlay
        opPanelOne:         'opPanelOne',           // id for the first panel
        opPanelTwo:         'opPanelTwo',           // id for the second panel
        overlayContainer:   'element',              // where to place the overlay
        overlayCover:       'window',               // the element the overlay should cover. Defaults to window.
        opPanelOnePos:      'element',              // the element used to position the first panel. Defaults to element.
        opPanelTwoOffset:   10,                     // the number of pixels distance between the first panel and the second panel
        opPanelOneContent:  false,                  // content to go into the first panel
        opPanelContent:     false,                  // the content that appears in panel one when triggered. Defaults to false, required.
        opPanelTwoTrigger:  'li',   // valid css selector for content that appears in the second panel.
        opPanelTwoSelector: '.panel-two-content',   // valid css selector for content that appears in the second panel.
        mainOverlayfx:      false,                  // effect for overlay coming into view
        opPanelOnefx:       false,                  // effect for panel one coming into view
        opPanelTwofx:       false,                  // effect for panel two coming into view
        mainOverlayHidefx:  false,                  // effect for overlay coming into view
        opPanelOneHidefx:   false,                  // effect for panel one coming into view
        opPanelTwoHidefx:   false                   // effect for panel two coming into view
    };
    function Plugin ( element, options ) {
      
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
        
    }
    $.extend(Plugin.prototype, {
      
        init: function () {
          
          // Create the wrappers for the overlays
          var create = this.createOverlays();
          
          // Bind keypress and overlay click events to close the panels
          if(create){
            this.bindEvents();
          }
          
        },
        
        // Create the overlays. Check the DOM to see if the selectors exit, and create them if needed
        createOverlays: function () {
          
          var overlayContainer, action, overlay, panelone, paneltwo;
          
          // Set the target for where the overlays will appear.
          // Valid options are 'element' and a CSS selector.
          // 'element' places the overlay containers just after the element.
          // A valid CSS selector places the overlay contaners just after the CSS selector.
          if(this.settings.overlayContainer == 'element'){
            overlayContainer = $(this.element);
            action = 'after';
          } else if($(this.settings.overlayContainer).length > 0){
            overlayContainer = $(this.settings.overlayContainer);
            action = 'append';
          } else {
            return false;
          }
          
          // Check to see if the overlay already exists, and create one if we need it
          if(this.settings.mainOverlay && $('#' + this.settings.mainOverlay).length == 0){
            overlay = '<div id="' + this.settings.mainOverlay + '"></div>';
            overlayContainer[action](overlay);
          }
          // Create the first panel
          if(this.settings.opPanelOne && $('#' + this.settings.opPanelOne).length == 0){
            panelone = '<div id="' + this.settings.opPanelOne + '"></div>';
            overlayContainer[action](panelone);
          }
          // Create the second panel
          if(this.settings.opPanelTwo && $('#' + this.settings.opPanelTwo).length == 0){
            paneltwo = '<div id="' + this.settings.opPanelTwo + '"></div>';
            overlayContainer[action](paneltwo);
          }
          
          return true;
          
        },

        // Show the overlay. This gets called from the triggering element
        // We get information about the plugin from the event object
        showOverlay: function (ev) {
          
          var settings = ev.data.overlay.settings, cover = settings.overlayCover, overlay = $('#' + settings.mainOverlay), 
          panelOptions, displayFx = settings.mainOverlayfx;
          
          // where are we placing the overlay?
          // it should always appear on top of the overlayCover element
          // this could be an element in the page or it could be the window itself
          if (cover == window){
            cover = $('body');
            h = cover.height();
            w = cover.width();
            pos = { xpos: 0, ypos: 0 };
          } else {
            cover = $(cover);
            h = cover.outerHeight(true);
            w = cover.outerWidth(true);
            pos = cover.position();
          };
          
          // set dimensions for the overlay
          overlay.css({
            height: h,
            width: w,
            top: pos.top + "px",
            left: pos.left + "px"
          });
          
          // Display the overlay
          if(displayFx === false){
            ev.data.overlay.displayOverlay(overlay);
          } else {
            fx = displayFx;
            fx(overlay);
          }
          
          // display panel one
          panelOptions = {
            elem: this
          };
          ev.data.overlay.showPanelOne(panelOptions);
          
          // Add keybindings for hiding the overlay
          $(document).on( 
            'keyup.hideOverlay', {data: ev.data},  ev.data.overlay.hideOverlay
          );
          
          // Add clickevent for hiding the overlay
          overlay.on( 
            'click.hideOverlay', {data: ev.data, clickEvent: true }, ev.data.overlay.hideOverlay
          );
          
        },
        // Displays panel one
        showPanelOne: function (options) {
          
          var h, pos, bottom, toppos, elem, overlay = $('#' + this.settings.opPanelOne), position, displayFx = this.settings.opPanelOnefx;
          
          // Set content in the first panel
          overlay.html(this.settings.opPanelOneContent);
          
          // get the position for the first panel
          // @todo: add support for centering on window
          if(this.settings.opPanelOnePos == 'element' || $(this.settings.opPanelOnePos).length > 0){
            
            if(this.settings.opPanelOnePos == 'element'){
              // we are positioning this panel directly on top of the window
              elem = $(options.elem);            
            } else {
              // we are placing this panel above a specified DOM element
              elem = $(this.settings.opPanelOnePos);
            }
            position = this.getDOMElementPosition(elem, overlay);
            
            // set positioning
            h =       position.h;
            pos =     position.pos;
            bottom =  position.bottom;
            toppos =  position.pos.top;
            
          } else if(this.settings.opPanelOnePos == 'window'){
            // we are positioning this panel in the center left of the window
            elem = $('body');
            position = this.getBodyElementPosition(elem);
            
            // set positioning
            // @todo: this needs to be set for the window
            /*
            h =       position.outerHeight(true);
            pos =     position.position();
            bottom =  position.css('margin-bottom');
            toppos =  position.top;
            */
          } else {
            // if none of these are true, fail
            return false;
          }
          
          // Set the overlay position 
          overlay.css({
            left: pos.left + "px",
            top: toppos - overlay.outerHeight() + elem.outerHeight() + "px"
          });
          
          // Display the overlay
          if(displayFx === false){
            this.displayOverlay(overlay);
          } else {
            fx = displayFx;
            fx(overlay);
          }
          
          // add triggers for panel two
          overlay.find(this.settings.opPanelTwoTrigger).on('click.showPanel', { overlay: this }, this.showPanelTwo);

        },
        
        // Displays panel two
        showPanelTwo: function (ev) {
          
          var panelOptions, P1Pos, settings = ev.data.overlay.settings, overlay = $('#' + settings.opPanelTwo), 
          panelOne = $('#' + settings.opPanelOne), cover = settings.overlayCover, displayFx = settings.opPanelTwofx;
          
          // put content in the second panel
          // this pulls content from within the triggering element
          overlay.html($(this).find(settings.opPanelTwoSelector).html());
          
          // position the panel
          P1Pos = panelOne.position();
          panelOptions = {
            top: P1Pos.top + 'px',
            left: P1Pos.left + panelOne.outerWidth() + settings.opPanelTwoOffset + 'px',
          }
          overlay.css(panelOptions);
          
          // Display the overlay
          if(displayFx === false){
            ev.data.overlay.displayOverlay(overlay);
          } else {
            fx = displayFx;
            fx(overlay);
          }
          
        },
        
        // gets the position of a panel relative to a DOM element
        getDOMElementPosition: function(elem){
          var pos = {};
          pos.h = elem.outerHeight(true);
          pos.pos = elem.position();
          pos.bottom = elem.css('margin-bottom');
          return pos;
        },
        // gets the position of a panel relative to the body
        // @todo: complete this function
        getBodyElementPosition: function(elem, overlay){
          
          var pos = {};
          // @todo: add positioning logic
          // the panels should be centered on the page
          return pos;
        },
        
        // FX for displaying an overlay or a panel
        displayOverlay: function (overlay){
          $(overlay).fadeIn();
        },
        // FX for displaying an overlay or a panel
        hideOverlayfx: function (overlay){
          overlay.fadeOut();
        },
        // Hides all overlays and panels
        // Associated with the ESC key and the overlay
        hideOverlay: function(ev){
          var ol = ev.data.data.overlay, settings = ol.settings, o = $('#' + settings.mainOverlay), p1 = $('#' + settings.opPanelOne), p2 = $('#' + settings.opPanelTwo), clickEvent = ev.data.clickEvent;
          
          if (clickEvent || ev.keyCode == 27) { 
            // this gets rid of the keyup function
            $(document).off('keyup.hideOverlay');
            // hide panel two
            if(settings.opPanelTwoHidefx === false){
              ol.hideOverlayfx(p2);
            } else {
              fx = settings.opPanelTwoHidefx;
              fx(p2);
            }
            // hide panel one
            if(settings.opPanelOneHidefx === false){
              ol.hideOverlayfx(p1);
            } else {
              fx = settings.opPanelTwoHidefx;
              fx(p1);
            }
            // hide the overlay
            if(settings.mainOverlayHidefx === false){
              ol.hideOverlayfx(o);
            } else {
              fx = settings.opPanelTwoHidefx;
              fx(o);
            }
          }
        },
        // Bind a click event to the trigger
        bindEvents: function () {
          
          // The plug in itself gets passed into events so we can reference it later
          var options = {
            overlay: this 
          };
          
          // Show the overlay when the triggering element is clicked
          $(this.element).on('click.showOverlay', options, this.showOverlay);
          
          // @todo: add resize event
          
        },
        // removes the plugin
        destroy: function () {
          console.log('destroying overlyaypanels');
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });

        // chain jQuery functions
        return this;
    };

})( jQuery, window, document );