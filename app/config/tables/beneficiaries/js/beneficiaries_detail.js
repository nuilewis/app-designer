/**
 * The file for displaying detail views of the Tea Houses table.
 */
/* global $, control, data */
'use strict';

// Handle the case where we are debugging in chrome.
// if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
//   console.log('Welcome to Tables debugging in Chrome!');
//   $.ajax({
//       url: odkCommon.getFileAsUrl('output/debug/Tea_houses_data.json'),
//       async: false,  // do it first
//       success: function(dataObj) {
//           window.data.setBackingObject(dataObj);
//         }
//   });
// }
 
var beneficiaryResultSet = {};

function cbSuccess(result) {

  beneficiaryResultSet = result;
  var first_name = beneficiaryResultSet.get('first_name');
  var last_name = beneficiaryResultSet.get('last_name');
  $('#TITLE').text(first_name + ' ' + last_name);

  $('#FIELD_17').text(beneficiaryResultSet.get('beneficiary_code'));
  //$('#FIELD_18').text(beneficiaryResultSet.get('envelope_code'));

  /*var received_card = beneficiaryResultSet.get('received_card');
  var card_label = 'NO';
  if (received_card === '1') {
    card_label = 'YES';
  }*/


  $('#FIELD_4').text(beneficiaryResultSet.get('address'));

  $('#FIELD_5').text(beneficiaryResultSet.get('city'));

  $('#FIELD_8').text(beneficiaryResultSet.get('telephone'));

  $('#FIELD_9').text(beneficiaryResultSet.get('date_screened'));

  $('#FIELD_20').text(beneficiaryResultSet.get('village'));
  $('#FIELD_21').text(beneficiaryResultSet.get('sub_village'));
  $('#FIELD_22').text(beneficiaryResultSet.get('district'));
  $('#FIELD_23').text(beneficiaryResultSet.get('distribution_site'));
  $('#FIELD_24').text(beneficiaryResultSet.get('mobile_provider'));

  var jsonMap = {};
    // Prepopulate plot id
  jsonMap.beneficiary_code = beneficiaryResultSet.get('beneficiary_code');

  jsonMap = JSON.stringify(jsonMap);

  var deliver = $('#deliver');
  deliver.on(
      'click',
      function() {
       // var rowId = beneficiaryResultSet.getRowId(0);
        odkTables.addRowWithSurvey(
          'deployment',
          'deploy_to_beneficiary',
          null,
          jsonMap);
      }
    );
}

function cbFailure(error) {
  console.log('beneficiaries_detail cbFailure: getViewData failed with message: ' + error);
}

function display() {
  odkData.getViewData(cbSuccess, cbFailure);
}

