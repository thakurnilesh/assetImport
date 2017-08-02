/* 
	==================================================================================================
	
 COMMERCE ACTION - ASSETS IMPORT										 						

	+-----------------------------------------------------------------------------------------------+
	
 Assets is imported from salesforce.									 						

	
 The import assets are added as lines when the quote is Renewal.		 						

	
 Assets Update is called via SOAP to update the lines with the asset values.		 			

	
 If renewalsDetails_quote is populated with a value then all the SOAP calls have been successful	

	=================================================================================================	
*/
/*-------------------------------------------------------------------------------------------------------------
//USE THIS FOR TESTING PURPOSES
//Renewals Holder String = 
//COBROKE#2.0#2015-06-10#2015-12-10##02ig0000005jvVOAAY#524.0#Fast Follow-Up#Full#90008!!COBROKE#12.0#2015-06-10#2015-12-10##02ig0000005jvVOAAY#524.0#Fast //Follow-Up#Full#90008!!
Renewals Holder String = 
COBROKE#2.0#2015-06-11#2015-12-11##02ig0000005jxT8AAI#323.0#Fast Follow-up#Full#90008#6#Monthly########false#false#!!
---------------------------------------------------------------------------------------------------------------*/
/*---------------------------------CONSTANTS---------------------------*/
DEBUG = true;
temp = "";
assetDelim = "!!";
fieldDelim = "#";

partNumIndex = 0;
qtyIndex = 1;
installDate = 2;
usageEndDate = 3;
status = 4;
assetIDIndex = 5;
priceIndex = 6;
leadTypeIndex = 7;
productTypeIndex = 8;
marketIndex = 9;

contractTermIndex = 10; 
billingPeriodIndex = 11; 
promotionIndex = 12;
discountTypeIndex = 13;
commerceGroupIndex =14;
brokerPlanAffiliationIndex =15;
productEmailIndex = 16;
participantsIndex = 17;
licenseTierRangeIndex = 18; 
topConnectorIndex = 19;
featuredMortgageIndex = 20;
hLCOverrideIndex = 21;
zouraProductRatePlanChargeIndex = 22;
zouraIdIndex = 23;
subscriptionIdIndex = 24;
priceTierIndex = 25;
zuoraProductRatePlanIdIndx = 26;
//nextChargeDateIndx = 27;
assetListPriceIndex = 27;
EXTERNAL_ID_INDEX = 28;
subscriptionStartDateIndex = 29;
subscriptionEndDateIndex = 30;
HLC_INDEX = 31;
EXTERNAL_ID_LINE_INDEX = 32;
overrideTermIndex = 33;
licenseTierIndex = 34;
manualDiscountAmountIndex = 35;
manualDiscountTypeIndex = 36;
assetPriceEffectiveDateIndex = 37;
marketKeyIndex = 38;
renewalStatusindex= 39;
costPerActionIndex = 40;
MANUAL_LIST_PRICE_OVERRIDE_INDEX = 41;
NEXT_CHARGE_DATE_INDEX = 42;
marketCodeIndex = 43;
lastModifiedByIndex = 44;
termEndDateIndex = 46;
MONTHLY_CONTRACTED_UNITS = 47;
CONTRACTED_UNITS = 48;
campaignIdIndex = 49;
PRICE_PER_IMPRESSION_INDEX = 50;
UNDERSOLD_MARKET_INDEX = 51;
extendedNetPriceIndex = 52;
ACCOUNT_CATEGORY_INDEX = 53;
//Added below line for Ticket# CRM - 1772
ASSET_NUMBER_INDEX = 54;
/*---------------------------------VARIABLES---------------------------*/ 
parts = String[][];
returnStr = "";
CobrokeFlg = false;
existingAssets = string[];

//Get all existing assetid's
for line in transactionLine {
	if(line._part_number<>"" AND line.assetID_l<>""){
		append(existingAssets,line.assetID_l);
	}
}

/* ======================================================================== *
*	Add assets as line items and upddate is using SOAP calls *
* ======================================================================== */

