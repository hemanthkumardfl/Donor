public without sharing class SpermDonorWithCodesController {
    
    @AuraEnabled
    public static Response fetchSpermDonorDetails(string contactObj){
        try{
            DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);  
             list<string> pmccodes = new list<string>();
             list<string> spermbankIds = new list<string>();
            List<string> associateCodes = new List<string>();
            list<SpermBank> spermBanks = new list<SpermBank>();
            pmccodes.addAll(donor.codes.PMC);
            associateCodes.addAll(donor.codes.SDN);
            associateCodes.addAll(donor.codes.REC);
             list<d21_PMC__c> PMCRecords;
            if(!pmccodes.isEmpty()){
                
                 PMCRecords = [SELECT Id,Name,d21_Sperm_Bank__c FROM d21_PMC__c WHERE Name IN :pmccodes  AND d21_Sperm_Bank__c != NULL]; 
                 system.debug('pmccodes' + pmccodes);
            }
            else {
                if(!associateCodes.isEmpty()){
                    pmccodes = new list<string>();
                    list<d21_Associated_Codes__c> associateCodeList = [SELECT Id, Name,
                                                                    d21_PMC_Code__c FROM d21_Associated_Codes__c WHERE NAME In : associateCodes];
                    for(d21_Associated_Codes__c a : associateCodeList){
                        pmccodes.add(a.d21_PMC_Code__c);
                    }
                    PMCRecords = [SELECT Id,Name,d21_Sperm_Bank__c FROM d21_PMC__c WHERE Id IN :pmccodes]; 
                    system.debug('associateCodes' + associateCodeList);
                }
            }
            system.debug('PMCRecords' + PMCRecords);
            //list<d21_PMC__c> PMCRecords = [SELECT Id,Name,d21_Sperm_Bank__c FROM d21_PMC__c WHERE Name IN :pmccodes  AND d21_Sperm_Bank__c != NULL]; 
            
             system.debug('PMCRecords' + PMCRecords);
               if(!PMCRecords.isEmpty()){
                for(d21_PMC__c pmc : PMCRecords){
                    spermbankIds.add(pmc.d21_Sperm_Bank__c);
                }
                if(!spermbankIds.isEmpty()){
                    for(Account acc : [Select Name, Id,Phone,Website,d21_Email__c,d21_Coordinator_Name__c from Account where Id IN :spermbankIds]){
                        SpermBank bank = new SpermBank();
                        bank.bankName = acc.Name;
                        bank.spermbankId = acc.Id;
                        bank.phone = acc.Phone;
                        bank.website = acc.Website;
                        bank.coordinator = acc.d21_Coordinator_Name__c;
                        bank.email = acc.d21_Email__c;
                        spermBanks.add(bank);
                    }
                }
            } 
            system.debug('spermBanks' + spermBanks);
            return new Response(true,JSON.serialize(spermBanks));
        } 
        catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
        
    }

      @AuraEnabled
    public static Response fetchSpermDonorClinicDetails(string contactObj){
        try{
            DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);  
            list<string> pmccodes = new list<string>();
            list<string> spermclinicIds = new list<string>();
            List<string> associateCodes = new List<string>();
            list<SpermClinic> spermClinics = new list<SpermClinic>();
            pmccodes.addAll(donor.codes.PMC);
            associateCodes.addAll(donor.codes.SDN);
            associateCodes.addAll(donor.codes.REC);
            list<d21_PMC__c> PMCRecords;
             if(!pmccodes.isEmpty()){
            	PMCRecords = [SELECT Id,Name,d21_Clinic__c FROM d21_PMC__c WHERE Name IN :pmccodes  AND d21_Clinic__c != NULL]; 
             }
             else {
                 if(!associateCodes.isEmpty()){
                     pmccodes = new list<string>();
                     list<d21_Associated_Codes__c> associateCodeList = [SELECT Id, Name,
                                                                    	d21_PMC_Code__c FROM d21_Associated_Codes__c WHERE NAME In : associateCodes];
                     for(d21_Associated_Codes__c a : associateCodeList){
                         pmccodes.add(a.d21_PMC_Code__c);
                     }
                     PMCRecords = [SELECT Id,Name,d21_Clinic__c FROM d21_PMC__c WHERE Id IN :pmccodes]; 
                 }
             }
            if(!PMCRecords.isEmpty()){
                for(d21_PMC__c pmc : PMCRecords){
                    spermclinicIds.add(pmc.d21_Clinic__c);
                }
                if(!spermclinicIds.isEmpty()){
                    for(Account acc : [Select Name, Id,Phone,Website,d21_Email__c,d21_Coordinator_Name__c from Account where Id IN :spermclinicIds]){
                        SpermClinic clinic = new SpermClinic();
                        clinic.bankName = acc.Name;
                        clinic.spermclinicId = acc.Id;
                        clinic.phone = acc.Phone;
                        clinic.website = acc.Website;
                        clinic.coordinator = acc.d21_Coordinator_Name__c;
                        clinic.email = acc.d21_Email__c;
                        spermClinics.add(clinic);
                    }
                }
            }
            
             /*system.debug('PMCRecords' + PMCRecords);
               if(!PMCRecords.isEmpty()){
                for(d21_PMC__c pmc : PMCRecords){
                    spermclinicIds.add(pmc.d21_Clinic__c);
                }
                if(!spermclinicIds.isEmpty()){
                    for(Account acc : [Select Name, Id,Phone,Website,d21_Email__c,d21_Coordinator_Name__c from Account where Id IN :spermclinicIds]){
                        SpermClinic clinic = new SpermClinic();
                        clinic.bankName = acc.Name;
                        clinic.spermclinicId = acc.Id;
                        clinic.phone = acc.Phone;
                        clinic.website = acc.Website;
                        clinic.coordinator = acc.d21_Coordinator_Name__c;
                        clinic.email = acc.d21_Email__c;
                        spermClinics.add(clinic);
                    }
                }
            } */
            system.debug('spermClinics' + spermClinics);
            return new Response(true,JSON.serialize(spermClinics));
        } 
        catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
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
        //@AuraEnabled public DonationBasics donationBasics;
        @AuraEnabled public list<string> newCodeList;
        /*@AuraEnabled public list<RecordWrapper> agenciesWithoutCode;
        @AuraEnabled public list<RecordWrapper> clinicsWithoutCode;
        @AuraEnabled public list<RecordWrapper> AttorniesWithoutCode;
        @AuraEnabled public list<RecordWrapper> recipientsWithoutCode;
        @AuraEnabled public list<Cycle> allCycles;
        @AuraEnabled public AlternateObject alternateDetails;
        @AuraEnabled public ClinicDetails clinicsWithCodes;    
        @AuraEnabled public AgencyDetails agenciesWithCodes;*/
    }
    
      public class Codes {
        @AuraEnabled public List<String> PMC;
        @AuraEnabled public List<String> EDN;
        @AuraEnabled public List<String> SDN;
        @AuraEnabled public List<String> EMB;
        @AuraEnabled public List<String> REC;
        @AuraEnabled public Boolean isSkipped;
    }
    
    public class SpermBank{
        @AuraEnabled public String bankName;
        @AuraEnabled public String email;
        @AuraEnabled public String phone;
        @AuraEnabled public String website;
        @AuraEnabled public String coordinator;
        @AuraEnabled public String spermbankId;
    }

    public class SpermClinic{
        @AuraEnabled public String bankName;
        @AuraEnabled public String email;
        @AuraEnabled public String phone;
        @AuraEnabled public String website;
        @AuraEnabled public String coordinator;
        @AuraEnabled public String spermclinicId;
    }

    public class Response{
        @AuraEnabled public string message;
        @AuraEnabled public boolean isSuccess;
        public Response(boolean isSuccess, string message){
            this.isSuccess = isSuccess;
            this.message = message;
        }
    }
}