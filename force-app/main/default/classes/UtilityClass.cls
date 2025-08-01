public without sharing class UtilityClass {

    public class Coordinator{
        @AuraEnabled public string firstName;
        @AuraEnabled public string lastName;
        @AuraEnabled public string phone;
        @AuraEnabled public string parentId;
        @AuraEnabled public string coordinatorId;
        @AuraEnabled public string fullName;
    }


    @AuraEnabled
    public static Response createCoordinator(string coordinateData){
        try {
            Coordinator coordinatorRecord = (Coordinator)JSON.deserialize(coordinateData, Coordinator.class);  
            system.debug('coordinatorRecord' + coordinatorRecord);
            Contact con = new Contact();
            con.LastName = coordinatorRecord.lastName;
            con.FirstName = coordinatorRecord.firstName;
            con.AccountId = coordinatorRecord.parentId;
            con.Phone = coordinatorRecord.phone;
            if(coordinatorRecord.coordinatorId != null && string.IsNotBlank(coordinatorRecord.coordinatorId)){
                con.Id = coordinatorRecord.coordinatorId;
            }
            upsert con;
            coordinatorRecord.coordinatorId = con.Id;
            con = [SELECT Id, Name FROM Contact WHERE Id = :con.Id LIMIT 1];
    		coordinatorRecord.fullName = con.Name;
            return new Response(true, JSON.serialize(coordinatorRecord));
        } catch (Exception e) {
            return new Response(false, e.getMessage()+' >>> '+e.getLineNumber()+'  >>>  '+e.getStackTraceString());
        }
    }


    @AuraEnabled
    public static Response deleteCoordinator(string coordinatorId){
        try {
            list<contact> contactList = [SELECT Id FROM Contact WHERE Id =:coordinatorId WITH SYSTEM_MODE];
            if(!contactList.isEmpty())      {
                Database.delete(contactList,false);
            }     
            return new Response(true, 'Coordinator deleted successfully');
        } catch (Exception e) {
            return new Response(false, e.getMessage()+' >>> '+e.getLineNumber()+'  >>>  '+e.getStackTraceString());
        }
    }


    public class Response{
        @AuraEnabled public string message;
        @AuraEnabled public boolean isSuccess;
        public Response(Boolean isSuccess, string message){
            this.message = message;
            this.isSuccess = isSuccess;
        }
    } 
    
    @AuraEnabled(cacheable=true)
    public static List<SObject> searchRecords(String objectApiName, String searchKey, String accountId) {
        String query = 'SELECT Id, Name, Phone FROM ' + String.escapeSingleQuotes(objectApiName);
        system.debug(objectApiName +'__' +searchKey +'__'+ accountId);
  
        List<String> conditions = new List<String>();
        conditions.add('Name LIKE \'%' + String.escapeSingleQuotes(searchKey) + '%\'');
        
        if (objectApiName == 'Contact' && String.isNotBlank(accountId)) {
            conditions.add('AccountId = \'' + String.escapeSingleQuotes(accountId) + '\'');
        }
        
        query += ' WHERE ' + String.join(conditions, ' AND ') + ' LIMIT 10';
        system.debug(Database.query(query));
        return Database.query(query);
    }

}