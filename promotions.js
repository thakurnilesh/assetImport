/*
*    Function which converts line-item eligible promotions strings into a single select menu of available promotion code values.
*/
var appliedString = jQuery("textarea[id*=appliedPromotions_quote]").val();
var docnums = [];
var promos = [];
var appliedArray = [];
var count=0;
if(appliedString){
    appliedArray = appliedString.split("!!!");
	for(i=0;i<appliedArray.length-1;i++){
		var appliedPromo = appliedArray[i].split(".!.");
		docnums[i] = appliedPromo[0];
		promos[i] = appliedPromo[1]; //Holds the promo like "FSFREECBC"
	}
}
/*jQuery("input[name='_line_item_list']").click(function() {
	var docNumber = $(this).val();
	var selectCheckAttr = "input[name*='"+docNumber+"_selectedLineItemCheck_line']";
	if($(this).prop('checked')){
		jQuery(selectCheckAttr).prop('checked',true);
		console.log("main check box is checked");
		
	}else{
		jQuery(selectCheckAttr).prop('checked',false);
		console.log("the main cbk value not populated");
	}
	
});  */
jQuery("span[id*=_eligiblePromotions_line]").each(function(){
	//FH25.!.25.0.!.3!!!FH33.!.33.0.!.3!!!
	//var declation
	//var index = jQuery(this).attr('id').substring(9,10);
	//split the string
	var index = jQuery(this).attr('id').split("_");
	
	var selectIndex = docnums.indexOf(index[1]); 
	
	var selectPromo = "";
	if(selectIndex>-1){
		var selectPromo = promos[selectIndex];
	}
	
	var promoString = jQuery(this).text();
	var resultString = '';
	var firstTime = true;	
	if(promoString.indexOf(".!.")>-1){
		
		var promoArray = promoString.split("!!!");
		
		
		//var findposition= jQuery.inArray( "ADVANTAGECAPPEDPRICE", promoArray.toString()); 
		console.log(promoArray.toString().indexOf("ADVANTAGECAPPEDPRICE"));
		
		if(promoArray.toString().indexOf("ADVANTAGECAPPEDPRICE") != -1){
			count =count+1;
		}
		//build single-select menu
		for(i=0; i<promoArray.length-1;i++){
		
			var promoValues = promoArray[i].split(".!.");
			
			
			if(firstTime){
				
			   // Removed id else condition always set blank as default  CRM 1526	//if(promoArray.toString().indexOf("ADVANTAGECAPPEDPRICE") == -1){
						resultString = '<SELECT><OPTION VALUE="' + promoValues[2] + '.!.0!!!" ID="0" ';
				if(selectPromo==""){
					resultString = resultString + ' selected="selected"';
				}
				resultString = resultString + '> </OPTION>';
				firstTime = false;
			/*	}
				else{
					
							resultString = '<SELECT><OPTION ID="' + promoValues[0] + '" VALUE="' + promoValues[2] + '.!.' + promoValues[0] + '!!!' + '"';
				if(selectPromo==""){
					resultString = resultString + ' selected="selected"';
				}
				resultString = resultString + '> </OPTION>';
				firstTime = false;
				
				} */
				
			}
			resultString = resultString + '<OPTION ID="' + promoValues[0] + '" VALUE="' + promoValues[2] + '.!.' + promoValues[0] + '!!!' + '"';
			if(promoValues[0]==selectPromo){
				resultString = resultString + 'selected="selected"';
				selectFlag=false;
			}
			// Updated for to set default ADVANTAGECAPPEDPRICE CRM 1526 
			if(promoValues[0] != "ADVANTAGECAPPEDPRICE"){
				resultString = resultString + '>' + promoValues[0] + ' - ' + promoValues[1] + '%</OPTION>';
			}
			else{
			    if(selectPromo==""){
					resultString = resultString + ' selected="selected" >' + promoValues[0] + '</OPTION>';
					//CRM 1526
					appliedString=appliedString+'!!!'+index[1]+'.!.'+'ADVANTAGECAPPEDPRICE';
					jQuery("textarea[id*=appliedPromotions_quote]").val(appliedString);					
					document.bmDocForm._line_item_modified.value=true;
				}			
				 else{
					resultString = resultString + '>' + promoValues[0] + '</OPTION>';
				}				
			}
			// END CRM 1526
		}
		console.log(resultString);
		//replace string with single select menu.
		jQuery(this).html('');
		jQuery(this).parent().replaceWith(resultString + '</SELECT>');
	}
	
});

