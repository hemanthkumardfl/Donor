public without sharing class EggDonorAttorneyWithCodeController {

    public class Response{
        @AuraEnabled public string message;
        @AuraEnabled public boolean isSuccess;
        public Response(Boolean isSuccess, string message){
            this.message = message;
            this.isSuccess = isSuccess;
        }
    } 
    
    
    @AuraEnabled 
    public static Response fetchCodeData(string contactObj){
        try{
        DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);  
            list<string> attorneyIds = new list<string>();
            list<string> pmccodes = new list<string>();
            List<string> associateCodes = new List<string>();
            list<Attorney> attornies = new list<Attorney>();
            list<d21_PMC__c> PMCRecords = new list<d21_PMC__c>();
            pmccodes.addAll(donor.codes.PMC);
            associateCodes.addAll(donor.codes.EDN);
            associateCodes.addAll(donor.codes.SDN);
            associateCodes.addAll(donor.codes.EMB);
            associateCodes.addAll(donor.codes.REC);
            if(!pmccodes.isEmpty()){
             PMCRecords = [SELECT Id,Name,d21_Attorney__c FROM d21_PMC__c WHERE Name IN :pmccodes  AND d21_Attorney__c != NULL]; 
            }
            else if(!associateCodes.isEmpty()){
                system.debug('associateCodes >>> '+associateCodes);
                list<d21_Associated_Codes__c> associateList = [select Id,d21_PMC_Code__c from d21_Associated_Codes__c Where Name In :associateCodes];
                for(d21_Associated_Codes__c aCode: associateList){
                    pmccodes.add(aCode.d21_PMC_Code__c);
                }
                system.debug('pmccodes >>> '+pmccodes);
                PMCRecords = [SELECT Id,Name,d21_Attorney__c FROM d21_PMC__c WHERE Id IN :pmccodes  AND d21_Attorney__c != NULL]; 
            }
            
            if(!PMCRecords.isEmpty()){
                for(d21_PMC__c pmc : PMCRecords){
                    attorneyIds.add(pmc.d21_Attorney__c);
                }
                if(!attorneyIds.isEmpty()){
                    for(Contact acc : [Select Name, Id,Phone,Email,Account.Website,Account.Name,Account.d21_City_State_Of_Clinic__c from Contact where Id IN :attorneyIds]){
                        Attorney att = new Attorney();
                        att.Name = acc.Name;
                        att.attorneyId = acc.Id;
                        att.Phone = acc.Phone;
                        att.Website = acc.Account.Website;
                        att.Email = acc.Email;
                        att.LawFirm = acc.Account.Name;
                        att.State = acc.Account.d21_City_State_Of_Clinic__c;
                        attornies.add(att);
                    }
                }
            }
        
            return new Response(true, JSON.serialize(attornies));
        }catch(Exception e){
            return new Response(false, e.getMessage()+' >>> '+e.getLineNumber()+'  >>>  '+e.getStackTraceString());
        }
}


    @AuraEnabled
    public  static Response updateEggAttorniesWithCodes(string existingAttornies,string addedAttornies,string cycles){
        try {
            list<RecordWrapper> existingAttorneyList = (list<RecordWrapper>)JSON.deserialize(existingAttornies, list<RecordWrapper>.class);  
            list<RecordWrapper> addedAttorneyList = (list<RecordWrapper>)JSON.deserialize(addedAttornies, list<RecordWrapper>.class);  
            list<Cycle> cyclesList = (list<Cycle>)JSON.deserialize(cycles, list<Cycle>.class);  

            list<Contact> upsertExistingAttorneyList = new list<Contact>();
            list<Contact> upsertAddedAttorneyList = new list<Contact>();
            list<d21_Cycle__c> updateCycleList = new list<d21_Cycle__c>();
            Map<string,Contact> cycleAccountMap = new Map<string,Contact>();
            list<d21_Donor_Fertility_Attorney__c> donorAttorneyList = new list<d21_Donor_Fertility_Attorney__c>();
            Set<string> conIds = new Set<string>();
            Set<string> addedConIds = new Set<string>();
            list<Account> updateAttorneyAccounts = new list<Account>();
            Map<string,Account> powerMap = new Map<string,Account>();

            for(RecordWrapper record : existingAttorneyList){
                conIds.add(record.attorneyId);
            }

            Map<string,Contact> contactMap = new Map<string,Contact>([Select Name, Id,Phone,AccountId,Email,Account.Website,Account.Name,Account.d21_City_State_Of_Clinic__c from Contact where Id IN :conIds]);


            for(RecordWrapper record : existingAttorneyList){
                if(!record.noAttorneyChecked && !record.selectedCycles.isEmpty()){
                    if(record.attorneyId != null && record.attorneyId != '' && contactMap.get(record.attorneyId).AccountId != null){
                        Account acct = new Account();
                        acct.Id = contactMap.get(record.attorneyId).AccountId;
                        acct.Name = record.LawFirm;
                        acct.d21_City_State_Of_Clinic__c = record.State;
                        acct.Website = record.Website;
                        updateAttorneyAccounts.add(acct);
                    }
                Contact acc = new Contact();
                acc.Id = record.attorneyId;
                acc.Phone = record.Phone;
                acc.Email = record.Email;
                acc.LastName = record.Name;
                acc.recordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Attorney').getRecordTypeId();
                upsertExistingAttorneyList.add(acc);
                for(string cycle : record.selectedCycles){
                    cycleAccountMap.put('Cycle '+cycle,acc);
                }
            }
            }

            if(!updateAttorneyAccounts.isEmpty()){
                update updateAttorneyAccounts;
            }

            if(!upsertExistingAttorneyList.isEmpty()){
                upsert upsertExistingAttorneyList;
            }

            for(RecordWrapper record : addedAttorneyList){
                addedConIds.add(record.attorneyId);
            }

            Map<string,Contact> addedContactMap = new Map<string,Contact>([Select Name, Id,Phone,AccountId,Email,Account.Website,Account.Name,Account.d21_City_State_Of_Clinic__c from Contact where Id IN :addedConIds]);

            for(RecordWrapper record : addedAttorneyList){
                if(!record.selectedCycles.isEmpty()){
                    if(record.LawFirm != null && record.LawFirm != ''){
                    Account acct = new Account();
                    acct.Name = record.LawFirm;
                    acct.Website = record.Website;
                    acct.d21_City_State_Of_Clinic__c = record.State;
                    if(record.attorneyId != null && record.attorneyId != '' && addedContactMap.get(record.attorneyId).AccountId != null){
                        acct.Id = addedContactMap.get(record.attorneyId).AccountId;
                    }
                powerMap.put(record.Name+' '+record.LawFirm,acct);
                    }
                Contact acc = new Contact();
                acc.Id = record.attorneyId;
                acc.Phone = record.Phone;
                acc.Email = record.Email;
                acc.LastName = record.Name;
                acc.FirstName = record.LawFirm;
                acc.recordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Attorney').getRecordTypeId();
                upsertAddedAttorneyList.add(acc);
                for(string cycle : record.selectedCycles){
                    cycleAccountMap.put('Cycle '+cycle,acc);
                }
            }
            }

            system.debug('powerMap.values() >>> '+powerMap.values());

            if(!powerMap.values().isEmpty()){
                upsert powerMap.values();
            }

            if(!upsertAddedAttorneyList.isEmpty()){
                for(Contact con : upsertAddedAttorneyList){
                    if(con.FirstName != null && con.FirstName != '' && powerMap.containsKey(con.FirstName+' '+con.LastName)){
                    con.AccountId = powerMap.get(con.FirstName+' '+con.LastName).Id;
                    }
                }
                upsert upsertAddedAttorneyList;
                for (Integer i = 0; i < addedAttorneyList.size(); i++) {
                    if(!addedAttorneyList[i].selectedCycles.isEmpty()){
                    addedAttorneyList[i].attorneyId = upsertAddedAttorneyList[i].Id;
                    }
                }
            }
            system.debug('cycleAccountMap >>> '+cycleAccountMap);
            for(Cycle record : cyclesList){
                d21_Cycle__c cycle = new d21_Cycle__c();
                cycle.Id = record.Id;
                if(cycleAccountMap.containsKey(record.Name)){
                cycle.d21_Attorney__c = cycleAccountMap.get(record.Name).Id;
                }
                updateCycleList.add(cycle);
            }

            if(!updateCycleList.isEmpty()){
                update updateCycleList;
                Map<string,d21_Cycle__c> cycleMap = new Map<string,d21_Cycle__c>(updateCycleList);
                list<d21_Cycle__c> fetchCycles = [Select Id,d21_Attorney__r.LastName,d21_Attorney__c,d21_Donor__c from d21_Cycle__c Where Id In :cycleMap.keySet()];
                list<d21_Donor_Fertility_Attorney__c> deleteDonorAttorneyList = [SELECT Id,Name from 	d21_Donor_Fertility_Attorney__c WHERE d21_Donor__c = :fetchCycles[0].d21_Donor__c];
                if(!deleteDonorAttorneyList.isEmpty()){
                    delete deleteDonorAttorneyList;
                }
                Map<string,string> accIdNameMap = new Map<string,string>();
                for(d21_Cycle__c cycle : fetchCycles){
                    if(cycle.d21_Attorney__c != null){
                    accIdNameMap.put(cycle.d21_Attorney__c, cycle.d21_Attorney__r.LastName);
                    }
                }
                for(string accId : accIdNameMap.keySet()){
                    d21_Donor_Fertility_Attorney__c donorAttorney = new d21_Donor_Fertility_Attorney__c();
                    donorAttorney.Name = accIdNameMap.get(accId);
                    donorAttorney.d21_Attorney__c = accId;
                    donorAttorney.d21_Donor__c = fetchCycles[0].d21_Donor__c;
                    donorAttorneyList.add(donorAttorney);
                } 
                if(!donorAttorneyList.isEmpty()){
                    insert donorAttorneyList;
                }
            }

            return new Response(true,JSON.serialize(addedAttorneyList));

        } catch (Exception e) {
            return new Response(false, e.getMessage()+' >>> '+e.getLineNumber()+'  >>>  '+e.getStackTraceString());
        }
    }

    @AuraEnabled
    public static Response deleteCycleAttorney(string attorneyId){
        try {
            delete [select Id from Contact Where Id =: attorneyId];
            return new Response(true,'Deleted Successfully');
        } catch (Exception e) {
            return new Response(false, e.getMessage()+' >>> '+e.getLineNumber()+'  >>>  '+e.getStackTraceString());
        }
    }
    
    public class ClinicResponse{
        @AuraEnabled public  list<RecordWrapper> responseOneList;
        @AuraEnabled public  list<RecordWrapper> responseTwoList;
    }    
    
    public class BankDetails{
        @AuraEnabled public string bankName;
        @AuraEnabled public string website;
        @AuraEnabled public string phone;
        @AuraEnabled public string email;
        @AuraEnabled public string coordinatorName;
    }
    
    public class SpermClinicDetails{
        @AuraEnabled public string bankName;
        @AuraEnabled public string website;
        @AuraEnabled public string phone;
        @AuraEnabled public string email;
        @AuraEnabled public string coordinatorName;
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
        @AuraEnabled public list<string> newCodeList;
        @AuraEnabled public list<RecordWrapper> agenciesWithoutCode;
        @AuraEnabled public list<RecordWrapper> clinicsWithoutCode;
        @AuraEnabled public list<RecordWrapper> AttorniesWithoutCode;
        @AuraEnabled public list<RecordWrapper> recipientsWithoutCode;
        @AuraEnabled public list<Cycle> allCycles;
        @AuraEnabled public AlternateObject alternateDetails;
        @AuraEnabled public ClinicDetails clinicsWithCodes;    
        @AuraEnabled public list<Agency> agencies;
    }
    
    public class Agency{
        @AuraEnabled public String Name;
        @AuraEnabled public String Email;
        @AuraEnabled public String Phone;
        @AuraEnabled public String Website;
        @AuraEnabled public String CoordinatorName;
        @AuraEnabled public String AgencyId;
    }

    public class Clinic{
        @AuraEnabled public String Name;
        @AuraEnabled public String Email;
        @AuraEnabled public String Phone;
        @AuraEnabled public String Website;
        @AuraEnabled public String CoordinatorName;
        @AuraEnabled public String clinicId;
    }

    public class Attorney{
        @AuraEnabled public String Name;
        @AuraEnabled public String Email;
        @AuraEnabled public String Phone;
        @AuraEnabled public String Website;
        @AuraEnabled public string attorneyId;
        @AuraEnabled public string LawFirm;
        @AuraEnabled public string State;
    }
    
    public class AgencyDetails{
        @AuraEnabled public list<RecordWrapper> donationOutcomesListFromApex;
        @AuraEnabled public list<RecordWrapper> additionalAgencies;
    }
    
    public class ClinicDetails{
        @AuraEnabled public list<RecordWrapper> donationOutcomesListFromApex;
        @AuraEnabled public list<RecordWrapper> additionalClinics;
    }
    
    public class AlternateObject {
        @AuraEnabled public String email;
        @AuraEnabled public String phone;
        @AuraEnabled public Boolean isOptOut;
    }
    
    public class Codes {
        @AuraEnabled public List<String> PMC;
        @AuraEnabled public List<String> EDN;
        @AuraEnabled public List<String> SDN;
        @AuraEnabled public List<String> EMB;
        @AuraEnabled public List<String> REC;
        @AuraEnabled public Boolean isSkipped;
    }
    
    public class DonationBasics {
        @AuraEnabled public Egg egg;
        @AuraEnabled public Sperm sperm;
    }
    
    public class Egg {
        @AuraEnabled public Integer liveBirths;
        @AuraEnabled public Boolean currentOrFutureDonation;
        @AuraEnabled public Boolean workWithAnyAgencyOrEggBank;
        @AuraEnabled public Boolean workWithAttorney;
        @AuraEnabled public Boolean haveIntendedParentDetails;
    }
    
    public class Sperm {
        @AuraEnabled public Boolean workWithAnySpermBank;
        @AuraEnabled public Boolean workWithAnyClinic;
        @AuraEnabled public Boolean haveIntendedParentDetailsForSperm;
    } 
    
    public class RecordWrapper {
        @AuraEnabled public String Name;
        @AuraEnabled public String AttorneyName;
        @AuraEnabled public String Website;
        @AuraEnabled public String Phone;
        @AuraEnabled public String Email;
        @AuraEnabled public String CoordinatorName;
        @AuraEnabled public string ClinicName;
        @AuraEnabled public string DoctorName;
        @AuraEnabled public string CityStateOfClinic;
        @AuraEnabled public list<String> selectedCycles;
        @AuraEnabled public string LawFirm;
        @AuraEnabled public string State;
        @AuraEnabled public string recipient1FirstName;
        @AuraEnabled public string recipient1LastName;
        @AuraEnabled public string additionalInfo;
        @AuraEnabled public list<String> totalSelectedCycles;
        @AuraEnabled public list<Cycles> cycles;
        @AuraEnabled public String agencyId;
        @AuraEnabled public string clinicId;
        @AuraEnabled public string recipientId;
        @AuraEnabled public String attorneyId; 
        @AuraEnabled public String contactId;
        @AuraEnabled public String junctionId;
        @AuraEnabled public String recipientNumber;
        @AuraEnabled public String attorneyNumber;
        @AuraEnabled public string Agency;
        @AuraEnabled public boolean noAgencyChecked;
        @AuraEnabled public boolean noAttorneyChecked;
    }
    
    public class Cycles{
        @AuraEnabled public Integer index;
        @AuraEnabled public string cycleId;
        @AuraEnabled public string cycleName;
        @AuraEnabled public Boolean disabled;
        @AuraEnabled public Boolean checked;
    }
    
    public class Cycle{
        @AuraEnabled public string Id;
        @AuraEnabled public string Name;
        @AuraEnabled public string agencyId;
        @AuraEnabled public string clinicId;
    }


}