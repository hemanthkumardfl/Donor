public without sharing class EggDonorAgencyWithCodeController {
    
    
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
            list<string> pmccodes = new list<string>();
            List<string> associateCodes = new List<string>();
            list<Agency> agencies = new list<Agency>();
            list<d21_PMC__c> pmcRecords = new list<d21_PMC__c>();
            Map<string,string> pmcAgencyIdMap = new Map<string,string>();
            
            pmccodes.addAll(donor.codes.PMC);
            associateCodes.addAll(donor.codes.EDN);
            associateCodes.addAll(donor.codes.SDN);
            associateCodes.addAll(donor.codes.EMB);
            associateCodes.addAll(donor.codes.REC);
            
            if(!associateCodes.isEmpty()){
                list<d21_Associated_Codes__c> associateList = [SELECT Id,d21_PMC_Code__c 
                                                               FROM d21_Associated_Codes__c 
                                                               WHERE Name IN :associateCodes
                                                               WITH SYSTEM_MODE];
                for(d21_Associated_Codes__c aCode: associateList){
                    pmccodes.add(aCode.d21_PMC_Code__c);
                }
            }

            system.debug('PMC Codes >>> '+pmccodes);
            
            if(!pmccodes.isEmpty()){
                pmcRecords = [SELECT Id,Name,d21_Agency__c 
                              FROM d21_PMC__c 
                              WHERE Name IN :pmccodes  
                              AND d21_Agency__c != NULL
                              WITH SYSTEM_MODE]; 
            }
            
            if(!pmcRecords.isEmpty()){
                
                for(d21_PMC__c pmc : pmcRecords){
                    pmcAgencyIdMap.put(pmc.Name,pmc.d21_Agency__c);
                }
                
                if(!pmcAgencyIdMap.values().isEmpty()){
                    Map<Id,Account> accountMap = new Map<Id,Account>([SELECT Name, Id,Phone,Website,d21_Email__c,d21_Coordinator_Name__c 
                                                                      FROM Account 
                                                                      WHERE Id IN :pmcAgencyIdMap.values()
                                                                      WITH SYSTEM_MODE]);
                    for(string pmc : pmcAgencyIdMap.keySet()){
                        Agency agen = new Agency();
                        agen.Name = accountMap.get(pmcAgencyIdMap.get(pmc)).Name;
                        agen.agencyId = pmcAgencyIdMap.get(pmc);
                        agen.Phone = accountMap.get(pmcAgencyIdMap.get(pmc)).Phone;
                        agen.Website = accountMap.get(pmcAgencyIdMap.get(pmc)).Website;
                        agen.PMC = pmc;
                        agencies.add(agen);
                    }
                }
            }
            
            return new Response(true, JSON.serialize(agencies));
        }catch(Exception e){
            return new Response(false, e.getMessage()+' >>> '+e.getLineNumber()+'  >>>  '+e.getStackTraceString());
        }
    }
    
    
    @AuraEnabled
    public  static Response updateEggAgenciesWithCodes(string existingAgencies,string addedAgencies,string cycles){
        try {
            list<RecordWrapper> existingAgencyList = (list<RecordWrapper>)JSON.deserialize(existingAgencies, list<RecordWrapper>.class);  
            list<RecordWrapper> addedAgencyList = (list<RecordWrapper>)JSON.deserialize(addedAgencies, list<RecordWrapper>.class);  
            list<Cycle> cyclesList = (list<Cycle>)JSON.deserialize(cycles, list<Cycle>.class);  
            
            list<Account> upsertExistingAgencyList = new list<Account>();
            list<Account> upsertAddedAgencyList = new list<Account>();
            list<d21_Cycle__c> updateCycleList = new list<d21_Cycle__c>();
            Map<string,Account> cycleAccountMap = new Map<string,Account>();
            list<d21_Donor_Agency__c> donorAgencyList = new list<d21_Donor_Agency__c>();
            
            
            for(RecordWrapper record : existingAgencyList){
                system.debug('record.selectedCycles >>> '+record.selectedCycles);
                if(!record.noAgencyChecked && !record.selectedCycles.isEmpty()){
                    Account acc = new Account();
                    acc.Id = record.agencyId;
                    acc.Phone = record.Phone;
                    acc.d21_Email__c = record.Email;
                    acc.Website = record.Website;
                    acc.Name = record.Name;
                    acc.recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Agency').getRecordTypeId();
                    acc.d21_Coordinator_Name__c = record.CoordinatorName;
                    upsertExistingAgencyList.add(acc);
                    for(string cycle : record.selectedCycles){
                        cycleAccountMap.put('Cycle '+cycle,acc);
                    }
                }
            }
            
            if(!upsertExistingAgencyList.isEmpty()){
                upsert upsertExistingAgencyList;
            }
            
            for(RecordWrapper record : addedAgencyList){
                if(!record.selectedCycles.isEmpty()){
                    Account acc = new Account();
                    acc.Id = record.agencyId;
                    acc.Phone = record.Phone;
                    acc.d21_Email__c = record.Email;
                    acc.Website = record.Website;
                    acc.Name = record.Name;
                    acc.recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Agency').getRecordTypeId();
                    acc.d21_Coordinator_Name__c = record.CoordinatorName;
                    upsertAddedAgencyList.add(acc);
                    for(string cycle : record.selectedCycles){
                        cycleAccountMap.put('Cycle '+cycle,acc);
                    }
                }
            }
            
            if(!upsertAddedAgencyList.isEmpty()){
                upsert upsertAddedAgencyList;
                for (Integer i = 0; i < addedAgencyList.size(); i++) {
                    if(!addedAgencyList[i].selectedCycles.isEmpty()){
                        addedAgencyList[i].agencyId = upsertAddedAgencyList[i].Id;
                    }
                }
            }
            system.debug('cycleAccountMap >>> '+cycleAccountMap);
            for(Cycle record : cyclesList){
                d21_Cycle__c cycle = new d21_Cycle__c();
                cycle.Id = record.Id;
                if(cycleAccountMap.containsKey(record.Name)){
                    cycle.d21_Agency__c = cycleAccountMap.get(record.Name).Id;
                }
                updateCycleList.add(cycle);
            }
            
            if(!updateCycleList.isEmpty()){
                update updateCycleList;
                Map<string,d21_Cycle__c> cycleMap = new Map<string,d21_Cycle__c>(updateCycleList);
                list<d21_Cycle__c> fetchCycles = [Select Id,d21_Agency__r.Name,d21_Agency__c,d21_Donor__c from d21_Cycle__c Where Id In :cycleMap.keySet()];
                list<d21_Donor_Agency__c> deleteDonorAgencyList = [SELECT Id,Name from d21_Donor_Agency__c WHERE d21_Egg_Donor__c = :fetchCycles[0].d21_Donor__c];
                if(!deleteDonorAgencyList.isEmpty()){
                    delete deleteDonorAgencyList;
                }
                Map<string,string> accIdNameMap = new Map<string,string>();
                for(d21_Cycle__c cycle : fetchCycles){
                    if(cycle.d21_Agency__c != null){
                        accIdNameMap.put(cycle.d21_Agency__c, cycle.d21_Agency__r.Name);
                    }
                }
                system.debug('accIdNameMap >>> '+accIdNameMap);
                for(string accId : accIdNameMap.keySet()){
                    d21_Donor_Agency__c donorAgency = new 	d21_Donor_Agency__c();
                    donorAgency.Name = accIdNameMap.get(accId);
                    donorAgency.Agency__c = accId;
                    donorAgency.d21_Egg_Donor__c = fetchCycles[0].d21_Donor__c;
                    donorAgencyList.add(donorAgency);
                } 
                if(!donorAgencyList.isEmpty()){
                    insert donorAgencyList;
                }
            }
            
            return new Response(true,JSON.serialize(addedAgencyList));
            
        } catch (Exception e) {
            return new Response(false, e.getMessage()+' >>> '+e.getLineNumber()+'  >>>  '+e.getStackTraceString());
        }
    }
    
    @AuraEnabled
    public static Response deleteCycleAgency(string agencyId){
        try {
            delete [select Id from Account Where Id =: agencyId];
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
        @AuraEnabled public string PMC;
    }
    
    public class Clinic{
        @AuraEnabled public String Name;
        @AuraEnabled public String Email;
        @AuraEnabled public String Phone;
        @AuraEnabled public String Website;
        @AuraEnabled public String CoordinatorName;
        @AuraEnabled public String clinicId;
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
        @AuraEnabled public string lawFirm;
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