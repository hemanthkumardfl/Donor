public with sharing class HipAAUtilityClass {
    @AuraEnabled
    public static hipaaWrapper spermDonor(String donorId) {
        hipaaWrapper hipaaWrapperlist = new hipaaWrapper();
        
        // Query Cycles
        Map<String, String> cycleMap = new Map<String, String>();
        List<d21_Cycle__c> fetchCycleList = [
            SELECT Id, Name, d21_Donor__c, d21_Agency__c, d21_Clinic__c, d21_Attorney__c, Recipient__c
            FROM d21_Cycle__c
            WHERE d21_Donor__c = :donorId
            WITH SYSTEM_MODE
        ];
        for (d21_Cycle__c cycle : fetchCycleList) {
            cycleMap.put(cycle.Name, cycle.Id);
        }

        // Sperm Banks
        List<d21_Donor_Agency__c> spermJunctionList = [
            SELECT Id, d21_Egg_Donor__c, Agency__c, Agency__r.Name, Agency__r.Phone, d21_isExisting__c,
                   Agency__r.d21_Coordinator_Name__c, Agency__r.Website, Agency__r.d21_Email__c,
                   d21_Donor_Code__c, d21_Know_Donor_Code__c
            FROM d21_Donor_Agency__c
            WHERE d21_Egg_Donor__c = :donorId AND Agency__c != null
            AND Agency__r.RecordType.DeveloperName = 'd21_Sperm_Bank'
            WITH SYSTEM_MODE
        ];
        
        Set<Id> spermIds = new Set<Id>();
        for (d21_Donor_Agency__c junction : spermJunctionList) {
            spermIds.add(junction.Agency__c);
        }
        List<d21_PMC__c> spermPmcList = [
            SELECT Id, Name, d21_Sperm_Bank__c
            FROM d21_PMC__c
            WHERE d21_Sperm_Bank__c IN :spermIds
            WITH SYSTEM_MODE
        ];
        Map<Id, String> spermToPmcMap = new Map<Id, String>();
        for (d21_PMC__c pmc : spermPmcList) {
            spermToPmcMap.put(pmc.d21_Sperm_Bank__c, pmc.Name);
        }

        List<Agency> spermlist = new List<Agency>();
        for (d21_Donor_Agency__c junction : spermJunctionList) {
            Agency a = new Agency();
            a.Id = junction.Agency__c;
            a.Name = junction.Agency__r.Name;
            a.Phone = junction.Agency__r.Phone;
            a.coordinatorName = junction.Agency__r.d21_Coordinator_Name__c;
            a.website = junction.Agency__r.Website;
            a.email = junction.Agency__r.d21_Email__c;
            a.pmcNumber = spermToPmcMap.get(junction.Agency__c);
            a.isEditable = String.isBlank(a.pmcNumber);
            a.donorCode = junction.d21_Donor_Code__c;
            a.knowDonorCode = junction.d21_Know_Donor_Code__c;
            a.cycles = new List<String>();
            for (d21_Cycle__c cycle : fetchCycleList) {
                if (cycle.d21_Agency__c == junction.Agency__c) {
                    a.cycles.add(cycle.Name.replace('Cycle ', ''));
                }
            }
            if (a.coordinatorId != null) {
                Contact coordinator = [SELECT FirstName, LastName, Phone FROM Contact WHERE Id = :a.coordinatorId LIMIT 1];
                a.coordinatorFirstName = coordinator.FirstName;
                a.coordinatorLastName = coordinator.LastName;
                a.coordinatorPhone = coordinator.Phone;
            }
            spermlist.add(a);
        }
        hipaaWrapperlist.spermlist = spermlist;

        // Agencies
        List<d21_Donor_Agency__c> agencyJunctionList = [
            SELECT Id, d21_Egg_Donor__c, Agency__c, Agency__r.Name, Agency__r.Phone, d21_isExisting__c,
                   Agency__r.d21_Coordinator_Name__c, Agency__r.Website, Agency__r.d21_Email__c,
                   d21_Donor_Code__c, d21_Know_Donor_Code__c
            FROM d21_Donor_Agency__c
            WHERE d21_Egg_Donor__c = :donorId AND Agency__c != null
            AND Agency__r.RecordType.DeveloperName = 'd21_Agency'
            WITH SYSTEM_MODE
        ];
        
        Set<Id> agencyIds = new Set<Id>();
        for (d21_Donor_Agency__c junction : agencyJunctionList) {
            agencyIds.add(junction.Agency__c);
        }
        List<d21_PMC__c> agencyPmcList = [
            SELECT Id, Name, d21_Agency__c
            FROM d21_PMC__c
            WHERE d21_Agency__c IN :agencyIds
            WITH SYSTEM_MODE
        ];
        Map<Id, String> agencyToPmcMap = new Map<Id, String>();
        for (d21_PMC__c pmc : agencyPmcList) {
            agencyToPmcMap.put(pmc.d21_Agency__c, pmc.Name);
        }

        List<Agency> agencyList = new List<Agency>();
        for (d21_Donor_Agency__c junction : agencyJunctionList) {
            Agency a = new Agency();
            a.Id = junction.Agency__c;
            a.Name = junction.Agency__r.Name;
            a.Phone = junction.Agency__r.Phone;
            a.coordinatorName = junction.Agency__r.d21_Coordinator_Name__c;
            a.website = junction.Agency__r.Website;
            a.email = junction.Agency__r.d21_Email__c;
            a.pmcNumber = agencyToPmcMap.get(junction.Agency__c);
            a.isEditable = String.isBlank(a.pmcNumber);
            a.donorCode = junction.d21_Donor_Code__c;
            a.knowDonorCode = junction.d21_Know_Donor_Code__c;
            a.cycles = new List<String>();
            for (d21_Cycle__c cycle : fetchCycleList) {
                if (cycle.d21_Agency__c == junction.Agency__c) {
                    a.cycles.add(cycle.Name.replace('Cycle ', ''));
                }
            }
            if (a.coordinatorId != null) {
                Contact coordinator = [SELECT FirstName, LastName, Phone FROM Contact WHERE Id = :a.coordinatorId LIMIT 1];
                a.coordinatorFirstName = coordinator.FirstName;
                a.coordinatorLastName = coordinator.LastName;
                a.coordinatorPhone = coordinator.Phone;
            }
            agencyList.add(a);
        }
        hipaaWrapperlist.Agencylist = agencyList;

        // Clinics
        List<d21_Donor_Fertility_Clinic__c> clinicJunctionList = [
            SELECT Id, d21_Donor__c, d21_Clinic__c, d21_Clinic__r.Name, d21_Clinic__r.Phone,
                   d21_Clinic__r.d21_Coordinator_Name__c, d21_Clinic__r.Website,
                   d21_Clinic__r.BillingCity, d21_Clinic__r.d21_Email__c
            FROM d21_Donor_Fertility_Clinic__c
            WHERE d21_Donor__c = :donorId AND d21_Clinic__c != null
            WITH SYSTEM_MODE
        ];
        
        Set<Id> clinicIds = new Set<Id>();
        for (d21_Donor_Fertility_Clinic__c junction : clinicJunctionList) {
            clinicIds.add(junction.d21_Clinic__c);
        }
        List<d21_PMC__c> clinicPmcList = [
            SELECT Id, Name, d21_Clinic__c
            FROM d21_PMC__c
            WHERE d21_Clinic__c IN :clinicIds
            WITH SYSTEM_MODE
        ];
        Map<Id, String> clinicToPmcMap = new Map<Id, String>();
        for (d21_PMC__c pmc : clinicPmcList) {
            clinicToPmcMap.put(pmc.d21_Clinic__c, pmc.Name);
        }

        List<Clinic> clinicList = new List<Clinic>();
        for (d21_Donor_Fertility_Clinic__c junction : clinicJunctionList) {
            Clinic c = new Clinic();
            c.Id = junction.d21_Clinic__c;
            c.Name = junction.d21_Clinic__r.Name;
            c.Phone = junction.d21_Clinic__r.Phone;
            c.coordinatorName = junction.d21_Clinic__r.d21_Coordinator_Name__c;
            c.website = junction.d21_Clinic__r.Website;
            c.cityState = junction.d21_Clinic__r.BillingCity;
            c.email = junction.d21_Clinic__r.d21_Email__c;
            c.pmcNumber = clinicToPmcMap.get(junction.d21_Clinic__c);
            c.isEditable = String.isBlank(c.pmcNumber);
            c.cycles = new List<String>();
            for (d21_Cycle__c cycle : fetchCycleList) {
                if (cycle.d21_Clinic__c == junction.d21_Clinic__c) {
                    c.cycles.add(cycle.Name.replace('Cycle ', ''));
                }
            }
            if (c.coordinatorId != null) {
                Contact coordinator = [SELECT FirstName, LastName, Phone FROM Contact WHERE Id = :c.coordinatorId LIMIT 1];
                c.coordinatorFirstName = coordinator.FirstName;
                c.coordinatorLastName = coordinator.LastName;
                c.coordinatorPhone = coordinator.Phone;
            }
            clinicList.add(c);
        }
        hipaaWrapperlist.Cliniclist = clinicList;

        // Attorneys
        List<d21_Donor_Fertility_Attorney__c> attorneyJunctionList = [
            SELECT Id, d21_Donor__c, d21_Attorney__c, d21_Attorney__r.Name, d21_Attorney__r.Email,
                   d21_Attorney__r.Phone, d21_Attorney__r.MailingState, d21_Attorney__r.LastName,
                   d21_Attorney__r.AccountId, d21_Attorney__r.Account.Name, d21_Attorney__r.Account.Website
            FROM d21_Donor_Fertility_Attorney__c
            WHERE d21_Donor__c = :donorId AND d21_Attorney__c != null
            WITH SYSTEM_MODE
        ];
        
        Set<Id> attorneyIds = new Set<Id>();
        for (d21_Donor_Fertility_Attorney__c junction : attorneyJunctionList) {
            attorneyIds.add(junction.d21_Attorney__c);
        }
        List<d21_PMC__c> attorneyPmcList = [
            SELECT Id, Name, d21_Attorney__c
            FROM d21_PMC__c
            WHERE d21_Attorney__c IN :attorneyIds
            WITH SYSTEM_MODE
        ];
        Map<Id, String> attorneyToPmcMap = new Map<Id, String>();
        for (d21_PMC__c pmc : attorneyPmcList) {
            attorneyToPmcMap.put(pmc.d21_Attorney__c, pmc.Name);
        }

        List<Attorney> attorneyList = new List<Attorney>();
        for (d21_Donor_Fertility_Attorney__c junction : attorneyJunctionList) {
            Attorney a = new Attorney();
            a.Id = junction.d21_Attorney__c;
            a.Name = junction.d21_Attorney__r.LastName;
            a.Phone = junction.d21_Attorney__r.Phone;
            a.email = junction.d21_Attorney__r.Email;
            a.cityState = junction.d21_Attorney__r.MailingState;
            a.lawFirm = junction.d21_Attorney__r.AccountId != null ? junction.d21_Attorney__r.Account.Name : '';
            a.website = junction.d21_Attorney__r.AccountId != null ? junction.d21_Attorney__r.Account.Website : '';
            a.pmcNumber = attorneyToPmcMap.get(junction.d21_Attorney__c);
            a.isEditable = String.isBlank(a.pmcNumber);
            a.cycles = new List<String>();
            for (d21_Cycle__c cycle : fetchCycleList) {
                if (cycle.d21_Attorney__c == junction.d21_Attorney__c) {
                    a.cycles.add(cycle.Name.replace('Cycle ', ''));
                }
            }
            attorneyList.add(a);
        }
        hipaaWrapperlist.Attorneylist = attorneyList;

        // Recipients
        List<d21_Donor_Recipient__c> recipientJunctionList = [
            SELECT Id, d21_Contact__c, d21_Recipient__r.Name
            FROM d21_Donor_Recipient__c
            WHERE d21_Contact__c = :donorId AND d21_Recipient__c != null
            WITH SYSTEM_MODE
        ];

        List<Recipient> recipientList = new List<Recipient>();
        for (d21_Donor_Recipient__c junction : recipientJunctionList) {
            Recipient r = new Recipient();
            r.Id = junction.d21_Recipient__c;
            r.firstName =  '';
            r.lastName = '';
            r.Phone = '';
            r.email = '';
            r.additionalInfo ='';
            r.cycles = new List<String>();
            for (d21_Cycle__c cycle : fetchCycleList) {
                if (cycle.Recipient__c == junction.d21_Recipient__c) {
                    r.cycles.add(cycle.Name.replace('Cycle ', ''));
                }
            }
            recipientList.add(r);
        }
        hipaaWrapperlist.Recipientlist = recipientList;

        // Parent Details
        parentdetail parent = new parentdetail();
        Contact con = [
            SELECT FirstName, LastName, d21_Date_Of_Birth__c, MailingState, MailingCity,
                   MailingStreet, MailingPostalCode, Phone, Email
            FROM Contact
            WHERE Id = :donorId
            LIMIT 1
        ];
        parent.Id = con.Id;
        parent.firstName = con.FirstName;
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

        return hipaaWrapperlist;
    }

    @AuraEnabled
    public static Map<String, Object> fetchSpermBankRecord(String spermBankId) {
        try {
            if (String.isBlank(spermBankId)) {
                throw new AuraHandledException('Sperm Bank ID is required.');
            }
            Id spermBankRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('d21_Sperm_Bank').getRecordTypeId();
            Account spermBank = [
                SELECT Id, Name, Phone, d21_Coordinator_Name__c, Website, d21_Email__c
                FROM Account
                WHERE Id = :spermBankId AND RecordTypeId = :spermBankRecordTypeId
                LIMIT 1
            ];
            Map<String, Object> result = new Map<String, Object>{
                'Id' => spermBank.Id,
                'Name' => spermBank.Name,
                'Phone' => spermBank.Phone,
                'coordinatorName' => spermBank.d21_Coordinator_Name__c,
                'website' => spermBank.Website,
                'email' => spermBank.d21_Email__c
            };
            if (spermBank.Id != null) {
                Contact coordinator = [
                    SELECT FirstName, LastName, Phone
                    FROM Contact
                    LIMIT 1
                ];
                result.put('coordinatorFirstName', coordinator.FirstName);
                result.put('coordinatorLastName', coordinator.LastName);
                result.put('coordinatorPhone', coordinator.Phone);
            } else {
                result.put('coordinatorFirstName', '');
                result.put('coordinatorLastName', '');
                result.put('coordinatorPhone', '');
            }
            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching sperm bank record: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void updateDonorName(String donorId, String firstName, String lastName, String dob, String city, String street, String pincode, String state) {
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
                List<d21_Cycle__c> cycles = [
                    SELECT Id, d21_Agency__c
                    FROM d21_Cycle__c
                    WHERE d21_Donor__c = :donorId AND d21_Agency__c = :recordId
                ];
                for (d21_Cycle__c cycle : cycles) {
                    cycle.d21_Agency__c = null;
                }
                if (!cycles.isEmpty()) {
                    update cycles;
                }
                delete junction[0];
            } else {
                throw new AuraHandledException('No matching sperm bank junction record found.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting sperm bank: ' + e.getMessage());
        }
    }

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
        try {
            if (String.isBlank(donorId) || String.isBlank(spermBankId)) {
                throw new AuraHandledException('Donor ID and Sperm Bank ID are required.');
            }
            if (String.isBlank(coordinatorId) && String.isBlank(coordinatorFirstName) && String.isNotBlank(coordinatorName)) {
                throw new AuraHandledException('Coordinator first name is required when adding a new coordinator.');
            }
            Id spermBankRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('d21_Sperm_Bank').getRecordTypeId();
            Account spermBank = [
                SELECT Id, Name, d21_Coordinator_Name__c
                FROM Account
                WHERE Id = :spermBankId
                LIMIT 1
            ];
            if (String.isBlank(coordinatorId) && String.isNotBlank(coordinatorFirstName)) {
                Contact newCoordinator = new Contact(
                    FirstName = coordinatorFirstName,
                    LastName = String.isBlank(coordinatorLastName) ? 'Coordinator' : coordinatorLastName,
                    Phone = coordinatorPhone,
                    AccountId = spermBank.Id
                );
                insert newCoordinator;
                coordinatorId = newCoordinator.Id;
            }
            if (String.isNotBlank(coordinatorName)) {
                spermBank.d21_Coordinator_Name__c = coordinatorName;
                update spermBank;
            }
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
    public static String addSpermBank(
        String donorId,
        String spermBankName,
        String phone,
        String coordinatorName,
        String coordinatorId,
        String website,
        String email,
        String coordinatorFirstName,
        String coordinatorLastName,
        String coordinatorPhone,
        String donorCode,
        Boolean knowDonorCode,
        List<String> cycles
    ) {
        try {
            if (String.isBlank(donorId) || String.isBlank(spermBankName)) {
                throw new AuraHandledException('Donor ID and Sperm Bank Name are required.');
            }
            if (String.isBlank(coordinatorId) && String.isBlank(coordinatorFirstName) && String.isNotBlank(coordinatorName)) {
                throw new AuraHandledException('Coordinator first name is required when adding a new coordinator.');
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
            if (String.isBlank(coordinatorId) && String.isNotBlank(coordinatorFirstName)) {
                Contact coordinator = new Contact(
                    FirstName = coordinatorFirstName,
                    LastName = String.isBlank(coordinatorLastName) ? 'Coordinator' : coordinatorLastName,
                    Phone = coordinatorPhone,
                    AccountId = spermBank.Id
                );
                insert coordinator;
            }
            d21_Donor_Agency__c junction = new d21_Donor_Agency__c(
                d21_Egg_Donor__c = donorId,
                Agency__c = spermBank.Id,
                d21_Donor_Code__c = donorCode,
                d21_Know_Donor_Code__c = knowDonorCode
            );
            insert junction;

            if (!cycles.isEmpty()) {
                Map<String, String> cycleMap = new Map<String, String>();
                List<d21_Cycle__c> fetchCycleList = [
                    SELECT Id, Name, d21_Donor__c
                    FROM d21_Cycle__c
                    WHERE d21_Donor__c = :donorId
                    WITH SYSTEM_MODE
                ];
                for (d21_Cycle__c cycle : fetchCycleList) {
                    cycleMap.put(cycle.Name, cycle.Id);
                }
                List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
                for (String cyc : cycles) {
                    d21_Cycle__c cycle = new d21_Cycle__c();
                    cycle.Id = cycleMap.get('Cycle ' + cyc);
                    cycle.d21_Agency__c = spermBank.Id;
                    cycleList.add(cycle);
                }
                if (!cycleList.isEmpty()) {
                    update cycleList;
                }
            }

            return spermBank.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding sperm bank: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void editSpermBank(
        String donorId,
        String accountId,
        String spermBankName,
        String phone,
        String coordinatorName,
        String coordinatorId,
        String website,
        String email,
        String donorCode,
        Boolean knowDonorCode,
        List<String> cycles
    ) {
        try {
            if (String.isBlank(donorId) || String.isBlank(accountId) || String.isBlank(spermBankName)) {
                throw new AuraHandledException('Donor ID, Sperm Bank ID, and Name are required.');
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

            List<d21_Donor_Agency__c> junction = [
                SELECT Id, d21_Donor_Code__c, d21_Know_Donor_Code__c
                FROM d21_Donor_Agency__c
                WHERE d21_Egg_Donor__c = :donorId AND Agency__c = :accountId
                LIMIT 1
            ];
            if (!junction.isEmpty()) {
                junction[0].d21_Donor_Code__c = donorCode;
                junction[0].d21_Know_Donor_Code__c = knowDonorCode;
                update junction[0];
            }

            Map<String, String> cycleMap = new Map<String, String>();
            List<d21_Cycle__c> fetchCycleList = [
                SELECT Id, Name, d21_Donor__c, d21_Agency__c
                FROM d21_Cycle__c
                WHERE d21_Donor__c = :donorId
                WITH SYSTEM_MODE
            ];
            for (d21_Cycle__c cycle : fetchCycleList) {
                cycleMap.put(cycle.Name, cycle.Id);
            }
            List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
            List<d21_Cycle__c> removeCycleList = new List<d21_Cycle__c>();
            for (d21_Cycle__c cycle : fetchCycleList) {
                if (cycle.d21_Agency__c == accountId && !cycles.contains(cycle.Name.replace('Cycle ', ''))) {
                    cycle.d21_Agency__c = null;
                    removeCycleList.add(cycle);
                }
            }
            for (String cyc : cycles) {
                d21_Cycle__c cycle = new d21_Cycle__c();
                cycle.Id = cycleMap.get('Cycle ' + cyc);
                cycle.d21_Agency__c = accountId;
                cycleList.add(cycle);
            }
            if (!cycleList.isEmpty()) {
                update cycleList;
            }
            if (!removeCycleList.isEmpty()) {
                update removeCycleList;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error updating sperm bank: ' + e.getMessage());
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
                List<d21_Cycle__c> cycles = [
                    SELECT Id, d21_Agency__c
                    FROM d21_Cycle__c
                    WHERE d21_Donor__c = :donorId AND d21_Agency__c = :recordId
                ];
                for (d21_Cycle__c cycle : cycles) {
                    cycle.d21_Agency__c = null;
                }
                if (!cycles.isEmpty()) {
                    update cycles;
                }
                delete junction[0];
            } else {
                throw new AuraHandledException('No matching agency junction record found.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting agency: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static String addAgency(
        String donorId,
        String agencyName,
        String phone,
        String coordinatorName,
        String coordinatorId,
        String website,
        String cityState,
        String email,
        String donorCode,
        Boolean knowDonorCode,
        List<String> cycles
    ) {
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
                Agency__c = agency.Id,
                d21_Donor_Code__c = donorCode,
                d21_Know_Donor_Code__c = knowDonorCode
            );
            insert junction;

            if (!cycles.isEmpty()) {
                Map<String, String> cycleMap = new Map<String, String>();
                List<d21_Cycle__c> fetchCycleList = [
                    SELECT Id, Name, d21_Donor__c
                    FROM d21_Cycle__c
                    WHERE d21_Donor__c = :donorId
                    WITH SYSTEM_MODE
                ];
                for (d21_Cycle__c cycle : fetchCycleList) {
                    cycleMap.put(cycle.Name, cycle.Id);
                }
                List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
                for (String cyc : cycles) {
                    d21_Cycle__c cycle = new d21_Cycle__c();
                    cycle.Id = cycleMap.get('Cycle ' + cyc);
                    cycle.d21_Agency__c = agency.Id;
                    cycleList.add(cycle);
                }
                if (!cycleList.isEmpty()) {
                    update cycleList;
                }
            }

            return agency.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding agency: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void editAgency(
        String donorId,
        String accountId,
        String agencyName,
        String phone,
        String coordinatorName,
        String coordinatorId,
        String website,
        String cityState,
        String email,
        String donorCode,
        Boolean knowDonorCode,
        List<String> cycles
    ) {
        try {
            if (String.isBlank(donorId) || String.isBlank(accountId) || String.isBlank(agencyName)) {
                throw new AuraHandledException('Donor ID, Agency ID, and Name are required.');
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

            List<d21_Donor_Agency__c> junction = [
                SELECT Id, d21_Donor_Code__c, d21_Know_Donor_Code__c
                FROM d21_Donor_Agency__c
                WHERE d21_Egg_Donor__c = :donorId AND Agency__c = :accountId
                LIMIT 1
            ];
            if (!junction.isEmpty()) {
                junction[0].d21_Donor_Code__c = donorCode;
                junction[0].d21_Know_Donor_Code__c = knowDonorCode;
                update junction[0];
            }

            Map<String, String> cycleMap = new Map<String, String>();
            List<d21_Cycle__c> fetchCycleList = [
                SELECT Id, Name, d21_Donor__c, d21_Agency__c
                FROM d21_Cycle__c
                WHERE d21_Donor__c = :donorId
                WITH SYSTEM_MODE
            ];
            for (d21_Cycle__c cycle : fetchCycleList) {
                cycleMap.put(cycle.Name, cycle.Id);
            }
            List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
            List<d21_Cycle__c> removeCycleList = new List<d21_Cycle__c>();
            for (d21_Cycle__c cycle : fetchCycleList) {
                if (cycle.d21_Agency__c == accountId && !cycles.contains(cycle.Name.replace('Cycle ', ''))) {
                    cycle.d21_Agency__c = null;
                    removeCycleList.add(cycle);
                }
            }
            for (String cyc : cycles) {
                d21_Cycle__c cycle = new d21_Cycle__c();
                cycle.Id = cycleMap.get('Cycle ' + cyc);
                cycle.d21_Agency__c = accountId;
                cycleList.add(cycle);
            }
            if (!cycleList.isEmpty()) {
                update cycleList;
            }
            if (!removeCycleList.isEmpty()) {
                update removeCycleList;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error updating agency: ' + e.getMessage());
        }
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
            if (String.isBlank(donorId) || String.isBlank(clinicId)) {
                throw new AuraHandledException('Donor ID and Clinic ID are required.');
            }
            if (String.isBlank(coordinatorId) && String.isBlank(coordinatorFirstName) && String.isNotBlank(coordinatorName)) {
                throw new AuraHandledException('Coordinator first name is required when adding a new coordinator.');
            }
            Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('d21_Clinic').getRecordTypeId();
            Account clinic = [
                SELECT Id, Name, d21_Coordinator_Name__c, RecordTypeId
                FROM Account
                WHERE Id = :clinicId
                LIMIT 1
            ];
            if (String.isBlank(coordinatorId) && String.isNotBlank(coordinatorFirstName)) {
                Contact newCoordinator = new Contact(
                    FirstName = coordinatorFirstName,
                    LastName = String.isBlank(coordinatorLastName) ? 'Coordinator' : coordinatorLastName,
                    Phone = coordinatorPhone,
                    AccountId = clinic.Id
                );
                insert newCoordinator;
                coordinatorId = newCoordinator.Id;
            }
            if (String.isNotBlank(coordinatorName)) {
                clinic.d21_Coordinator_Name__c = coordinatorName;
                update clinic;
            }
            List<d21_Donor_Fertility_Clinic__c> existingLinks = [
                SELECT Id
                FROM d21_Donor_Fertility_Clinic__c
                WHERE d21_Donor__c = :donorId AND d21_Clinic__c = :clinicId
                LIMIT 1
            ];
            if (!existingLinks.isEmpty()) {
                throw new AuraHandledException('Clinic already linked to this donor.');
            }
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
    public static String addClinic(
        String donorId,
        String clinicName,
        String phone,
        String coordinatorName,
        String coordinatorId,
        String website,
        String cityState,
        String email,
        List<String> cycles
    ) {
        try {
            if (String.isBlank(donorId) || String.isBlank(clinicName)) {
                throw new AuraHandledException('Donor ID and Clinic Name are required.');
            }
            Id accountRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('d21_Clinic').getRecordTypeId();
            Account clinic = new Account(
                Name = clinicName,
                RecordTypeId = accountRecordTypeId,
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

            if (!cycles.isEmpty()) {
                Map<String, String> cycleMap = new Map<String, String>();
                List<d21_Cycle__c> fetchCycleList = [
                    SELECT Id, Name, d21_Donor__c
                    FROM d21_Cycle__c
                    WHERE d21_Donor__c = :donorId
                    WITH SYSTEM_MODE
                ];
                for (d21_Cycle__c cycle : fetchCycleList) {
                    cycleMap.put(cycle.Name, cycle.Id);
                }
                List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
                for (String cyc : cycles) {
                    d21_Cycle__c cycle = new d21_Cycle__c();
                    cycle.Id = cycleMap.get('Cycle ' + cyc);
                    cycle.d21_Clinic__c = clinic.Id;
                    cycleList.add(cycle);
                }
                if (!cycleList.isEmpty()) {
                    update cycleList;
                }
            }

            return clinic.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding clinic: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void editClinic(
        String donorId,
        String accountId,
        String clinicName,
        String phone,
        String coordinatorName,
        String coordinatorId,
        String website,
        String cityState,
        String email,
        List<String> cycles
    ) {
        try {
            if (String.isBlank(donorId) || String.isBlank(accountId) || String.isBlank(clinicName)) {
                throw new AuraHandledException('Donor ID, Clinic ID, and Name are required.');
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
           // clinic.d21_Coordinator__c = coordinatorId;
            clinic.Website = website;
            clinic.BillingCity = cityState;
            clinic.d21_Email__c = email;
            update clinic;

            Map<String, String> cycleMap = new Map<String, String>();
            List<d21_Cycle__c> fetchCycleList = [
                SELECT Id, Name, d21_Donor__c, d21_Clinic__c
                FROM d21_Cycle__c
                WHERE d21_Donor__c = :donorId
                WITH SYSTEM_MODE
            ];
            for (d21_Cycle__c cycle : fetchCycleList) {
                cycleMap.put(cycle.Name, cycle.Id);
            }
            List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
            List<d21_Cycle__c> removeCycleList = new List<d21_Cycle__c>();
            for (d21_Cycle__c cycle : fetchCycleList) {
                if (cycle.d21_Clinic__c == accountId && !cycles.contains(cycle.Name.replace('Cycle ', ''))) {
                    cycle.d21_Clinic__c = null;
                    removeCycleList.add(cycle);
                }
            }
            for (String cyc : cycles) {
                d21_Cycle__c cycle = new d21_Cycle__c();
                cycle.Id = cycleMap.get('Cycle ' + cyc);
                cycle.d21_Clinic__c = accountId;
                cycleList.add(cycle);
            }
            if (!cycleList.isEmpty()) {
                update cycleList;
            }
            if (!removeCycleList.isEmpty()) {
                update removeCycleList;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error updating clinic: ' + e.getMessage());
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
                List<d21_Cycle__c> cycles = [
                    SELECT Id, d21_Clinic__c
                    FROM d21_Cycle__c
                    WHERE d21_Donor__c = :donorId AND d21_Clinic__c = :recordId
                ];
                for (d21_Cycle__c cycle : cycles) {
                    cycle.d21_Clinic__c = null;
                }
                if (!cycles.isEmpty()) {
                    update cycles;
                }
                delete junction[0];
            } else {
                throw new AuraHandledException('No matching clinic junction record found.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting clinic: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static String addAttorney(
        String donorId,
        String attorneyName,
        String phone,
        String lawFirm,
        String website,
        String cityState,
        String email,
        List<String> cycles
    ) {
        try {
            if (String.isBlank(donorId) || String.isBlank(attorneyName)) {
                throw new AuraHandledException('Donor ID and Attorney Name are required.');
            }
            Id accountRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('d21_Attorney').getRecordTypeId();
            Account attorneyAccount = new Account(
                Name = lawFirm,
                RecordTypeId = accountRecordTypeId,
                Website = website
            );
            insert attorneyAccount;
            Contact attorneyContact = new Contact(
                LastName = attorneyName,
                Phone = phone,
                Email = email,
                MailingState = cityState,
                AccountId = attorneyAccount.Id
            );
            insert attorneyContact;
            d21_Donor_Fertility_Attorney__c junction = new d21_Donor_Fertility_Attorney__c(
                d21_Donor__c = donorId,
                d21_Attorney__c = attorneyContact.Id
            );
            insert junction;

            if (!cycles.isEmpty()) {
                Map<String, String> cycleMap = new Map<String, String>();
                List<d21_Cycle__c> fetchCycleList = [
                    SELECT Id, Name, d21_Donor__c
                    FROM d21_Cycle__c
                    WHERE d21_Donor__c = :donorId
                    WITH SYSTEM_MODE
                ];
                for (d21_Cycle__c cycle : fetchCycleList) {
                    cycleMap.put(cycle.Name, cycle.Id);
                }
                List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
                for (String cyc : cycles) {
                    d21_Cycle__c cycle = new d21_Cycle__c();
                    cycle.Id = cycleMap.get('Cycle ' + cyc);
                    cycle.d21_Attorney__c = attorneyContact.Id;
                    cycleList.add(cycle);
                }
                if (!cycleList.isEmpty()) {
                    update cycleList;
                }
            }

            return attorneyContact.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding attorney: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void editAttorney(
        String donorId,
        String attorneyId,
        String attorneyName,
        String phone,
        String lawFirm,
        String website,
        String cityState,
        String email,
        List<String> cycles
    ) {
        try {
            if (String.isBlank(donorId) || String.isBlank(attorneyId) || String.isBlank(attorneyName)) {
                throw new AuraHandledException('Donor ID, Attorney ID, and Name are required.');
            }
            Contact attorneyContact = [
                SELECT Id, LastName, Phone, Email, MailingState, AccountId
                FROM Contact
                WHERE Id = :attorneyId
                LIMIT 1
            ];
            attorneyContact.LastName = attorneyName;
            attorneyContact.Phone = phone;
            attorneyContact.Email = email;
            attorneyContact.MailingState = cityState;
            update attorneyContact;

            if (attorneyContact.AccountId != null) {
                Account attorneyAccount = [
                    SELECT Id, Name, Website
                    FROM Account
                    WHERE Id = :attorneyContact.AccountId
                    LIMIT 1
                ];
                attorneyAccount.Name = lawFirm;
                attorneyAccount.Website = website;
                update attorneyAccount;
            }

            Map<String, String> cycleMap = new Map<String, String>();
            List<d21_Cycle__c> fetchCycleList = [
                SELECT Id, Name, d21_Donor__c, d21_Attorney__c
                FROM d21_Cycle__c
                WHERE d21_Donor__c = :donorId
                WITH SYSTEM_MODE
            ];
            for (d21_Cycle__c cycle : fetchCycleList) {
                cycleMap.put(cycle.Name, cycle.Id);
            }
            List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
            List<d21_Cycle__c> removeCycleList = new List<d21_Cycle__c>();
            for (d21_Cycle__c cycle : fetchCycleList) {
                if (cycle.d21_Attorney__c == attorneyId && !cycles.contains(cycle.Name.replace('Cycle ', ''))) {
                    cycle.d21_Attorney__c = null;
                    removeCycleList.add(cycle);
                }
            }
            for (String cyc : cycles) {
                d21_Cycle__c cycle = new d21_Cycle__c();
                cycle.Id = cycleMap.get('Cycle ' + cyc);
                cycle.d21_Attorney__c = attorneyId;
                cycleList.add(cycle);
            }
            if (!cycleList.isEmpty()) {
                update cycleList;
            }
            if (!removeCycleList.isEmpty()) {
                update removeCycleList;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error updating attorney: ' + e.getMessage());
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
                List<d21_Cycle__c> cycles = [
                    SELECT Id, d21_Attorney__c
                    FROM d21_Cycle__c
                    WHERE d21_Donor__c = :donorId AND d21_Attorney__c = :recordId
                ];
                for (d21_Cycle__c cycle : cycles) {
                    cycle.d21_Attorney__c = null;
                }
                if (!cycles.isEmpty()) {
                    update cycles;
                }
                delete junction[0];
            } else {
                throw new AuraHandledException('No matching attorney junction record found.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting attorney: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static String addRecipient(
        String donorId,
        String firstName,
        String lastName,
        String phone,
        String email,
        String additionalInfo,
        List<String> cycles
    ) {
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

            if (!cycles.isEmpty()) {
                Map<String, String> cycleMap = new Map<String, String>();
                List<d21_Cycle__c> fetchCycleList = [
                    SELECT Id, Name, d21_Donor__c
                    FROM d21_Cycle__c
                    WHERE d21_Donor__c = :donorId
                    WITH SYSTEM_MODE
                ];
                for (d21_Cycle__c cycle : fetchCycleList) {
                    cycleMap.put(cycle.Name, cycle.Id);
                }
                List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
                for (String cyc : cycles) {
                    d21_Cycle__c cycle = new d21_Cycle__c();
                    cycle.Id = cycleMap.get('Cycle ' + cyc);
                    cycle.Recipient__c = recipientAccount.Id;
                    cycleList.add(cycle);
                }
                if (!cycleList.isEmpty()) {
                    update cycleList;
                }
            }

            return recipientAccount.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding recipient: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void editRecipient(
        String donorId,
        String accountId,
        String firstName,
        String lastName,
        String phone,
        String email,
        String additionalInfo,
        List<String> cycles
    ) {
        try {
            if (String.isBlank(donorId) || String.isBlank(accountId) || String.isBlank(lastName)) {
                throw new AuraHandledException('Donor ID, Recipient ID, and Last Name are required.');
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

            Map<String, String> cycleMap = new Map<String, String>();
            List<d21_Cycle__c> fetchCycleList = [
                SELECT Id, Name, d21_Donor__c, Recipient__c
                FROM d21_Cycle__c
                WHERE d21_Donor__c = :donorId
                WITH SYSTEM_MODE
            ];
            for (d21_Cycle__c cycle : fetchCycleList) {
                cycleMap.put(cycle.Name, cycle.Id);
            }
            List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
            List<d21_Cycle__c> removeCycleList = new List<d21_Cycle__c>();
            for (d21_Cycle__c cycle : fetchCycleList) {
                if (cycle.Recipient__c == accountId && !cycles.contains(cycle.Name.replace('Cycle ', ''))) {
                    cycle.Recipient__c = null;
                    removeCycleList.add(cycle);
                }
            }
            for (String cyc : cycles) {
                d21_Cycle__c cycle = new d21_Cycle__c();
                cycle.Id = cycleMap.get('Cycle ' + cyc);
                cycle.Recipient__c = accountId;
                cycleList.add(cycle);
            }
            if (!cycleList.isEmpty()) {
                update cycleList;
            }
            if (!removeCycleList.isEmpty()) {
                update removeCycleList;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error updating recipient: ' + e.getMessage());
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
                List<d21_Cycle__c> cycles = [
                    SELECT Id, Recipient__c
                    FROM d21_Cycle__c
                    WHERE d21_Donor__c = :donorId AND Recipient__c = :recordId
                ];
                for (d21_Cycle__c cycle : cycles) {
                    cycle.Recipient__c = null;
                }
                if (!cycles.isEmpty()) {
                    update cycles;
                }
                delete junction[0];
            } else {
                throw new AuraHandledException('No matching recipient junction record found.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting recipient: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Agency> getSpermBanks() {
        List<Account> spermBankAccounts = [
            SELECT Id, Name, Phone, Website, d21_Email__c,
                   (SELECT FirstName, LastName, Phone FROM Contacts LIMIT 1)
            FROM Account
            WHERE RecordType.DeveloperName = 'd21_Sperm_Bank'
        ];
        List<Agency> spermBanks = new List<Agency>();
        for (Account acc : spermBankAccounts) {
            Agency a = new Agency();
            a.Id = acc.Id;
            a.Name = acc.Name;
            a.Phone = acc.Phone;
            a.website = acc.Website;
            a.email = acc.d21_Email__c;
            if (!acc.Contacts.isEmpty()) {
                a.coordinatorFirstName = acc.Contacts[0].FirstName;
                a.coordinatorLastName = acc.Contacts[0].LastName;
                a.coordinatorPhone = acc.Contacts[0].Phone;
            }
            spermBanks.add(a);
        }
        return spermBanks;
    }

    public class hipaaWrapper {
        @AuraEnabled public List<Agency> spermlist;
        @AuraEnabled public List<Agency> Agencylist;
        @AuraEnabled public List<Clinic> Cliniclist;
        @AuraEnabled public List<Attorney> Attorneylist;
        @AuraEnabled public List<Recipient> Recipientlist;
        @AuraEnabled public parentdetail parentdetails;
    }

    public class Agency {
        @AuraEnabled public String Id;
        @AuraEnabled public String Name;
        @AuraEnabled public String Phone;
        @AuraEnabled public String coordinatorName;
        @AuraEnabled public String coordinatorId;
        @AuraEnabled public String coordinatorFirstName;
        @AuraEnabled public String coordinatorLastName;
        @AuraEnabled public String coordinatorPhone;
        @AuraEnabled public String website;
        @AuraEnabled public String email;
        @AuraEnabled public String pmcNumber;
        @AuraEnabled public Boolean isEditable;
        @AuraEnabled public String donorCode;
        @AuraEnabled public Boolean knowDonorCode;
        @AuraEnabled public List<String> cycles;
    }

    public class Clinic {
        @AuraEnabled public String Id;
        @AuraEnabled public String Name;
        @AuraEnabled public String Phone;
        @AuraEnabled public String coordinatorName;
        @AuraEnabled public String coordinatorId;
        @AuraEnabled public String coordinatorFirstName;
        @AuraEnabled public String coordinatorLastName;
        @AuraEnabled public String coordinatorPhone;
        @AuraEnabled public String website;
        @AuraEnabled public String cityState;
        @AuraEnabled public String email;
        @AuraEnabled public String pmcNumber;
        @AuraEnabled public Boolean isEditable;
        @AuraEnabled public List<String> cycles;
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
        @AuraEnabled public List<String> cycles;
    }

    public class Recipient {
        @AuraEnabled public String Id;
        @AuraEnabled public String firstName;
        @AuraEnabled public String lastName;
        @AuraEnabled public String Phone;
        @AuraEnabled public String email;
        @AuraEnabled public String additionalInfo;
        @AuraEnabled public String pmcNumber;
        @AuraEnabled public Boolean isEditable;
        @AuraEnabled public List<String> cycles;
    }

    public class parentdetail {
        @AuraEnabled public String Id;
        @AuraEnabled public String firstName;
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
}