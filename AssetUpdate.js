/* 
/* 
	==================================================================================================
	| COMMERCE ACTION - ASSETS UPDATE										 						|
	+-----------------------------------------------------------------------------------------------+
	| Assets imported from salesforce, are updated in this place.									 						|
	| The import assets are added as lines when the quote is Rewal.		 						|
	| Assets Update is called via SOAP to update the lines with the asset values.		 			|
	| If assetDetails_quote is populated with a value then all the SOAP calls have been successful	|
	=================================================================================================	
*/
debug = true;
res = "";
/* ======================================================================== */
/*	CONSTANTS [CONSTANTS]						*/
/* ======================================================================== */
FIELD_DELIM = "#";
ASET_DELIM = "!!";
QUOTE_STR_DELIM	= "|";
promotionString = "";
promotion = "";
marketCodeValue = "";
lastModifiedBy = "";
monthlyContractedUnits = "";
totalContractUnits = "";
campaignId = "";
/* ======================================================================== */
/*Define Indexes to get Info from assetDetails_quote		*/
/* ======================================================================== */
DOC_NUM_INDEX = 0;
PART_NUM_INDEX = 1;
QTY_INDEX = 2;
PRICE_INDEX = 3;
ASSET_ID_INDEX = 4;
INSTALL_DATE_INDEX = 5;
USAGE_ENDDATE_INDEX = 6;

LEAD_TYPE_INDEX = 7;
PRODUCT_TYPE_INDEX = 8;
MARKET_TYPE_INDEX = 9;

