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
    public  static Response updateEggAgenciesWithCodes(string donorId,string agencyData){
        try {
            List<RecordWrapper> agencyList = (List<RecordWrapper>)JSON.deserialize(agencyData, List<RecordWrapper>.class);
            Map<string,string> cycleMap = new Map<string,string>();
            list<d21_Cycle__c> cycleList = new list<d21_Cycle__c>();
            list<d21_Cycle__c> removeAgencyCycleList = new list<d21_Cycle__c>();
            list<d21_Donor_Agency__c> donorAgencyList = new list<d21_Donor_Agency__c>();

            list<d21_Cycle__c> fetchCycleList = [SELECT Id,Name,d21_Donor__c,d21_Agency__c FROM d21_Cycle__c WHERE d21_Donor__c = :donorId WITH SYSTEM_MODE];
            
            for(d21_Cycle__c cycle : fetchCycleList){
                cycleMap.put(cycle.Name,cycle.Id);
            }
            
            list<d21_Donor_Agency__c> fetchExistingDonorAgencyList = [SELECT Id,d21_Egg_Donor__c,Agency__c 
                                                                      FROM d21_Donor_Agency__c 
                                                                      WHERE d21_Egg_Donor__c  =:donorId
                                                                      WITH SYSTEM_MODE];
            
            if(!fetchExistingDonorAgencyList.isEmpty()){
                delete fetchExistingDonorAgencyList;
            }
            
            for(RecordWrapper acc : agencyList){
                if(!acc.selectedCycles.isEmpty()){
                    
                    d21_Donor_Agency__c donorAgency = new d21_Donor_Agency__c();
                    donorAgency.d21_Egg_Donor__c = donorId;
                    donorAgency.Agency__c = acc.agencyId; 
                    donorAgency.Name = acc.Name;
                    if(acc.showDonorCodeInput){
                        donorAgency.d21_Donor_Code__c = acc.DonorCode;
                    }
                    donorAgency.d21_Know_Donor_Code__c = acc.showDonorCodeInput;
                    donorAgencyList.add(donorAgency);
                    for(string cyc : acc.selectedCycles){
                        d21_Cycle__c cycle = new d21_Cycle__c();
                        cycle.Id = cycleMap.get('Cycle '+cyc);
                        cycle.d21_Agency__c = acc.agencyId;
                        cycleMap.remove('Cycle '+cyc);
                        cycleList.add(cycle);
                    }
                }
            }
            
            if(!cycleList.isEmpty()){
                update cycleList;
            }
            
            if(!donorAgencyList.isEmpty()){
                insert donorAgencyList;
            }

            for(string cycleMapKey : cycleMap.keySet()){
                d21_Cycle__c cycle = new d21_Cycle__c();
                cycle.Id = cycleMap.get(cycleMapKey);
                cycle.d21_Agency__c = null;
                removeAgencyCycleList.add(cycle);
            }
            
            if(!removeAgencyCycleList.isEmpty()){
                update removeAgencyCycleList;
            }
            
            return new Response(true,'');
            
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


    @AuraEnabled
    public static Account getRecord(string accountId){
        try {
            return [select Id,Name,Phone,Website from Account Where Id =: accountId limit 1];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
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
        @AuraEnabled public String agencyId;
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
        @AuraEnabled public string DonorCode;
        @AuraEnabled public boolean showDonorCodeInput;
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