/*
* Below is the function written to disable the promotions dropdown in cancel, buyout or reinstate
*/

jQuery("td[id*='_lineType_line'] select").each(function(){
	
	var lineType = jQuery(this).find('option:selected').val();
	jQuery(this).removeAttr('onchange').removeAttr('class');
	var docNumberArr = [];
	docNumberArr = jQuery(this).attr('name').split("_");	
	if(lineType !== "" && lineType !== undefined){
		var promoAttr = "td[id*='_"+docNumberArr[2]+"_eligiblePromotions_line']";
		var promoDropdown = $(promoAttr).find("select");
		if(lineType.toLowerCase() === "cancel" || lineType.toLowerCase() === "reinstate" || lineType.toLowerCase() === "buyout"){
			jQuery(promoDropdown).attr('disabled', true);
		}else{
			jQuery(promoDropdown).attr('disabled', false);
		}	
	}
});

jQuery("td[id*='_lineType_line'] select").change(function(){	
	var lineType = jQuery(this).find('option:selected').val();
	var docNumber = jQuery(this).parents('tr').attr('documentNumber');
	if(lineType !== "" && lineType !== undefined){
		var promoAttr = "td[id*='_"+docNumber+"_eligiblePromotions_line']";
		var promoDropdown = $(promoAttr).find("select");
		if(lineType.toLowerCase() === "cancel" || lineType.toLowerCase() === "reinstate" || lineType.toLowerCase() === "buyout"){
			jQuery(promoDropdown).attr('disabled', true);
		}else{
			jQuery(promoDropdown).attr('disabled', false);
		}
		jQuery(this).attr('class','auto-run-rule-trigger');
		jQuery(this).attr('onchange','document.bmDocForm._line_item_modified.value=true');
		document.bmDocForm._line_item_modified.value=true;
	}
});

