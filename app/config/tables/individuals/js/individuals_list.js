'use strict';

var idxStart = -1;
var individualsResultSet = {};
var locale = odkCommon.getPreferredLocale();


var registrationCBFailure = function(error) {

    console.log('registrationMember_list registrationCBFailure: ' + error);
};

var firstLoad = function() {
    return resumeFn(0);
};

/**
 * Called when page loads to display things (Nothing to edit here)
 */
var resumeFn = function(fIdxStart) {
    var renderPromise = new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(result) {
        individualsResultSet = result;

        return displayGroup(idxStart);
    });


    idxStart = fIdxStart;
    console.log('resumeFn called. idxStart: ' + idxStart);
    if (idxStart === 0) {
        // We're also going to add a click listener on the wrapper ul that will
        // handle all of the clicks on its children.
        $('#list').click(function(e) {
            var tableId = individualsResultSet.getTableId();
            // We set the rowId while as the li id. However, we may have
            // clicked on the li or anything in the li. Thus we need to get
            // the original li, which we'll do with jQuery's closest()
            // method. First, however, we need to wrap up the target
            // element in a jquery object.
            // wrap up the object so we can call closest()
            var jqueryObject = $(e.target);
            // we want the closest thing with class item_space, which we
            // have set up to have the row id
            var containingDiv = jqueryObject.closest('.item_space');
            var rowId = containingDiv.attr('rowId');
            console.log('clicked with rowId: ' + rowId);
            // make sure we retrieved the rowId
            if (rowId !== null && rowId !== undefined) {
                // we'll pass null as the relative path to use the default file
                odkTables.openDetailView(null, tableId, rowId,
                    'config/tables/' + util.individualTable + '/html/' + util.individualTable + '_detail.html');
            }
        });
    }

    return renderPromise;
};

/**
 * Displays the list view in chunks or groups. Number of list entries per chunk
 * can be modified. The list view is designed so that each row in the table is
 * represented as a list item. If you touch a particular list item, it will
 * expand with more details (that you choose to include). Clicking on this
 * expanded portion will take you to the more detailed view.
 */
var displayGroup = function(idxStart) {
    console.log('displayGroup called. idxStart: ' + idxStart);

    /* If the list comes back empty, inform the user */
    if (individualsResultSet.getCount() === 0) {
        var errorText = $('#error');
        errorText.show();
        errorText.text('No beneficiaries found'); // TODO: Translate this
    }

    var dbActions = [];

    /* Number of rows displayed per 'chunk' - can modify this value */
    var chunk = 50;
    for (var i = idxStart; i < idxStart + chunk; i++) {
        if (i >= individualsResultSet.getCount()) {
            break;
        }
        /* Creates the item space */
        // We're going to select the ul and then start adding things to it.
        //var item = $('#list').append('<li>');
        var item = $('<li>');
        item.attr('rowId', individualsResultSet.getRowId(i));
        item.attr('class', 'item_space');
        item.attr('id', individualsResultSet.getData(i, '_id'));
        dbActions.push(new Promise( function(resolve, reject) {
            odkData.query(util.getIndividualCustomFormId(), '_id = ?', [individualsResultSet.getData(i, 'custom_individual_row_id')],
                null, null, null, null, null, null, true, resolve, reject);
        }).then( function(customIndividualResult) {
            var first_last_name = customIndividualResult.getData(0, 'first_last_name');
            item.text(odkCommon.localizeText(locale, 'name') + ": " + first_last_name);
        }));


        /* Creates arrow icon (Nothing to edit here) */
        var chevron = $('<img>');
        chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
        chevron.attr('class', 'chevron');
        item.append(chevron);

        $('#list').append(item);

        // don't append the last one to avoid the fencepost problem
        var borderDiv = $('<div>');
        borderDiv.addClass('divider');
        $('#list').append(borderDiv);

    }

    if (i < individualsResultSet.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
    return Promise.all(dbActions);
};