/**
 * Render the registration detail page
 */

'use strict';

var customBeneficiaryEntityResultSet = {};
var type = util.getQueryParameter('type');
var rootRowId = util.getQueryParameter('rootRowId');
var locale = odkCommon.getPreferredLocale();
var beneficiaryEntityId;

function display() {
    var displayPromise = new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(result) {
        customBeneficiaryEntityResultSet = result;


        //TODO: add translations entry for each column of all tables
        var exclusionList = [];
        util.populateDetailView(customBeneficiaryEntityResultSet, "field_list", locale, exclusionList);
        return new Promise(function (resolve, reject) {
            odkData.query(util.beneficiaryEntityTable, '_id = ?', [rootRowId],
                null, null, null, null, null, null, true, resolve, reject);
        });
    }).then( function(result) {
        $('#title').text(odkCommon.localizeText(locale, 'beneficiary_entity_id') + ": " + result.get('beneficiary_entity_id'));
        beneficiaryEntityId = result.getData(0, "beneficiary_entity_id");
        let exclusionList = ["beneficiary_entity_id"];
        if (type === 'override_beneficiary_entity_status') {
            $('#toggle_workflow').hide();
            initBeneficiaryStatusToggle(result.getData(0, "status"));
            exclusionList.push('status');
        }  else if (type === 'override_entitlement_status') {
            $('#toggle_workflow').hide();
            setSublistToPendingEntitlements('change_status');


        } else if (util.getRegistrationMode() === "INDIVIDUAL") {
            if (result.get('status') === 'DISABLED') {
                // do nothing, this should be called as a detail view without sublist
            } else {
                console.log("entered individual path");
                $('#toggle_workflow').hide();
                initEntitlementToggle();
                setToDeliveryView(false);
            }
        } else if (util.getRegistrationMode() === "HOUSEHOLD") {
            if (result.get('status') === 'DISABLED') {
                $('#toggle_workflow').hide();
                setToHouseholdView();
            } else {
                console.log("entered household path");
                initEntitlementToggle();
                if (type === "registration") {
                    setToHouseholdView();
                } else if (type === "delivery") {
                    setToDeliveryView(true);
                }
            }
        }
        util.populateDetailView(result, "field_list", locale, exclusionList);
    });

    displayPromise.catch( function(reason) {
        console.log('getViewData failed with message: ' + reason);
    });
    return displayPromise;
}

 function initBeneficiaryStatusToggle(status) {
     $('#switch-title-id').text('Beneficiary Entity Status'); // TODO: localize this

     if (status === 'ENABLED') {
         $('#left').prop('checked', true);
     } else {
         $('#right').prop('checked', true);
     }

     $('#left_txt').text('Enabled'); // TODO: Localize this
     $('#left').click(function() {
        changeStatusPromise('ENABLED');
     });

     $('#right_txt').text('Disabled'); // TODO: Localize this
     $('#right').click(function() {
         changeStatusPromise('DISABLED');
     });

     $('#switch-id').show();
 }

 function changeStatusPromise(status) {
     return new Promise( function(resolve, reject) {
         odkData.updateRow(util.beneficiaryEntityTable, {'status' : status}, rootRowId,
             resolve, reject);
     }).then( function(result) {
         console.log('Update success: ' + result);
     }).catch( function(reason) {
         console.log('Update failure: ' + reason);
     });
 }


function initEntitlementToggle() {
    $('#switch-title-id').text('Entitlements Listed'); // TODO: localize this

    $('#left_txt').text('Pending'); // TODO: Localize this
    $('#left').click(function() {
        setSublistToPendingEntitlements('deliver');
    });

    $('#right_txt').text('Delivered'); // TODO: Localize this
    $('#right').click(function() {
        setSublistToDeliveredEntitlements();
    });
}

// TODO: abstract a default individual foreign key value to populate the registration detail view with

function setToHouseholdView() {
    var toggleWorkflowButton = $('#toggle_workflow');
    toggleWorkflowButton.find(".sr-only").text("Entitlements");

    toggleWorkflowButton.off('click').on('click', function(e) {
        e.preventDefault();
        console.log("setting to delivery view");
        setToDeliveryView(true);
    });
    $('#switch-field').hide();
    setSublistToHousehold();
}

function setToDeliveryView(includeWorkflowButton) {
    if (includeWorkflowButton) {
        var toggleWorkflowButton = $('#toggle_workflow');
        toggleWorkflowButton.find(".sr-only").text("Household");
        toggleWorkflowButton.off('click').on('click', function(e) {
            console.log("preventing default");
            e.preventDefault();
            console.log("setting to registration view");
            setToHouseholdView();
        });
    }
    $('#switch-id').show();
    if ($('#left').is(':checked')) {
        setSublistToPendingEntitlements('deliver');
    } else {
        setSublistToDeliveredEntitlements();
    }
}

function setSublistToPendingEntitlements(action) {
    console.log("setting to pending");

    var joinQuery = 'SELECT * FROM ' + util.entitlementTable + ' t1 LEFT JOIN ' +  util.deliveryTable +
        ' t2 ON t2.entitlement_id = t1._id WHERE t2._id IS NULL AND t1.beneficiary_entity_id = ?';

    odkTables.setSubListViewArbitraryQuery(util.entitlementTable, joinQuery, [beneficiaryEntityId],
        'config/tables/' + util.entitlementTable + '/html/' + util.entitlementTable + '_list.html?action=' + encodeURIComponent(action));
}

function setSublistToDeliveredEntitlements() {
    console.log("setting to delivered");

    var joinQuery = 'SELECT * FROM ' + util.entitlementTable + ' t1' +
        ' JOIN ' + util.deliveryTable + ' t2 ON t2.entitlement_id = t1._id' +
        ' WHERE t1.beneficiary_entity_id = ?';

    odkTables.setSubListViewArbitraryQuery(util.entitlementTable, joinQuery, [beneficiaryEntityId],
        'config/tables/' + util.entitlementTable + '/html/' + util.entitlementTable + '_list.html?action=' + encodeURIComponent('detail'));

}

function setSublistToHousehold() {
    console.log("setting to household");
    odkTables.setSubListView(util.individualTable, 'beneficiary_entity_row_id = ?',
        [rootRowId],
        'config/tables/' + util.individualTable + '/html/' + util.individualTable +'_list.html');
}