//if(quoteType_quote == "retention" OR quoteType_quote == "backout" OR quoteType_quote == "buyout") {
if(renewalsHolderString_quote <> "") {
	i = 0;
	j = 0; //CRM-1928
	fivestreetEmail = ""; //CRM-1928
	assets = split(renewalsHolderString_quote,assetDelim);
	/* ======================================================================== *
	*	LOOP through line assets and create Parts array for further processing  *
	* ======================================================================== */
	for asset in assets {
		if(asset <> "" ) {
			fields = split(asset,fieldDelim);
			if(fields[0] == "COBROKE"){ //CRM-1928
				CobrokeFlg = true;
				if(fivestreetEmail == ""){
				fivestreetEmail = fields[productEmailIndex];
				}
			}
			//print asset;
			//print fields;
			//If not an existing asset then only add it.
			if(findinarray(existingAssets, fields[assetIDIndex]) == -1 ){
				parts[i][partNumIndex] = fields[partNumIndex];
				qty = "1";
				if(fields[qtyIndex] <> "" AND isnumber(fields[qtyIndex])){
					qtyValIndex = find(fields[qtyIndex],".");
					if(qtyValIndex <> -1){
						qty = substring(fields[qtyIndex], 0, qtyValIndex);
					}
					else{
						qty = fields[qtyIndex];
					}
				}
				parts[i][qtyIndex] = qty;
				parts[i][assetIDIndex] = fields[assetIDIndex];
				parts[i][installDate] = fields[installDate];
				parts[i][usageEndDate] = fields[usageEndDate];
				
				parts[i][status] = fields[status];
				
				parts[i][priceIndex] = fields[priceIndex];
				parts[i][leadTypeIndex] = fields[leadTypeIndex];
				parts[i][productTypeIndex] = fields[productTypeIndex];
				parts[i][marketIndex] = fields[marketIndex];

				parts[i][contractTermIndex] = fields[contractTermIndex];
				parts[i][billingPeriodIndex] = fields[billingPeriodIndex];
				
				//parts[i][promotionIndex] = fields[promotionIndex];
				promotionVal = fields[promotionIndex];
				promoStrLen = find(promotionVal," ");
				if(promoStrLen <> -1){
					promotionVal = substring(promotionVal,0,promoStrLen);
					print promotionVal;
				}
				parts[i][promotionIndex] = promotionVal;
				
				parts[i][discountTypeIndex] = fields[discountTypeIndex];
				parts[i][commerceGroupIndex] = fields[commerceGroupIndex];
				parts[i][brokerPlanAffiliationIndex] = fields[brokerPlanAffiliationIndex];
				parts[i][productEmailIndex] = fields[productEmailIndex];
				parts[i][participantsIndex] = fields[participantsIndex];
				parts[i][licenseTierRangeIndex] = fields[licenseTierRangeIndex];
				parts[i][topConnectorIndex] = fields[topConnectorIndex];
				parts[i][featuredMortgageIndex] = fields[featuredMortgageIndex];
				parts[i][hLCOverrideIndex] = fields[hLCOverrideIndex];
				
				parts[i][zouraProductRatePlanChargeIndex] = fields[zouraProductRatePlanChargeIndex];
				parts[i][zouraIdIndex] = fields[zouraIdIndex];
				parts[i][subscriptionIdIndex] = fields[subscriptionIdIndex];
				if(isNumber(fields[priceTierIndex]))
				{
					parts[i][priceTierIndex] = string(integer(atof(fields[priceTierIndex])));
				}
				else
				{
					parts[i][priceTierIndex] = fields[priceTierIndex];
				}
				parts[i][zuoraProductRatePlanIdIndx] = fields[zuoraProductRatePlanIdIndx];
				//parts[i][nextChargeDateIndx] = fields[nextChargeDateIndx];
				parts[i][assetListPriceIndex] = fields[assetListPriceIndex];
				parts[i][EXTERNAL_ID_INDEX] = fields[EXTERNAL_ID_INDEX];
				parts[i][subscriptionStartDateIndex] = fields[subscriptionStartDateIndex];
				parts[i][subscriptionEndDateIndex] = fields[subscriptionEndDateIndex];
				parts[i][HLC_INDEX] = fields[HLC_INDEX];
				parts[i][EXTERNAL_ID_LINE_INDEX] = fields[EXTERNAL_ID_LINE_INDEX];
				parts[i][overrideTermIndex] = fields[overrideTermIndex];
				if(isnumber(fields[licenseTierIndex])){
					parts[i][licenseTierIndex] = string(integer(atof(fields[licenseTierIndex])));
				}else{
					parts[i][licenseTierIndex] = "0" ;
				}
				print "Asdasd";
				print parts[i][licenseTierIndex];
				parts[i][manualDiscountAmountIndex] = fields[manualDiscountAmountIndex];
				parts[i][manualDiscountTypeIndex] = fields[manualDiscountTypeIndex];
				parts[i][assetPriceEffectiveDateIndex] = fields[assetPriceEffectiveDateIndex];
				parts[i][marketKeyIndex] = replace(fields[marketKeyIndex],"|","@@");
				parts[i][renewalStatusindex] = fields[renewalStatusindex];
				parts[i][costPerActionIndex] = fields[costPerActionIndex];
				parts[i][MANUAL_LIST_PRICE_OVERRIDE_INDEX] = fields[MANUAL_LIST_PRICE_OVERRIDE_INDEX];
				parts[i][NEXT_CHARGE_DATE_INDEX] = fields[NEXT_CHARGE_DATE_INDEX];
				parts[i][marketCodeIndex] = fields[marketCodeIndex];
				parts[i][lastModifiedByIndex] = fields[lastModifiedByIndex];
				parts[i][termEndDateIndex] = fields[termEndDateIndex];
				
				
				monthlyContractUnits = fields[MONTHLY_CONTRACTED_UNITS];
				if(monthlyContractUnits <> "" AND monthlyContractUnits <> "null" AND isnumber(monthlyContractUnits)){
					qtyValIndex = find(monthlyContractUnits,".");
					monthlyContractUnits = substring(monthlyContractUnits, 0, qtyValIndex);
				}
				else{
					monthlyContractUnits = "0";
				}
				parts[i][MONTHLY_CONTRACTED_UNITS] = monthlyContractUnits;
				
				totalContractUnits = fields[CONTRACTED_UNITS];
				if(totalContractUnits <> "" AND totalContractUnits <> "null" AND isnumber(totalContractUnits)){
					qtyValIndex = find(totalContractUnits,".");
					totalContractUnits = substring(totalContractUnits, 0, qtyValIndex);
				}
				else{
					totalContractUnits = "0";
				}
				parts[i][CONTRACTED_UNITS] = totalContractUnits;
				//Appended below line for Ticket# CRM - 1772
				parts[i][campaignIdIndex] = fields[campaignIdIndex] + fieldDelim + fields[PRICE_PER_IMPRESSION_INDEX] + fieldDelim + fields[UNDERSOLD_MARKET_INDEX] + fieldDelim + fields[extendedNetPriceIndex] + fieldDelim + fields[ACCOUNT_CATEGORY_INDEX] + fieldDelim + fields[ASSET_NUMBER_INDEX];
				//parts[i][UNDERSOLD_MARKET_INDEX] = fields[UNDERSOLD_MARKET_INDEX];
				//parts[i][PRICE_PER_IMPRESSION_INDEX] = fields[PRICE_PER_IMPRESSION_INDEX];
				//print parts[i][PRICE_PER_IMPRESSION_INDEX];
				i = i + 1;
               			j = i; //CRM-1928	               			
				//print parts;
			}				
		}
	}
	if(CobrokeFlg == true) //CRM-1928
	{
		if(isFiveStreetOffered_quote == false AND isFiveStreetOffered2 == false )
		{ 
	     		parts[j][partNumIndex] = "FIVESTREET";
				parts[j][qtyIndex] = "1";
				parts[j][assetIDIndex] = "";
				parts[j][installDate] = util.dateToAPIStringFormat2(0);
				parts[j][usageEndDate] = util.dateToAPIStringFormat2(365);
				parts[j][status] = "Active";
				parts[j][priceIndex] = "";
				parts[j][leadTypeIndex] = "";
				parts[j][productTypeIndex] = "Standard";
				parts[j][marketIndex] = "";
				parts[j][contractTermIndex] = "12"; 
				parts[j][billingPeriodIndex] = "Monthly";
				parts[j][promotionIndex] = ""; 
				parts[j][discountTypeIndex] = "";
				parts[j][commerceGroupIndex] = ""; 
				parts[j][brokerPlanAffiliationIndex] = "";
				parts[j][productEmailIndex] = fivestreetEmail;
				parts[j][participantsIndex] = ""; 
				parts[j][licenseTierRangeIndex] = ""; 
				parts[j][topConnectorIndex] = "false";
				parts[j][featuredMortgageIndex] = "false";
				parts[j][hLCOverrideIndex] = "";
				parts[j][zouraProductRatePlanChargeIndex] = "";
				parts[j][zouraIdIndex] = "";
				parts[j][subscriptionIdIndex] = ""; 
				parts[j][priceTierIndex] = ""; 
				parts[j][zuoraProductRatePlanIdIndx] = ""; 
				parts[j][assetListPriceIndex] = ""; 
				parts[j][EXTERNAL_ID_INDEX] = ""; 
				parts[j][subscriptionStartDateIndex] = util.dateToAPIStringFormat2(0); 
				parts[j][subscriptionEndDateIndex] = util.dateToAPIStringFormat2(366);
				parts[j][HLC_INDEX] = ""; 
				parts[j][EXTERNAL_ID_LINE_INDEX] = ""; 
				parts[j][overrideTermIndex] = ""; 
				parts[j][licenseTierIndex] = ""; 
				parts[j][manualDiscountAmountIndex] = ""; 
				parts[j][manualDiscountTypeIndex] = ""; 
				parts[j][assetPriceEffectiveDateIndex] = util.dateToAPIStringFormat2(0);  
				parts[j][marketKeyIndex] = ""; 
				parts[j][renewalStatusindex] = ""; 
				parts[j][costPerActionIndex] = ""; 
				parts[j][MANUAL_LIST_PRICE_OVERRIDE_INDEX] = ""; 
				parts[j][NEXT_CHARGE_DATE_INDEX] = "1st of the month"; 
				parts[j][marketCodeIndex] = "";
				parts[j][lastModifiedByIndex] = ""; 
				parts[j][termEndDateIndex] = util.dateToAPIStringFormat2(366); 
				parts[j][MONTHLY_CONTRACTED_UNITS] = "";
				parts[j][CONTRACTED_UNITS] = "";
				parts[j][campaignIdIndex] = "####BDX#";  
		 
		}
	}
	//print parts;
	if(DEBUG){
		print "parts details"; 
		print parts;
	}
	
	/* ======================================================================== *
	*	Parts array is used to form and execute SOAP query for adding lines  	*
	* ======================================================================== */
	if(sizeofarray(parts) <= 0){
		return "";
	}
	else{
		print "inputs to SOAP ADD TO TRANS";
		print "_system_buyside_id";
		print _system_buyside_id;
		print "_system_user_session_id";
		print _system_user_session_id;
		print "parts";
		print parts;
		soapQuery = util.generateSOAPAddToTransactionQuery(_system_buyside_id, _system_user_session_id, parts);
		if(DEBUG){
			print "soapADD QUERY";
			print soapQuery;
		}
		executeQuery = util.executeSOAPQuery(soapQuery, "ERR");
		if(executeQuery == "ERR") {
			if(DEBUG){
				print "***********************ERROR in add*****************";
			}
			return "";// Return empty when there is an error in this SOAP call
		}
		
		/* ======================================================================== *
		*	Get the last doc num for updating the lines								*
		*	Form Update SOAP query and execute.										*
		* ======================================================================== */
		lastDocNum = "-1";
		lastDocNumNode = "bm:last_document_number>";
		last_docNumIndex = find(executeQuery,lastDocNumNode);
		if(last_docNumIndex <>-1) {
			lastDocNum = substring(executeQuery,last_docNumIndex+len(lastDocNumNode),find(executeQuery,"</" + lastDocNumNode));
		}
		docNumOffset = 0;
		if(DEBUG){
			print "lastDocNum " + lastDocNum;
		}
		if(lastDocNum <> "-1" and isnumber(lastDocNum)) {
			if(DEBUG){
				print "sizeofarray(parts) " + string(sizeofarray(parts));
			}
			docNumOffset = integer(atof(lastDocNum)-sizeofarray(parts));
		}
		fields = String[][];
		fields[0][0] = "assetDetails_quote";
		assetDetails = String[];
		i = 0;
		print "Parts ####";
		print parts;
		//print "docNumOffset: " + string(docNumOffset);
		for part in parts {
			append(assetDetails,string(i + docNumOffset + 1) + fieldDelim + part[partNumIndex]  + fieldDelim + part[qtyIndex] + fieldDelim + part[priceIndex] + fieldDelim + part[assetIDIndex]  + fieldDelim + part[installDate]  + fieldDelim + part[usageEndDate] + fieldDelim + part[leadTypeIndex] + fieldDelim + part[productTypeIndex] + fieldDelim + part[marketIndex] + fieldDelim + part[contractTermIndex] + fieldDelim + part[billingPeriodIndex] + fieldDelim + part[promotionIndex] + fieldDelim + part[discountTypeIndex] + fieldDelim + part[commerceGroupIndex] + fieldDelim + part[brokerPlanAffiliationIndex] + fieldDelim + part[productEmailIndex] + fieldDelim + part[participantsIndex] + fieldDelim + part[licenseTierRangeIndex] + fieldDelim + part[topConnectorIndex] + fieldDelim + part[featuredMortgageIndex] + fieldDelim + part[hLCOverrideIndex] + fieldDelim + part[status] + fieldDelim + part[zouraProductRatePlanChargeIndex] + fieldDelim + part[zouraIdIndex] + fieldDelim + part[subscriptionIdIndex] + fieldDelim + part[priceTierIndex] + fieldDelim + part[zuoraProductRatePlanIdIndx] + /*fieldDelim + part[nextChargeDateIndx] +*/ fieldDelim + part[assetListPriceIndex] + fieldDelim + part[EXTERNAL_ID_INDEX] + fieldDelim + part[subscriptionStartDateIndex] + fieldDelim + part[subscriptionEndDateIndex] + fieldDelim + part[HLC_INDEX] + fieldDelim + part[EXTERNAL_ID_LINE_INDEX] + fieldDelim + part[overrideTermIndex] + fieldDelim + part[licenseTierIndex] + fieldDelim + part[manualDiscountAmountIndex] + fieldDelim + part[manualDiscountTypeIndex] + fieldDelim + part[assetPriceEffectiveDateIndex] + fieldDelim + part[marketKeyIndex] + fieldDelim + part[renewalStatusindex] + fieldDelim + part[costPerActionIndex] + fieldDelim + part[MANUAL_LIST_PRICE_OVERRIDE_INDEX] + fieldDelim + part[NEXT_CHARGE_DATE_INDEX] + fieldDelim + part[marketCodeIndex] + fieldDelim + part[lastModifiedByIndex] + fieldDelim + part[termEndDateIndex]+ fieldDelim + part[MONTHLY_CONTRACTED_UNITS] + fieldDelim + part[CONTRACTED_UNITS] + fieldDelim + part[campaignIdIndex] );
			i = i + 1;
		}
		//print assetDetails;
		if(DEBUG){
			print "AD";
			print assetDetails;
		}
		assetDetailsStr = join(assetDetails,assetDelim);
		if(DEBUG){
			print "ADSTR: " + assetDetailsStr;
		}
		fields[0][1] = assetDetailsStr;
		print "fields"; print fields;
		print "update QUERY input";
		print "_system_buyside_id";
		print _system_buyside_id;
		print "fields";
		print fields;
		print "_system_supplier_company_name";
		print _system_supplier_company_name;
		updateQuery = util.generateSOAPUpdateTransactionQuery(_system_buyside_id, _system_user_session_id, fields, _system_supplier_company_name, "assetsUpdate_quote");
		
		if(DEBUG){
			print "UPDATEQUERY"; 
			print updateQuery;
		}
		
		executeQuery = util.executeSOAPQuery(updateQuery, "ERR");
		if( executeQuery == "ERR" ) {
			if(DEBUG){
				print "***************ERROR in update**********************";
			}
			return "";
		}
		
		//Hit Save Action
		fields = string[][];
		fields[0][0] = "quoteNumber_quote";
		fields[0][1] = quoteNumber_quote;
		updateQuery = util.generateSOAPUpdateTransactionQuery(_system_buyside_id, _system_user_session_id, fields, _system_supplier_company_name, "cleanSave_t");
		
		if(DEBUG){
			print "UPDATEQUERY"; 
			print updateQuery;
		}
		executeQuery = util.executeSOAPQuery(updateQuery, "ERR");
		if( executeQuery == "ERR" ) {
			if(DEBUG){
				print "***************ERROR in update**********************";
			}
			return "";
		}
		if(NOT(isnull(assetDetailsStr))){
			returnStr = "1~renewalsDetails_quote~"+assetDetailsStr;			
		}
	}
}

/*Determines if import date has already been assigned and does so if one has not; likely could be condensed into above loop.*/
for line in transactionLine{
	if(len(line.assetID_l)>0 AND len(line.importDate_line)<1){
		returnStr = returnStr + "|" + line._document_number + "~importDate_line~" + getstrdate();
	}
}

return returnStr+temp;