CONTRACT_TERM_INDEX = 10; 
BILLING_PERIOD_INDEX = 11; 
PROMOTION_INDEX = 12;
DISCOUNT_TYPE_INDEX = 13;
COMMERCE_GROUP_INDEX =14;
BROKER_PLAN_AFFILIATION_INDEX =15;
PRODUCT_EMAIL_INDEX = 16;
PARTICIPANTS_INDEX = 17;
LICENSE_TIER_RANGE_INDEX = 18; 
TOP_CONNECTOR_INDEX = 19;
FEATURED_MORTGAGE_INDEX = 20;
HLCOVERRIDE_INDEX = 21;
STATUS_INDEX = 22;
ZOURAPRODUCTRATEPLANCHARGEINDEX = 23;
ZOURAIDINDEX = 24;
SUBSCRIPTIONIDINDEX = 25;
PRICETIER_INDEX = 26;
ZUORARATEPLANID_INDEX = 27;
//NEXTCHARGEDATE_INDEX = 28;
ASSET_LIST_PRICE_INDEX = 28;
EXTERNAL_ID_INDEX = 29;
SUBSCRIPTION_STARTDATE_INDEX = 30;
SUBSCRIPTION_ENDDATE_INDEX = 31;
HLC_INDEX = 32;
EXTERNAL_ID_LINE_INDEX = 33;
OVERRIDE_TERM_INDEX = 34 ;
LICENSE_TIER_INDEX = 35;
MANUAL_DISCOUNT_AMOUNT_INDEX = 36;
MANUAL_DISCOUNT_TYPE_INDEX = 37;
ASSET_PRICE_EFFECTIVE_DATE_INDEX = 38;
MARKET_KEY_INDEX = 39;
RENEWAL_STATUS_INDEX = 40;
COST_PER_ACTION_INDEX = 41;
MANUAL_LIST_PRICE_OVERRIDE_INDEX = 42;
MARKET_CODE_INDEX = 44;
LASET_MODIFIED_BY_INDEX = 45;
MONTHLY_CONTRACTED_UNITS = 47;
CONTRACTED_UNITS = 48;
CAMPAIGN_ID_INDEX = 49;
PRICE_PER_IMPRESSION_INDEX = 50;
UNDERSOLD_MARKET_INDEX = 51;
ACCOUNT_CATEGORY_INDEX = 53;
// Added below line for Ticket# CRM - 1772
ASSET_NUMBER_INDEX = 54;
docNumArr = string[];
uniquePartNumArrForRenewalType = string[];
partNumArrForRenewalType = string[];
docNumArrForRenewalType = string[];
partsDBDict = dict("string");
//CRM - 1812
fieldsalesGroupArr = string[]{"fieldSalesUser","fieldSalesManager","technicalAdminstrator"};
userGroupArr = split(_system_user_groups, "+");	
fieldsalesuserflag = "N";
FivestreetFlg = "N"; 
for each in fieldsalesGroupArr{
	if (findinarray(userGroupArr, each) <> -1)
	{
		fieldsalesuserflag = "Y";
		break;
	}
}
assetIdsStr = assetIdsForInflightCheck_quote;
if(NOT(isnull(appliedPromotions_quote))){
	promotionString = appliedPromotions_quote;
	eachPromoCode = split(promotionString,"!!!");
	for each in eachPromoCode{
		promoCode = split(each,".!.");
		docNumber = promoCode[0];
		if(findinarray(docNumArr,docNumber) == -1){
			append(docNumArr,docNumber);
		}
	}
}
if(debug){
	print docNumArr;
}	
if(assetDetails_quote <> ""){
	assetDetails = assetDetails_quote;
	
	assetsArray	= split(assetDetails, ASET_DELIM);
	if(debug){
		print "assetsArray";
		print assetsArray;
	}
	//When assets imported, quote type need to change from "New" to "Modify"
	//if(quoteType_quote == "New"){
	//	res = res + "1~quoteType_quote~Modify" + QUOTE_STR_DELIM;
	//}
	
	for asset in assetsArray {
		assetPriceEffectiveDateFormat = string[];
		assetArray 	= split(asset, FIELD_DELIM);
		if(assetArray[1] == "FIVESTREET") //CRM-1928
		{
		 FivestreetFlg = "Y"; 
		}
		docNum	= assetArray[DOC_NUM_INDEX];
		if( docNum <> "" ) {
			price = 0;
			manualListPriceOverride = 0;
			assetListPrice = 0;
			if(isnumber(assetArray[PRICE_INDEX])){
				price = atof(assetArray[PRICE_INDEX]);
			}
			if(isnumber(assetArray[MANUAL_LIST_PRICE_OVERRIDE_INDEX])){
				manualListPriceOverride = atof(assetArray[MANUAL_LIST_PRICE_OVERRIDE_INDEX]);
			}
			assetId = assetArray[ASSET_ID_INDEX];
			if(assetId <> "" AND quoteType_quote == "New"){
				res = res + "1~quoteType_quote~Modify" + QUOTE_STR_DELIM;
			}
			startDate = assetArray[INSTALL_DATE_INDEX];
			endDate = assetArray[USAGE_ENDDATE_INDEX];
			leadType = assetArray[LEAD_TYPE_INDEX];
			productType = assetArray[PRODUCT_TYPE_INDEX];
			if(leadType == "Flex Follow-up")
			{
				leadType = "Flex";
			}
			elif(leadType == "Fast Follow-up")
			{
				leadType = "Fast";
			}
			market = assetArray[MARKET_TYPE_INDEX];
			
			newStartDate = util.salesforceStringToJavaDate(startDate);
			newEndDate = util.salesforceStringToJavaDate(endDate);
			
			partNumber = assetArray[PART_NUM_INDEX];
			qty = assetArray[QTY_INDEX];
			
			contractTerm = assetArray[CONTRACT_TERM_INDEX];
			billingPeriod = assetArray[BILLING_PERIOD_INDEX]; 
			
			if(findinarray(docNumArr,docNum) == -1){
				promotion = assetArray[PROMOTION_INDEX];
			}
			discountType = assetArray[DISCOUNT_TYPE_INDEX];
			commerceGroup = trim(assetArray[COMMERCE_GROUP_INDEX]);
			//Ravi 5/17/2017 CRM-1678. Modified below If condition to exclude 'Agent Marketing Solution from Assets. Parent ticket # CRM-1456
			//if(find(commerceGroup,"Solution") == -1)
			if(find(commerceGroup,"Solution") == -1 OR find(commerceGroup,"Agent Marketing Solution") <> -1)
			{
				commerceGroup = "";
			}
			brokerPlanAffiliation = assetArray[BROKER_PLAN_AFFILIATION_INDEX];
			productEmail = assetArray[PRODUCT_EMAIL_INDEX];
			participants = assetArray[PARTICIPANTS_INDEX];
			licenseTierRange = assetArray[LICENSE_TIER_RANGE_INDEX];
			topConnector = assetArray[TOP_CONNECTOR_INDEX];
			featuredMortgage = assetArray[FEATURED_MORTGAGE_INDEX];
			hLCOverride = assetArray[HLCOVERRIDE_INDEX];
			hlcOverrideIdx = find(hLCOverride, ".");
			if(hlcOverrideIdx <> -1){
				hLCOverride = substring(hLCOverride,0,hlcOverrideIdx);
			}

			status = assetArray[STATUS_INDEX];
			zouraProductRatePlanCharge = assetArray[ZOURAPRODUCTRATEPLANCHARGEINDEX];
			zouraId = assetArray[ZOURAIDINDEX];
			subscriptionId = assetArray[SUBSCRIPTIONIDINDEX];
			priceTier = assetArray[PRICETIER_INDEX];
			zuoraRatePlanId = assetArray[ZUORARATEPLANID_INDEX];
			//nextChargeDate = util.salesforceStringToJavaDate(assetArray[NEXTCHARGEDATE_INDEX]);
			if(isNumber(assetArray[ASSET_LIST_PRICE_INDEX]))
			{
				assetListPrice = atof(assetArray[ASSET_LIST_PRICE_INDEX]);
			}
			EXTERNAL_ID = assetArray[EXTERNAL_ID_INDEX];

			subscriptionStartDate = assetArray[SUBSCRIPTION_STARTDATE_INDEX];
			subscriptionEndDate = assetArray[SUBSCRIPTION_ENDDATE_INDEX];
			externalId_Line = assetArray[EXTERNAL_ID_LINE_INDEX];
			overrideTerm = assetArray[OVERRIDE_TERM_INDEX];
			licenseTier = assetArray[LICENSE_TIER_INDEX];
			manualDiscountAmount = assetArray[MANUAL_DISCOUNT_AMOUNT_INDEX];
			if(isNumber(manualDiscountAmount) == false)
			{
				manualDiscountAmount = string(0.0);
			}
			manualDiscountType = assetArray[MANUAL_DISCOUNT_TYPE_INDEX];
			if(manualDiscountType == "$"){
				manualDiscountType = "Amt";
			}
			assetPriceEffectiveDateFormat = split(assetArray[ASSET_PRICE_EFFECTIVE_DATE_INDEX],"T");
			assetPriceEffectiveDate = assetPriceEffectiveDateFormat[0];
			marketKeyValue = assetArray[MARKET_KEY_INDEX];
			print "marketCode";
			print assetArray[MARKET_CODE_INDEX];
			if(assetArray[MARKET_CODE_INDEX] <> "" AND NOT(isnull(assetArray[MARKET_CODE_INDEX])) AND assetArray[MARKET_CODE_INDEX] <> "null"){
				marketCodeValue = assetArray[MARKET_CODE_INDEX];
			}else{
				marketCodeValue = " ";
			}
			if(assetArray[LASET_MODIFIED_BY_INDEX] <> "" AND NOT(isnull(assetArray[LASET_MODIFIED_BY_INDEX])) AND assetArray[LASET_MODIFIED_BY_INDEX] <> "null"){
				lastModifiedBy = assetArray[LASET_MODIFIED_BY_INDEX];
			}else{
				lastModifiedBy = " ";
			}
			if(assetArray[MONTHLY_CONTRACTED_UNITS] <> "" AND NOT(isnull(assetArray[MONTHLY_CONTRACTED_UNITS])) AND assetArray[MONTHLY_CONTRACTED_UNITS] <> "null"){
				monthlyContractedUnits = assetArray[MONTHLY_CONTRACTED_UNITS];
			}else{
				monthlyContractedUnits = "0";
			}
			if(assetArray[CONTRACTED_UNITS] <> "" AND NOT(isnull(assetArray[CONTRACTED_UNITS])) AND assetArray[CONTRACTED_UNITS] <> "null"){
				totalContractUnits = assetArray[CONTRACTED_UNITS];
			}else{
				totalContractUnits = "0";
			}
			if(assetArray[CAMPAIGN_ID_INDEX] <> "" AND NOT(isnull(assetArray[CAMPAIGN_ID_INDEX])) AND assetArray[CAMPAIGN_ID_INDEX] <> "null"){
				campaignId = assetArray[CAMPAIGN_ID_INDEX];
			}else{
				campaignId = "";
			}
			
			renewalStatus = assetArray[RENEWAL_STATUS_INDEX];
			costPerActionValue = assetArray[COST_PER_ACTION_INDEX];
			if(isNumber(costPerActionValue) == false)
			{
				costPerActionValue = string(0.0);
			}
			pricePerImpressionSold = assetArray[PRICE_PER_IMPRESSION_INDEX];
			if(isNumber(pricePerImpressionSold) == false)
			{
				pricePerImpressionSold = string(0.0);
			}
			undersoldAsset = assetArray[UNDERSOLD_MARKET_INDEX];
			accountCategory = assetArray[ACCOUNT_CATEGORY_INDEX];
			// Added below line for Ticket# CRM - 1772 
			assetNumber = assetArray[ASSET_NUMBER_INDEX];
			//print "Debug Subscription date";
			//print subscriptionStartDate;
			//print subscriptionEndDate;
			if(not(isnull(subscriptionStartDate)) AND subscriptionStartDate<>""){
				newsubscriptionStartDate = util.salesforceStringToJavaDate(subscriptionStartDate);
				//newStartDate = newsubscriptionStartDate;
				res = res + docNum + "~subscriptionStartDate_line~" + datetostr(newsubscriptionStartDate) + QUOTE_STR_DELIM;				
			}
			if(not(isnull(subscriptionEndDate)) AND subscriptionEndDate<>""){
				newsubscriptionEndDate = util.salesforceStringToJavaDate(subscriptionEndDate);
				//newEndDate = newsubscriptionEndDate;
				res = res + docNum + "~subscriptionEndDate_line~" + datetostr(newsubscriptionEndDate) + QUOTE_STR_DELIM;
			}			
			
			importDate = getstrdate();
			print importDate;
			
			res = res + docNum + "~assetPrice_line~" + string(price) + QUOTE_STR_DELIM;
			res = res + docNum + "~assetFlag_l~true" + QUOTE_STR_DELIM;

			res = res + docNum + "~_part_number~" + partNumber + QUOTE_STR_DELIM;
			res = res + docNum + "~_price_quantity~" + qty + QUOTE_STR_DELIM;
			eligibleForRenew = true;// OTC-174
			today = getdate();
			diff = getdiffindays(newEndDate , today);
			if(((accountType_quote <> "Realtor Agent" AND accountType_quote <> "Agent Team") AND diff > 90) OR ((accountType_quote == "Realtor Agent" OR accountType_quote == "Agent Team") AND diff > 60) OR renewalStatus == "Do Not Renew" OR pastDue_quote)
			{
				eligibleForRenew = false;
			}
			if(FivestreetFlg == "N") //CRM-1928
			{
				if((renewalStatus == "Do Not Renew" OR partNumber == "TURBO") AND util.checkRestrictedUserProfiles(currentUserProfile_quote, quoteType_quote) == false)
				{
					if(eligibleForRenew)
					{
						res = res + docNum + "~lineType_line~renew" + QUOTE_STR_DELIM;// OTC-174
						append(docNumArrForRenewalType,docNum);
						append(partNumArrForRenewalType,partNumber);
						if(findinarray(uniquePartNumArrForRenewalType,partNumber) == -1){
							append(uniquePartNumArrForRenewalType,partNumber);
						}
					}
					else
					{
						res = res + docNum + "~lineType_line~cancel" + QUOTE_STR_DELIM;
					}
				}
				else
				{
					/*if(((accountType_quote <> "Realtor Agent" AND accountType_quote <> "Agent Team") AND diff > 90) OR ((accountType_quote == "Realtor Agent" OR accountType_quote == "Agent Team") AND diff > 60) OR renewalStatus == "Do Not Renew")
					{
						res = res + docNum + "~lineType_line~amend" + QUOTE_STR_DELIM;
					}
					else
					{
						res = res + docNum + "~lineType_line~renew" + QUOTE_STR_DELIM;
					}*/
					if(eligibleForRenew)
					{
						res = res + docNum + "~lineType_line~renew" + QUOTE_STR_DELIM;
						append(docNumArrForRenewalType,docNum);
						append(partNumArrForRenewalType,partNumber);
						if(findinarray(uniquePartNumArrForRenewalType,partNumber) == -1){
							append(uniquePartNumArrForRenewalType,partNumber);
						}
					}
					else
					{
						res = res + docNum + "~lineType_line~amend" + QUOTE_STR_DELIM;
					}
				}
			}
			else{
				res = res + docNum + "~lineType_line~add" + QUOTE_STR_DELIM;
			}
			//Start CRM-1090
			if(eligibleForRenew){
				manualListPriceOverride = 0;
				manualDiscountAmount = "0.0";
				overrideTerm = "0";
				discountType = "%";
				manualDiscountType = "%";
				promotion = "";
				//CRM - 1812
				if(fieldsalesuserflag == "N" AND find(commerceGroup,"Broker Marketing Solution") <> -1){
					commerceGroup = "";
				}
			}
			if(promotion <> "" AND NOT(isnull(promotion))){
				promotionString = promotionString + docNum + ".!." + assetArray[PROMOTION_INDEX] + "!!!";
			}
			//End CRM-1090
			if(find(assetIdsStr,assetId) == -1)
			{
				if(assetIdsStr <> "")
				{
					assetIdsStr = assetIdsStr + ",";
				}
				assetIdsStr = assetIdsStr + "'" + assetId + "'";
			}
			res = res + docNum + "~assetID_l~" + assetId + QUOTE_STR_DELIM;
			res = res + docNum + "~contractStartDate_l~" + datetostr(newStartDate) + QUOTE_STR_DELIM;
			res = res + docNum + "~contractEndDate_l~" + datetostr(newEndDate) + QUOTE_STR_DELIM;
			res = res + docNum + "~assetStartDate_line~" + datetostr(newStartDate) + QUOTE_STR_DELIM;
			res = res + docNum + "~assetEndDate_line~" + datetostr(newEndDate) + QUOTE_STR_DELIM;
			res = res + docNum + "~leadType_line~" + leadType + QUOTE_STR_DELIM;
			res = res + docNum + "~productType_line~" + productType + QUOTE_STR_DELIM;
			res = res + docNum + "~marketZip_line~" + market + QUOTE_STR_DELIM;
			res = res + docNum + "~contractTerms_line~" + contractTerm + QUOTE_STR_DELIM;
			res = res + docNum + "~billingPeriod_line~" + billingPeriod + QUOTE_STR_DELIM;
			res = res + docNum + "~promotion_line~" + promotion + QUOTE_STR_DELIM;
			res = res + docNum + "~appliedPromotions_line~" + promotion + QUOTE_STR_DELIM;
			res = res + docNum + "~discountType_line~" + discountType + QUOTE_STR_DELIM;
			res = res + docNum + "~commerceGroup_line~" + commerceGroup + QUOTE_STR_DELIM;
			//res = res + docNum + "~~" + brokerPlanAffiliation + QUOTE_STR_DELIM;
			res = res + docNum + "~productEmail_line~" + productEmail + QUOTE_STR_DELIM;
			//res = res + docNum + "~~" + participants + QUOTE_STR_DELIM;
			res = res + docNum + "~licenseTier_line~" + licenseTierRange + QUOTE_STR_DELIM;
			res = res + docNum + "~topConnector_line~" + topConnector + QUOTE_STR_DELIM;
			//res = res + docNum + "~~" + featuredMortgage + QUOTE_STR_DELIM;
			res = res + docNum + "~hlcOverride_line~" + hLCOverride + QUOTE_STR_DELIM;
			res = res + docNum + "~status_l~" + status + QUOTE_STR_DELIM;
			
			res = res + docNum + "~zuoraSubscriptionID_line~" + subscriptionId + QUOTE_STR_DELIM;
			res = res + docNum + "~zuoraProductRatePlanChargeID_line~" + zouraProductRatePlanCharge + QUOTE_STR_DELIM;
			res = res + docNum + "~zuoraRatePlanID_line~" + zuoraRatePlanId + QUOTE_STR_DELIM;
			//res = res + docNum + "~nextChargeDate_line~" + datetostr(nextChargeDate) + QUOTE_STR_DELIM;
			res = res + docNum + "~zuoraAmendmentID_line~" + zouraId + QUOTE_STR_DELIM;
			res = res + docNum + "~priceTier_line~" + priceTier + QUOTE_STR_DELIM;
			res = res + docNum + "~assetListPrice_line~" + string(assetListPrice) + QUOTE_STR_DELIM;
			//res = res + docNum + "~externalID_line~" + EXTERNAL_ID + QUOTE_STR_DELIM;

			//res = res + docNum + "~fulfillToAccount_line~" + _transaction_customer_id + QUOTE_STR_DELIM;
			res = res + docNum + "~assetDetails_line~" + asset + QUOTE_STR_DELIM;
			res = res + docNum + "~importDate_line~" + importDate + QUOTE_STR_DELIM;
			
			 
			res = res + docNum + "~externalID_line~" + externalId_Line + QUOTE_STR_DELIM;
			// Added below line for Ticket# CRM - 1772 
			res = res + docNum + "~assetNumber~" + assetNumber + QUOTE_STR_DELIM;
			if(isnumber(overrideTerm))
			{
				if(find(overrideTerm,".") > -1)
				{
					overrideTermArray = split(overrideTerm,".");
					overrideTerm = overrideTermArray[0];
				}
				res = res + docNum + "~overrideTerm_line~" + overrideTerm + QUOTE_STR_DELIM;
			}
			
			res = res + docNum + "~license_line~" + licenseTier + QUOTE_STR_DELIM;
			res = res + docNum + "~override_line~" + manualDiscountAmount + QUOTE_STR_DELIM;
			res = res + docNum + "~discountType_line~" + manualDiscountType + QUOTE_STR_DELIM;
			res = res + docNum + "~assetPriceEffectiveDate_line~" + assetPriceEffectiveDate + QUOTE_STR_DELIM;
			res = res + docNum + "~marketId_line~" + marketKeyValue + QUOTE_STR_DELIM;
			res = res + docNum + "~marketCode_line~" + marketCodeValue + QUOTE_STR_DELIM;
			res = res + docNum + "~assetLastModifiedDate_line~" + lastModifiedBy + QUOTE_STR_DELIM;
			res = res + docNum + "~forecastedLeads_line~" + monthlyContractedUnits + QUOTE_STR_DELIM;
			res = res + docNum + "~contractedImpressions_line~" + totalContractUnits + QUOTE_STR_DELIM;
			res = res + docNum + "~campaignId_line~" + campaignId + QUOTE_STR_DELIM;
			res = res + docNum + "~renewalStatus_line~" + renewalStatus + QUOTE_STR_DELIM ; 
			res = res + docNum + "~costPerAction_line~" + costPerActionValue + QUOTE_STR_DELIM ;
			res = res + docNum + "~pricePerImpressionSold_line~" + pricePerImpressionSold + QUOTE_STR_DELIM ;
			res = res + docNum + "~undersoldAsset_line~" + undersoldAsset + QUOTE_STR_DELIM ;
			res = res + docNum + "~listPriceOverride_line~" + string(manualListPriceOverride) + QUOTE_STR_DELIM ;
			//res = res + docNum + "~oldLineType_line~" + "add" + QUOTE_STR_DELIM; 
			res = res + docNum + "~accountCategory_line~" + accountCategory + QUOTE_STR_DELIM;
		}
	}
	if(NOT(isnull(promotionString))){
		res = res + "1~appliedPromotions_quote~" + promotionString + QUOTE_STR_DELIM ;
	}
	res = res + "1~assetIdsForInflightCheck_quote~" + assetIdsStr + QUOTE_STR_DELIM ;
	
	partsDatabaseResult = bmql("select part_number,custom_field22 from _parts where part_number in $uniquePartNumArrForRenewalType");
	for eachterm in partsDatabaseResult{
		if(NOT containsKey(partsDBDict,get(eachterm,"part_number"))){
			put(partsDBDict,get(eachterm,"part_number"),get(eachterm,"custom_field22"));
		}
	}
	index = 0;
	for eachDoc in docNumArrForRenewalType{
		contractTerm = get(partsDBDict,partNumArrForRenewalType[index]);
		res = res + eachDoc + "~contractTerms_line~" + contractTerm + QUOTE_STR_DELIM;
		index = index + 1;
	}
}
return res;