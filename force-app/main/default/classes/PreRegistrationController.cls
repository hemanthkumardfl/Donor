public class PreRegistrationController {
    
    public class SpermBankRecipientResponse {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Map<String, Id> accountMap;
        @AuraEnabled public Map<String, Id> junctionMap;
        @AuraEnabled public Map<String, Id> contactMap;
        
        public SpermBankRecipientResponse(Boolean success, String message, Map<String, Id> accountMap, Map<String, Id> junctionMap, Map<String, Id> contactMap) {
            this.success = success;
            this.message = message;
            this.accountMap = accountMap != null ? accountMap : new Map<String, Id>();
            this.junctionMap = junctionMap != null ? junctionMap : new Map<String, Id>();
            this.contactMap = contactMap != null ? contactMap : new Map<String, Id>();
        }
    }
    
    public class DeleteRecipientWrapper {
        @AuraEnabled public String accountId;
        @AuraEnabled public String contactId;
        @AuraEnabled public String junctionId;
    }
    
    public class DonorRegistrationWrapper {
        @AuraEnabled public String contribute;
        @AuraEnabled public String hasAdditional;
        @AuraEnabled public Boolean additionalCheckbox;
        @AuraEnabled public String donorId;
        @AuraEnabled public List<SpermDonorRecipientsInfoWrapper> recipients;
    }
    
    public class SpermDonorRecipientsInfoWrapper {
        @AuraEnabled public String RecipientNumber;
        @AuraEnabled public String recipient2FirstName;
        @AuraEnabled public String recipient2LastName;
        @AuraEnabled public String email;
        @AuraEnabled public String phone;
        @AuraEnabled public String additionalInfo;
        @AuraEnabled public String hasRecipient;
        @AuraEnabled public Boolean doYouWantToLink;
        @AuraEnabled public String accountId;
        @AuraEnabled public String contactId;
        @AuraEnabled public String junctionId;
        
    }
    
    @AuraEnabled
    public static SpermBankRecipientResponse deleteSpermDonorRecipient(String deleteDetails) {
        try {
            System.debug('Delete Details JSON: ' + deleteDetails);
            
            DeleteRecipientWrapper deleteData = (DeleteRecipientWrapper) JSON.deserialize(deleteDetails, DeleteRecipientWrapper.class);
            System.debug('Parsed delete data: ' + deleteData);
            
            List<SObject> recordsToDelete = new List<SObject>();
            
            // Collect records to delete
            if (String.isNotBlank(deleteData.junctionId)) {
                recordsToDelete.add(new d21_Donor_Recipient__c(Id = deleteData.junctionId));
            }
            
            if (String.isNotBlank(deleteData.contactId)) {
                recordsToDelete.add(new Contact(Id = deleteData.contactId));
            }
            
            if (String.isNotBlank(deleteData.accountId)) {
                recordsToDelete.add(new Account(Id = deleteData.accountId));
            }
            
            if (!recordsToDelete.isEmpty()) {
                // Delete in reverse order (Junction -> Contact -> Account)
                List<d21_Donor_Recipient__c> junctionsToDelete = new List<d21_Donor_Recipient__c>();
                List<Contact> contactsToDelete = new List<Contact>();
                List<Account> accountsToDelete = new List<Account>();
                
                for (SObject record : recordsToDelete) {
                    if (record instanceof d21_Donor_Recipient__c) {
                        junctionsToDelete.add((d21_Donor_Recipient__c) record);
                    } else if (record instanceof Contact) {
                        contactsToDelete.add((Contact) record);
                    } else if (record instanceof Account) {
                        accountsToDelete.add((Account) record);
                    }
                }
                
                // Delete junctions first
                if (!junctionsToDelete.isEmpty()) {
                    delete junctionsToDelete;
                    System.debug('Deleted junctions: ' + junctionsToDelete.size());
                }
                
                // Then contacts
                if (!contactsToDelete.isEmpty()) {
                    delete contactsToDelete;
                    System.debug('Deleted contacts: ' + contactsToDelete.size());
                }
                
                // Finally accounts
                if (!accountsToDelete.isEmpty()) {
                    delete accountsToDelete;
                    System.debug('Deleted accounts: ' + accountsToDelete.size());
                }
                
                return new SpermBankRecipientResponse(true, 'Recipient deleted successfully', null, null, null);
            } else {
                return new SpermBankRecipientResponse(true, 'No records to delete', null, null, null);
            }
            
        } catch (Exception e) {
            System.debug('Exception in deleteSpermDonorRecipient: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new SpermBankRecipientResponse(false, 'Error deleting recipient: ' + e.getMessage() + ' - Line: ' + e.getLineNumber(), null, null, null);
        }
    }
    @AuraEnabled
    public static SpermBankRecipientResponse createSpermDonorRecipients(String RecipientDetails) {
    try {
        DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(RecipientDetails, DonorRegistrationWrapper.class);
        System.debug('spermDonorRecipients >>> ' + donor.recipients);
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
            junction.d21_Contact__c = '003QL00000xCzvfYAC';//'003QL00000wfhEQYAY'; //con.Id;

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
    } catch (Exception e) {
        return  null;
    }
}
  
     @AuraEnabled
    public static String addAgency(String donorId, String agencyName, String phone, String coordinatorName, String website, String cityState, String email, String donorCode, String profileFile, String photoFile, String accountId, String junctionId) {
        try {
            // Validate required fields
            if (String.isBlank(agencyName)) {
                throw new AuraHandledException('Sperm Bank Name is required.');
            }
            if (String.isBlank(donorId)) {
                throw new AuraHandledException('Donor ID is required.');
            }

            // Create or update Account for the sperm bank
            Account agencyAccount;
            if (String.isNotBlank(accountId)) {
                // Update existing account
                agencyAccount = [SELECT Id, Name, Phone, Website, BillingCity, BillingState, d21_Coordinator_Name__c, d21_Email__c 
                                 FROM Account 
                                 WHERE Id = :accountId 
                                 LIMIT 1];
            } else {
                // Create new account
                agencyAccount = new Account();
            }

            agencyAccount.Name = agencyName;
            agencyAccount.Phone = phone;
            agencyAccount.Website = website;
            agencyAccount.BillingCity = cityState != null ? cityState.split('/')[0] : null;
            agencyAccount.BillingState = cityState != null && cityState.contains('/') ? cityState.split('/')[1] : null;
            agencyAccount.d21_Coordinator_Name__c = coordinatorName;
            agencyAccount.d21_Email__c = email;
            //agencyAccount.d21_Donor_Code__c = donorCode;

            upsert agencyAccount;

            // Handle file uploads (ContentVersion for profile and photo)
            List<ContentVersion> contentVersions = new List<ContentVersion>();
            if (String.isNotBlank(profileFile)) {
                contentVersions.add(createContentVersion(profileFile, donorId + '_Profile', agencyAccount.Id));
            }
            if (String.isNotBlank(photoFile)) {
                contentVersions.add(createContentVersion(photoFile, donorId + '_Photo', agencyAccount.Id));
            }
            if (!contentVersions.isEmpty()) {
                insert contentVersions;
            }

            // Create or update Donor_Agency junction
            d21_Donor_Agency__c junction;
            if (String.isNotBlank(junctionId)) {
                junction = [SELECT Id, d21_Egg_Donor__c, Agency__c 
                            FROM d21_Donor_Agency__c 
                            WHERE Id = :junctionId LIMIT 1];
            } else {
                junction = new d21_Donor_Agency__c();
            }
            junction.d21_Egg_Donor__c = donorId;
            junction.Agency__c = agencyAccount.Id;

            upsert junction;

            // Create or update Donor_Recipient junction
            Contact con = [SELECT Id, Name, AccountId 
                           FROM Contact 
                           WHERE Id = :donorId 
                           LIMIT 1];
            d21_Donor_Recipient__c recipientJunction;
            List<d21_Donor_Recipient__c> existingJunctions = [SELECT Id 
                                                             FROM d21_Donor_Recipient__c 
                                                             WHERE d21_Contact__c = :donorId 
                                                             AND d21_Recipient__c = :con.AccountId 
                                                             WITH SECURITY_ENFORCED 
                                                             LIMIT 1];
            if (!existingJunctions.isEmpty()) {
                recipientJunction = existingJunctions[0];
            } else {
                recipientJunction = new d21_Donor_Recipient__c();
            }
            recipientJunction.d21_Recipient__c = con.AccountId;
            recipientJunction.d21_Contact__c = donorId;

            upsert recipientJunction;

            return agencyAccount.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error saving sperm bank information: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static String addClinic(String donorId, String clinicName, String phone, String coordinatorName, String website, String cityState, String email, String profileFile, String photoFile, String accountId, String junctionId) {
        try {
            // Validate required fields
            if (String.isBlank(clinicName)) {
                throw new AuraHandledException('Clinic Name is required.');
            }

            // Create or update Account for the clinic
            Account clinicAccount;
            if (String.isNotBlank(accountId)) {
                // Update existing account
                clinicAccount = [SELECT Id, Name, Phone, Website, d21_Coordinator_Name__c,d21_Email__c FROM Account WHERE Id = :accountId LIMIT 1];
            } else {
                // Create new account
                clinicAccount = new Account();
            }

            clinicAccount.Name = clinicName;
            clinicAccount.Phone = phone;
            clinicAccount.Website = website;
            clinicAccount.BillingCity = cityState != null ? cityState.split('/')[0] : null;
            clinicAccount.BillingState = cityState != null && cityState.contains('/') ? cityState.split('/')[1] : null;
            clinicAccount.d21_Coordinator_Name__c = coordinatorName;
            clinicAccount.d21_Email__c = email;

            upsert clinicAccount;

            // Handle file uploads (ContentVersion for profile and photo)
            List<ContentVersion> contentVersions = new List<ContentVersion>();
            if (String.isNotBlank(profileFile)) {
                contentVersions.add(createContentVersion(profileFile, donorId + '_Profile', clinicAccount.Id));
            }
            if (String.isNotBlank(photoFile)) {
                contentVersions.add(createContentVersion(photoFile, donorId + '_Photo', clinicAccount.Id));
            }
            if (!contentVersions.isEmpty()) {
                insert contentVersions;
            }

            // Create or update junction object (assuming Clinic_Junction__c)
            d21_Donor_Fertility_Clinic__c junction;
            if (String.isNotBlank(junctionId)) {
                junction = [SELECT Id, d21_Donor__c, d21_Clinic__c 
                            FROM d21_Donor_Fertility_Clinic__c 
                            WHERE Id = :junctionId 
                            LIMIT 1];
            } else {
                junction = new d21_Donor_Fertility_Clinic__c();
            }
            junction.d21_Donor__c = donorId;
            junction.d21_Clinic__c = clinicAccount.Id;

            upsert junction;

            return clinicAccount.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error saving clinic information: ' + e.getMessage());
        }
    }

   /* @AuraEnabled
    public static Map<String, Object> deleteSpermBank(String spermbankId) {
        try {
            // Validate input
            if (String.isBlank(spermbankId)) {
                throw new AuraHandledException('Sperm Bank ID is required.');
            }

            // Delete related junction records
            List<SpermBank_Junction__c> junctions = [SELECT Id 
                                                     FROM SpermBank_Junction__c 
                                                     WHERE Account__c = :spermbankId 
                                                     WITH SECURITY_ENFORCED];
            if (!junctions.isEmpty()) {
                delete junctions;
            }

            // Delete the Account
            Account spermBank = [SELECT Id 
                                 FROM Account 
                                 WHERE Id = :spermbankId 
                                 WITH SECURITY_ENFORCED 
                                 LIMIT 1];
            delete spermBank;

            return new Map<String, Object>{'isSuccess' => true};
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting sperm bank: ' + e.getMessage());
        }
    }*/

    // Helper method to create ContentVersion for file uploads
    private static ContentVersion createContentVersion(String base64Data, String fileName, Id parentId) {
        ContentVersion cv = new ContentVersion();
        cv.Title = fileName;
        cv.PathOnClient = fileName + getFileExtension(base64Data);
        cv.VersionData = EncodingUtil.base64Decode(base64Data.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        cv.FirstPublishLocationId = parentId;
        return cv;
    }

    // Helper method to determine file extension
    private static String getFileExtension(String base64Data) {
        if (base64Data.contains('data:application/pdf')) {
            return '.pdf';
        } else if (base64Data.contains('data:image/jpeg')) {
            return '.jpg';
        } else if (base64Data.contains('data:image/png')) {
            return '.png';
        }
        return '.bin'; // Fallback
    }
    
}