/*
*	Function which updates the Applied Promotions string if any changes are necessary
*	Inputs: PromoCode promo, Int docnum
*/
jQuery("td[id*='_eligiblePromotions_line'] select").change(function() {
//var appliedPromoFunc = function(promotion){
	var promotion =jQuery(this).val();
	// Code to populate percentage to Line Discount -- Start
	var docNumber = jQuery(this).parents('tr').attr('documentNumber');
	var lineDiscountField = "input[name*='_"+docNumber+"_override_line']";
	var lineDiscountTypeField = "select[name*='_"+docNumber+"_discountType_line']";
	var changedValue = jQuery(this).find('option:selected').text();
	// Added ADVANTAGECAPPEDPRICE in the condition : CRM 1526
	if(changedValue !== " " && changedValue !== undefined && changedValue !== "" && changedValue !== "ADVANTAGECAPPEDPRICE"){
		
		var defaultDiscArr = changedValue.split(" - ");
		var discPercent = defaultDiscArr[1].split("%");
		var tempVal = parseFloat(discPercent[0]).toFixed(3) + 0.0000;
		jQuery(lineDiscountField).val(tempVal);
		jQuery(lineDiscountField).change();
		jQuery(lineDiscountTypeField).val("%");
		jQuery(lineDiscountTypeField).change();
	}else{
		var defaultPercentage = 0.0000;
		jQuery(lineDiscountField).val(defaultPercentage.toFixed(4));
		jQuery(lineDiscountField).change();
		jQuery(lineDiscountTypeField).val("%");
		jQuery(lineDiscountTypeField).change();
	}	
	// Code to populate percentage to Line Discount -- END
	var updateString = "";
	var update = false;
	var appliedPromoChangeFlag = false;
	var promotionArr = [];
	var applyString = jQuery("textarea[id*=appliedPromotions_quote]").val();
	var applyStringArr = applyString.split("!!!");
	var myJsonObject = {};
	for(i = 0; i < applyStringArr.length; i++ ){
		var temp = applyStringArr[i].split(".!.");
	  if(temp[0] != ""){
			myJsonObject[temp[0]] = temp[1];
	  }
	}
	promotion = promotion.replace("!!!","");
	promotionArr = promotion.split(".!.");
	if(typeof promotionArr !== 'undefined' && promotionArr.length > 0){
		if(promotionArr[1] == '0'){
			promotionArr[1] = "";
		}
		if(myJsonObject.hasOwnProperty(promotionArr[0])){
		  if(promotionArr[1] == "" || promotionArr[1] == undefined ){
			delete myJsonObject[promotionArr[0]];
		  }else{
			 myJsonObject[promotionArr[0]] = promotionArr[1];
		  }
		}else{
		  myJsonObject[promotionArr[0]] = promotionArr[1];
		}
		for (var key in myJsonObject) {
			updateString = updateString + key + ".!." + myJsonObject[key] + "!!!";
		}

		console.log("restults "+updateString);
		appliedPromoChangeFlag = true;
	}
		
	if((updateString == "" || updateString == undefined) && appliedPromoChangeFlag == false ){
		jQuery("textarea[id*=appliedPromotions_quote]").val(applyString);
	}else{
		jQuery("textarea[id*=appliedPromotions_quote]").val(updateString);
	}
	console.log(promotionArr[0]);
	var attrib = "textarea[id*='"+promotionArr[0]+"_appliedPromotions_line']";
	jQuery(attrib).val(promotionArr[1]);
	document.bmDocForm._line_item_modified.value=true;
});

/*
* Cancellation Reasons Start : CRM 1833
*/
jQuery("span[id*=_eligibleReasons_line]").each(function(){	
	var index = jQuery(this).attr('id').split("_");	
	var selectIndex = index[1]; 
	var promoString = jQuery(this).text();
	var selectPromo = "";
	var initVal="";
	var selectFlag=true;
	if(selectIndex>-1){
		var selectPromo = jQuery("input[id*='"+selectIndex+"_appliedReasons_line']").val();		
	}
	
	var resultString1 = '';	
	if(promoString.indexOf(".!.")>-1){		
		var promoArray = promoString.split("!!!");			
		//build single-select menu
		resultString1 = '<SELECT>';
		for(i=0; i<promoArray.length-1;i++){		
			var promoValues = promoArray[i].split(".!.");							
			resultString1 = resultString1 + '<OPTION VALUE="' + promoValues[0] + '" ';	
			if(i==0){
				initVal= promoValues[1];
			}
			if(selectPromo == promoValues[1]){
				resultString1 = resultString1 + ' selected="selected" >' + promoValues[1] + '</OPTION>';
				selectFlag=false;
			}else{
				resultString1 = resultString1 + '>' + promoValues[1] + '</OPTION>';
			}				
			
		}
		console.log(resultString1);
		//replace string with single select menu.
		jQuery(this).html('');
		jQuery(this).parent().replaceWith(resultString1 + '</SELECT>');
		if(selectFlag){
			var attrib = "input[id*='"+selectIndex+"_appliedReasons_line']";
			jQuery(attrib).val(initVal);
			document.bmDocForm._line_item_modified.value=true;
		}
	}
	
});

jQuery("td[id*='_eligibleReasons_line'] select").change(function() {
//var appliedPromoFunc = function(promotion){
	var promotion =jQuery(this).val();	
	// Code to populate percentage to Line Discount -- Start
	var docNumber = jQuery(this).parents('tr').attr('documentNumber');	
	var changedValue = jQuery(this).find('option:selected').text();	
    var attrib = "input[id*='"+docNumber+"_appliedReasons_line']";
	jQuery(attrib).val(changedValue);
	document.bmDocForm._line_item_modified.value=true;	
});
// CRM 1833: End