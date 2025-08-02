public without sharing  class SpermDonorPreRegistrationController {
    public class SpermBankWrapper {
        @AuraEnabled public String name;
        @AuraEnabled public String website;
        @AuraEnabled public String phone;
        @AuraEnabled public String email;
        @AuraEnabled public String coordinator;
        @AuraEnabled public String donorCode;
        @AuraEnabled public String knowDonorCode;
        @AuraEnabled public boolean noSpermBankChecked;
        @AuraEnabled public integer clinicNumber;
        @AuraEnabled public String accountId; 
        @AuraEnabled public String junctionId; 
        @AuraEnabled public string bankName;
        @AuraEnabled public string spermbankId;
        @AuraEnabled public string spermclinicId;
        @AuraEnabled public boolean showDonorCodeInput;
        @AuraEnabled public boolean hideDonorCodeInput;
        @AuraEnabled public string coordinatorContactAvailable;
        @AuraEnabled public boolean primaryConfirmed;
        @AuraEnabled public CoordinatorWrapper coordinatorUserInputsObj;
       
    }
    
    public class CoordinatorWrapper{
        @AuraEnabled public String firstName;
        @AuraEnabled public String lastName;
        @AuraEnabled public String parentId;
        @AuraEnabled public String phone;
        @AuraEnabled public String coordinatorId;  
    }
    
    /*@AuraEnabled
public static SpermBankResponse createSpermBank(string spermBankDetails, string donorId){

// Deserialize JSON into list of wrapper objects
List<SpermBankWrapper> spermBanks = (List<SpermBankWrapper>) JSON.deserialize(spermBankDetails, List<SpermBankWrapper>.class);
system.debug(spermBanks);
//Holds sperm bank record type accounts
List<Account> spermBankAccounts = new List<Account>();

//Holds donor sperm bank junction object records
List<d21_Donor_Sperm_Bank__c> junctions = new List<d21_Donor_Sperm_Bank__c>();

//this map holds exact match between js sperm bank object with backend sperm object
Map<String, Id> clinicNumberToAccountId = new Map<String, Id>(); 

//this map holds exact match between js sperm bank object with backend junction object
Map<String, Id> clinicNumberToJunctionId = new Map<String, Id>();

try{
// if Check here if you did not work with any sperm banks "not selected"
if(spermBanks[0].noSpermBankChecked == false){
for (SpermBankWrapper bank : spermBanks) {
//intiating sperm bank
Account acc = new Account();
if (String.isNotBlank(bank.accountId)) {
acc.Id = bank.accountId;
}
acc.Name = bank.name;
acc.Website = bank.website;
acc.Phone = bank.phone;
acc.d21_Email__c = bank.email;
acc.d21_Coordinator_Name__c = bank.coordinator;
acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Sperm Bank').getRecordTypeId();
//adding sperm bank details
spermBankAccounts.add(acc);
}
//create/update sperm bank details
upsert spermBankAccounts;
system.debug(spermBankAccounts);

//iterating over sperm Bank Accounts
for (Integer i = 0; i < spermBankAccounts.size(); i++) {
//getting each sperm bank wrapper object
SpermBankWrapper bank = spermBanks[i];

//getting each inserted sperm bank record
Account acc = spermBankAccounts[i];

//intiating junction object
d21_Donor_Sperm_Bank__c link = new d21_Donor_Sperm_Bank__c();
link.name = acc.name;

//checking if junction object already created or not by just validating ID
if (String.isNotBlank(bank.junctionId)) {
link.Id = bank.junctionId;
}
//initiating values for these d21_Sperm_Bank__c, d21_Sperm_Donor__c at first time only
else{
link.d21_Sperm_Bank__c = acc.Id;
link.d21_Sperm_Donor__c = donorId;
}

link.d21_Donor_Code__c = bank.donorCode;
link.d21_Worked_With_Program__c = true;
if(bank.knowDonorCode == 'Yes'){
link.d21_Know_Donor_Code__c = true;
}
else{
link.d21_Know_Donor_Code__c = false;
}
junctions.add(link);
}

upsert junctions;
system.debug(junctions);

//iterating over sperm Banks wraper
for (Integer i = 0; i < spermBanks.size(); i++) {
SpermBankWrapper bank = spermBanks[i];
//mapping sperm bank clinicNumber with inserted sperm bank (Account id) to validate front end and backend 
clinicNumberToAccountId.put(string.valueOf(bank.clinicNumber), spermBankAccounts[i].Id);

//mapping sperm bank clinicNumber with inserted Donor sperm bank (junction id) to validate front end and backend 
clinicNumberToJunctionId.put(string.valueOf(bank.clinicNumber), junctions[i].Id);
}

return new SpermBankResponse(true, 'Agency Records Created/Updated Successfully.', clinicNumberToAccountId, clinicNumberToJunctionId);
}
else{
return new SpermBankResponse(true, 'Agency skipped.');
}
} 
catch (Exception e) {
return new SpermBankResponse(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
}
}*/

@AuraEnabled
public static Response createSpermBankWithSDN(string contactObj) {
    try {
        DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
        system.debug('Primary confirmed flag: ' + donor.spermWithSDNBankprimaryConfirmed);
        system.debug('primaryBanksListFromApex' + donor.spermBanksWithSDN.primaryBanksListFromApex);
        
        // Initialize response wrapper
        ResponseData wrapperData = new ResponseData();
        PrimaryCheckBoxClass primaryCheckBoxesCls = new PrimaryCheckBoxClass();
        /*primaryCheckBoxesCls.primaryConfirmed = donor.spermBanksWithSDN.primaryConfirmed;
        primaryCheckBoxesCls.primaryIncorrect = donor.spermBanksWithSDN.primaryIncorrect;*/
        wrapperData.primaryCheckBoxOptions = primaryCheckBoxesCls;
        
        /*boolean isAdditionalBanksAvailable = false;
        List<SpermBankWrapper> spermBankList = donor.spermBanksWithSDN.additionalBanks;*/
        list<SpermBankWrapper> autoPopulatedSpermBank = donor.spermBanksWithSDN.primaryBanksListFromApex;
        
        list<SpermBankWrapper> spermBankResponse = new list<SpermBankWrapper>();
        list<SpermBankWrapper> autoPopulatedSpermBankResponse = new list<SpermBankWrapper>();
        
        // Get Sperm Bank record type ID
        Id spermBankRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Sperm Bank').getRecordTypeId();
        
        // Maps for tracking agency and junction records
        Map<string, d21_Donor_Agency__c> agencyIdVsAgencyJunctionRecordMap = new Map<string, d21_Donor_Agency__c>();
        set<Id> agencyRecordIdset = new set<Id>();
        
        // Process primary/auto-populated banks
        if(autoPopulatedSpermBank != null) {
            list<Account> upsertAccountList = new list<Account>();
           
            for(SpermBankWrapper wrapper : autoPopulatedSpermBank) {
                if(wrapper.primaryConfirmed != null &&  wrapper.primaryConfirmed == true){
                    system.debug('>>>' + wrapper.primaryConfirmed);
                    
                    Account acc = new Account();
                    acc.Name = wrapper.bankName;
                    acc.Website = wrapper.website;
                    acc.Phone = wrapper.phone;
                    acc.d21_Email__c = wrapper.email;
                    acc.d21_Coordinator_Name__c = wrapper.coordinator;
                    acc.RecordTypeId = spermBankRecordTypeId;
                    
                    if(wrapper.spermbankId != null) {
                        acc.Id = wrapper.spermbankId;
                    }
                    
                    if(wrapper.coordinatorContactAvailable != null && string.IsNotBlank(wrapper.coordinatorContactAvailable)){
                    }
                    
                    upsertAccountList.add(acc);
                }
            }
            
            if(!upsertAccountList.isEmpty()) {
                // Upsert accounts
                Database.UpsertResult[] accountResults = Database.upsert(upsertAccountList, false);
                
                set<string> autopopulatedAgencyRecordIdset = new set<string>();
                for(Integer i = 0; i < accountResults.size(); i++) {
                    if(accountResults[i].isSuccess()) {
                        Account acc = upsertAccountList[i];
                        SpermBankWrapper rec = new SpermBankWrapper();
                        rec.bankName = acc.Name;
                        rec.website = acc.Website;
                        rec.phone = acc.Phone;
                        rec.email = acc.d21_Email__c;
                        rec.coordinator = acc.d21_Coordinator_Name__c;
                        rec.accountId = acc.Id;
                        autopopulatedAgencyRecordIdset.add(acc.Id);
                        autoPopulatedSpermBankResponse.add(rec);
                    }
                }
                
                // Query existing junction records
                list<d21_Donor_Agency__c> donorAgencies = [SELECT Id, Agency__c, d21_Egg_Donor__c, Name
                                                           FROM d21_Donor_Agency__c 
                                                           WHERE Agency__c IN :autopopulatedAgencyRecordIdset
                                                           AND d21_Egg_Donor__c = :donor.donorId];
                
                // Populate junction record map
                for(d21_Donor_Agency__c donorAgency : donorAgencies) {
                    agencyIdVsAgencyJunctionRecordMap.put(donorAgency.Agency__c, donorAgency);
                }
                
                // Create/update junction records
                list<d21_Donor_Agency__c> junctions = new list<d21_Donor_Agency__c>();
                for (Account acc : upsertAccountList) {
                    d21_Donor_Agency__c link = new d21_Donor_Agency__c();
                    link.Name = acc.Name;
                    
                    if (agencyIdVsAgencyJunctionRecordMap.containsKey(acc.Id)) {
                        link.Id = agencyIdVsAgencyJunctionRecordMap.get(acc.Id).Id;
                    } else {
                        link.Agency__c = acc.Id;
                        link.d21_Egg_Donor__c = donor.donorId;
                    }
                    junctions.add(link);
                }
                
                if(!junctions.isEmpty()) {
                    Database.UpsertResult[] junctionResults = Database.upsert(junctions, false);
                    for(Integer i = 0; i < junctionResults.size(); i++) {
                        if(junctionResults[i].isSuccess()) {
                            // Update response with junction ID
                            autoPopulatedSpermBankResponse[i].junctionId = junctions[i].Id;
                        }
                    }
                }
            }
            wrapperData.autoPopulateList = autoPopulatedSpermBankResponse;
        }
        
        // Process additional banks if they exist
        /*if(isAdditionalBanksAvailable == false && spermBankList != null && !spermBankList.isEmpty()) {
            list<Account> accountList = new list<Account>();
            
            for(SpermBankWrapper record : spermBankList) {
                Account acc = new Account();
                acc.Name = record.bankName;
                acc.Website = record.website;
                acc.Phone = record.phone;
                acc.d21_Email__c = record.email;
                acc.d21_Coordinator_Name__c = record.coordinator;
                acc.RecordTypeId = spermBankRecordTypeId;
                
                if(record.accountId != null && String.isNotBlank(record.accountId)) {
                    acc.Id = record.accountId;
                }
                accountList.add(acc);
            }
            
            if(!accountList.isEmpty()) {
                // Upsert accounts
                Database.UpsertResult[] accountResults = Database.upsert(accountList, false);
                
                for(Integer i = 0; i < accountResults.size(); i++) {
                    if(accountResults[i].isSuccess()) {
                        Account acc = accountList[i];
                        SpermBankWrapper record = new SpermBankWrapper();
                        record.bankName = acc.Name;
                        record.website = acc.Website;
                        record.phone = acc.Phone;
                        record.email = acc.d21_Email__c;
                        record.coordinator = acc.d21_Coordinator_Name__c;
                        record.accountId = acc.Id;
                        record.spermbankId = acc.Id;
                        record.donorCode = spermBankList[i].donorCode;
                        record.showDonorCodeInput = spermBankList[i].showDonorCodeInput;
                        record.hideDonorCodeInput = spermBankList[i].hideDonorCodeInput;
                        spermBankResponse.add(record);
                        agencyRecordIdset.add(acc.Id);
                    }
                }
                
                // Query existing junction records
                list<d21_Donor_Agency__c> donorAgencies = [SELECT Id, Agency__c, d21_Egg_Donor__c, Name
                                                          FROM d21_Donor_Agency__c 
                                                          WHERE Agency__c IN :agencyRecordIdset
                                                          AND d21_Egg_Donor__c = :donor.donorId];
                
                // Populate junction record map
                for(d21_Donor_Agency__c donorAgency : donorAgencies) {
                    agencyIdVsAgencyJunctionRecordMap.put(donorAgency.Agency__c, donorAgency);
                }
                
                // Create/update junction records
                list<d21_Donor_Agency__c> junctions = new list<d21_Donor_Agency__c>();
                for (Integer i = 0; i < accountList.size(); i++) {
                    Account acc = accountList[i];
                    SpermBankWrapper bank = spermBankList[i];
                    
                    d21_Donor_Agency__c link = new d21_Donor_Agency__c();
                    link.Name = acc.Name;
                    
                    if (agencyIdVsAgencyJunctionRecordMap.containsKey(acc.Id)) {
                        link.Id = agencyIdVsAgencyJunctionRecordMap.get(acc.Id).Id;
                    } else {
                        link.Agency__c = acc.Id;
                        link.d21_Egg_Donor__c = donor.donorId;
                    }
                    junctions.add(link);
                    
                    // Update response with donor code info
                    if(i < spermBankResponse.size()) {
                        spermBankResponse[i].donorCode = bank.donorCode;
                        spermBankResponse[i].showDonorCodeInput = bank.showDonorCodeInput;
                        spermBankResponse[i].hideDonorCodeInput = bank.hideDonorCodeInput;
                    }
                }
                
                if(!junctions.isEmpty()) {
                    Database.UpsertResult[] junctionResults = Database.upsert(junctions, false);
                    for(Integer i = 0; i < junctionResults.size(); i++) {
                        if(junctionResults[i].isSuccess() && i < spermBankResponse.size()) {
                            // Update response with junction ID
                            spermBankResponse[i].junctionId = junctions[i].Id;
                        }
                    }
                }
            }
            wrapperData.responseList = spermBankResponse;
        }*/
        
        return new Response(true, JSON.serialize(wrapperData));
    } catch (Exception e) {
        System.debug('Error: ' + e.getMessage() + ' at line ' + e.getLineNumber());
        return new Response(false, 'Error: ' + e.getMessage() + ' at line ' + e.getLineNumber());
    }
}

public class ResponseData{
    @AuraEnabled public list<SpermBankWrapper> autoPopulateList;
    @AuraEnabled public list<SpermBankWrapper> responseList;
    @AuraEnabled public PrimaryCheckBoxClass primaryCheckBoxOptions;
    
}

/*@AuraEnabled
public static Response createSpermClinicWithSDN(string contactObj){
    try {
        DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
        SpermBankWrapperResponse wrapper = new SpermBankWrapperResponse();
        PrimaryCheckBoxClass primaryCheckBoxesCls = new PrimaryCheckBoxClass();
        primaryCheckBoxesCls.primaryConfirmed = donor.clinicInfoWithSDN.primaryConfirmed;
        primaryCheckBoxesCls.primaryIncorrect = donor.clinicInfoWithSDN.primaryIncorrect;
       	wrapper.primaryCheckBoxOptions = primaryCheckBoxesCls;
            
        boolean isAddionalPrimaryClinic = donor.clinicInfoWithSDN.primaryConfirmed;
        boolean isAddionalPrimaryIncorrect = donor.clinicInfoWithSDN.primaryIncorrect;
        //SpermBankWrapper autoPopulatedSpermBank = donor.clinicInfoWithSDN.primaryBank;
        list<SpermBankWrapper> autoPopulatedSpermBanks = donor.clinicInfoWithSDN.primaryBanksListFromApex;
        boolean isAddionalClinicsAvailable = donor.clinicInfoWithSDN.noOtherBanks;
        
        system.debug('donor.clinicInfoWithSDN.primaryBank:' + autoPopulatedSpermBanks); //auto population
        
        list<SpermBankWrapper> spermBankList = donor.clinicInfoWithSDN.additionalBanks;
        system.debug('donor.clinicInfoWithSDN.spermBankList:' + spermBankList);//user entries list
        
        list<SpermBankWrapper> spermBankResponse = new list<SpermBankWrapper>();
        SpermBankWrapper autoPopulatedSpermBankResponse = new SpermBankWrapper();
        list<Account> accountList = new list<Account>();
        
        Map<string, d21_Donor_Fertility_Clinic__c> clinicIdVsCinicJunctionRecordMap = new Map<string, d21_Donor_Fertility_Clinic__c>();
        //this set holds clinic record ids
        set<Id> clinicRecordIdset = new set<Id>();
         list<Account> upsertAccountList = new list<Account>();
        //iterate over autoPopulatedSpermBanks records
        for(SpermBankWrapper wrp : autoPopulatedSpermBanks){
            Account acc = new Account();
            acc.Name = wrp.bankName;
            acc.Website = wrp.website;
            acc.Phone = wrp.phone;
            acc.d21_Email__c = wrp.email;
            acc.d21_Coordinator_Name__c = wrp.coordinator;
            if(wrp.spermclinicId != null){
                acc.Id = wrp.spermclinicId;
            }
            upsertAccountList.add(acc);
        }
        if(!upsertAccountList.isEmpty()){
            update upsertAccountList;
            /*list<SpermBankWrapper> autoPopulatedSpermBankResponse = new list<SpermBankWrapper>();//spermBanksAutoPopulatedList
            for(Account acc : upsertAccountList){
                SpermBankWrapper rec = new SpermBankWrapper();
                rec.bankName = acc.Name;
                rec.website = acc.Website;
                rec.phone = acc.Phone;
                rec.email = acc.d21_Email__c;
                rec.coordinator = acc.d21_Coordinator_Name__c;
                rec.accountId = acc.Id;
                autoPopulatedSpermBankResponse.add(rec);
            }
            
        }
        
        //iterate over user given additional sperm clinic details
         if(isAddionalClinicsAvailable == false){
            system.debug('additional false');
            for(SpermBankWrapper record : spermBankList){
            system.debug('record ' + record);
            Account acc = new Account();
            acc.Name = record.bankName;
            acc.Website = record.website;
            acc.Phone = record.phone;
            acc.d21_Email__c = record.email;
            acc.d21_Coordinator_Name__c = record.coordinator;
            acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Clinic').getRecordTypeId();
            if(record.accountId != null && string.IsNotBlank(record.accountId)){
                acc.Id = record.accountId;
            }
            accountList.add(acc);
        }
         }
       

        if(!accountList.isEmpty()){
            upsert accountList;
            system.debug('Account List Record >>> '+accountList);
            for(Account acc : accountList){
                SpermBankWrapper record = new SpermBankWrapper();
                record.bankName = acc.Name;
                record.website = acc.Website;
                record.phone = acc.Phone;
                record.email = acc.d21_Email__c;
                record.coordinator = acc.d21_Coordinator_Name__c;
                record.accountId = acc.Id;
                record.spermbankId = acc.Id;
                spermBankResponse.add(record);
                clinicRecordIdset.add(acc.Id);
            }
            system.debug('clinicRecordIdset' + clinicRecordIdset);
            //fetch instered agency records
            list<d21_Donor_Fertility_Clinic__c> donorClinics = [SELECT Id, d21_Clinic__c, d21_Donor__c
                                                                FROM d21_Donor_Fertility_Clinic__c 
                                                                WHERE d21_Clinic__c In : clinicRecordIdset];
            system.debug('donorClinics' + donorClinics);
            //if clinics are available then iterate over them.
            if(!donorClinics.isEmpty()){
                system.debug('donorClinics' + donorClinics);
                for(d21_Donor_Fertility_Clinic__c donorClinic : donorClinics){
                    //set agency id and donor clinic junction records
                    clinicIdVsCinicJunctionRecordMap.put(donorClinic.d21_Clinic__c, donorClinic);
                }
            }
            system.debug('clinicIdVsCinicJunctionRecordMap' + clinicIdVsCinicJunctionRecordMap);
            List<d21_Donor_Fertility_Clinic__c> junctions = new List<d21_Donor_Fertility_Clinic__c>();
            
            //spermBankList
            for (Integer i = 0; i < accountList.size(); i++) {
                SpermBankWrapper clinic = spermBankList[i];
                system.debug('clinic' + clinic);
                
                spermBankResponse[i].donorCode = clinic.donorCode;
                spermBankResponse[i].showDonorCodeInput = clinic.showDonorCodeInput;
                spermBankResponse[i].hideDonorCodeInput = clinic.hideDonorCodeInput;
                
                //getting each inserted clinic record
                Account acc = accountList[i];
                system.debug('acc' + acc);
                d21_Donor_Fertility_Clinic__c link = new d21_Donor_Fertility_Clinic__c();
                link.name = acc.name;
                //checking if junction object already created or not by just validating ID
                
                if (clinicIdVsCinicJunctionRecordMap.containsKey(acc.Id)) {
                    system.debug(clinicIdVsCinicJunctionRecordMap.get(acc.Id));
                    link.Id = clinicIdVsCinicJunctionRecordMap.get(acc.Id).Id;
                }
                //initiating values for these d21_Sperm_Bank__c, d21_Sperm_Donor__c at first time only
                else{
                    link.d21_Clinic__c = acc.Id;
                    link.d21_Donor__c = donor.donorId;
                }
                link.d21_Worked_With_Program__c = true;
                //adding junction objects to list
                junctions.add(link);
            }
			 upsert junctions;
             system.debug(junctions);
        }
        wrapper.spermBankList = spermBankResponse;
        return new Response(true, JSON.serialize(wrapper));
    } catch (Exception e) {
        return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
    }
}
   */ 
    /*************************************************************/
    @AuraEnabled
 	public static Response createSpermClinicWithSDN(String contactObj) {
    try {
        DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
		system.debug('donor' + donor);
        system.debug('donor' + donor.clinicInfoWithSDN.primaryClinicsListFromApex);
        SpermBankWrapperResponse wrapper = new SpermBankWrapperResponse();
      
        //boolean isAutoSpermClinicsAllowedToDml = donor.clinicInfoWithSDN.isAutoSpermClinicsAllowedToDml;
        //system.debug(isAutoSpermClinicsAllowedToDml);
        //wrapper.primaryCheckBoxOptions = primaryCheckBoxesCls;

        //Boolean isAddionalPrimaryClinic = donor.clinicInfoWithSDN.primaryConfirmed;
        //Boolean isAddionalPrimaryIncorrect = donor.clinicInfoWithSDN.primaryIncorrect;

        List<SpermBankWrapper> autoPopulatedSpermBanks = donor.clinicInfoWithSDN.primaryClinicsListFromApex;
        //Boolean isAddionalClinicsAvailable = donor.clinicInfoWithSDN.noOtherBanks;

        List<SpermBankWrapper> spermBankList = donor.clinicInfoWithSDN.additionalBanks;
        List<SpermBankWrapper> spermBankResponse = new List<SpermBankWrapper>();

        List<Account> accountList = new List<Account>();
        List<Account> upsertAccountList = new List<Account>();

        if(autoPopulatedSpermBanks != null){
        // Upsert auto-populated clinic accounts
            for (SpermBankWrapper wrp : autoPopulatedSpermBanks) {
                system.debug('>>>' + wrp.primaryConfirmed);
                if(wrp.primaryConfirmed != null &&  wrp.primaryConfirmed == true){
                    Account acc = new Account();
                    acc.Name = wrp.bankName;
                    acc.Website = wrp.website;
                    acc.Phone = wrp.phone;
                    acc.d21_Email__c = wrp.email;
                    acc.d21_Coordinator_Name__c = wrp.coordinator;
                    if (wrp.spermclinicId != null) {
                        acc.Id = wrp.spermclinicId;
                    }
                    upsertAccountList.add(acc);
                } 
            }
        }

        if (!upsertAccountList.isEmpty()) {
            update upsertAccountList;
            system.debug(upsertAccountList);

            // Upsert junctions for auto-populated clinics
            Set<Id> accIds = new Set<Id>();
            for (Account acc : upsertAccountList) {
                if (acc.Id != null) accIds.add(acc.Id);
            }

            Map<Id, d21_Donor_Fertility_Clinic__c> existingJunctions = new Map<Id, d21_Donor_Fertility_Clinic__c>();
            if (!accIds.isEmpty()) {
                for (d21_Donor_Fertility_Clinic__c junc : [
                    SELECT Id, d21_Clinic__c, d21_Donor__c
                    FROM d21_Donor_Fertility_Clinic__c
                    WHERE d21_Clinic__c IN :accIds AND d21_Donor__c = :donor.donorId
                ]) {
                    existingJunctions.put(junc.d21_Clinic__c, junc);
                }
            }

            List<d21_Donor_Fertility_Clinic__c> junctionsToUpsert = new List<d21_Donor_Fertility_Clinic__c>();
            for (Account acc : upsertAccountList) {
                d21_Donor_Fertility_Clinic__c junction = new d21_Donor_Fertility_Clinic__c();
                if (existingJunctions.containsKey(acc.Id)) {
                    junction.Id = existingJunctions.get(acc.Id).Id;
                } else {
                    junction.d21_Clinic__c = acc.Id;
                    junction.d21_Donor__c = donor.donorId;
                }
                junction.Name = acc.Name;
                junction.d21_Worked_With_Program__c = true;
                junctionsToUpsert.add(junction);
            }

            if (!junctionsToUpsert.isEmpty()) {
                upsert junctionsToUpsert;
                system.debug(junctionsToUpsert);
            }
        }

        // Upsert user-entered additional clinics
        /*if (!isAddionalClinicsAvailable) {
            for (SpermBankWrapper record : spermBankList) {
                Account acc = new Account();
                acc.Name = record.bankName;
                acc.Website = record.website;
                acc.Phone = record.phone;
                acc.d21_Email__c = record.email;
                acc.d21_Coordinator_Name__c = record.coordinator;
                acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Clinic').getRecordTypeId();
                if (record.accountId != null && String.isNotBlank(record.accountId)) {
                    acc.Id = record.accountId;
                }
                accountList.add(acc);
            }
        }*

        Map<String, d21_Donor_Fertility_Clinic__c> clinicIdVsCinicJunctionRecordMap = new Map<String, d21_Donor_Fertility_Clinic__c>();
        Set<Id> clinicRecordIdset = new Set<Id>();

        if (!accountList.isEmpty()) {
            upsert accountList;

            for (Account acc : accountList) {
                SpermBankWrapper record = new SpermBankWrapper();
                record.bankName = acc.Name;
                record.website = acc.Website;
                record.phone = acc.Phone;
                record.email = acc.d21_Email__c;
                record.coordinator = acc.d21_Coordinator_Name__c;
                record.accountId = acc.Id;
                record.spermbankId = acc.Id;
                spermBankResponse.add(record);
                clinicRecordIdset.add(acc.Id);
            }

            // Fetch existing junctions for user-entered clinics
            List<d21_Donor_Fertility_Clinic__c> donorClinics = [
                SELECT Id, d21_Clinic__c, d21_Donor__c
                FROM d21_Donor_Fertility_Clinic__c
                WHERE d21_Clinic__c IN :clinicRecordIdset
            ];

            for (d21_Donor_Fertility_Clinic__c donorClinic : donorClinics) {
                clinicIdVsCinicJunctionRecordMap.put(donorClinic.d21_Clinic__c, donorClinic);
            }

            // Create/Update junctions for additional banks
            List<d21_Donor_Fertility_Clinic__c> junctions = new List<d21_Donor_Fertility_Clinic__c>();
            for (Integer i = 0; i < accountList.size(); i++) {
                SpermBankWrapper clinic = spermBankList[i];
                spermBankResponse[i].donorCode = clinic.donorCode;
                spermBankResponse[i].showDonorCodeInput = clinic.showDonorCodeInput;
                spermBankResponse[i].hideDonorCodeInput = clinic.hideDonorCodeInput;

                Account acc = accountList[i];
                d21_Donor_Fertility_Clinic__c link = new d21_Donor_Fertility_Clinic__c();
                link.Name = acc.Name;

                if (clinicIdVsCinicJunctionRecordMap.containsKey(acc.Id)) {
                    link.Id = clinicIdVsCinicJunctionRecordMap.get(acc.Id).Id;
                } else {
                    link.d21_Clinic__c = acc.Id;
                    link.d21_Donor__c = donor.donorId;
                }

                link.d21_Worked_With_Program__c = true;
                junctions.add(link);
            }

            upsert junctions;
            system.debug('junctions' + junctions);
        }*/

        //wrapper.spermBankList = spermBankResponse;
        return new Response(true, '');

    } catch (Exception e) {
        return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
    }
}

    /********************************************************/
    @AuraEnabled
    public static SpermBankResponse createSpermBank(string donorDetails){
        DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(donorDetails, DonorRegistrationWrapper.class);
        system.debug(donor);
        list<SpermBankWrapper> spermBanks = donor.spermBanks;
        system.debug(spermBanks);
        system.debug(spermBanks[0].coordinatorUserInputsObj);
        
        //Holds sperm bank record type accounts
        List<Account> spermBankAccounts = new List<Account>();
        
        //Holds donor sperm bank junction object records
       // List<d21_Donor_Sperm_Bank__c> junctions = new List<d21_Donor_Sperm_Bank__c>();
        List<d21_Donor_Agency__c> junctions = new List<d21_Donor_Agency__c>();
        
        //this map holds exact match between js sperm bank object with backend sperm object
        Map<String, Id> clinicNumberToAccountId = new Map<String, Id>(); 
        
        //this map holds exact match between js sperm bank object with backend junction object
        Map<String, Id> clinicNumberToJunctionId = new Map<String, Id>();
        
        try{
            // if Check here if you did not work with any sperm banks "not selected"
            if(spermBanks[0].noSpermBankChecked == false){
                
                list<contact> bankCoordinatorsList = new list<contact>();//this list holds coordinators related to banks
                Map<string, account> coordinatorMap = new Map<string, account>();//this map holds coordinator record Id and bank instance for coordinator update purpose.
                
                for (SpermBankWrapper bank : spermBanks) {
                    //intiating sperm bank
                    Account acc = new Account();
                    if (String.isNotBlank(bank.accountId)) {
                        acc.Id = bank.accountId;
                    }
                    acc.Name = bank.name;
                    acc.Website = bank.website;
                    acc.Phone = bank.phone;
                    acc.d21_Email__c = bank.email;
                    //acc.d21_Coordinator_Name__c = bank.coordinator;
                    acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Sperm Bank').getRecordTypeId();
                    //adding sperm bank details
                    spermBankAccounts.add(acc);
                    
                    if(bank.coordinatorUserInputsObj != null && bank.coordinatorUserInputsObj.coordinatorId != null &&  string.isNotBlank(bank.coordinatorUserInputsObj.coordinatorId)){
                        contact coordinator = new contact();
                        coordinator.Id = bank.coordinatorUserInputsObj.coordinatorId;
                        //coordinator.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Sperm Bank').getRecordTypeId();
                        coordinatorMap.put(coordinator.Id, acc);
                        bankCoordinatorsList.add(coordinator);
                    }
                }
                //create/update sperm bank details
                upsert spermBankAccounts;
                system.debug(spermBankAccounts);
                
                //iterating over coordinators to update or assign accountId 
                for(contact c : bankCoordinatorsList){
                    if(coordinatorMap.containsKey(c.Id)){
                    	c.AccountId = coordinatorMap.get(c.Id).Id;
                    }
                }
                
                //update coordinators
                update bankCoordinatorsList;
                system.debug(bankCoordinatorsList);
                
                //iterating over sperm Bank Accounts
                for (Integer i = 0; i < spermBankAccounts.size(); i++) {
                    //getting each sperm bank wrapper object
                    SpermBankWrapper bank = spermBanks[i];
                    
                    //getting each inserted sperm bank record
                    Account acc = spermBankAccounts[i];
                    
                    //intiating junction object
                    //d21_Donor_Sperm_Bank__c link = new d21_Donor_Sperm_Bank__c();
                    d21_Donor_Agency__c link = new d21_Donor_Agency__c();
                    link.name = acc.name;
                    
                    //checking if junction object already created or not by just validating ID
                    if (String.isNotBlank(bank.junctionId)) {
                        link.Id = bank.junctionId;
                    }
                    //initiating values for these d21_Sperm_Bank__c, d21_Sperm_Donor__c at first time only
                    else{
                        //link.d21_Sperm_Bank__c = acc.Id;
                        link.Agency__c = acc.Id;
                        //link.d21_Sperm_Donor__c = donor.donorId;
                        link.d21_Egg_Donor__c = donor.donorId;
                    }
                    
                    //link.d21_Donor_Code__c = bank.donorCode;
                    link.d21_Worked_With_Program__c = true;
                    if(bank.knowDonorCode == 'Yes'){
                        link.d21_Know_Donor_Code__c = true;
                        link.d21_Donor_Code__c = bank.donorCode;
                    }
                    else{
                        link.d21_Know_Donor_Code__c = false;
                    }
                    junctions.add(link);
                }
                
                upsert junctions;
                system.debug(junctions);
                
                //iterating over sperm Banks wraper
                for (Integer i = 0; i < spermBanks.size(); i++) {
                    SpermBankWrapper bank = spermBanks[i];
                    //mapping sperm bank clinicNumber with inserted sperm bank (Account id) to validate front end and backend 
                    clinicNumberToAccountId.put(string.valueOf(bank.clinicNumber), spermBankAccounts[i].Id);
                    
                    //mapping sperm bank clinicNumber with inserted Donor sperm bank (junction id) to validate front end and backend 
                    clinicNumberToJunctionId.put(string.valueOf(bank.clinicNumber), junctions[i].Id);
                }
                
                return new SpermBankResponse(true, 'Agency Records Created/Updated Successfully.', clinicNumberToAccountId, clinicNumberToJunctionId);
            }
            else{
                set<string> contactRecordIdset = new set<string>();
                 if(!spermBanks.isEmpty()){
                    for (SpermBankWrapper bank : spermBanks) {
                        if(bank.coordinatorUserInputsObj != null && bank.coordinatorUserInputsObj.coordinatorId != null &&  string.isNotBlank(bank.coordinatorUserInputsObj.coordinatorId)){
                            contactRecordIdset.add(bank.coordinatorUserInputsObj.coordinatorId);
                        }
                        
                    } 
                }
                list<contact> coordinatorsList = [SELECT Id FROM Contact WHERE Id =: contactRecordIdset];
                system.debug(coordinatorsList);
                if(!coordinatorsList.isEmpty()){
                    delete coordinatorsList;
                }
                return new SpermBankResponse(true, 'Agency skipped.');
            }
        } 
        catch (Exception e) {
            return new SpermBankResponse(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
        /*******/
    }

    public class Response{
        @AuraEnabled public string message;
        @AuraEnabled public boolean isSuccess;
        public Response(Boolean isSuccess,string message){
            this.isSuccess = isSuccess;
            this.message = message;
        }
    }
    
    public class SpermBankResponse{
        @AuraEnabled public string message;
        @AuraEnabled public boolean isSuccess;
        @AuraEnabled public Map<String, Id> clinicNumberToAccountId;
        @AuraEnabled public Map<String, Id> clinicNumberToJunctionId;
        public SpermBankResponse(boolean isSuccess, string message){
            this.isSuccess = isSuccess;
            this.message = message;
        }
        public SpermBankResponse(boolean isSuccess, string message, Map<String, Id> clinicNumberToAccountId, Map<String, Id> clinicNumberToJunctionId) {
            this.isSuccess = isSuccess;
            this.message = message;
            this.clinicNumberToAccountId = clinicNumberToAccountId;
            this.clinicNumberToJunctionId = clinicNumberToJunctionId;
        }
    }
    
    public class SpermDonorClinicInfoWrapper {
        @AuraEnabled public Integer clinicNumber;
        @AuraEnabled public String name;
        @AuraEnabled public String doctorName;
        @AuraEnabled public String website;
        @AuraEnabled public String phone;
        @AuraEnabled public String email;
        @AuraEnabled public String cityState;
        @AuraEnabled public String coordinator;
        @AuraEnabled public boolean noClinicChecked;
        @AuraEnabled public String accountId; 
        @AuraEnabled public String junctionId; 
    }
    
    /*@AuraEnabled
public static SpermBankResponse createSpermDonorClinic(string clinicDetails, string donorId){
// Deserialize JSON into list of wrapper objects
List<SpermDonorClinicInfoWrapper> spermDonorClinics = (List<SpermDonorClinicInfoWrapper>) JSON.deserialize(clinicDetails, List<SpermDonorClinicInfoWrapper>.class);
system.debug(spermDonorClinics);
//Holds clinic record type accounts
List<Account> clinicAccounts = new List<Account>();

//Holds donor clinic junction object records
List<d21_Donor_Fertility_Clinic__c> junctions = new List<d21_Donor_Fertility_Clinic__c>();

//this map holds exact match between js clinic object with backend sperm donor clinic object
Map<String, Id> clinicNumberToAccountId = new Map<String, Id>(); 

//this map holds exact match between js clinic object with backend donor clinic junction object
Map<String, Id> clinicNumberToJunctionId = new Map<String, Id>();

try{
// if Check here if you did not work with any clinics "not selected"
if(spermDonorClinics[0].noClinicChecked == false){
for (SpermDonorClinicInfoWrapper clinic : spermDonorClinics) {
//intiating clinic
Account acc = new Account();
if (String.isNotBlank(clinic.accountId)) {
acc.Id = clinic.accountId;
}
acc.Name = clinic.name;
acc.Website = clinic.website;
acc.Phone = clinic.phone;
acc.d21_Email__c = clinic.email;
acc.d21_Coordinator_Name__c = clinic.coordinator;
acc.d21_Doctor_Name__c = clinic.doctorName;

acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Clinic').getRecordTypeId();
//adding clinic details
clinicAccounts.add(acc);
}
//create/update clinic details
upsert clinicAccounts;
system.debug(clinicAccounts);

//iterating over clinic Accounts
for (Integer i = 0; i < clinicAccounts.size(); i++) {
//getting each clinic wrapper object
SpermDonorClinicInfoWrapper clinic = spermDonorClinics[i];

//getting each inserted clinic record
Account acc = clinicAccounts[i];

//intiating junction object
d21_Donor_Fertility_Clinic__c link = new d21_Donor_Fertility_Clinic__c();
link.name = acc.name;
//checking if junction object already created or not by just validating ID
if (String.isNotBlank(clinic.junctionId)) {
link.Id = clinic.junctionId;
}
//initiating values for these d21_Sperm_Bank__c, d21_Sperm_Donor__c at first time only
else{
link.d21_Clinic__c = acc.Id;
link.d21_Donor__c = donorId;
}
link.d21_Worked_With_Program__c = true;
//adding junction objects to list
junctions.add(link);
}

upsert junctions;
system.debug(junctions);
//iterating over sperm Donor Clinics wraper
for (Integer i = 0; i < spermDonorClinics.size(); i++) {
SpermDonorClinicInfoWrapper clinic = spermDonorClinics[i];
//mapping sperm donor clinic js obj clinicNumber with inserted clinic (Account id) to validate front end and backend 
clinicNumberToAccountId.put(string.valueOf(clinic.clinicNumber), clinicAccounts[i].Id);

//mapping sperm donor clinic js obj clinicNumber with inserted Donor clinic (junction id) to validate front end and backend 
clinicNumberToJunctionId.put(string.valueOf(clinic.clinicNumber), junctions[i].Id);
}

return new SpermBankResponse(true, 'Agency Records Created/Updated Successfully.', clinicNumberToAccountId, clinicNumberToJunctionId);
}
else{
return new SpermBankResponse(true, 'Agency skipped.');
}
}
catch (Exception e) {
return new SpermBankResponse(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
}
}*/
    
    @AuraEnabled
    public static SpermBankResponse createSpermDonorClinic(string donorDetails){
        system.debug(donorDetails);
        // Deserialize JSON into wrapper objects
        DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(donorDetails, DonorRegistrationWrapper.class);
        system.debug(donor);
        // Deserialize JSON into list of wrapper objects
        list<SpermDonorClinicInfoWrapper> spermDonorClinics = donor.clinics;
        system.debug(spermDonorClinics);
        
        //Holds clinic record type accounts
        List<Account> clinicAccounts = new List<Account>();
        
        //Holds donor clinic junction object records
        List<d21_Donor_Fertility_Clinic__c> junctions = new List<d21_Donor_Fertility_Clinic__c>();
        
        //this map holds exact match between js clinic object with backend sperm donor clinic object
        Map<String, Id> clinicNumberToAccountId = new Map<String, Id>(); 
        
        //this map holds exact match between js clinic object with backend donor clinic junction object
        Map<String, Id> clinicNumberToJunctionId = new Map<String, Id>();
        
        try{
            // if Check here if you did not work with any clinics "not selected"
            if(spermDonorClinics[0].noClinicChecked == false){
                for (SpermDonorClinicInfoWrapper clinic : spermDonorClinics) {
                    //intiating clinic
                    Account acc = new Account();
                    if (String.isNotBlank(clinic.accountId)) {
                        acc.Id = clinic.accountId;
                    }
                    acc.Name = clinic.name;
                    acc.Website = clinic.website;
                    acc.Phone = clinic.phone;
                    acc.d21_Email__c = clinic.email;
                    acc.d21_Coordinator_Name__c = clinic.coordinator;
                    acc.d21_Doctor_Name__c = clinic.doctorName;
                    acc.d21_City_State_Of_Clinic__c = clinic.cityState;
                    
                    acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Clinic').getRecordTypeId();
                    //adding clinic details
                    clinicAccounts.add(acc);
                }
                //create/update clinic details
                upsert clinicAccounts;
                system.debug(clinicAccounts);
                
                //iterating over clinic Accounts
                for (Integer i = 0; i < clinicAccounts.size(); i++) {
                    //getting each clinic wrapper object
                    SpermDonorClinicInfoWrapper clinic = spermDonorClinics[i];
                    
                    //getting each inserted clinic record
                    Account acc = clinicAccounts[i];
                    
                    //intiating junction object
                    d21_Donor_Fertility_Clinic__c link = new d21_Donor_Fertility_Clinic__c();
                    link.name = acc.name;
                    //checking if junction object already created or not by just validating ID
                    if (String.isNotBlank(clinic.junctionId)) {
                        link.Id = clinic.junctionId;
                    }
                    //initiating values for these d21_Sperm_Bank__c, d21_Sperm_Donor__c at first time only
                    else{
                        link.d21_Clinic__c = acc.Id;
                        link.d21_Donor__c = donor.donorId;
                    }
                    link.d21_Worked_With_Program__c = true;
                    //adding junction objects to list
                    junctions.add(link);
                }
                
                upsert junctions;
                system.debug(junctions);
                //iterating over sperm Donor Clinics wraper
                for (Integer i = 0; i < spermDonorClinics.size(); i++) {
                    SpermDonorClinicInfoWrapper clinic = spermDonorClinics[i];
                    //mapping sperm donor clinic js obj clinicNumber with inserted clinic (Account id) to validate front end and backend 
                    clinicNumberToAccountId.put(string.valueOf(clinic.clinicNumber), clinicAccounts[i].Id);
                    
                    //mapping sperm donor clinic js obj clinicNumber with inserted Donor clinic (junction id) to validate front end and backend 
                    clinicNumberToJunctionId.put(string.valueOf(clinic.clinicNumber), junctions[i].Id);
                }
                
                return new SpermBankResponse(true, 'Agency Records Created/Updated Successfully.', clinicNumberToAccountId, clinicNumberToJunctionId);
            }
            else{
                return new SpermBankResponse(true, 'Agency skipped.');
            }
        }
        catch (Exception e) {
            return new SpermBankResponse(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    public class SpermBankRecipientResponse{
        @AuraEnabled public string message;
        @AuraEnabled public boolean isSuccess;
        @AuraEnabled public Map<String, Id> recipientNumberToAccountId;
        @AuraEnabled public Map<String, Id> recipientNumberToJunctionId;
        @AuraEnabled public Map<String, Id> recipientNumberToContactId;
        public SpermBankRecipientResponse(boolean isSuccess, string message){
            this.isSuccess = isSuccess;
            this.message = message;
        }
        public SpermBankRecipientResponse(boolean isSuccess, string message, Map<String, Id> recipientNumberToAccountId, Map<String, Id> recipientNumberToJunctionId , Map<String, Id> recipientNumberToContactId ) {
            this.isSuccess = isSuccess;
            this.message = message;
            this.recipientNumberToAccountId = recipientNumberToAccountId;
            this.recipientNumberToJunctionId = recipientNumberToJunctionId;
            this.recipientNumberToContactId = recipientNumberToContactId;
        }
    }  
    
    
    public class spermDonorRecipientsWrapper {
        @AuraEnabled  public Integer clinicNumber ;
        // @AuraEnabled public String recipient1FirstName ;
        //@AuraEnabled  public String recipient1LastName;
        @AuraEnabled  public String recipient2FirstName ;
        @AuraEnabled  public String recipient2LastName ;
        @AuraEnabled  public String phone;
        @AuraEnabled  public String email;
        @AuraEnabled  public String additionalInfo;
        @AuraEnabled public boolean noRecipientChecked;
        @AuraEnabled public String accountId; 
        @AuraEnabled public String contactId; 
        @AuraEnabled public String junctionId; 
        
    }
    
    /* @AuraEnabled
public static SpermBankRecipientResponse createSpermDonorRecipients(String RecipientDetails, String donorId) {
// Deserialize JSON into list of wrapper objects
List<spermDonorRecipientsWrapper> spermDonorRecipients = (List<spermDonorRecipientsWrapper>) JSON.deserialize(RecipientDetails, List<spermDonorRecipientsWrapper>.class);
System.debug(spermDonorRecipients);

List<Account> recipientAccounts = new List<Account>();
List<Contact> recipientContacts = new List<Contact>();
List<d21_Donor_Recipient__c> junctions = new List<d21_Donor_Recipient__c>();

Map<String, Id> recipientNumberToContactId = new Map<String, Id>();
Map<String, Id> recipientNumberToAccountId = new Map<String, Id>();
Map<String, Id> recipientNumberToJunctionId = new Map<String, Id>();

try {
if (spermDonorRecipients[0].noRecipientChecked == false) {

for (spermDonorRecipientsWrapper recipients : spermDonorRecipients) {
Account acc = new Account();

if (String.isNotBlank(recipients.accountId)) {
acc.Id = recipients.accountId;
}

acc.Name = recipients.recipient2FirstName;

acc.RecordTypeId = Schema.SObjectType.Account
.getRecordTypeInfosByName()
.get('Sperm Bank')
.getRecordTypeId();

recipientAccounts.add(acc);
}

upsert recipientAccounts;
System.debug('Recipient Accounts: ' + recipientAccounts);

for (Integer i = 0; i < spermDonorRecipients.size(); i++) {
spermDonorRecipientsWrapper recipients = spermDonorRecipients[i];

Account linkedAccount = recipientAccounts[i];

Contact con = new Contact();
if (String.isNotBlank(recipients.accountId)) {
con.Id = recipients.contactId;
}
con.FirstName = recipients.recipient2FirstName;
con.LastName = String.isNotBlank(recipients.recipient2LastName)
? recipients.recipient2LastName
: 'Recipient';
con.Email = recipients.email;
con.Phone = recipients.phone;
con.d21_Additional_Information__c = recipients.additionalInfo;
con.AccountId = linkedAccount.Id; 

recipientContacts.add(con);
}


upsert recipientContacts;
System.debug('Inserted Contacts: ' + recipientContacts);

for (Integer i = 0; i < recipientAccounts.size(); i++) {
spermDonorRecipientsWrapper recipients = spermDonorRecipients[i];
Account acc = recipientAccounts[i];

d21_Donor_Recipient__c link = new d21_Donor_Recipient__c();

if (String.isNotBlank(recipients.junctionId)) {
link.Id = recipients.junctionId;
} else {
link.d21_Recipient__c = acc.Id;
link.d21_Contact__c = donorId;
}

junctions.add(link);
}

upsert junctions;
System.debug('Inserted/Updated Junctions: ' + junctions);

for (Integer i = 0; i < spermDonorRecipients.size(); i++) {
spermDonorRecipientsWrapper recipients = spermDonorRecipients[i];

recipientNumberToAccountId.put(String.valueOf(recipients.clinicNumber), recipientAccounts[i].Id);
recipientNumberToContactId.put(String.valueOf(recipients.clinicNumber), recipientContacts[i].Id);
recipientNumberToJunctionId.put(String.valueOf(recipients.clinicNumber), junctions[i].Id);
}

return new SpermBankRecipientResponse(true, 'Agency Records Created/Updated Successfully.', recipientNumberToAccountId, recipientNumberToJunctionId,recipientNumberToContactId);
} else {
return new SpermBankRecipientResponse(true, 'Agency skipped.');
}
} catch (Exception e) {
return new SpermBankRecipientResponse(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
}
}*/
    
    public class SpermDonorRecipientsInfoWrapper {
        @AuraEnabled public String recipient2FirstName;
        @AuraEnabled public String recipient2LastName;
        @AuraEnabled public String phone;
        @AuraEnabled public String email;
        @AuraEnabled public String additionalInfo;
        @AuraEnabled public boolean noSpermBankChecked;
         @AuraEnabled public boolean noRecipientChecked;
        @AuraEnabled public String accountId; 
        @AuraEnabled public String contactId;
        @AuraEnabled public String junctionId;
        @AuraEnabled public String RecipientNumber;
        @AuraEnabled public String donorId;
    }
    
 @AuraEnabled
public static SpermBankRecipientResponse createSpermDonorRecipients(String RecipientDetails) {
    try {
        DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(RecipientDetails, DonorRegistrationWrapper.class);
        System.debug('spermDonorRecipients >>> ' + donor.Recipients);
		system.debug('donor >>> '+donor.donorId);
        Map<String, Contact> recipientContactMap = new Map<String, Contact>();
        Map<String, Account> recipientAccountMap = new Map<String, Account>();
        Map<String, d21_Donor_Recipient__c> recipientJunctionMap = new Map<String, d21_Donor_Recipient__c>();

        List<SpermDonorRecipientsInfoWrapper> spermDonorRecipients = donor.recipients;

        List<Account> accountList = new List<Account>();
        List<Contact> contactList = new List<Contact>();
        List<d21_Donor_Recipient__c> junctionList = new List<d21_Donor_Recipient__c>();

        Map<String, Id> accountMap = new Map<String, Id>();
        Map<String, Id> contactMap = new Map<String, Id>();
        Map<string,Id> newJunctionMap = new Map<string,Id>();
        Map<String, d21_Donor_Recipient__c> junctionMap = new Map<String, d21_Donor_Recipient__c>();
		system.debug('1139 ' + spermDonorRecipients[0].noRecipientChecked);
		
        if(spermDonorRecipients[0].noRecipientChecked == false){
        // 1. Prepare records
            for (SpermDonorRecipientsInfoWrapper rec : spermDonorRecipients) {
                // Account
                Account acc = new Account();
                system.debug('rec.accountId >>>> '+rec.accountId);
                if (String.isNotBlank(rec.accountId)) {
                    acc.Id = rec.accountId;
                }
                if(rec.recipient2FirstName != null){
                    acc.name = rec.recipient2FirstName+' '+rec.recipient2LastName;
                }
                else{
                    acc.Name = rec.recipient2LastName;
                }
                acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Parent Household').getRecordTypeId();
                recipientAccountMap.put(rec.RecipientNumber, acc);
    
                // Contact
                Contact con = new Contact();
                if (String.isNotBlank(rec.contactId)) {
                    con.Id = rec.contactId;
                }
                con.FirstName = rec.recipient2LastName;
                con.LastName = String.isNotBlank(rec.recipient2LastName) ? rec.recipient2LastName : 'Recipient';
                con.Email = rec.email;
                con.Phone = rec.phone;
                con.d21_Additional_Information__c = rec.additionalInfo;
                con.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Intended Parent').getRecordTypeId();
                recipientContactMap.put(rec.RecipientNumber, con);
    
                // Junction
                d21_Donor_Recipient__c junction = new d21_Donor_Recipient__c();
                if (String.isNotBlank(rec.junctionId)) {
                    junction.Id = rec.junctionId;
                      
                  junction.d21_Contact__c = donor.donorId;
                }
                 junction.Name = rec.recipient2LastName;
             
                recipientJunctionMap.put(rec.RecipientNumber, junction);
            }
    
            // 2. Upsert Accounts & Contacts
            if (!recipientAccountMap.isEmpty()) {
                upsert recipientAccountMap.values();
            }
            if (!recipientContactMap.isEmpty()) {
                upsert recipientContactMap.values();
            }
    
            // 3. Set AccountId in Contact & AccountId in Junction
            for (String recipientNumber : recipientAccountMap.keySet()) {
                Account acc = recipientAccountMap.get(recipientNumber);
                Contact con = recipientContactMap.get(recipientNumber);
                d21_Donor_Recipient__c junction = recipientJunctionMap.get(recipientNumber);
    
                con.AccountId = acc.Id;
                junction.d21_Recipient__c = acc.Id;
                junction.d21_Contact__c = donor.donorId;//'003QL00000wfhEQYAY'; //con.Id;
    
                contactList.add(con);
                junctionList.add(junction);
    
                accountMap.put(recipientNumber, acc.Id);
                contactMap.put(recipientNumber, con.Id);
                junctionMap.put(recipientNumber, junction);
            }
    
            // 4. Update Contact with AccountId
            if (!contactList.isEmpty()) {
                update contactList;
            }
    
            // 5. Upsert Junctions
            if (!junctionList.isEmpty()) {
                upsert junctionList;
            }
            
            for(string a : junctionMap.keySet()){
                newJunctionMap.put(a,junctionMap.get(a).Id);
            }
            system.debug('accountMap >>> '+accountMap);
            system.debug('junctionMap >>> '+junctionMap);
             system.debug('contactMap >>> '+contactMap);
            return new SpermBankRecipientResponse(true, 'Recipient records created/updated successfully.', accountMap, newJunctionMap, contactMap);
        }
        else{
            return new SpermBankRecipientResponse(true, 'Recipient skipped.');
        }
    } catch (Exception e) {
        return new SpermBankRecipientResponse(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - Line: ' + e.getLineNumber());
    }
}

    

    
    
    
    /*@AuraEnabled
    public static SpermBankResponse createSpermDonorDonationOutcome(String donationOutcomeDetails, String donorId){
        SpermDonorOutcomeWrapper spermDonorOutcome = (SpermDonorOutcomeWrapper) JSON.deserialize(donationOutcomeDetails, SpermDonorOutcomeWrapper.class);
        List<Contact> donorList = [SELECT Id, d21_Notified_Of_Live_Births__c, d21_Live_Births_Reported__c
                                   FROM Contact WHERE Id =: donorId LIMIT 1];
        donorList[0].d21_Live_Births_Reported__c = spermDonorOutcome.liveBirthsCount;
        if(spermDonorOutcome.selectedOption == 'Yes'){
            donorList[0].d21_Notified_Of_Live_Births__c = true;
        }
        else{
            donorList[0].d21_Notified_Of_Live_Births__c = false;
        }
        if(!donorList.isEmpty()){
            update donorList;            
        }
        system.debug(donorList);
        return new SpermBankResponse(true, 'Outcome updated.');
    }*/
    
    @AuraEnabled
    public static SpermBankResponse createSpermDonorDonationOutcome(String donationOutcomeDetails){
        
        DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(donationOutcomeDetails, DonorRegistrationWrapper.class);
    	system.debug('spermDonor>>> '+donor);
    	//get donation outcomedetails
        SpermDonorOutcomeWrapper spermDonorOutcome = donor.donationOutcome;
        system.debug(spermDonorOutcome);
        List<Contact> donorList = [SELECT Id, d21_Notified_Of_Live_Births__c, d21_Live_Births_Reported__c
                                   FROM Contact WHERE Id =: donor.donorId LIMIT 1];
        donorList[0].d21_Live_Births_Reported__c = spermDonorOutcome.liveBirthsCount;
        if(spermDonorOutcome.selectedOption == 'Yes'){
            donorList[0].d21_Notified_Of_Live_Births__c = true;
        }
        else{
            donorList[0].d21_Notified_Of_Live_Births__c = false;
        }
        if(!donorList.isEmpty()){
            update donorList;            
        }
        system.debug(donorList);
        return new SpermBankResponse(true, 'Outcome updated.');
    }

    
    public class SpermDonorOutcomeWrapper{
        @AuraEnabled public integer liveBirthsCount;
        @AuraEnabled public string selectedOption;
    }
    
    
    /***************************new wrapper ***********************************************/
    public class Egg {
        @AuraEnabled public Integer liveBirths;
        @AuraEnabled public Boolean currentOrFutureDonation;
        @AuraEnabled public Boolean workWithAnyAgencyOrEggBank;
        @AuraEnabled public Boolean workWithAttorney;
        @AuraEnabled public Boolean haveIntendedParentDetails;
    }
    
    public class Sperm {
        
    }
    
    public class DonationBasics {
        @AuraEnabled public Egg egg;
        @AuraEnabled public Sperm sperm;
    }
    
    public class Codes {
        @AuraEnabled public List<String> PMC;
        @AuraEnabled public List<String> EDN;
        @AuraEnabled public List<String> SDN;
        @AuraEnabled public List<String> EMB;
        @AuraEnabled public List<String> REC;
        @AuraEnabled public Boolean isSkipped;
    }
    
    public class DonorRegistrationWrapper {
        @AuraEnabled public String firstName;
        @AuraEnabled public String lastName;
        @AuraEnabled public String email;
        @AuraEnabled public String phone;
        @AuraEnabled public String preferredUserName;
        @AuraEnabled public String preferredPassword;
        @AuraEnabled public String verificationType;
        @AuraEnabled public Boolean terms;
        @AuraEnabled public string AccountId;
        @AuraEnabled public String donorType;
        @AuraEnabled public String donorId;
        @AuraEnabled public Codes codes;
        @AuraEnabled public Boolean isSkipped;
        @AuraEnabled public DonationBasics donationBasics;
        @AuraEnabled public list<SpermBankWrapper> spermBanks;
        @AuraEnabled public list<SpermBankWrapper> autoPopulatedSpermBanks;
        @AuraEnabled public list<SpermDonorClinicInfoWrapper> clinics;
        @AuraEnabled public list<SpermDonorRecipientsInfoWrapper> recipients;
        @AuraEnabled public SpermDonorOutcomeWrapper donationOutcome;
        @AuraEnabled public ClinicDetails clinicInfoWithSDN;
        @AuraEnabled public BankDetails spermBanksWithSDN;
        @AuraEnabled public boolean spermWithSDNBankprimaryConfirmed;
        

    }

    public class BankDetails{
        @AuraEnabled public List<SpermBankWrapper> primaryBanksListFromApex;
        @AuraEnabled public List<SpermBankWrapper> additionalBanks;
        @AuraEnabled public boolean noOtherBanks; 
        @AuraEnabled public boolean primaryConfirmed;
        @AuraEnabled public boolean primaryIncorrect;
        @AuraEnabled public boolean isAutoSpermBanksAllowedToDml;
    }

    public class ClinicDetails{
        @AuraEnabled public List<SpermBankWrapper> primaryClinicsListFromApex;
        @AuraEnabled public SpermBankWrapper primaryBank;
        @AuraEnabled public List<SpermBankWrapper> additionalBanks;
        @AuraEnabled public boolean noOtherBanks;
        @AuraEnabled public boolean primaryConfirmed;
        @AuraEnabled public boolean primaryIncorrect;
         @AuraEnabled public boolean isAutoSpermClinicsAllowedToDml;
       
    }

    public class SpermBankWrapperResponse{
        @AuraEnabled public SpermBankWrapper spermBank;
        @AuraEnabled public List<SpermBankWrapper> spermBankList;
        @AuraEnabled public PrimaryCheckBoxClass primaryCheckBoxOptions;
       
        
    }
    
    public class PrimaryCheckBoxClass{
        @AuraEnabled public boolean primaryConfirmed;
         @AuraEnabled public boolean primaryIncorrect;
    }
    
    /***************************new wrapper ***********************************************/
    
    
    public static void verifyReEnterCodes(string contactObj){
        try {
            DonorRegistrationWrapper wrapper = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
        } catch (Exception e) {
            
        }
    }


    @AuraEnabled
public static Response updateEggCycleDontionOutcomes(String cyclesData) {
    try {
        List<Cycle> cyclist = (List<Cycle>) JSON.deserialize(cyclesData, List<Cycle>.class);
        List<d21_Cycle__c> updateList = new List<d21_Cycle__c>();

        for (Cycle c : cyclist) {
            d21_Cycle__c egg = new d21_Cycle__c();
            egg.Id = c.Id;
            egg.d21_No_Of_Eggs_Retrieved__c = c.eggs;
            egg.d21_No_Of_Embryos_Created__c = c.embryos;
            egg.d21_Embryos_After_PGD__c = c.pgd;
            egg.d21_Pregnancy__c = c.pregnancy == 'Yes';
            egg.d21_Live_Birth__c = c.liveBirth == 'No';
            egg.d21_Children_s_Gender_Info__c = c.genderInfo;

            updateList.add(egg);
        }

        if (!updateList.isEmpty()) {
            update updateList;
        }
        return new Response(true,'Updated Donation Cycle Outcome');
    } catch (Exception e) {
        return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage());
    }
}

    

    public class Cycle{
        @AuraEnabled public string Name;
        @AuraEnabled public string Id;
        @AuraEnabled public Integer eggs;
        @AuraEnabled public Integer embryos;
        @AuraEnabled public Integer pgd;
        @AuraEnabled public string pregnancy;
        @AuraEnabled public string liveBirth;
        @AuraEnabled public string genderInfo;
    }
    
    /*************************************************************************/
    @AuraEnabled
    public static void fetchSpermDonorDetails(list<string> donorId){
        list<d21_Associated_Codes__c> associateCodeList = [SELECT Id,Name,
                                                           d21_PMC_Code__r.d21_Sperm_Bank__r.Name, 
                                                           d21_PMC_Code__r.d21_Sperm_Bank__r.Website,
                                                           d21_PMC_Code__r.d21_Sperm_Bank__r.Phone,
                                                           d21_PMC_Code__r.d21_Sperm_Bank__r.d21_Email__c,
                                                           d21_PMC_Code__r.d21_Sperm_Bank__r.d21_Coordinator_Name__c
                                                           FROM d21_Associated_Codes__c
                                                           ];
    }
    /*************************************************************************/
      @AuraEnabled
    public static string deleteSpermBank(string spermbankId){
        system.debug('spermbankId' + spermbankId);
        Account spermBank = [SELECT Id FROM Account WHERE ID =: spermbankId];
        system.debug(spermBank);
        delete spermBank;
        system.debug('spermBank');
        return 'success';
    }
    
      @AuraEnabled
    public static string deleteSpermJunction(string spermbankId){
        system.debug('spermbankId' + spermbankId);
        d21_Donor_Recipient__c spermJunction = [SELECT Id FROM d21_Donor_Recipient__c WHERE ID =: spermbankId];
        system.debug(spermJunction);
        delete spermJunction;
        system.debug('spermJunction');
        return 'success';
    }
    
    
    @AuraEnabled
    public static void deleteDonorSperm(String accountId) {
        try {
            // Query the d21_Donor_sperm__c record where Account__c matches the provided accountId
            List<d21_Donor_Agency__c> donorAgencyRecords = [
                SELECT Id 
                FROM d21_Donor_Agency__c 
                WHERE Agency__c  = :accountId 
                LIMIT 1
            ];
            
            List<account> donorSpermRecords = [
                SELECT Id 
                FROM account 
                WHERE id = :accountId 
                LIMIT 1
            ];
            
            if (!donorSpermRecords.isEmpty() && (!donorAgencyRecords.isEmpty())) {
                // Delete the matching record
                delete donorSpermRecords[0];
                delete donorAgencyRecords[0];
            } else {
                throw new AuraHandledException('No donor sperm record found for the provided Account ID.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting donor sperm record: ' + e.getMessage());
        }
    }
    
}
  /*  public static void saveDonorSperm(String accountId, String donorSperm) {
        try {
            // Deserialize the donorSperm JSON into a Map to extract fields
            Map<String, Object> spermData = (Map<String, Object>) JSON.deserializeUntyped(donorSperm);
            
            // Create or update the d21_Donor_sperm__c record
            d21_Donor_sperm__c donorSpermRecord;
            if (accountId != null) {
                // Query existing record by accountId
                List<d21_Donor_sperm__c> existingRecords = [
                    SELECT Id, Account__c 
                    FROM d21_Donor_sperm__c 
                    WHERE Account__c = :accountId 
                    LIMIT 1
                ];
                
                if (!existingRecords.isEmpty()) {
                    donorSpermRecord = existingRecords[0];
                } else {
                    donorSpermRecord = new d21_Donor_sperm__c();
                }
            } else {
                donorSpermRecord = new d21_Donor_sperm__c();
            }
            
            // Update only the Account__c field
            if (accountId != null) {
                donorSpermRecord.Account__c = accountId;
            }
            
            // Upsert the record (insert if new, update if existing)
            upsert donorSpermRecord;
        } catch (Exception e) {
            throw new AuraHandledException('Error saving donor sperm record: ' + e.getMessage());
        }
    }*/