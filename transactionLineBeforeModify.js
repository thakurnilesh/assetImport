result = "";
//partNumList = String[];
assetId = "";
invPool = "";
inventoryPool = "";
linesHasAssetId = false;
lastModifiedBy = "";
termEndDate = "";
cBCFiveStreetEmail = "";
nonInventoryAppliedPromo = "";
campaignId = "";
selectedOptionDataStr = "";
selectedOptionStr = "";
pickSelection = "";
pplOverride = "";
amlcOverride = "";
extendedNetPrice = "0.0";
appliedPromoArr = string[];
/* ======================================================================== */
/*	MLS AssetDetails Update						*/
/* ======================================================================== */
/* ======================================================================== */
/*	CONSTANTS [CONSTANTS]						*/
/* ======================================================================== */
FIELD_DELIM = "#$#";
ASET_DELIM = "!^!";
QUOTE_STR_DELIM	= "|";
/* ======================================================================== */
/*Define Indexes to get Info from assetMLSString_quote		*/
/* ======================================================================== */
ASSET_ID_INDEX = 0;

INSTALL_DATE_INDEX = 1;
USAGE_ENDDATE_INDEX = 2;
PRICE_INDEX = 3;
LEAD_TYPE_INDEX = 4;
MARKET_TYPE_INDEX = 5;
CONTRACT_TERM_INDEX = 6; 
BILLING_PERIOD_INDEX = 7; 
PROMOTION_INDEX = 8;
DISCOUNT_TYPE_INDEX = 9;
COMMERCE_GROUP_INDEX = 10;
PRODUCT_EMAIL_INDEX = 11;
LICENSE_TIER_RANGE_INDEX = 12; 
HLCOVERRIDE_INDEX = 13;

PRODUCT_TYPE_INDEX = 16;
TOP_CONNECTOR_INDEX = 18;
FEATURED_MORTGAGE_INDEX = 19;
LICENSE_TIER_INDEX = 20;
SUBSCRIPTIONID_INDEX = 21;
ZOURAID_INDEX = 22;
ZOURAPRODUCTRATEPLANCHARGE_INDEX = 23;
MARKET_TIER_INDEX = 24;
ASSET_LIST_PRICE_INDEX = 25;
ZOURA_RATE_PLAN_ID_INDEX = 26;
EXTERNAL_ID_INDEX = 27;
SUBSCRIPTION_STARTDATE_INDEX = 28;
SUBSCRIPTION_ENDDATE_INDEX = 29;
HLC_INDEX = 30;
CHOICE_LEAD_FM_INDEX = 32;
QUANTITY_INDEX = 33;
STATUS_INDEX = 34;
BROKER_PLAN_AFFILIATION_INDEX = 35;
PARTICIPANTS_INDEX = 36;
ASSET_EXTERNAL_ID_INDEX = 37;
OVERRIDE_TERM_INDEX = 38;
MANUAL_DISCOUNT_AMOUNT_INDEX = 39;
MANUAL_DISCOUNT_TYPE_INDEX = 40;
PRICE_EFFECTIVE_DATE_INDEX = 41;
MARKET_KEY_INDEX = 42;
RENEWAL_STATUS_INDEX = 43;
COST_PER_ACTION_INDEX = 44;
MANUAL_OVERRIDE_AMOUNT_INDEX = 45;
NEXT_CHARGE_DATE = 46;
LAST_MODIFIED_BY_INDEX = 47;
TERM_END_DATE_INDEX = 48;
CAMPAIGN_ID_INDEX = 49;
PRICE_PER_IMPRESSION_INDEX = 50;
PICK_SELECTION_INDEX = 51;
PPL_OVERRIDE_INDEX = 52;
AMLC_OVERRIDE_INDEX = 53;
EXTENDED_NET_PRICE_INDEX = 59;
ACCOUNT_CATEGORY_INDEX = 60;
//Added below line for CRM-1772
ASSET_NUMBER_INDEX = 61;
LQTY = "1";

promotionStringQuote = "";
commerceGroupFromConfig = "";
assetValDict =  dict("string[]");

