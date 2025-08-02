public with sharing class HipAAUtilityClass {
    @AuraEnabled(cacheable=true)
    public static List<Account> searchSpermBanks(String searchKey) {
        try {
            if (String.isBlank(searchKey)) {
                System.debug('Search key is blank, returning empty list');
                return new List<Account>();
            }
            String sanitizedSearchKey = String.escapeSingleQuotes(searchKey.trim());
            String query = 'SELECT Id, Name, Phone, d21_Coordinator_Name__c, Website, d21_Email__c ' +
                           'FROM Account ' +
                           'WHERE Name LIKE \'%' + sanitizedSearchKey + '%\' ' +
                           'AND RecordType.Name = \'Sperm Bank\' ';
            List<Account> results = Database.query(query);
            System.debug('Search key: ' + sanitizedSearchKey + ', Results: ' + results);
            return results;
        } catch (Exception e) {
            System.debug('Error in searchSpermBanks: ' + e.getMessage() + ', Line: ' + e.getLineNumber());
            throw new AuraHandledException('Error searching sperm banks: ' + e.getMessage());
        }
    }
}