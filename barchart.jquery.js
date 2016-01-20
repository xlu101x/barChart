(function($){

	var settings = {};

	$.fn.barChart = function(options){

		var defaults = {
			vertical : false,
			bars : [],
			hiddenBars : [],
			milestones : [],
			colors : [
				"#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", 
				"#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", 
				"#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", 
				"#ff5722", "#795548", "#9e9e9e", "#607d8b", "#263238"
			],
	    	barColors : {},
	    	dateFormat : 'DD.MM.YYYY HH:mm',
	    	barGap : 5,
	    	totalSumHeight : 25,
	    	defaultWidth : 40,
	    	defaultColumnWidth : 65,
	    	stepsCount : 5
		};


		settings = $.extend(settings, defaults, options);

		$(this)
			.css( 'height', settings.height && !settings.vertical ? settings.height : 'auto' )
			.addClass('bar-chart')
			.addClass( settings.vertical ? 'bar-chart-vertical' : '' )
			.wrap('<div class="bar-chart-wrapper"></div>');

		$.proxy(init, this)();	

		return this;
	};


	// init
	function init(){


		settings.maxHeight = settings.vertical ? $(this).width() : ( $(this).height() - settings.totalSumHeight );

		settings.maxWidth = settings.vertical ? settings.defaultWidth : $(this).width();

		settings.barGapPercent = settings.barGap / (settings.maxWidth / 100);


		var bars = colorizeBars(settings.bars, settings.colors);

		var columns = groupByKey(bars, settings.hiddenBars);


		$.proxy(drawY, this)(columns);

		$.proxy(drawX, this)(columns);

		$.proxy(drawTooltip, this)();

		$.proxy(drawLegend, this)(bars, settings.hiddenBars);

		$.proxy(subscribe_tooltip, this)();

		$.proxy(subscribe_legend, this)();

		return this;
	};

	// up to date
	function update(){

		var bars = colorizeBars(settings.bars, settings.colors);

		var columns = groupByKey(bars, settings.hiddenBars);


		$(this).html('');


		$.proxy(drawY, this)(columns);

		$.proxy(drawX, this)(columns);

		return this;
	};


	// group bar values by keys
	function groupByKey(bars, hiddenBars){

		var hiddenBarsArray = hiddenBars || [];

		var columns = {};

		bars.forEach(function(bar){

			if (hiddenBarsArray.indexOf(bar.name) !== -1) {
				return true;
			}

			bar.values.forEach(function(value){
				columns[ value[0] ] = columns[ value[0] ] || [];
				columns[ value[0] ].push({ value : parseFloat(value[1]), name : bar.name, color : bar.color });
			});

		});

		return columns;
	};

	// set bars colors
	function colorizeBars(bars, colors){

		colorIndex = 0;

		bars.forEach(function(bar){

			if (typeof bar.color === 'undefined') {
				bar.color = colors[colorIndex];
			}

			colorIndex++;

			if (colorIndex >= colors.length) {
				colorIndex = 0;
			}

		});

		return bars;
	};

	// find max value through all bars
	function findMax(columns){

		var result = 0;

		for (var i in columns) {

	        if (columns.hasOwnProperty(i)) {

	            var max = 0;

	            columns[i].forEach(function(value){
	                max += value.value;
	            });

	            if (max > result) {
	                result = max;
	            }

	        }

	    }

	    return result;
	};

	// find total sum of all values through all bars
	function totalSum(columns){

		var result = 0;

		for (var i in columns) {

	        if (columns.hasOwnProperty(i)) {

	            columns[i].forEach(function(value){
	                result += value.value;
	            });

	        }

	    }

	    return result;
	};

	// draw y-milestones
	function drawY(columns){

			var container = document.createElement('div');
		    
	    	var max = findMax(columns);
		    
		    var milestonesCount = Math.round( max ).toString().length;

		    var multiplier = Math.pow(10, milestonesCount - 1);

		    container.classList.add( settings.vertical ? 'bar-x' : 'bar-y' );

		    max = settings.vertical ? Math.ceil(max) : Math.ceil(max / multiplier) * multiplier;   

		    var step = (max / settings.stepsCount);

		    if (step < 1) {
		        step = 1;
		    }

		    var top = 0;
		    var value = 0;

		    var yClassName = settings.vertical ? 'bar-x-value' : 'bar-y-value';
		    var yPropertyName = settings.vertical ? 'left' : 'bottom';

		    while (top < settings.maxHeight) {

		        top = (value * settings.maxHeight) / max;

		        var gridValue = value;

		        if (gridValue < 1000) {
		            gridValue = gridValue.toFixed(2);
		        }

		        if (gridValue >= 1000 && gridValue <= 1000000) {
		            gridValue = (gridValue / 1000).toFixed(2) + ' K';
		        }

		        if (gridValue >= 1000000 && gridValue <= 1000000000) {
		            gridValue = (gridValue / 1000000).toFixed(2) + ' M';
		        }

		        var y = document.createElement('div');

		        y.classList.add( yClassName );
		        y.style[ yPropertyName ] = top + 'px';
		        y.innerHTML = '<div>' + gridValue + '</div>';
		       
		       	container.appendChild( y );

		        value += step;

		    }
		    
		    $(this).append( container );

		    return this;
	};

	// draw x-values
	function drawX(columns){

		var keys = Object.keys(columns);
		var columnsCount = keys.length;
	    var columnWidth = Math.round((settings.maxWidth - settings.barGap * (columnsCount + 1)) / columnsCount);

	    if (settings.vertical) {
	    	columnWidth = settings.defaultWidth;
	    }

	    var max = findMax(columns);
		var total = totalSum(columns);

	    if (!settings.vertical) {
	        if (columnWidth < settings.defaultColumnWidth) { //settings.defaultColumnWidth = 65
	            $(this).addClass('bar-titles-vertical');
	        }
	        columnWidth = (columnWidth / (settings.maxWidth / 100));
	    }


	    keys.sort(function(a,b){ return parseInt(a) - parseInt(b); });


	    var bars = document.createDocumentFragment();

	    for (var k in keys) {

	        if (keys.hasOwnProperty(k)) {

	            var key = keys[k];

	            var column = columns[key];

	            var localMax = 0;
	            var localSum = 0;
	            var localMaxHeight = 0;

	           	//sort values desc
	            column.sort(function (a, b) { return b.value - a.value; });

	            column.forEach(function(bar){
	                localMax = bar.value > localMax ? bar.value : localMax;
	                localSum += bar.value;
	            });

	            localMaxHeight = (localMax * settings.maxHeight / max);

	            var text = key.toString()

	            //it's timestamp, so let's format it
	            if (text.length === 10 && text == parseInt(text)) {
	            	text = formatDate(new Date(text * 1000));
	            }

	            var bar = document.createElement('div');
	            var barTitle = document.createElement('div');
	            var barValue = document.createElement('div');


	            barTitle.classList.add('bar-title');
	            barTitle.textContent = text;

	            barValue.classList.add('bar-value');
	            barValue.style[ settings.vertical ? 'width' : 'height' ] = localMaxHeight;

	            bar.classList.add('bar');

	            if (settings.vertical) {
	            	bar.style.height = columnWidth;
	            } else {
	            	bar.style.width = columnWidth + '%';
	            	bar.style.marginLeft = settings.barGapPercent + '%';
	            }

	            bar.setAttribute('data-id', key);

	            bar.appendChild(barTitle);
	            bar.appendChild(barValue);


	            var bottom = 0;
	            var previousBottom = 0;
	            var previousHeight = 0;

	            var partial = document.createDocumentFragment();

	            column.forEach(function (bar) {

	                var height = localMaxHeight / localMax * bar.value;
	                var percentage = (bar.value / (total / 100)).toFixed(2);

	                bottom = previousHeight + previousBottom;

	                var barLine = document.createElement('div');

	                barLine.classList.add('bar-line');

	                barLine.setAttribute('data-percentage', percentage + '%');
	                barLine.setAttribute('data-name', bar.name);
	                barLine.setAttribute('data-value', bar.value);

	                barLine.style.backgroundColor = bar.color;
	                barLine.style[ settings.vertical ? 'width' : 'height' ] = height + 'px';
	                barLine.style[ settings.vertical ? 'left' : 'bottom' ] = bottom + 'px';

	                partial.appendChild(barLine);

	                previousBottom = bottom;
	                previousHeight = height;

	            });
				
				barValue.appendChild( partial );

				var barSum = document.createElement('div');

				barSum.classList.add('bar-value-sum');

				barSum.style[ settings.vertical ? 'left' : 'bottom' ] = previousBottom + previousHeight + 'px';

				barSum.textContent = Number( localSum.toFixed(4) ); // trim unsignificant trailing zeros


				bar.appendChild(barSum);

	        }

	        bars.appendChild(bar);

	    }

	    $(this).append(bars);

	    return this;
	};

	// adds tooltip markup to dom
	function drawTooltip(){

	    if ($(this).find('.tooltip').length === 0) {

	    	$(this).append(
	    		'<div class="tooltip tooltip-mobile hidden" style="top: 0; left: 0;">' +
	        		'<div class="tooltip-title">{title}</div> ' +
					'<div class="tooltip-change">{value}</div> ' +
				'</div>'
			);

	    }

	    return this;
	};

	// legend
	function drawLegend(bars, hiddenBars){

		var $legend = $('<div />').addClass('bar-legend legend');

    	$(this).parent().append( $legend );

    	bars.forEach(function(bar){

    		var $checkbox = $('<div />')
    							.addClass('checkbox')
    							.addClass( hiddenBars.indexOf(bar.name) === -1 ? 'checked' : '' )
    							.css({ 'background-color' : bar.color });

			var $legendItem = $('<div />')
									.addClass('legend-item')
									.css({ color : bar.color })
									.html( bar.name )

    		var $legendItemWrapper = $('<div />')
    							.addClass('legend-item-wrapper')
    							.append( $checkbox )
    							.append( $legendItem );

    		$legend.append( $legendItemWrapper );

    	});

    	return this;
	};

	// mousemove and mouseleave pon bar
	function subscribe_tooltip(){

		var $barLines = $(this).find('.bar-line');
		var $tooltip = $(this).find('.tooltip');

		$barLines.on('mousemove', function(e){

	  		$(this).parents('.bar').addClass('bar-active');

	        $tooltip.css({
	            top: e.pageY - 65,		// + $(this).offset().top
	            left: e.pageX - 65		// + $(this).offset().left
	        });

	        $tooltip.find('.tooltip-title').html( $(this).data('name') );
	        $tooltip.find('.tooltip-change').html( $(this).data('value') + '<small>' + $(this).data('percentage') + '</small>' );

	        $tooltip.removeClass('hidden');

		});

		$barLines.on('mouseleave', function(e){

	  		$tooltip.addClass('hidden');

	        $(this).parents('.bar').removeClass('bar-active');

		});

		return this;
	};

	// checkbox click and double click
	function subscribe_legend(){

	    /**
	     * emulate single and double clicks pon same element
	     */
	    var clicks = 0;
	    var timer = null;
	    var delay = 200;

	    var $self = $(this);

		var $legendItemWrapper = $(this).parent().find('.legend-item-wrapper');


		$legendItemWrapper.on('mouseleave', function(){

			var barName = $(this).find('.legend-item').html();

			var $bar = $('.bar-line[data-name="' + barName + '"]');

			$bar.removeClass('active');

		});


		$legendItemWrapper.on('mouseenter', function(){

			var barName = $(this).find('.legend-item').html();

			var $bar = $('.bar-line[data-name="' + barName + '"]');

			$bar.addClass('active');

		});


	    $legendItemWrapper.on('click', function(e){

	        e.preventDefault();

	        var $this = $(this);

	        clicks++;

	        if (clicks === 1) {

	            timer = setTimeout(function(){

	                clearTimeout(timer);

	                var name = $this.find('.legend-item').html();

	                var isChecked = $this.find('.checkbox').hasClass('checked');

	                $('.bar-line[data-name="' + name + '"]').toggleClass('hidden');

	                $this.find('.checkbox').toggleClass('checked');


	                if (isChecked) {

	                    settings.hiddenBars.push(name);

	                } else {

	                    var index = settings.hiddenBars.indexOf(name);

	                    if (index >= 0) {
	                        settings.hiddenBars.splice(index, 1);
	                    }

	                }

	                $.proxy(update, $self)();

	                clicks = 0;

	            }, delay);

	        } else {

	            clearTimeout(timer);

	            var $checkbox = $(this).find('.checkbox');

	            var $checkboxes = $(this).parent().find('.checkbox.checked');

	            var checkedCount = $checkboxes.length;

	            if (checkedCount === 1 && $checkbox.hasClass('checked')) {

	                $(this).parent().find('.checkbox').addClass('checked');

	            } else {

	                $(this).parent().find('.checkbox').removeClass('checked');

	                $checkbox.addClass('checked');

	            }

	            var checkboxes = [];

	            $(this).parent().find('.checkbox:not(.checked)').each(function(){

	                checkboxes.push( $(this).next('.legend-item').html() );

	            });

	            settings.hiddenBars = checkboxes;

	            //self.update();
	            $.proxy(update, $self)();

	            clicks = 0;

	        }

	    });


	    $legendItemWrapper.on('dblclick', function(e){

	        e.preventDefault();

	    });

	    return this;
	};

	// dateformat to dd/mm/yyyy
	function formatDate(dt) {
	    var dd = dt.getDate();
	    var mm = dt.getMonth() + 1;
	    var yyyy = dt.getFullYear().toString().substring(2);
	    return [ dd, mm, yyyy ].join('.');
	};

}(jQuery));