assetIdsStr = "";//assetIdsForInflightCheck_quote;
fullfillToOfficeStringArr = string[];
Cobroke_fullfillToOfficeStringArr = string[];
partsDatabaseResults = bmql("select part_number,custom_field20 from _parts");
defaultValueDict = dict("string");
for eachValue in partsDatabaseResults{
	put(defaultValueDict,get(eachValue,"part_number"),get(eachValue,"custom_field20"));
}
//print defaultValueDict;
if(parentAssetMLSString_quote <> ""){
	assetDetails = parentAssetMLSString_quote;
	assetsArray	= split(assetDetails, ASET_DELIM);
	for asset in assetsArray {
		assetArray 	= split(asset, FIELD_DELIM);
		//print assetArray;
		assetId	= assetArray[ASSET_ID_INDEX];
		put(assetValDict, assetId, assetArray);
	}
}
/* Below logic to get appliedpromo string and store in Array */
if(appliedPromotions_quote <> "" AND isnull(appliedPromotions_quote) == false){
	appliedPromoArr = split(appliedPromotions_quote,"!!!");
}
/* End */

for line in transactionLine {
	
	if(line._part_number <> "") {
		assetIdForInflight = line.assetID_l;
		assetDetails = "";
		//Product email for Cobroke products
		if(line._part_number == "COBROKE" OR line._part_number == "FIVESTREET" OR line._part_number == "TURBO" OR line._part_number == "SELLERLEAD" OR line._part_number == "SELLERLEADBUNDLE"){
			if(line.productEmail_line == ""){
				result= result + line._document_number + "~productEmail_line~"+primaryEmailID_quote+ QUOTE_STR_DELIM;
			}
			
			//result= result + line._document_number + "~fulfillToAccount_line~" + _transaction_customer_id +QUOTE_STR_DELIM;			
		}
		if(line._part_number == "FIVESTREET")
		{
			result = result + line._document_number + "~license_line~" + LQTY + QUOTE_STR_DELIM;
			if(line.productTypeLineGrid_line == "")
		    {
				result= result + line._document_number + "~productTypeLineGrid_line~"+ "Standard"+ QUOTE_STR_DELIM;
				result= result + line._document_number + "~productType_line~"+ "Standard"+ QUOTE_STR_DELIM;
			}
			if(line.contractTerms_line == "")
			{
			result = result + line._document_number + "~contractTerms_line~" + "12" + QUOTE_STR_DELIM;
			}	
					
		}
		else
		{ 
	       	if(line.productTypeLineGrid_line == "")
			{
				result= result + line._document_number + "~accountCategory_line~"+accountCategory_quote+ QUOTE_STR_DELIM;
				
			}
		}
		//if(line._part_custom_field13 == "true" AND line.selectedOffice_line == "" AND ((line._part_number <> "SELLERLEAD" AND line.productTypeLineGrid_line == "") OR (line._part_number == "SELLERLEAD"))){
		if(line._part_custom_field13 == "true" AND line.selectedOffice_line == "" AND ((line._part_number <> "SELLERLEADBUNDLE" AND line._part_number <> "SELLERLEAD" AND line.productTypeLineGrid_line == ""))){// removed condition line._part_number <> "COBROKE" AND for CRM-457
			
			if(accountType_quote == "Realtor Agent"){
				result = result + line._document_number + "~selectedOffice_line~" + _transaction_customer_id + QUOTE_STR_DELIM;
				result = result + line._document_number + "~selectedOfficeDesc_line~" + "Agent" + QUOTE_STR_DELIM;
				
			}else{
				fullfillToOfficeStringArr = split(fullfillToOfficeString_quote,"!^!");
				CfCB_fullfillToOfficeStringArr = split(fullfillToOfficeStringArr[0],"#$#");
				if(sizeofarray(CfCB_fullfillToOfficeStringArr) > 7){
					result = result + line._document_number + "~productEmail_line~" + CfCB_fullfillToOfficeStringArr[7] + QUOTE_STR_DELIM;
					result = result + line._document_number + "~fullFillToSelectedValue_line~" + CfCB_fullfillToOfficeStringArr[6] + QUOTE_STR_DELIM;
					result = result + line._document_number + "~selectedOffice_line~" + CfCB_fullfillToOfficeStringArr[2] + QUOTE_STR_DELIM;
					result = result + line._document_number + "~selectedOfficeDesc_line~" + CfCB_fullfillToOfficeStringArr[0] + " " +CfCB_fullfillToOfficeStringArr[1] + " " + CfCB_fullfillToOfficeStringArr[3] + " " + CfCB_fullfillToOfficeStringArr[4] + " " + CfCB_fullfillToOfficeStringArr[5] + QUOTE_STR_DELIM;
				}
			}
		}
		lineComment = line. _line_item_comment;		
		isRenewalFlag = false;
		//configLineAction = "";
		//commerceLineAction = line.lineType_line;
		if(lineComment <> ""){
			if(line._parent_doc_number <> ""){
				commentHeader = getconfigattrvalue(line._parent_doc_number, "recItemsCommentHeaders");
				//commentHeader = getconfigattrvalue(line._parent_doc_number, "recItemsCommentVariableName");
				assetIdFromConfig = "";
				contractTermForRenewal = "";
				if(NOT isNull(commentHeader) AND commentHeader <> "")
				{
					lineCommentHeader = split(commentHeader,"^_^");
					lineCommentArray = split(lineComment,"^_^");
					index = 0;
					//narMembershipFromConfig = "";					
					invPool = "available";
					inventoryPool = upper(invPool);
					for chunk in lineCommentArray {
						attrValue = chunk;
						attrName = lineCommentHeader[index];
						if(attrName == "assetID_l")
						{
							assetIdFromConfig = attrValue;
						}
						elif (attrName == "productType_line" OR attrName == "marketZip_line")
						{
							result= result + line._document_number + "~"+ replace(attrName,"_line","LineGrid_line") +"~" + attrValue + QUOTE_STR_DELIM;
						}
						if(attrValue == "PRESALE"){
							invPool = "presale"; 
							inventoryPool = upper(invPool);
						}elif(attrName <> "" AND attrName <> "null" AND NOT(isnull(attrName))){
							result= result + line._document_number + "~"+ attrName +"~" + attrValue + QUOTE_STR_DELIM;
						}
						index = index + 1;						
						if( line._part_custom_field13 == "false" ){
							invPool = "";
							inventoryPool = "";
						}
						if(attrName == "lineType_line" AND attrValue == "renew"){
							contractTermForRenewal = line._part_custom_field22;
							isRenewalFlag = true;
						}
					}
					result= result + line._document_number + "~invPool_line~" + invPool + QUOTE_STR_DELIM;
					result= result + line._document_number + "~inventoryPool_line~" + inventoryPool + QUOTE_STR_DELIM;
				}
				assetFlag = false;
				if(line._part_number <> "" AND line._part_custom_field13 == "false" AND assetIdFromConfig <>"") {
					if(containsKey(assetValDict, assetIdFromConfig) AND line.assetID_l == "" ){
						assetArray = get(assetValDict, assetIdFromConfig);
						assetIdForInflight = assetIdFromConfig;
						price = 0;
						assetListPrice = 0;
						assetFlag = true;
						if(isnumber(assetArray[PRICE_INDEX])){
							price = atof(assetArray[PRICE_INDEX]);
						}
						
						startDate = assetArray[INSTALL_DATE_INDEX];
						endDate = assetArray[USAGE_ENDDATE_INDEX];
						leadType = assetArray[LEAD_TYPE_INDEX];
						market = assetArray[MARKET_TYPE_INDEX];
						
						newStartDate = util.salesforceStringToJavaDate(startDate);
						newEndDate = util.salesforceStringToJavaDate(endDate);
						
						contractTerm = assetArray[CONTRACT_TERM_INDEX];
						/*if(isRenewalFlag == true){
							contractTerm = contractTermForRenewal;
						}*/
						billingPeriod = assetArray[BILLING_PERIOD_INDEX]; 
						promotion = assetArray[PROMOTION_INDEX];
						discountType = assetArray[DISCOUNT_TYPE_INDEX];
						commerceGroup = assetArray[COMMERCE_GROUP_INDEX];
						productEmail = assetArray[PRODUCT_EMAIL_INDEX];
						licenseTierRange = assetArray[LICENSE_TIER_RANGE_INDEX];
						hLCOverride = assetArray[HLCOVERRIDE_INDEX];
						choiceLeadForm = assetArray[CHOICE_LEAD_FM_INDEX];
						zouraProductRatePlanCharge = assetArray[ZOURAPRODUCTRATEPLANCHARGE_INDEX];
						zuoraRatePlanID = assetArray[ZOURA_RATE_PLAN_ID_INDEX];
						zouraId = assetArray[ZOURAID_INDEX];
						productType = assetArray[PRODUCT_TYPE_INDEX];
						licenseTier = assetArray[LICENSE_TIER_INDEX];
						topConnector = assetArray[TOP_CONNECTOR_INDEX];
						featuredMortgage = assetArray[FEATURED_MORTGAGE_INDEX];
						marketTier = assetArray[MARKET_TIER_INDEX];
						quantity = assetArray[QUANTITY_INDEX];
						status = assetArray[STATUS_INDEX];
						brokerPlanAffiliation = assetArray[BROKER_PLAN_AFFILIATION_INDEX];
						participants = assetArray[PARTICIPANTS_INDEX];
						assetExternalId = assetArray[ASSET_EXTERNAL_ID_INDEX];
						overrideTerm = assetArray[OVERRIDE_TERM_INDEX];
						manualDiscountAmount = assetArray[MANUAL_DISCOUNT_AMOUNT_INDEX];
						nextChargeDate = assetArray[NEXT_CHARGE_DATE];
						
						if(NOT(isnull(assetArray[LAST_MODIFIED_BY_INDEX]))){
							lastModifiedBy = assetArray[LAST_MODIFIED_BY_INDEX];
						}else{
							lastModifiedBy = "";
						}
						if(NOT(isnull(assetArray[TERM_END_DATE_INDEX]))){
							termEndDate = assetArray[TERM_END_DATE_INDEX];
						}else{
							termEndDate = "";
						}
						if(NOT(isnull(assetArray[CAMPAIGN_ID_INDEX])) AND assetArray[CAMPAIGN_ID_INDEX] <> "" AND assetArray[CAMPAIGN_ID_INDEX] <> "null"){
							campaignId = assetArray[CAMPAIGN_ID_INDEX];
						}else{
							campaignId = "";
						}
						if(line.commerceGroup_line <> "" AND NOT(isnull(line.commerceGroup_line))){
							commerceGroup = line.commerceGroup_line;
						}			
						
						if(isNumber(manualDiscountAmount) == false)
						{
							manualDiscountAmount = "0.0";
						}
						manualDiscountType = assetArray[MANUAL_DISCOUNT_TYPE_INDEX];
						priceEffectiveDate = assetArray[PRICE_EFFECTIVE_DATE_INDEX];
						marketKey = assetArray[MARKET_KEY_INDEX];
						renewalStatus = assetArray[RENEWAL_STATUS_INDEX];
						costPerAction = assetArray[COST_PER_ACTION_INDEX];
						pricePerImpression = assetArray[PRICE_PER_IMPRESSION_INDEX];
						if(NOT(isnull(assetArray[EXTENDED_NET_PRICE_INDEX])) AND assetArray[EXTENDED_NET_PRICE_INDEX] <> "" AND assetArray[EXTENDED_NET_PRICE_INDEX] <> "null"){
							extendedNetPrice = assetArray[EXTENDED_NET_PRICE_INDEX];
						}
						accountCategory = assetArray[ACCOUNT_CATEGORY_INDEX];
						//Added below line for CRM-1772
						assetNumber = assetArray[ASSET_NUMBER_INDEX];
						
						/* if(NOT(isnull(assetArray[PICK_SELECTION_INDEX]))){
							if(assetArray[PICK_SELECTION_INDEX] <> "" AND assetArray[PICK_SELECTION_INDEX] <> "null"){
								pickSelection = assetArray[PICK_SELECTION_INDEX];
								if(find(pickSelection,";") > -1){
									pickSelection = replace(pickSelection,";",",");
								}
							}
						}else{
							pickSelection = "";
						} 
						if(NOT(isnull(assetArray[PPL_OVERRIDE_INDEX])) AND assetArray[PPL_OVERRIDE_INDEX] <> "" AND assetArray[PPL_OVERRIDE_INDEX] <> "null"  AND isnumber(assetArray[PPL_OVERRIDE_INDEX])){
							pplOverride = assetArray[PPL_OVERRIDE_INDEX];
						}else{
							pplOverride = "0";
						}
						if(NOT(isnull(assetArray[AMLC_OVERRIDE_INDEX])) AND assetArray[AMLC_OVERRIDE_INDEX] <> "" AND assetArray[AMLC_OVERRIDE_INDEX]<>"null" AND isnumber(assetArray[AMLC_OVERRIDE_INDEX])){
							amlcOverride = string(integer(atof(assetArray[AMLC_OVERRIDE_INDEX])));
						}else{
							amlcOverride = "0";
						}*/
						manualOverrideAmount = assetArray[MANUAL_OVERRIDE_AMOUNT_INDEX];
						if(isNumber(manualOverrideAmount)== false)
						{
							manualOverrideAmount = "0";
						}
						if(isnumber(assetArray[ASSET_LIST_PRICE_INDEX]))
						{
							assetListPrice = atof(assetArray[ASSET_LIST_PRICE_INDEX]);
						}
						subscriptionId = assetArray[SUBSCRIPTIONID_INDEX];
						
						hlcOverrideIdx = find(hLCOverride, ".");
						if(hlcOverrideIdx <> -1){
							hLCOverride = substring(hLCOverride,0,hlcOverrideIdx);
						}
						EXTERNAL_ID = assetArray[EXTERNAL_ID_INDEX];
						subscriptionStartDate = assetArray[SUBSCRIPTION_STARTDATE_INDEX];
						subscriptionEndDate = assetArray[SUBSCRIPTION_ENDDATE_INDEX];
						HLC = assetArray[HLC_INDEX];
						/*Start CRM-1090
						if(isRenewalFlag == true){
							manualOverrideAmount = "0";
							overrideTerm = "0";
							billingPeriod = "Monthly";
							if(contractTerm == "12"){
								billingPeriod = "Annual";
							}elif(contractTerm == "6"){
								billingPeriod = "Bi-Annual";
							}elif(contractTerm == "3"){
								billingPeriod = "Quarterly";
							}
							//discountType = "%";
							//manualDiscountType = "%";
							//promotion = "";
						}// End CRM-1090*/

						assetPriceEffectiveDateFormat = split(priceEffectiveDate,"T");
						assetPriceEffectiveDate = assetPriceEffectiveDateFormat[0];
						if(not(isnull(subscriptionStartDate)) AND subscriptionStartDate<>""){
							newsubscriptionStartDate = util.salesforceStringToJavaDate(subscriptionStartDate);
							//newStartDate = newsubscriptionStartDate;
							result = result + line._document_number + "~subscriptionStartDate_line~" + datetostr(newsubscriptionStartDate) + QUOTE_STR_DELIM;				
						}
						if(not(isnull(subscriptionEndDate)) AND subscriptionEndDate<>""){
							newsubscriptionEndDate = util.salesforceStringToJavaDate(subscriptionEndDate);
							//newEndDate = newsubscriptionEndDate;
							result = result + line._document_number + "~subscriptionEndDate_line~" + datetostr(newsubscriptionEndDate) + QUOTE_STR_DELIM;
						}
						
						result = result + line._document_number + "~assetPrice_line~" + string(price) + QUOTE_STR_DELIM;
						result = result + line._document_number + "~contractStartDate_l~" + datetostr(newStartDate) + QUOTE_STR_DELIM;
						result = result + line._document_number + "~contractEndDate_l~" + datetostr(newEndDate) + QUOTE_STR_DELIM;
						result = result + line._document_number + "~leadType_line~" + leadType + QUOTE_STR_DELIM;
						result = result + line._document_number + "~marketZip_line~" + market + QUOTE_STR_DELIM;
						result = result + line._document_number + "~contractTerms_line~" + contractTerm + QUOTE_STR_DELIM;
						result = result + line._document_number + "~billingPeriod_line~" + billingPeriod + QUOTE_STR_DELIM;
						result = result + line._document_number + "~promotion_line~" + promotion + QUOTE_STR_DELIM;
						result = result + line._document_number + "~appliedPromotions_line~" + promotion + QUOTE_STR_DELIM;
						promotionStringQuote = promotionStringQuote + line._document_number + ".!." + promotion + "!!!";
						
						if(trim(discountType) <> "" AND trim(manualDiscountType) == "")
						{
							result = result + line._document_number + "~discountType_line~" + discountType + QUOTE_STR_DELIM;
						}elif(trim(manualDiscountType) <> "")
						{
							result = result + line._document_number + "~discountType_line~" + manualDiscountType + QUOTE_STR_DELIM;
						}
						
						//result = result + line._document_number + "~commerceGroup_line~" + commerceGroup + QUOTE_STR_DELIM;
						result = result + line._document_number + "~productEmail_line~" + productEmail + QUOTE_STR_DELIM;
						//result = result + line._document_number + "~licenseTier_line~" + licenseTierRange + QUOTE_STR_DELIM;
						//result = result + line._document_number + "~hlcOverride_line~" + hLCOverride + QUOTE_STR_DELIM;
						result = result + line._document_number + "~assetFlag_l~" + string(assetFlag) + QUOTE_STR_DELIM;
						result = result + line._document_number + "~zuoraSubscriptionID_line~" + subscriptionId + QUOTE_STR_DELIM;
						result = result + line._document_number + "~zuoraProductRatePlanChargeID_line~" + zouraProductRatePlanCharge + QUOTE_STR_DELIM;
						result = result + line._document_number + "~zuoraRatePlanID_line~" + zuoraRatePlanID + QUOTE_STR_DELIM;
						result = result + line._document_number + "~zuoraAmendmentID_line~" + zouraId + QUOTE_STR_DELIM;
						result = result + line._document_number + "~assetListPrice_line~" + string(assetListPrice) + QUOTE_STR_DELIM
										+ line._document_number + "~assetPriceEffectiveDate_line~" + assetPriceEffectiveDate + QUOTE_STR_DELIM
										+ line._document_number + "~renewalStatus_line~" + renewalStatus + QUOTE_STR_DELIM
										+ line._document_number + "~override_line~" + manualDiscountAmount + QUOTE_STR_DELIM
										+ line._document_number + "~listPriceOverride_line~" + manualOverrideAmount + QUOTE_STR_DELIM
										+ line._document_number + "~assetLastModifiedDate_line~" + lastModifiedBy + QUOTE_STR_DELIM
										+ line._document_number + "~campaignId_line~" + campaignId + QUOTE_STR_DELIM
										+ line._document_number + "~oldLineType_line~" + line.lineType_line + QUOTE_STR_DELIM
										+ line._document_number + "~accountCategory_line~" + accountCategory + QUOTE_STR_DELIM
										//Added below line for CRM-1772
										+ line._document_number + "~assetNumber~" + assetNumber + QUOTE_STR_DELIM;
										//+ line._document_number + "~selectOption_line~" + pickSelection + QUOTE_STR_DELIM;
										//+ line._document_number + "~pPLOverride_line~" + pplOverride + QUOTE_STR_DELIM
										//+ line._document_number + "~aMLCOverride_line~" + amlcOverride + QUOTE_STR_DELIM;
										//+ line._document_number + "~choiceLeadForm~" + choiceLeadForm + QUOTE_STR_DELIM;
						
						//res = res + "1~appliedPromotions_quote~" + promotionString + QUOTE_STR_DELIM ;
						if(isnumber(overrideTerm))
						{
							if(find(overrideTerm,".") > -1)
							{
								overrideTermArray = split(overrideTerm,".");
								overrideTerm = overrideTermArray[0];
							}
							result = result + line._document_number + "~overrideTerm_line~" + overrideTerm + QUOTE_STR_DELIM;
						}
						/*if(renewalStatus == "Do Not Renew")
						{
							result = result + line._document_number + "~lineType_line~cancel" + QUOTE_STR_DELIM;
						}*/
						/* Below is code to default the applied promo on the non inventory line item -- starts*/
						if(promotion <> "" AND isnull(promotion) == false){
							if(sizeofarray(appliedPromoArr) > 0){
								checkPromoAvailability = line._document_number + ".!." + promotion ;
								if(findinarray(appliedPromoArr, checkPromoAvailability) == -1){
									nonInventoryAppliedPromo = nonInventoryAppliedPromo + line._document_number + ".!." + promotion+ "!!!";
								}
							}else{
								nonInventoryAppliedPromo = nonInventoryAppliedPromo + line._document_number + ".!." + promotion+ "!!!";
							}
						}
						
						/* Above is code to default the applied promo on the non inventory line item -- End*/
						assetDetails = line._document_number + "#" + line._part_number + "#" + quantity + "#" + string(price) + "#" + assetId + "#" + startDate + "#" + endDate + "#" + leadType + "#" + productType + "#" + market + "#" + contractTerm + "#" + billingPeriod + "#" + promotion + "#" + discountType + "#" + commerceGroup + "#" + brokerPlanAffiliation + "#" + productEmail + "#" + participants + "#" + licenseTierRange + "#" + topConnector + "#" + featuredMortgage  + "#" + hLCOverride + "#" + status + "#" + zouraProductRatePlanCharge + "#" + zouraId + "#" + subscriptionId + "#" + marketTier + "#" + zuoraRatePlanID + "#" + string(assetListPrice) + "#" + EXTERNAL_ID + "#" + subscriptionStartDate + "#" + subscriptionEndDate + "#" + HLC + "#" + assetExternalId + "#" + overrideTerm + "#" + licenseTier + "#" + manualDiscountAmount + "#" + manualDiscountType + "#" + priceEffectiveDate + "#" + marketKey + "#" + renewalStatus + "#" + costPerAction + "#" + manualOverrideAmount + "#" + nextChargeDate + "#" + "#" + lastModifiedBy + "#" + termEndDate + "#" + "#" + "#" + campaignId + "#" + pricePerImpression /*+ "#" + pickSelection + "#" + pplOverride + "#" + amlcOverride*/+ "#" + "#" + extendedNetPrice+"#"+accountCategory;
						result = result + line._document_number + "~assetDetails_line~" + assetDetails + QUOTE_STR_DELIM;
					}
					linesHasAssetId = true;
				}
				if( line._part_number <> "" AND NOT(assetFlag) AND containskey(defaultValueDict,line._part_number) AND line.contractTerms_line == ""){
					result = result + line._document_number + "~contractTerms_line~" + get(defaultValueDict,line._part_number) + QUOTE_STR_DELIM;
				}
				if(line.assetID_l <> "" AND linesHasAssetId == false){
					linesHasAssetId = true;
				}
			}
		}
		
		if(line._parent_doc_number <> ""){
			
			if(line._part_custom_field13 == "false"){
				commerceGroupFromConfig = getconfigattrvalue(line._parent_doc_number,"addToProductBundle");
			}else{
				commerceGroupFromConfig = getconfigattrvalue(line._parent_doc_number,"addToCommerceGroup_menu");
			}	
			if(line.commerceGroup_line <> "" AND NOT(isnull(line.commerceGroup_line)) AND line.commerceGroup_line <> "null"){
				
				result = result + line._document_number + "~commerceGroup_line~" + line.commerceGroup_line + QUOTE_STR_DELIM;
			}elif(commerceGroupFromConfig <> "null" AND NOT(isnull(commerceGroupFromConfig))){
				result = result + line._document_number + "~commerceGroup_line~" + commerceGroupFromConfig + QUOTE_STR_DELIM;
			}
			if(line._part_number == "ADVANTAGE"){
				selectedOptionDataStr = getconfigattrvalue(line._parent_doc_number,"selectedOptionDataString_adv");
				
				if(selectedOptionDataStr <> ""){
					selectedOptionStrArr = split(selectedOptionDataStr,"+");
					selectedOptionStr = join(selectedOptionStrArr,",");
					result = result + line._document_number + "~selectOption_line~" + selectedOptionStr + QUOTE_STR_DELIM ;
				}
				
			}
		}
		if(assetIdForInflight <> "")
		{
			if(assetIdsStr <> "")
			{
				assetIdsStr = assetIdsStr + ",";
			}
			assetIdsStr = assetIdsStr + "'" + assetIdForInflight + "'";
		}
	}
}

if(linesHasAssetId AND quoteType_quote == "New"){
	result = result + "1~quoteType_quote~" + "Modify" + QUOTE_STR_DELIM;
}
result = result + "1~assetIdsForInflightCheck_quote~" + assetIdsStr + QUOTE_STR_DELIM;
if(appliedPromotions_quote == "" OR isnull(appliedPromotions_quote) == true){
	nonInventoryAppliedPromo = nonInventoryAppliedPromo;
}else{
	nonInventoryAppliedPromo = appliedPromotions_quote + "!!!" + nonInventoryAppliedPromo;
}
result = result + "1~appliedPromotions_quote~" + nonInventoryAppliedPromo + QUOTE_STR_DELIM ;
result = result + "1~selectedOptionDataString_quote~" + selectedOptionDataStr + QUOTE_STR_DELIM ;




/*if(sizeofarray(partNumList) > 0){
	temp = join(partNumList,",");
	result = result + "1~existingProducts~" + temp + QUOTE_STR_DELIM;
}*/
return result;