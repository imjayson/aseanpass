// ==UserScript==
// @name         Airasia Asean Pass
// @namespace    http://www.airasia.com/
// @version      0.1
// @description  enter something useful
// @author       You
// @include      http://www.airasia.com/sg/en/book-with-us/asean-pass.page
// @grant        unsafeWindow, document,window
// @require      https://code.jquery.com/jquery-1.11.2.js
// ==/UserScript==

var $ = unsafeWindow.jQuery;

unsafeWindow.$planner = $('<div class="container" style="flex-direction: row"></div>');
unsafeWindow.$counter = $('<h1 class="counter" style="flex-direction: row">Total Credits: 0</h1>');

var destinations = {};

var countryMapping = {};

var getCredits = function($table) {
    var credit = $table.find('[align=left]').text().split(' '); 
    credit = credit[0][credit[0].length-1];
    return credit;
}

unsafeWindow.createCol = function(loc) {
    var $locs = $('<div style="width: 200px;float: left;" class="loc"></div>');
    
    if (loc) {
        var avail = destinations[loc];
        $.each(avail, function(i,e) {
            $locs.append(createLink(i, e.country, e.credits));
            
        });
    } else {
        $.each(destinations, function(i,e) {
            $locs.append(createLink(i, e.country, 0));
        });
    }
    $planner.append($locs);
}

unsafeWindow.highlight = function($e) {
    $($e).parent().attr('done', true);
    
    $($e).parent().nextAll().remove();
    
    $.each($($e).parent().children(), function(i,other) {
        $(other).css('background-color', '#fff');
        $(other).removeClass('selected');
    });
    $($e).css('background-color', '#eee');
    $($e).addClass('selected');
}
unsafeWindow.updateCredits = function() {
    var count = 0;
    $.each($('.selected'), function(i,e) {
        count += +$(e).attr('credits');
    })
    $counter.html('Total Credits: ' + count);
}
var createLink = function(text, country, credits) {
    return $('<div onclick="highlight(this);updateCredits();createCol(this.getAttribute(\'loc-id\'));" loc-id="'+text+'" credits="'+credits+'">' + text + ' (' + countryMapping[text] + ')' + '</div>');
}

$(document).ready(function() {
    var tables = $('table');
    var reqTables = [$(tables[7]), $(tables[8]), $(tables[9]), $(tables[10])];
    
    
    for (var i=0; i< reqTables.length; i++) {
        var $curr = reqTables[i];
        var credits = getCredits($curr);
        
        var $places = $curr.find('tr').splice(1);
        
        
        // primary locations
        var $priLocs = reqTables[i].find('tbody > tr td:first-child').not(function(i,e) { 
            return $(e).html().indexOf('Fly from') === -1 
        });
        
        var priLocs = [];
        $.each($priLocs, function(i,e) { 
            var text = $(e).text().split('Fly from/to ');
            text = text[text.length-1];
            priLocs.push(text.trim()); 
        });
        console.log(priLocs);
        // secondary locations
        var $secLocs = reqTables[i].find('td').not('[colspan]').not(function(i, e) { 
            return $(e).html().indexOf('img') === -1 
        });
        
        var secLocs = [];
        var country;
        $.each($secLocs, function(i,e) { 
            var text = $(e).text();
            if ($(e).parent().find('strong')[0])
                country = $(e).parent().find('strong')[0].innerHTML;
            if (text)
                secLocs.push(text.trim());
            if (!countryMapping[text.trim()])
                countryMapping[text.trim()] = country;
            // var nameCorrection = $.inArray(text.trim(), priLocs);
            // console.log(nameCorrection)
            // console.log(nameCorrection)
            // console.log(nameCorrection !== -1)
            
            // if (nameCorrection !== -1) {
            //     console.log('adding country')
            //     priLocs.splice(nameCorrection, 1, text.trim() + ' (' + country + ')');
            // }
        });
        
        var secIndex = 0;        
        $.each(priLocs, function(i,pl) {
            var priColour = $($priLocs[i]).css('background-color');
            var dest = destinations[pl];
            if (!dest) {
                dest = {};
            }
            for (secIndex; secIndex< secLocs.length; secIndex++) {                
                var sl = secLocs[secIndex];
                if (priColour === $($secLocs[secIndex]).css('background-color')) {
                    dest[sl] = {
                        id: sl,
                        credits: credits
                    };
                    
                    if (!destinations[sl]) {
                        destinations[sl] = {};
                    }
                    destinations[sl][pl] = {
                        id: pl,
                        credits: credits
                    };
                } else {
                    break;
                }
            };
            destinations[pl] = dest;
        });
    }
    
    // construct planner
    $('body').empty();
    $('body').append($counter);
    $('body').append($planner);
    createCol();
});
