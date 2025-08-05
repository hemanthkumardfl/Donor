public without sharing class DonorPreRegHippaController2222 {
        
    @AuraEnabled
    public static hipaaWrapper spermDonor(String donorId) {
        hipaaWrapper hipaaWrapperlist = new hipaaWrapper();
        
        List<d21_Donor_Agency__c> Agencyjunctionlist = [
            SELECT Id, d21_Egg_Donor__c, Agency__r.Name, Agency__c, Agency__r.Phone,d21_isExisting__c, 
            Agency__r.d21_Coordinator_Name__c, Agency__r.Website, Agency__r.d21_Email__c 
            FROM d21_Donor_Agency__c 
            WHERE d21_Egg_Donor__c = :donorId AND Agency__c != null
        ];
        
        Set<Id> spermIds = new Set<Id>();
        for (d21_Donor_Agency__c agencyJunction : Agencyjunctionlist) {
            spermIds.add(agencyJunction.Agency__c);
        }
        List<d21_PMC__c> spermpmcList = [
            SELECT Id, Name, d21_Sperm_Bank__c 
            FROM d21_PMC__c 
            WHERE d21_Sperm_Bank__c IN : spermIds
        ];
        
        // Create a map of Agency Id to PMC Name
        Map<Id, String> agencyToPmcMap = new Map<Id, String>();
        for (d21_PMC__c spermpmc : spermpmcList) {
            agencyToPmcMap.put(spermpmc.d21_Sperm_Bank__c, spermpmc.Name);
        }
        
        List<Agency> spermlist = new List<Agency>();
        for (d21_Donor_Agency__c agencyJunction : Agencyjunctionlist) {
            Agency a = new Agency();
            a.Id = agencyJunction.Agency__c;
            a.Name = agencyJunction.Agency__r.Name;
            a.Phone = agencyJunction.Agency__r.Phone;
            a.coordinatorName = agencyJunction.Agency__r.d21_Coordinator_Name__c;
            a.website = agencyJunction.Agency__r.Website;
            a.email = agencyJunction.Agency__r.d21_Email__c;
            a.pmcNumber = agencyToPmcMap.get(agencyJunction.Agency__c); 
            a.isEditable = String.isBlank(a.pmcNumber); 
            spermlist.add(a);
        }
        hipaaWrapperlist.spermlist = spermlist;
        
        
        Set<Id> agencyIds = new Set<Id>();
        for (d21_Donor_Agency__c agencyJunction : Agencyjunctionlist) {
            agencyIds.add(agencyJunction.Agency__c);
        }
        List<d21_PMC__c> pmcList = [
            SELECT Id, Name, d21_Agency__c 
            FROM d21_PMC__c 
            WHERE d21_Agency__c IN : agencyIds
        ];
        
        // Create a map of Agency Id to PMC Name
        Map<Id, String> spermToPmcMap = new Map<Id, String>();
        for (d21_PMC__c pmc : pmcList) {
            spermToPmcMap.put(pmc.d21_Agency__c, pmc.Name);
        }
        
        List<Agency> Agencylist = new List<Agency>();
        for (d21_Donor_Agency__c agencyJunction : Agencyjunctionlist) {
            Agency a = new Agency();
            a.Id = agencyJunction.Agency__c;
            a.Name = agencyJunction.Agency__r.Name;
            a.Phone = agencyJunction.Agency__r.Phone;
            a.coordinatorName = agencyJunction.Agency__r.d21_Coordinator_Name__c;
            a.website = agencyJunction.Agency__r.Website;
            a.email = agencyJunction.Agency__r.d21_Email__c;
            a.pmcNumber = agencyToPmcMap.get(agencyJunction.Agency__c); 
            a.isEditable = String.isBlank(a.pmcNumber); 
            Agencylist.add(a);
        }
        hipaaWrapperlist.Agencylist = Agencylist;
        
        // Rest of the method remains unchanged
        List<d21_Donor_Fertility_Clinic__c> Clinicjunctionlist = [
            SELECT Id, d21_Clinic__c, d21_Clinic__r.Name, d21_Donor__c, d21_Clinic__r.Phone,
            d21_Clinic__r.d21_Coordinator_Name__c, d21_Clinic__r.Website, 
            d21_Clinic__r.BillingCity, d21_Clinic__r.d21_Email__c 
            FROM d21_Donor_Fertility_Clinic__c 
            WHERE d21_Donor__c = :donorId AND d21_Clinic__c != null
        ];
        List<d21_Donor_Fertility_Attorney__c> Attorneyjunctionlist = [
            SELECT Id, d21_Donor__c, d21_Attorney__c, d21_Attorney__r.Name, d21_Attorney__r.Email, 
            d21_Attorney__r.Phone, d21_Attorney__r.MailingState, d21_Attorney__r.LastName
            FROM d21_Donor_Fertility_Attorney__c 
            WHERE d21_Donor__c = :donorId AND d21_Attorney__c != null
        ];
        List<d21_Donor_Recipient__c> RecipientjunctionList = [
            SELECT Id, d21_Contact__c, d21_Recipient__c, d21_Recipient__r.Name
            FROM d21_Donor_Recipient__c 
            WHERE d21_Contact__c = :donorId AND d21_Recipient__c != null
        ];
        
        parentdetail parent = new parentdetail();
        Contact con = [SELECT FirstName, LastName, d21_Date_Of_Birth__c, MailingState, MailingCity, 
                       MailingStreet, MailingPostalCode, Phone, Email 
                       FROM Contact WHERE Id = :donorId LIMIT 1];
        parent.fristName = con.FirstName;
        parent.Id = con.Id;
        parent.lastName = con.LastName;
        parent.dob = String.valueOf(con.d21_Date_Of_Birth__c);
        parent.email = con.Email;
        parent.phone = con.Phone;
        parent.address = con.MailingState + ',' + con.MailingCity + ',' + con.MailingStreet + ',' + con.MailingPostalCode;
        parent.state = con.MailingState;
        parent.street = con.MailingStreet;
        parent.pincode = con.MailingPostalCode;
        parent.city = con.MailingCity;
        hipaaWrapperlist.parentdetails = parent;
        
         Set<Id> clinicIds = new Set<Id>();
        for (d21_Donor_Fertility_Clinic__c clinicJunction : Clinicjunctionlist) {
            clinicIds.add(clinicJunction.d21_Clinic__c);
        }
        List<d21_PMC__c> clinicPmcList = [
            SELECT Id, Name, d21_Clinic__c 
            FROM d21_PMC__c 
            WHERE d21_Clinic__c IN :clinicIds
        ];
        
        // Create a map of Clinic Id to PMC Name
        Map<Id, String> clinicToPmcMap = new Map<Id, String>();
        for (d21_PMC__c pmc : clinicPmcList) {
            clinicToPmcMap.put(pmc.d21_Clinic__c, pmc.Name);
        }
        
        List<Clinic> Cliniclist = new List<Clinic>();
        for (d21_Donor_Fertility_Clinic__c clinicJunction : Clinicjunctionlist) {
            Clinic c = new Clinic();
            c.Name = clinicJunction.d21_Clinic__r.Name;
            c.Id = clinicJunction.d21_Clinic__c;
            c.Phone = clinicJunction.d21_Clinic__r.Phone;
            c.coordinatorName = clinicJunction.d21_Clinic__r.d21_Coordinator_Name__c;
            c.website = clinicJunction.d21_Clinic__r.Website;
            c.cityState = clinicJunction.d21_Clinic__r.BillingCity;
            c.email = clinicJunction.d21_Clinic__r.d21_Email__c;
            c.pmcNumber = clinicToPmcMap.get(clinicJunction.d21_Clinic__c);
            c.isEditable = String.isBlank(c.pmcNumber);
            Cliniclist.add(c);
        }
        hipaaWrapperlist.Cliniclist = Cliniclist;
        
        
        // Query PMC records related to Attorneys
        Set<Id> attorneyIds = new Set<Id>();
        for (d21_Donor_Fertility_Attorney__c attorneyJunction : Attorneyjunctionlist) {
            attorneyIds.add(attorneyJunction.d21_Attorney__c);
        }
        List<d21_PMC__c> attorneyPmcList = [
            SELECT Id, Name, d21_Attorney__c 
            FROM d21_PMC__c 
            WHERE d21_Attorney__c IN :attorneyIds
        ];
        
        // Create a map of Attorney Id to PMC Name
        Map<Id, String> attorneyToPmcMap = new Map<Id, String>();
        for (d21_PMC__c pmc : attorneyPmcList) {
            attorneyToPmcMap.put(pmc.d21_Attorney__c, pmc.Name);
        }
        
        List<Attorney> Attorneylist = new List<Attorney>();
        if (!Attorneyjunctionlist.isEmpty()) {
            d21_Donor_Fertility_Attorney__c junction = Attorneyjunctionlist[0];
            Attorney at = new Attorney();
            at.Id = junction.d21_Attorney__c;
            at.lawFirm = '';
            at.Phone = junction.d21_Attorney__r.Phone;
            at.email = junction.d21_Attorney__r.Email;
            at.cityState = junction.d21_Attorney__r.MailingState;
            at.Name = junction.d21_Attorney__r.LastName;
            at.website = '';
            at.pmcNumber = attorneyToPmcMap.get(junction.d21_Attorney__c);
            at.isEditable = String.isBlank(at.pmcNumber);
            Attorneylist.add(at);
        }
        hipaaWrapperlist.Attorneylist = Attorneylist;
        
        List<Recipient> Recipientlist = new List<Recipient>();
        Recipient recp = new Recipient();
        if (!RecipientjunctionList.isEmpty()) {
            d21_Donor_Recipient__c junction = RecipientjunctionList[0];
            recp.Id = junction.d21_Recipient__c;
            recp.fristName = junction.d21_Recipient__r.Name;
            
            List<Contact> contList = [
                SELECT Id, Name, Phone, Email, LastName, d21_Additional_Information__c
                FROM Contact
                WHERE AccountId = :junction.d21_Recipient__c
                LIMIT 1
            ];
            
            if (!contList.isEmpty()) {
                Contact cont = contList[0];
                recp.Phone = cont.Phone;
                recp.email = cont.Email;
                recp.lastName = cont.LastName;
                recp.additionalInfo = cont.d21_Additional_Information__c;
            } else {
                recp.Phone = '';
                recp.email = '';
                recp.lastName = '';
                recp.additionalInfo = '';
            }
            Recipientlist.add(recp);
system.debug('Recipientlist>>>>>>>>>>>>>'+Recipientlist);
        }
        hipaaWrapperlist.Recipientlist = Recipientlist;
        
        return hipaaWrapperlist;
    }
    
    // Update Agency class to include pmcNumber and isEditable
    public class Agency {
        @AuraEnabled public String Id;
        @AuraEnabled public String Name;
        @AuraEnabled public String Phone;
        @AuraEnabled public String coordinatorName;
        @AuraEnabled public String website;
        @AuraEnabled public String email;
        @AuraEnabled public String pmcNumber; // New field for PMC number
        @AuraEnabled public Boolean isEditable; // New field to control editability
    }
    
    // Rest of the classes remain unchanged
    public class hipaaWrapper {
         @AuraEnabled public List<Agency> spermlist;
        @AuraEnabled public List<Agency> Agencylist;
        @AuraEnabled public List<Clinic> Cliniclist;
        @AuraEnabled public List<Attorney> Attorneylist;
        @AuraEnabled public List<Recipient> Recipientlist;
        @AuraEnabled public parentdetail parentdetails;
    }
    
    public class Clinic {
        @AuraEnabled public String Id;
        @AuraEnabled public String Name;
        @AuraEnabled public String Phone;
        @AuraEnabled public String coordinatorName;
        @AuraEnabled public String website;
        @AuraEnabled public String email;
        @AuraEnabled public String cityState;
        @AuraEnabled public String pmcNumber;
        @AuraEnabled public Boolean isEditable;
    }
    
    public class Attorney {
        @AuraEnabled public String Id;
        @AuraEnabled public String Name;
        @AuraEnabled public String Phone;
        @AuraEnabled public String website;
        @AuraEnabled public String email;
        @AuraEnabled public String cityState;
        @AuraEnabled public String lawFirm;
        @AuraEnabled public String pmcNumber;
        @AuraEnabled public Boolean isEditable;
    }
    
    public class Recipient {
        @AuraEnabled public String Id;
        @AuraEnabled public String fristName;
        @AuraEnabled public String lastName;
        @AuraEnabled public String Phone;
        @AuraEnabled public String email;
        @AuraEnabled public String additionalInfo;
        @AuraEnabled public String pmcNumber;
        @AuraEnabled public Boolean isEditable;
    }
    
    public class parentdetail {
        @AuraEnabled public String Id;
        @AuraEnabled public String fristName;
        @AuraEnabled public String lastName;
        @AuraEnabled public String dob;
        @AuraEnabled public String email;
        @AuraEnabled public String phone;
        @AuraEnabled public String address;
        @AuraEnabled public String city;
        @AuraEnabled public String state;
        @AuraEnabled public String street;
        @AuraEnabled public String pincode;
    }
    @AuraEnabled
    public static void updateDonorName(String donorId, String firstName, String lastName, String dob,string city,string street,string pincode,string state) {
        try {
            if (String.isBlank(donorId)) {
                throw new AuraHandledException('Donor ID is required.');
            }
            if (String.isNotBlank(dob)) {
                Date dobDate = Date.valueOf(dob);
                Date today = Date.today();
                if (dobDate > today) {
                    throw new AuraHandledException('Date of Birth cannot be in the future.');
                }
                Integer age = today.year() - dobDate.year();
                if (today.month() < dobDate.month() || (today.month() == dobDate.month() && today.day() < dobDate.day())) {
                    age--;
                }
                if (age < 18) {
                    throw new AuraHandledException('Donor must be at least 18 years old.');
                }
            }
            Contact donorContact = [SELECT Id, FirstName, LastName, d21_Date_Of_Birth__c FROM Contact WHERE Id = :donorId LIMIT 1];
            if (donorContact == null) {
                throw new AuraHandledException('Contact not found for the provided Donor ID.');
            }
            donorContact.FirstName = firstName;
            donorContact.LastName = lastName;
            donorContact.MailingCity = city;
            donorContact.MailingStreet = street;
            donorContact.MailingPostalCode = pincode;
             donorContact.MailingState = state;
            if (String.isNotBlank(dob)) {
                donorContact.d21_Date_Of_Birth__c = Date.valueOf(dob);
            }
            update donorContact;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating donor information: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void savePDFToContact(String contactId, String pdfBase64, String fileName) {
        try {
            if (String.isBlank(contactId)) {
                throw new AuraHandledException('Contact ID is required.');
            }
            
            Blob pdfBlob = EncodingUtil.base64Decode(pdfBase64);
            
            ContentVersion cv = new ContentVersion();
            cv.Title = fileName;
            cv.PathOnClient = fileName;
            cv.VersionData = pdfBlob;
            cv.FirstPublishLocationId = contactId;
            cv.IsMajorVersion = true;
            
            insert cv;
        } catch (Exception e) {
            throw new AuraHandledException('Error saving PDF: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void deleteSpermBank(String donorId, String recordId) {
         system.debug('donorId>>>>>>>>>'+donorId+'spermBankId>>>>>>>>>>>'+recordId);
        try {
            if (String.isBlank(donorId) || String.isBlank(recordId)) {
                throw new AuraHandledException('Donor ID and Sperm Bank ID are required.');
            }
            List<d21_Donor_Agency__c> junction = [
                SELECT Id 
                FROM d21_Donor_Agency__c 
                WHERE d21_Egg_Donor__c = :donorId AND Agency__c = :recordId
                LIMIT 1
            ];
            if (!junction.isEmpty()) {
                delete junction[0];
            } else {
                throw new AuraHandledException('No matching sperm bank junction record found.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting sperm bank: ' + e.getMessage());
        }
    }
    
 
/*public static String addlookupSpermBank(String donorId, String spermBankId) {
    system.debug('donorId>>>>>>>>>'+donorId+'spermBankId>>>>>>>>>>>'+spermBankId);
    try {
        if (String.isBlank(donorId) || String.isBlank(spermBankId)) {
            throw new AuraHandledException('Donor ID and Sperm Bank ID are required.');
        }
        List<d21_Donor_Agency__c> existingJunction = [
            SELECT Id 
            FROM d21_Donor_Agency__c 
            WHERE d21_Egg_Donor__c = :donorId AND Agency__c = :spermBankId
            LIMIT 1
        ];
        if (existingJunction.isEmpty()) {
            d21_Donor_Agency__c newJunction = new d21_Donor_Agency__c(
                d21_Egg_Donor__c = donorId,
                Agency__c = spermBankId
            );
            insert newJunction;
            return newJunction.Id;
        } else {
            throw new AuraHandledException('Sperm bank already linked to this donor.');
        }
    } catch (Exception e) {
        throw new AuraHandledException('Error adding sperm bank: ' + e.getMessage());
    }
}*/
    @AuraEnabled
public static String addlookupSpermBank(
    String donorId,
    String spermBankId,
    String coordinatorId,
    String coordinatorFirstName,
    String coordinatorLastName,
    String coordinatorPhone,
    String coordinatorName
) {
    System.debug('donorId: ' + donorId + ', spermBankId: ' + spermBankId + ', coordinatorId: ' + coordinatorId + ', coordinatorFirstName: ' + coordinatorFirstName);
    
    try {
        // Validate required fields
        if (String.isBlank(donorId) || String.isBlank(spermBankId)) {
            throw new AuraHandledException('Donor ID and Sperm Bank ID are required.');
        }

        if (String.isBlank(coordinatorId) && String.isBlank(coordinatorFirstName) && !String.isBlank(coordinatorName)) {
            throw new AuraHandledException('Coordinator first name is required when adding a new coordinator.');
        }

        // Verify Sperm Bank (Account) exists with the correct record type
        Id spermBankRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('d21_Sperm_Bank').getRecordTypeId();
        
        Account spermBank = [
            SELECT Id, Name,  d21_Coordinator_Name__c
            FROM Account
            WHERE Id = :spermBankId 
            LIMIT 1
        ];

        // Create a new Coordinator Contact if ID not provided
        if (String.isBlank(coordinatorId) && !String.isBlank(coordinatorFirstName)) {
            Contact newCoordinator = new Contact(
                FirstName = coordinatorFirstName,
                LastName = String.isBlank(coordinatorLastName) ? 'Coordinator' : coordinatorLastName,
                Phone = coordinatorPhone,
                AccountId = spermBank.Id
            );
            insert newCoordinator;
            coordinatorId = newCoordinator.Id;
        }

        // Update Sperm Bank Account with coordinator info
        /*if (!String.isBlank(coordinatorId)) {
            spermBank.d21_Coordinator__c = coordinatorId;
            if (!String.isBlank(coordinatorName)) {
                spermBank.d21_Coordinator_Name__c = coordinatorName;
            }*/
            update spermBank;
        

        // Check if junction already exists
        List<d21_Donor_Agency__c> existingLinks = [
            SELECT Id
            FROM d21_Donor_Agency__c
            WHERE d21_Egg_Donor__c = :donorId AND Agency__c = :spermBankId
            LIMIT 1
        ];

        if (existingLinks.isEmpty()) {
            d21_Donor_Agency__c link = new d21_Donor_Agency__c(
                d21_Egg_Donor__c = donorId,
                Agency__c = spermBank.Id
            );
            insert link;
            return link.Id;
        } else {
            throw new AuraHandledException('Sperm bank already linked to this donor.');
        }

    } catch (Exception e) {
        throw new AuraHandledException('Error adding sperm bank: ' + e.getMessage());
    }
}

    
    @AuraEnabled
    public static void deleteAgency(String donorId, String recordId) {
        try {
            if (String.isBlank(donorId) || String.isBlank(recordId)) {
                throw new AuraHandledException('Donor ID and Agency ID are required.');
            }
            List<d21_Donor_Agency__c> junction = [
                SELECT Id 
                FROM d21_Donor_Agency__c 
                WHERE d21_Egg_Donor__c = :donorId AND Agency__c = :recordId
                LIMIT 1
            ];
            if (!junction.isEmpty()) {
                delete junction[0];
            } else {
                throw new AuraHandledException('No matching agency junction record found.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting agency: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void deleteClinic(String donorId, String recordId) {
        try {
            if (String.isBlank(donorId) || String.isBlank(recordId)) {
                throw new AuraHandledException('Donor ID and Clinic ID are required.');
            }
            List<d21_Donor_Fertility_Clinic__c> junction = [
                SELECT Id 
                FROM d21_Donor_Fertility_Clinic__c 
                WHERE d21_Donor__c = :donorId AND d21_Clinic__c = :recordId
                LIMIT 1
            ];
            if (!junction.isEmpty()) {
                delete junction[0];
            } else {
                throw new AuraHandledException('No matching clinic junction record found.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting clinic: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void deleteAttorney(String donorId, String recordId) {
        try {
            if (String.isBlank(donorId) || String.isBlank(recordId)) {
                throw new AuraHandledException('Donor ID and Attorney ID are required.');
            }
            List<d21_Donor_Fertility_Attorney__c> junction = [
                SELECT Id 
                FROM d21_Donor_Fertility_Attorney__c 
                WHERE d21_Donor__c = :donorId AND d21_Attorney__c = :recordId
                LIMIT 1
            ];
            if (!junction.isEmpty()) {
                delete junction[0];
            } else {
                throw new AuraHandledException('No matching attorney junction record found.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting attorney: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void deleteRecipient(String donorId, String recordId) {
        try {
            if (String.isBlank(donorId) || String.isBlank(recordId)) {
                throw new AuraHandledException('Donor ID and Recipient ID are required.');
            }
            List<d21_Donor_Recipient__c> junction = [
                SELECT Id 
                FROM d21_Donor_Recipient__c 
                WHERE d21_Contact__c = :donorId AND d21_Recipient__c = :recordId
                LIMIT 1
            ];
            if (!junction.isEmpty()) {
                delete junction[0];
            } else {
                throw new AuraHandledException('No matching recipient junction record found.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting recipient: ' + e.getMessage());
        }
    }
    
  /*  @AuraEnabled
    public static String addSpermBank(String donorId, String spermBankName, String phone, String coordinatorName, String website, String email) {
        try {
            if (String.isBlank(donorId) || String.isBlank(spermBankName)) {
                throw new AuraHandledException('Donor ID and Sperm Bank Name are required.');
            }
            Id accountRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('d21_Sperm_Bank').getRecordTypeId();
            Account spermBank = new Account( 
                Name = spermBankName,
                RecordTypeId = accountRecordTypeId,
                Phone = phone,
                d21_Coordinator_Name__c = coordinatorName,
                Website = website,
                d21_Email__c = email
            );
            insert spermBank;
            
            d21_Donor_Agency__c junction = new d21_Donor_Agency__c(
                d21_Egg_Donor__c = donorId,
                Agency__c = spermBank.Id
            );
            insert junction;
            
            return spermBank.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding sperm bank: ' + e.getMessage());
        }
    }*/
   @AuraEnabled  
public static String addSpermBank(String donorId, String spermBankName, String phone, String coordinatorName, String coordinatorId, String website, String email, String coordinatorFirstName, String coordinatorLastName, String coordinatorPhone) {
    try {
        // Validate required fields
        if (String.isBlank(donorId) || String.isBlank(spermBankName)) {
            throw new AuraHandledException('Donor ID and Sperm Bank Name are required.');
        }

        if (String.isBlank(coordinatorId) && String.isBlank(coordinatorFirstName) && !String.isBlank(coordinatorName)) {
            throw new AuraHandledException('Coordinator first name is required when adding a new coordinator.');
        }

        // Get the Sperm Bank record type ID
        Id accountRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('d21_Sperm_Bank').getRecordTypeId();

        // Create the Sperm Bank (Account) record
        Account spermBank = new Account(
            Name = spermBankName,
            RecordTypeId = accountRecordTypeId,
            Phone = phone,
            d21_Coordinator_Name__c = coordinatorName,
            Website = website,
            d21_Email__c = email
        );

        insert spermBank;

        // Create or associate Coordinator (Contact)
        if (String.isBlank(coordinatorId) && !String.isBlank(coordinatorFirstName)) {
            Contact coordinator = new Contact(
                FirstName = coordinatorFirstName,
                LastName = String.isBlank(coordinatorLastName) ? 'Coordinator' : coordinatorLastName,
                Phone = coordinatorPhone,
                AccountId = spermBank.Id // Relating Contact to Sperm Bank Account
            );
            insert coordinator;
        } else if (!String.isBlank(coordinatorId)) {
            // Optionally update coordinator's AccountId if not already set
            Contact existingCoordinator = [SELECT Id, AccountId FROM Contact WHERE Id = :coordinatorId LIMIT 1];
            if (existingCoordinator.AccountId == null) {
                existingCoordinator.AccountId = spermBank.Id;
                update existingCoordinator;
            }
        }

        // Create the junction object to link Donor and Sperm Bank
        d21_Donor_Agency__c junction = new d21_Donor_Agency__c(
            d21_Egg_Donor__c = donorId,
            Agency__c = spermBank.Id
        );
        insert junction;

        return spermBank.Id;

    } catch (Exception e) {
        throw new AuraHandledException('Error adding sperm bank: ' + e.getMessage());
    }
}

    
    @AuraEnabled
    public static String addAgency(String donorId, String agencyName, String phone, String coordinatorName, String website, String cityState, String email) {
        try {
            if (String.isBlank(donorId) || String.isBlank(agencyName)) {
                throw new AuraHandledException('Donor ID and Agency Name are required.');
            }
            Id accountRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('d21_Agency').getRecordTypeId();
            Account agency = new Account(
                Name = agencyName,
                RecordTypeId = accountRecordTypeId,
                Phone = phone,
                d21_Coordinator_Name__c = coordinatorName,
                Website = website,
                BillingCity = cityState,
                d21_Email__c = email
            );
            insert agency;
            
            d21_Donor_Agency__c junction = new d21_Donor_Agency__c(
                d21_Egg_Donor__c = donorId,
                Agency__c = agency.Id
            );
            insert junction;
            
            return agency.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding agency: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static String addClinic(String donorId, String clinicName, String phone, String coordinatorName, String website, String cityState, String email) {
        try {
            if (String.isBlank(donorId) || String.isBlank(clinicName)) {
                throw new AuraHandledException('Donor ID and Clinic Name are required.');
            }
            Account clinic = new Account(
                Name = clinicName,
                Phone = phone,
                d21_Coordinator_Name__c = coordinatorName,
                Website = website,
                BillingCity = cityState,
                d21_Email__c = email
            );
            insert clinic;
            
            d21_Donor_Fertility_Clinic__c junction = new d21_Donor_Fertility_Clinic__c(
                d21_Donor__c = donorId,
                d21_Clinic__c = clinic.Id
            );
            insert junction;
            
            return clinic.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding clinic: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static String addAttorney(String donorId, String attorneyName, String phone, String lawFirm, String website, String cityState, String email) {
        try {
            if (String.isBlank(donorId) || String.isBlank(attorneyName)) {
                throw new AuraHandledException('Donor ID and Attorney Name are required.');
            }
          //  Id accountRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('d21_Attorney').getRecordTypeId();
            Account attorney = new Account(
                Name = lawFirm,
                Website = website
            );
            insert attorney;
            
            Contact attcontact = new Contact(
                Phone = phone,
               // RecordTypeId = accountRecordTypeId,
                AccountId = attorney.Id,
                LastName = attorneyName,
                Email = email,
                MailingState = cityState
            );
            insert attcontact;
            
            d21_Donor_Fertility_Attorney__c junction = new d21_Donor_Fertility_Attorney__c(
                d21_Donor__c = donorId,
                d21_Attorney__c = attcontact.Id
            );
            insert junction;
            
            return attorney.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding attorney: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static String addRecipient(String donorId, String firstName, String lastName, String phone, String email, String additionalInfo) {
        try {
            if (String.isBlank(donorId) || String.isBlank(lastName)) {
                throw new AuraHandledException('Donor ID and Recipient Last Name are required.');
            }
            Id accountRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('Recipient').getRecordTypeId();
            Account recipientAccount = new Account(
                Name = String.isNotBlank(firstName) ? firstName + ' ' + lastName : lastName,
                RecordTypeId = accountRecordTypeId
            );
            insert recipientAccount;
            
            Contact recipientContact = new Contact(
                FirstName = firstName,
                LastName = lastName,
                AccountId = recipientAccount.Id,
                Phone = phone,
                Email = email,
                d21_Additional_Information__c = additionalInfo
            );
            insert recipientContact;
            
            d21_Donor_Recipient__c junction = new d21_Donor_Recipient__c(
                d21_Contact__c = donorId,
                d21_Recipient__c = recipientAccount.Id
            );
            insert junction;
            
            return recipientAccount.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding recipient: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void editSpermBank(String accountId, String spermBankName, String phone, String coordinatorName, String website, String email) {
        try {
            if (String.isBlank(accountId) || String.isBlank(spermBankName)) {
                throw new AuraHandledException('Sperm Bank ID and Name are required.');
            }
            Account spermBank = [
                SELECT Id, Name, Phone, d21_Coordinator_Name__c, Website, d21_Email__c 
                FROM Account 
                WHERE Id = :accountId 
                LIMIT 1
            ];
            spermBank.Name = spermBankName;
            spermBank.Phone = phone;
            spermBank.d21_Coordinator_Name__c = coordinatorName;
            spermBank.Website = website;
            spermBank.d21_Email__c = email;
            update spermBank;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating sperm bank: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void editAgency(String accountId, String agencyName, String phone, String coordinatorName, String website, String cityState, String email) {
        try {
            if (String.isBlank(accountId) || String.isBlank(agencyName)) {
                throw new AuraHandledException('Agency ID and Name are required.');
            }
            Account agency = [
                SELECT Id, Name, Phone, d21_Coordinator_Name__c, Website, BillingCity, d21_Email__c 
                FROM Account 
                WHERE Id = :accountId 
                LIMIT 1
            ];
            agency.Name = agencyName;
            agency.Phone = phone;
            agency.d21_Coordinator_Name__c = coordinatorName;
            agency.Website = website;
            agency.BillingCity = cityState;
            agency.d21_Email__c = email;
            update agency;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating agency: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void editClinic(String accountId, String clinicName, String phone, String coordinatorName, String website, String cityState, String email) {
        try {
            if (String.isBlank(accountId) || String.isBlank(clinicName)) {
                throw new AuraHandledException('Clinic ID and Name are required.');
            }
            Account clinic = [
                SELECT Id, Name, Phone, d21_Coordinator_Name__c, Website, BillingCity, d21_Email__c 
                FROM Account 
                WHERE Id = :accountId 
                LIMIT 1
            ];
            clinic.Name = clinicName;
            clinic.Phone = phone;
            clinic.d21_Coordinator_Name__c = coordinatorName;
            clinic.Website = website;
            clinic.BillingCity = cityState;
            clinic.d21_Email__c = email;
            update clinic;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating clinic: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void editAttorney(String accountId, String attorneyName, String phone, String lawFirm, String website, String cityState, String email) {
        try {
            if (String.isBlank(accountId) || String.isBlank(attorneyName)) {
                throw new AuraHandledException('Attorney ID and Name are required.');
            }
            /* Account attorney = [
SELECT Id, Name, Website 
FROM Account 
WHERE Id = :accountId 
LIMIT 1
];
attorney.Name = lawFirm;
attorney.Website = website;
update attorney;*/
            
            Contact attContact = [
                SELECT Id, Phone, Email, MailingState, LastName ,AccountId
                FROM Contact 
                WHERE id = :accountId 
                LIMIT 1
            ];
            attContact.Phone = phone;
            attContact.Email = email;
            attContact.MailingState = cityState;
            attContact.LastName = attorneyName;
            // attContact.Account_r.name = attorneyName;
            update attContact;
            
            if (attContact.AccountId != null) {
                Account acc = [
                    SELECT Id, Name, Website
                    FROM Account
                    WHERE Id = :attContact.AccountId
                    LIMIT 1
                ];
                
                if (!String.isBlank(lawFirm)) {
                    acc.Name = lawFirm;
                }
                
                acc.Website = website;
                update acc;
            }
            
        } catch (Exception e) {
            throw new AuraHandledException('Error updating attorney: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void editRecipient(String accountId, String firstName, String lastName, String phone, String email, String additionalInfo) {
        try {
            if (String.isBlank(accountId) || String.isBlank(lastName)) {
                throw new AuraHandledException('Recipient ID and Last Name are required.');
            }
            Account recipientAccount = [
                SELECT Id, Name 
                FROM Account 
                WHERE Id = :accountId 
                LIMIT 1
            ];
            recipientAccount.Name = String.isNotBlank(firstName) ? firstName + ' ' + lastName : lastName;
            update recipientAccount;
            
            Contact recipientContact = [
                SELECT Id, FirstName, LastName, Phone, Email, d21_Additional_Information__c 
                FROM Contact 
                WHERE AccountId = :accountId 
                LIMIT 1
            ];
            recipientContact.FirstName = firstName;
            recipientContact.LastName = lastName;
            recipientContact.Phone = phone;
            recipientContact.Email = email;
            recipientContact.d21_Additional_Information__c = additionalInfo;
            update recipientContact;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating recipient: ' + e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Agency> getSpermBanks() {
        List<Account> spermBankAccounts = [
            SELECT Id, Name, Phone, d21_Coordinator_Name__c, Website, d21_Email__c 
            FROM Account 
            WHERE RecordType.DeveloperName = 'd21_Sperm_Bank'
        ];
        
        List<Agency> spermBanks = new List<Agency>();
        for (Account acc : spermBankAccounts) {
            Agency a = new Agency();
            a.Id = acc.Id;
            a.Name = acc.Name;
            a.Phone = acc.Phone;
            a.coordinatorName = acc.d21_Coordinator_Name__c;
            a.website = acc.Website;
            a.email = acc.d21_Email__c;
            spermBanks.add(a);
        }
        return spermBanks;
    }
    
    
    @AuraEnabled
public static String addlookupClinic(
    String donorId,
    String clinicId,
    String coordinatorId,
    String coordinatorFirstName,
    String coordinatorLastName,
    String coordinatorPhone,
    String coordinatorName
) {
    try {
        // Validate required fields
        if (String.isBlank(donorId) || String.isBlank(clinicId)) {
            throw new AuraHandledException('Donor ID and Clinic ID are required.');
        }
        if (String.isBlank(coordinatorId) && String.isBlank(coordinatorFirstName) && String.isNotBlank(coordinatorName)) {
            throw new AuraHandledException('Coordinator first name is required when adding a new coordinator.');
        }

        // Verify Clinic (Account) exists with the correct record type
        Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('d21_Clinic').getRecordTypeId();
        Account clinic = [
            SELECT Id, Name, d21_Coordinator_Name__c, RecordTypeId
            FROM Account
            WHERE Id = :clinicId 
            LIMIT 1
        ];

        // Create a new Coordinator Contact if ID not provided
        if (String.isBlank(coordinatorId) && String.isNotBlank(coordinatorFirstName)) {
            Contact newCoordinator = new Contact(
                FirstName = coordinatorFirstName,
                LastName = String.isBlank(coordinatorLastName) ? 'Coordinator' : coordinatorLastName,
                Phone = coordinatorPhone,
                AccountId = clinic.Id
            );
            insert newCoordinator;
            coordinatorId = newCoordinator.Id;
        } else if (String.isNotBlank(coordinatorId)) {
            Contact existingCoordinator = [SELECT Id, AccountId FROM Contact WHERE Id = :coordinatorId LIMIT 1];
            if (existingCoordinator.AccountId == null) {
                existingCoordinator.AccountId = clinic.Id;
                update existingCoordinator;
            }
        }

        // Update Clinic Account with coordinator info if provided
        if (String.isNotBlank(coordinatorName)) {
            clinic.d21_Coordinator_Name__c = coordinatorName;
            update clinic;
        }

        // Check if junction already exists
        List<d21_Donor_Fertility_Clinic__c> existingLinks = [
            SELECT Id
            FROM d21_Donor_Fertility_Clinic__c
            WHERE d21_Donor__c = :donorId AND d21_Clinic__c = :clinicId
            LIMIT 1
        ];

        if (!existingLinks.isEmpty()) {
            throw new AuraHandledException('Clinic already linked to this donor.');
        }

        // Create junction record
        d21_Donor_Fertility_Clinic__c link = new d21_Donor_Fertility_Clinic__c(
            d21_Donor__c = donorId,
            d21_Clinic__c = clinic.Id
        );
        insert link;
        return link.Id;

    } catch (Exception e) {
        throw new AuraHandledException('Error adding clinic: ' + e.getMessage());
    }
}
    
 @AuraEnabled
public static String addlookupAgency(
    String donorId,
    String agencyId,
    String coordinatorId,
    String coordinatorFirstName,
    String coordinatorLastName,
    String coordinatorPhone,
    String coordinatorName
) {
    try {
        // Validate required fields
        if (String.isBlank(donorId) || String.isBlank(agencyId)) {
            throw new AuraHandledException('Donor ID and Agency ID are required.');
        }
        if (String.isBlank(coordinatorId) && String.isBlank(coordinatorFirstName) && String.isNotBlank(coordinatorName)) {
            throw new AuraHandledException('Coordinator first name is required when adding a new coordinator.');
        }

        // Verify Agency (Account) exists with the correct record type
        Id agencyRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('d21_Agency').getRecordTypeId();
        Account agency = [
            SELECT Id, Name, d21_Coordinator_Name__c, RecordTypeId
            FROM Account
            WHERE Id = :agencyId 
            LIMIT 1
        ];
        
        if (agency.RecordTypeId != agencyRecordTypeId) {
            throw new AuraHandledException('Invalid Agency ID: Account is not of Agency record type.');
        }

        // Create a new Coordinator Contact if ID not provided
        if (String.isBlank(coordinatorId) && String.isNotBlank(coordinatorFirstName)) {
            Contact newCoordinator = new Contact(
                FirstName = coordinatorFirstName,
                LastName = String.isBlank(coordinatorLastName) ? 'Coordinator' : coordinatorLastName,
                Phone = coordinatorPhone,
                AccountId = agency.Id
            );
            insert newCoordinator;
            coordinatorId = newCoordinator.Id;
        } else if (String.isNotBlank(coordinatorId)) {
            // Update existing coordinator's AccountId if not set
            Contact existingCoordinator = [SELECT Id, AccountId FROM Contact WHERE Id = :coordinatorId LIMIT 1];
            if (existingCoordinator.AccountId == null) {
                existingCoordinator.AccountId = agency.Id;
                update existingCoordinator;
            }
        }

        // Update Agency Account with coordinator info if provided
        if (String.isNotBlank(coordinatorName)) {
            agency.d21_Coordinator_Name__c = coordinatorName;
            update agency;
        }

        // Check if junction already exists
        List<d21_Donor_Agency__c> existingLinks = [
            SELECT Id
            FROM d21_Donor_Agency__c
            WHERE d21_Egg_Donor__c = :donorId AND Agency__c = :agencyId
            LIMIT 1
        ];

        if (!existingLinks.isEmpty()) {
            throw new AuraHandledException('Agency already linked to this donor.');
        }

        // Create junction record
        d21_Donor_Agency__c link = new d21_Donor_Agency__c(
            d21_Egg_Donor__c = donorId,
            Agency__c = agency.Id
        );
        insert link;
        return link.Id;

    } catch (Exception e) {
        throw new AuraHandledException('Error adding agency: ' + e.getMessage());
    }
}   
    
}