public without sharing class EggDonorClinicWithCodeController {

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
            list<string> clinicIds = new list<string>();
            list<string> pmccodes = new list<string>();
            List<string> associateCodes = new List<string>();
            list<Clinic> clinics = new list<Clinic>();
            list<d21_PMC__c> PMCRecords = new list<d21_PMC__c>();
            pmccodes.addAll(donor.codes.PMC);
            associateCodes.addAll(donor.codes.EDN);
            associateCodes.addAll(donor.codes.SDN);
            associateCodes.addAll(donor.codes.EMB);
            associateCodes.addAll(donor.codes.REC);
            if(!pmccodes.isEmpty()){
             PMCRecords = [SELECT Id,Name,d21_Clinic__c FROM d21_PMC__c WHERE Name IN :pmccodes  AND d21_Clinic__c != NULL]; 
            }
            else if(!associateCodes.isEmpty()){
                system.debug('associateCodes >>> '+associateCodes);
                list<d21_Associated_Codes__c> associateList = [select Id,d21_PMC_Code__c from d21_Associated_Codes__c Where Name In :associateCodes];
                for(d21_Associated_Codes__c aCode: associateList){
                    pmccodes.add(aCode.d21_PMC_Code__c);
                }
                system.debug('pmccodes >>> '+pmccodes);
                PMCRecords = [SELECT Id,Name,d21_Clinic__c FROM d21_PMC__c WHERE Id IN :pmccodes  AND d21_Clinic__c != NULL]; 
            }
            
            if(!PMCRecords.isEmpty()){
                for(d21_PMC__c pmc : PMCRecords){
                    clinicIds.add(pmc.d21_Clinic__c);
                }
                if(!clinicIds.isEmpty()){
                    for(Account acc : [Select Name, Id,Phone,Website,d21_Email__c,d21_Coordinator_Name__c from Account where Id IN :clinicIds]){
                        Clinic clin = new Clinic();
                        clin.Name = acc.Name;
                        clin.clinicId = acc.Id;
                        clin.Phone = acc.Phone;
                        clin.Website = acc.Website;
                        clin.CoordinatorName = acc.d21_Coordinator_Name__c;
                        clin.Email = acc.d21_Email__c;
                        clinics.add(clin);
                    }
                }
            }
        
            return new Response(true, JSON.serialize(clinics));
        }catch(Exception e){
            return new Response(false, e.getMessage()+' >>> '+e.getLineNumber()+'  >>>  '+e.getStackTraceString());
        }
}


    @AuraEnabled
    public  static Response updateEggClinicsWithCodes(string existingClinics,string addedClinics,string cycles){
        try {
            list<RecordWrapper> existingClinicList = (list<RecordWrapper>)JSON.deserialize(existingClinics, list<RecordWrapper>.class);  
            list<RecordWrapper> addedClinicList = (list<RecordWrapper>)JSON.deserialize(addedClinics, list<RecordWrapper>.class);  
            list<Cycle> cyclesList = (list<Cycle>)JSON.deserialize(cycles, list<Cycle>.class);  

            list<Account> upsertExistingClinicList = new list<Account>();
            list<Account> upsertAddedClinicList = new list<Account>();
            list<d21_Cycle__c> updateCycleList = new list<d21_Cycle__c>();
            Map<string,Account> cycleAccountMap = new Map<string,Account>();
            list<d21_Donor_Fertility_Clinic__c> donorAgencyList = new list<d21_Donor_Fertility_Clinic__c>();


            for(RecordWrapper record : existingClinicList){
                system.debug('record.selectedCycles >>> '+record.selectedCycles);
                if(!record.noClinicChecked && !record.selectedCycles.isEmpty()){
                Account acc = new Account();
                acc.Id = record.clinicId;
                acc.Phone = record.Phone;
                acc.d21_Email__c = record.Email;
                acc.Website = record.Website;
                acc.Name = record.Name;
                acc.recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Clinic').getRecordTypeId();
                acc.d21_Coordinator_Name__c = record.CoordinatorName;
                upsertExistingClinicList.add(acc);
                for(string cycle : record.selectedCycles){
                    cycleAccountMap.put('Cycle '+cycle,acc);
                }
            }
            }

            if(!upsertExistingClinicList.isEmpty()){
                upsert upsertExistingClinicList;
            }

            for(RecordWrapper record : addedClinicList){
                if(!record.selectedCycles.isEmpty()){
                Account acc = new Account();
                acc.Id = record.clinicId;
                acc.Phone = record.Phone;
                acc.d21_Email__c = record.Email;
                acc.Website = record.Website;
                acc.Name = record.Name;
                acc.recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Clinic').getRecordTypeId();
                acc.d21_Coordinator_Name__c = record.CoordinatorName;
                upsertAddedClinicList.add(acc);
                for(string cycle : record.selectedCycles){
                    cycleAccountMap.put('Cycle '+cycle,acc);
                }
            }
            }

            if(!upsertAddedClinicList.isEmpty()){
                upsert upsertAddedClinicList;
                for (Integer i = 0; i < addedClinicList.size(); i++) {
                    if(!addedClinicList[i].selectedCycles.isEmpty()){
                    addedClinicList[i].clinicId = upsertAddedClinicList[i].Id;
                    }
                }
            }
            system.debug('cycleAccountMap >>> '+cycleAccountMap);
            for(Cycle record : cyclesList){
                d21_Cycle__c cycle = new d21_Cycle__c();
                cycle.Id = record.Id;
                if(cycleAccountMap.containsKey(record.Name)){
                cycle.d21_Clinic__c = cycleAccountMap.get(record.Name).Id;
                }
                updateCycleList.add(cycle);
            }

            if(!updateCycleList.isEmpty()){
                update updateCycleList;
                Map<string,d21_Cycle__c> cycleMap = new Map<string,d21_Cycle__c>(updateCycleList);
                list<d21_Cycle__c> fetchCycles = [Select Id,d21_Clinic__r.Name,d21_Clinic__c,d21_Donor__c from d21_Cycle__c Where Id In :cycleMap.keySet()];
                list<d21_Donor_Fertility_Clinic__c> deleteDonorAgencyList = [SELECT Id,Name from d21_Donor_Fertility_Clinic__c WHERE d21_Donor__c = :fetchCycles[0].d21_Donor__c];
                if(!deleteDonorAgencyList.isEmpty()){
                    delete deleteDonorAgencyList;
                }
                Map<string,string> accIdNameMap = new Map<string,string>();
                for(d21_Cycle__c cycle : fetchCycles){
                    if(cycle.d21_Clinic__c != null){
                    accIdNameMap.put(cycle.d21_Clinic__c, cycle.d21_Clinic__r.Name);
                    }
                }
                system.debug('accIdNameMap >>> '+accIdNameMap);
                for(string accId : accIdNameMap.keySet()){
                    d21_Donor_Fertility_Clinic__c donorAgency = new 	d21_Donor_Fertility_Clinic__c();
                    donorAgency.Name = accIdNameMap.get(accId);
                    donorAgency.d21_Clinic__c = accId;
                    donorAgency.d21_Donor__c = fetchCycles[0].d21_Donor__c;
                    donorAgencyList.add(donorAgency);
                } 
                if(!donorAgencyList.isEmpty()){
                    insert donorAgencyList;
                }
            }

            return new Response(true,JSON.serialize(addedClinicList));

        } catch (Exception e) {
            return new Response(false, e.getMessage()+' >>> '+e.getLineNumber()+'  >>>  '+e.getStackTraceString());
        }
    }

    @AuraEnabled
    public static Response deleteCycleClinic(string clinicId){
        try {
            delete [select Id from Account Where Id =: clinicId];
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
        @AuraEnabled public boolean noClinicChecked;
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