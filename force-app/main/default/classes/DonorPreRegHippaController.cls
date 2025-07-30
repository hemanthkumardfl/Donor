public without sharing class DonorPreRegHippaController {
    
    @AuraEnabled
    public static hipaaWrapper  spermDonor(String donorId) {
        hipaaWrapper hipaaWrapperlist = new hipaaWrapper();
        list<d21_Donor_Agency__c> Agencyjunctionlist = [SELECT Id,d21_Egg_Donor__c,Agency__r.name,Agency__c  FROM d21_Donor_Agency__c WHERE d21_Egg_Donor__c = :donorId and Agency__c !=null];
        list<d21_Donor_Fertility_Clinic__c> Clinicjunctionlist = [SELECT Id,d21_Clinic__c,d21_Clinic__r.name,d21_Donor__c FROM d21_Donor_Fertility_Clinic__c WHERE d21_Donor__c  = :donorId and d21_Clinic__c !=null];
        list<d21_Donor_Fertility_Attorney__c> Attorneyjunctionlist = [SELECT Id,d21_Donor__c,d21_Attorney__r.name,d21_Attorney__c   FROM d21_Donor_Fertility_Attorney__c WHERE d21_Donor__c = :donorId and d21_Attorney__c  !=null];
        list<d21_Donor_Recipient__c> RecipientjunctionList = [SELECT Id,d21_Contact__c,d21_Recipient__c,d21_Recipient__r.name  FROM d21_Donor_Recipient__c WHERE d21_Contact__c = :donorId and d21_Recipient__c !=null];
            list<Agency> Agencylist = new list<Agency>();
            list<Clinic> Cliniclist = new list<Clinic>();
            list<Attorney> Attorneylist = new list<Attorney>();
            list<Recipient> Recipientlist = new list<Recipient>();
        
        for (d21_Donor_Agency__c agencyJunction : agencyJunctionList) {
            Agency a = new Agency();
            a.Name = agencyJunction.Agency__r.name;
            a.Id =   agencyJunction.Agency__c;
            Agencylist.add(a);
        }
        hipaaWrapperlist.Agencylist = Agencylist;
        
        for (d21_Donor_Fertility_Clinic__c clinicJunction : Clinicjunctionlist) {
            Clinic c = new Clinic();
            c.Name =clinicJunction.d21_Clinic__r.name;
            c.Id =clinicJunction.d21_Clinic__c;
            
             Cliniclist.add(c);
        }
         hipaaWrapperlist.Cliniclist = Cliniclist;
        
        for (d21_Donor_Fertility_Attorney__c attorneyJunction : Attorneyjunctionlist) {
             Attorney At = new Attorney();
            At.Name =attorneyJunction.d21_Attorney__r.name;
            At.Id =attorneyJunction.d21_Attorney__c;
            Attorneylist.add(At);
        }
         hipaaWrapperlist.Attorneylist = Attorneylist;
        
        for (d21_Donor_Recipient__c recipientJunction : RecipientjunctionList) {
            Recipient R = new Recipient();
            R.Name =recipientJunction.d21_Recipient__r.name;
            R.Id =recipientJunction.d21_Recipient__c;
            Recipientlist.add(R);
        }
         hipaaWrapperlist.Recipientlist = Recipientlist;
        return hipaaWrapperlist;
    }
    
    public class hipaaWrapper{
     @AuraEnabled public  list<Agency> Agencylist;
     @AuraEnabled public  list<Clinic> Cliniclist; 
      @AuraEnabled public list<Attorney> Attorneylist;
       @AuraEnabled public  list<Recipient> Recipientlist;
    }
      
    
    public class Agency{
       @AuraEnabled  public string Id;
        @AuraEnabled public string Name;   
    }
    
    public class Clinic{
       @AuraEnabled  public string Id;
       @AuraEnabled  public string Name;   
    }
    
    public class Attorney{
       @AuraEnabled public string Id;
       @AuraEnabled public string Name;     
    }
    
    public class Recipient{
      @AuraEnabled  public string Id;
       @AuraEnabled public string Name;   
    }
    
    
    
    @AuraEnabled
    public static void updateDonorName(String donorId, String firstName, String lastName ,string dob) {
        try {
            if (String.isBlank(donorId)) {
                throw new AuraHandledException('Donor ID is required.');
            }
            Contact donorContact = [SELECT Id, FirstName, LastName FROM Contact WHERE Id = :donorId LIMIT 1];
            if (donorContact == null) {
                throw new AuraHandledException('Contact not found for the provided Donor ID.');
            }
            donorContact.FirstName = firstName;
            donorContact.LastName = lastName;
            donorContact.d21_Date_Of_Birth__c = Date.valueOf(dob);
            update donorContact;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating donor name: ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static void savePDFToContact(String contactId, String pdfBase64, String fileName) {
        try {
            // For demo purposes, using a default contact ID if none provided
            if (String.isBlank(contactId) || contactId == 'demo-contact-id') {
                contactId = contactId; // Replace with actual contact ID
            }
            
            Blob pdfBlob = EncodingUtil.base64Decode(pdfBase64);
            
            ContentVersion cv = new ContentVersion();
            cv.Title = fileName;
            cv.PathOnClient = fileName;
            cv.VersionData = pdfBlob;
            cv.FirstPublishLocationId = contactId;
            cv.IsMajorVersion = true;
            
            insert cv;
            
            System.debug('PDF saved successfully: ' + fileName);
        } catch (Exception e) {
            System.debug('Error saving PDF: ' + e.getMessage());
            throw new AuraHandledException('Error saving PDF: ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static void deleteSpermBank(String donorId, String accountId, String junctionId, String pmcjunctionId) {
        try {
            // Handle deletion for junction object (primaryBanksListFromApex)
            if (String.isNotBlank(pmcjunctionId)) {
                d21_Donor_Agency__c junction = [
                    SELECT Id 
                    FROM d21_Donor_Agency__c 
                    WHERE Agency__c = :pmcjunctionId
                    LIMIT 1
                ];
                if (junction != null) {
                    delete junction;
                }
            }
            // Handle deletion for normal account
            else if (String.isNotBlank(accountId)) {
                Account acc = [SELECT Id FROM Account WHERE Id = :accountId LIMIT 1];
                if (acc != null) {
                    delete acc;
                }
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting sperm bank: ' + e.getMessage());
        }
    }
    
    // Delete Clinic
    @AuraEnabled
    public static void deleteClinic(String donorId, String accountId, String junctionId, String pmcjunctionId) {
        try {
            // Handle deletion for junction object (primaryBanksListFromApex)
            if (String.isNotBlank(pmcjunctionId)) {
                d21_Donor_Fertility_Clinic__c junction = [
                    SELECT Id 
                    FROM d21_Donor_Fertility_Clinic__c 
                    WHERE d21_Clinic__c = :pmcjunctionId
                    LIMIT 1
                ];
                if (junction != null) {
                    delete junction;
                }
            }
            // Handle deletion for normal account
            else if (String.isNotBlank(accountId)) {
                Account acc = [SELECT Id FROM Account WHERE Id = :accountId LIMIT 1];
                if (acc != null) {
                    delete acc;
                }
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting clinic: ' + e.getMessage());
        }
    }
    
    // Delete Recipient
    @AuraEnabled
    public static void deleteRecipient(String donorId, String accountId, String junctionId, String pmcjunctionId) {
        try {
            // Handle deletion for junction object (primaryBanksListFromApex)
            if (String.isNotBlank(pmcjunctionId)) {
                d21_Donor_Recipient__c junction = [
                    SELECT Id 
                    FROM d21_Donor_Recipient__c 
                    WHERE d21_Recipient__c = :pmcjunctionId
                    LIMIT 1
                ];
                if (junction != null) {
                    delete junction;
                }
            }
            // Handle deletion for normal account and associated contact
            else if (String.isNotBlank(accountId)) {
                Account acc = [SELECT Id FROM Account WHERE Id = :accountId LIMIT 1];
                List<Contact> contacts = [SELECT Id FROM Contact WHERE AccountId = :accountId LIMIT 1];
                if (acc != null) {
                    delete acc;
                }
                if (!contacts.isEmpty()) {
                    delete contacts[0];
                }
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting recipient: ' + e.getMessage());
        }
    }
    
    // Add Sperm Bank
    @AuraEnabled
    public static String addSpermBank(String donorId, String spermBankName, String phone, String coordinatorName, String website, String email) {
        try {
            // Validate required fields
            if (String.isBlank(donorId) || String.isBlank(spermBankName)) {
                throw new AuraHandledException('Donor ID and Sperm Bank Name are required.');
            }
            
            /* acc.Name = bank.name;
acc.Website = bank.website;
acc.Phone = bank.phone;
acc.d21_Email__c = bank.email;
acc.d21_Coordinator_Name__c = bank.coordinator;
acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Sperm Bank').getRecordTypeId();*/
            
            // Create new Account for the sperm bank
            Account newAccount = new Account(
                Name = spermBankName,
                Phone = phone,
                Website = website,
                d21_Email__c = email,
                d21_Coordinator_Name__c = coordinatorName
                // Assuming email is stored in a custom field or as a placeholder
            );
            insert newAccount;
            
            // Create junction record
            d21_Donor_Agency__c junction = new d21_Donor_Agency__c(
                d21_Egg_Donor__c = donorId,
                Agency__c = newAccount.Id
            );
            /* if (String.isNotBlank(coordinatorName)) {
junction.Coordinator_Name__c = coordinatorName; // Assuming custom field
}*/
            insert junction;
            
            return newAccount.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding sperm bank: ' + e.getMessage());
        }
    }
    
    // Edit Sperm Bank
    @AuraEnabled
    public static void editSpermBank(String accountId, String spermBankName, String phone, String coordinatorName, String website, String email) {
        try {
            // Validate inputs
            if (String.isBlank(accountId) || String.isBlank(spermBankName)) {
                throw new AuraHandledException('Account ID and Sperm Bank Name are required.');
            }
            
            // Fetch and update Account
            Account acc = [SELECT Id, Name, Phone, Website FROM Account WHERE Id = :accountId LIMIT 1];
            if (acc != null) {
                acc.Name = spermBankName;
                acc.Phone = phone;
                acc.Website = website;
                acc.d21_Email__c = email;
                acc.d21_Coordinator_Name__c = coordinatorName;
                update acc;
            }
            
            /* acc.Name = bank.name;
acc.Website = bank.website;
acc.Phone = bank.phone;
acc.d21_Email__c = bank.email;
acc.d21_Coordinator_Name__c = bank.coordinator;
acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Sperm Bank').getRecordTypeId();*/
            
            
            // Update junction record for coordinator name if needed
            /* List<d21_Donor_Recipient__c> junctions = [SELECT Id, Coordinator_Name__c FROM d21_Donor_Recipient__c WHERE Sperm__c = :accountId LIMIT 1];
if (!junctions.isEmpty()) {
junctions[0].Coordinator_Name__c = coordinatorName;
update junctions[0];
}*/
        } catch (Exception e) {
            throw new AuraHandledException('Error editing sperm bank: ' + e.getMessage());
        }
    }
    
    // Add Clinic
    @AuraEnabled
    public static String addClinic(String donorId, String clinicName, String phone, String coordinatorName, String website, String cityState, String email) {
        try {
            // Validate required fields
            if (String.isBlank(donorId) || String.isBlank(clinicName)) {
                throw new AuraHandledException('Donor ID and Clinic Name are required.');
            }
            /* acc.Name = clinic.name;
acc.Website = clinic.website;
acc.Phone = clinic.phone;
acc.d21_Email__c = clinic.email;
acc.d21_Coordinator_Name__c = clinic.coordinator;
acc.d21_Doctor_Name__c = clinic.doctorName;
acc.d21_City_State_Of_Clinic__c = clinic.cityState;*/
            
            
            // Create new Account for the clinic
            Account newAccount = new Account(
                Name = clinicName,
                Phone = phone,
                Website = website,
                d21_City_State_Of_Clinic__c = cityState,
                d21_Email__c = email,
                d21_Coordinator_Name__c = coordinatorName
                // Assuming email as placeholder
            );
            insert newAccount;
            
            // Create junction record
            d21_Donor_Fertility_Clinic__c junction = new d21_Donor_Fertility_Clinic__c(
                d21_Donor__c = donorId,
                d21_Clinic__c = newAccount.Id
            );
            /* if (String.isNotBlank(coordinatorName)) {
junction.Coordinator_Name__c = coordinatorName; // Assuming custom field
}*/
            insert junction;
            
            return newAccount.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding clinic: ' + e.getMessage());
        }
    }
    
    // Edit Clinic
    @AuraEnabled
    public static void editClinic(String accountId, String clinicName, String phone, String coordinatorName, String website, String cityState, String email) {
        try {
            // Validate inputs
            if (String.isBlank(accountId) || String.isBlank(clinicName)) {
                throw new AuraHandledException('Account ID and Clinic Name are required.');
            }
            
            
            /*acc.Name = clinic.name;
acc.Website = clinic.website;
acc.Phone = clinic.phone;
acc.d21_Email__c = clinic.email;
acc.d21_Coordinator_Name__c = clinic.coordinator;
acc.d21_Doctor_Name__c = clinic.doctorName;
acc.d21_City_State_Of_Clinic__c = clinic.cityState;*/
            
            // Fetch and update Account
            Account acc = [SELECT Id, Name, Phone, Website, BillingCity FROM Account WHERE Id = :accountId LIMIT 1];
            if (acc != null) {
                acc.Name = clinicName;
                acc.Phone = phone;
                acc.Website = website;
                acc.d21_City_State_Of_Clinic__c = cityState;
                acc.d21_Email__c = email;
                acc.d21_Coordinator_Name__c = coordinatorName;
                // Assuming email is stored in a custom field
                update acc;
            }
            
            // Update junction record for coordinator name if needed
            List<d21_Donor_Fertility_Clinic__c> junctions = [SELECT Id FROM d21_Donor_Fertility_Clinic__c WHERE d21_Clinic__c = :accountId LIMIT 1];
            if (!junctions.isEmpty()) {
                // junctions[0].Coordinator_Name__c = coordinatorName;
                update junctions[0];
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error editing clinic: ' + e.getMessage());
        }
    }
    
    // Add Recipient
    @AuraEnabled
    public static String addRecipient(String donorId, String firstName, String lastName, String phone, String email, String additionalInfo) {
        try {
            // Validate required fields
            if (String.isBlank(donorId) || String.isBlank(lastName)) {
                throw new AuraHandledException('Donor ID and Recipient Last Name are required.');
            }
            
            // Create new Account for the recipient
            Account newAccount = new Account(
                Name = (String.isNotBlank(firstName) ? firstName + ' ' : '') + lastName,
                Phone = phone
                // Email and additionalInfo may need custom fields
            );
            insert newAccount;
            
            // Create new Contact for the recipient
            Contact newContact = new Contact(
                FirstName = firstName,
                LastName = lastName,
                Phone = phone,
                Email = email,
                AccountId = newAccount.Id,
                Description = additionalInfo // Assuming additionalInfo maps to Description
            );
            insert newContact;
            
            // Create junction record
            d21_Donor_Recipient__c junction = new d21_Donor_Recipient__c(
                d21_Contact__c = donorId,
                d21_Recipient__c = newAccount.Id
            );
            insert junction;
            
            return newAccount.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding recipient: ' + e.getMessage());
        }
    }
    
    // Edit Recipient
    @AuraEnabled
    public static void editRecipient(String accountId, String firstName, String lastName, String phone, String email, String additionalInfo) {
        try {
            // Validate inputs
            if (String.isBlank(accountId) || String.isBlank(lastName)) {
                throw new AuraHandledException('Account ID and Recipient Last Name are required.');
            }
            
            // Fetch and update Account
            Account acc = [SELECT Id, Name, Phone FROM Account WHERE Id = :accountId LIMIT 1];
            if (acc != null) {
                acc.Name = (String.isNotBlank(firstName) ? firstName + ' ' : '') + lastName;
                acc.Phone = phone;
                update acc;
            }
            
            // Fetch and update Contact
            List<Contact> contacts = [SELECT Id, FirstName, LastName, Phone, Email, Description FROM Contact WHERE AccountId = :accountId LIMIT 1];
            if (!contacts.isEmpty()) {
                Contact con = contacts[0];
                con.FirstName = firstName;
                con.LastName = lastName;
                con.Phone = phone;
                con.Email = email;
                con.Description = additionalInfo;
                update con;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error editing recipient: ' + e.getMessage());
        }       
    }
}