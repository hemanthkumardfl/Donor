public class Spermclass {
 /*   public class DonorRegistrationWrapper {
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
        // @AuraEnabled public DonationBasics donationBasics;
        @AuraEnabled public list<RecordWrapper> noCodeAgencyRecordList;
        @AuraEnabled public list<RecordWrapper> withCodeAgencyRecordList;
        @AuraEnabled public list<RecordWrapper> noCodeClinicRecordList;
        @AuraEnabled public list<RecordWrapper> withCodeClinicRecordList;
        @AuraEnabled public list<RecordWrapper> noCodeAttorneyRecordList;
        @AuraEnabled public list<RecordWrapper> withCodeAttorneyRecordList;
        @AuraEnabled public list<RecordWrapper> noCodeRecipientRecordList;
        @AuraEnabled public list<RecordWrapper> withCodeRecipientRecordList;
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
    
    public class RecordWrapper {
        @AuraEnabled public String firstName;
        @AuraEnabled public String lastName;
        @AuraEnabled public String name;
        @AuraEnabled public String website;
        @AuraEnabled public String email;
        @AuraEnabled public String phone;
        @AuraEnabled public String cordinatorName;
        @AuraEnabled public String cityState;
        @AuraEnabled public String additionalInformation;
        @AuraEnabled public String lawFirm;
        @AuraEnabled public Boolean haveDonerCode;
        @AuraEnabled public String doctorName;
        @AuraEnabled public String agencyId;
        @AuraEnabled public String clinicId;
        @AuraEnabled public String recipientId; 
        @AuraEnabled public String ContactId; 
    }
    
    
    
    @AuraEnabled
    public static void nocodeAgency(string contactObj){
        try {
            DonorRegistrationWrapper wrapper = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
            system.debug('wrapper : '+wrapper);
            List<Account> agencyAccounts = new List<Account>();
            for(RecordWrapper record  : wrapper.noCodeAgencyRecordList) {
                Account acc = new Account();
                if (String.isNotBlank(record.agencyId)) {
                    acc.Id = record.agencyId;
                }
                acc.Name = record.name;
                acc.Phone = record.Phone;
                acc.d21_Email__c = record.email;
                acc.Website = record.website;
                acc.d21_Coordinator_Name__c = record.cordinatorName;
                agencyAccounts.add(acc);
            }
            upsert agencyAccounts;
            
        } catch (Exception e) {
        }
    }	
    
    @AuraEnabled
    public static void nocodeclinic(string contactObj){
        try {
            DonorRegistrationWrapper wrapper = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
            system.debug('wrapper : '+wrapper);
            List<Account> agencyclinics = new List<Account>();
            for(RecordWrapper record  : wrapper.noCodeClinicRecordList) {
                Account acc = new Account();
                if (String.isNotBlank(record.clinicId)) {
                    acc.Id = record.clinicId;
                }
                acc.Name = record.name;
                acc.Phone = record.Phone;
                acc.d21_Email__c = record.email;
                acc.Website = record.website;
                acc.d21_Coordinator_Name__c = record.cordinatorName;
                acc.d21_Doctor_Name__c = record.doctorName;
                agencyclinics.add(acc);
            }
            
            upsert agencyclinics;
        } catch (Exception e) {
        }
    }
    
    @AuraEnabled
    public static void nocodeRecipient(String contactObj) {
        try {
            DonorRegistrationWrapper wrapper = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
            System.debug('wrapper : ' + wrapper);
            
            List<RecordWrapper> recordList = wrapper.noCodeAttorneyRecordList;
            List<Account> recipientAccounts = new List<Account>();
            Id contactId;
            Id targetAccountId;
            
            for (RecordWrapper record : recordList) {
                Account acc = new Account();
                
                if (String.isNotBlank(record.recipientId)) {
                    acc.Id = record.recipientId;
                    if (targetAccountId == null) {
                        targetAccountId = record.recipientId;
                    }
                }
                
                acc.Name = record.lawFirm;
                recipientAccounts.add(acc);
            }
            
            if (!recipientAccounts.isEmpty()) {
                upsert recipientAccounts;
                
                if (targetAccountId == null) {
                    targetAccountId = recipientAccounts[0].Id;
                }
            }
            
            if (!recordList.isEmpty()) {
                RecordWrapper firstRecord = recordList[0];
                
                if (String.isNotBlank(firstRecord.firstName)) {
                    Contact con = new Contact();
                    con.FirstName = firstRecord.lawFirm;
                    con.LastName = String.isNotBlank(firstRecord.lastName) ? firstRecord.lastName : 'Recipient';
                    con.Email = firstRecord.email;
                    con.Phone = firstRecord.phone;
                    con.d21_Additional_Information__c = firstRecord.additionalInformation;
                    
                    if (targetAccountId != null) {
                        con.AccountId = targetAccountId;
                    }
                    
                    insert con;
                    contactId = con.Id;
                }
            }
            
        } catch (Exception e) {
            System.debug('Error in nocodeRecipient: ' + e.getMessage());
            throw new AuraHandledException('Failed to save recipient data.');
        }
    }  */ 
}