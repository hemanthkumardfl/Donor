public class AssociatedCode {

    public class ContactWrapper {
        public String donorType;
        public String agencyId;
        public String attorneyId;
        public String eggDonorId;
        public String spermDonorId;
        public String embryoDonor;
    }

    public static void getRelatedRecords(String contactObjJson) {
        
        try {
            // Deserialize JSON string into ContactWrapper object
            ContactWrapper contactObj = (ContactWrapper) JSON.deserialize(contactObjJson, ContactWrapper.class);

            // Validate donorType
            if (String.isBlank(contactObj.donorType)) {
                System.debug(LoggingLevel.ERROR, 'Missing donorType.');
                return;
            }

            Map<String, String> contactFields = new Map<String, String>{
                'Attorney' => contactObj.attorneyId,
                'Egg Donor' => contactObj.eggDonorId,
                'Sperm Donor' => contactObj.spermDonorId,
                'Embryo Donor' => contactObj.embryoDonor
            };

            Map<String, String> prefixMap = new Map<String, String>{
                'SDN' => 'SDN-', 
                'EDN' => 'EDN-'
            };
            
            if (prefixMap.containsKey(contactObj.donorType)) {
                String codeName = prefixMap.get(contactObj.donorType) + String.valueOf(Math.abs(Crypto.getRandomLong())).substring(0, 6);
                
                // Check if code already exists
                if ([SELECT COUNT() FROM d21_Associated_Codes__c WHERE Name = :codeName LIMIT 1] == 0) {
                    // Create new record
                    d21_Associated_Codes__c newCode = new d21_Associated_Codes__c(
                        Name = codeName,
                        d21_Type__c = contactObj.donorType
                    );
                    
                    // Set the appropriate contact field based on donor type
                    if (contactObj.donorType == 'SDN' && !String.isBlank(contactObj.spermDonorId)) {
                        newCode.d21_Contact__c = contactObj.spermDonorId;
                    } else if (contactObj.donorType == 'EDN' && !String.isBlank(contactObj.embryoDonor)) {
                        newCode.d21_Contact__c = contactObj.embryoDonor;
                    }
                    
                    // Only insert if we have a contact reference
                    if (newCode.d21_Contact__c != null) {
                        insert newCode;
                    }
                }
            }
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error processing related records: ' + e.getMessage());
        }
    }
}