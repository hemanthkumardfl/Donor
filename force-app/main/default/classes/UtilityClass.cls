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
            if(coordinatorRecord.lastName != null && string.isNotBlank(coordinatorRecord.lastName)){
                con.LastName = coordinatorRecord.lastName;
            	con.FirstName = coordinatorRecord.firstName;
            }
            else{
                con.LastName = coordinatorRecord.firstName;
            	//con.FirstName = coordinatorRecord.firstName;
            }
            
            if(coordinatorRecord.parentId != null && string.IsNotBlank(coordinatorRecord.parentId)){
                con.AccountId = coordinatorRecord.parentId;
            }
            con.Phone = coordinatorRecord.phone;
            if(coordinatorRecord.coordinatorId != null && string.IsNotBlank(coordinatorRecord.coordinatorId)){
                con.Id = coordinatorRecord.coordinatorId;
            }
            upsert con;
            system.debug('>>>' + con);
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
    
    @AuraEnabled
    public static List<ResultWrapper> fetchRecords(SearchWrapper inputWrapper, string recordTypeName) {
        try {
            if(inputWrapper != null){
                String fieldsToQuery = 'SELECT Id, ';
                if(string.isNotBlank(inputWrapper.fieldApiName)){
                    fieldsToQuery = fieldsToQuery + inputWrapper.fieldApiName;
                }
                if(string.isNotBlank(inputWrapper.otherFieldApiName)){
                    if (inputWrapper.objectApiName == 'Contact' && inputWrapper.otherFieldApiName == 'Industry') {
                    }
                    else{
                        fieldsToQuery = fieldsToQuery + ', ' + inputWrapper.otherFieldApiName;
                    }
                }
                String query = fieldsToQuery + ' FROM '+ inputWrapper.objectApiName;
               // query += ' WHERE RecordType.Name = \'' + String.escapeSingleQuotes(recordTypeName) + '\'';
                system.debug('query >>>' + query);
                String filterCriteria = inputWrapper.fieldApiName + ' LIKE ' + '\'' + String.escapeSingleQuotes(inputWrapper.searchString.trim()) + '%\' LIMIT 10';
                if(String.isNotBlank(inputWrapper.selectedRecordId)) {
                    query += ' Where Id = \''+ inputWrapper.selectedRecordId + '\'';
                }else if(String.isNotBlank(inputWrapper.parentFieldApiName) && String.isNotBlank(inputWrapper.parentRecordId)){
                    query += ' Where '+ inputWrapper.parentFieldApiName+ ' = \''+ inputWrapper.parentRecordId + '\'';
                    query += ' AND ' + filterCriteria;
                } 
                else {
                    query += ' Where '+ filterCriteria;
                }
                system.debug(query);
                system.debug(Database.query(query));
                List<ResultWrapper> returnWrapperList = new List<ResultWrapper>();
                for(SObject s : Database.query(query)) {
                    ResultWrapper wrap = new ResultWrapper();
                    wrap.mainField = (String)s.get(inputWrapper.fieldApiName);
                    wrap.subField = (String)s.get(inputWrapper.otherFieldApiName);
                    wrap.id = (String)s.get('id');
                    returnWrapperList.add(wrap);
                }
                return returnWrapperList;
            }
            return null;
        } catch (Exception err) {
            throw new AuraHandledException(err.getMessage());
        }
    }

    public class ResultWrapper{
        @AuraEnabled public String mainField{get;set;}
        @AuraEnabled public String subField{get;set;}
        @AuraEnabled public String id{get;set;}
    }

    public class SearchWrapper {
        @AuraEnabled public String objectApiName{get;set;}
        @AuraEnabled public String fieldApiName{get;set;}
        @AuraEnabled public String otherFieldApiName{get;set;}
        @AuraEnabled public String searchString{get;set;}
        @AuraEnabled public String selectedRecordId{get;set;}
        @AuraEnabled public String parentRecordId{get;set;}
        @AuraEnabled public String parentFieldApiName{get;set;}
    }
    
    @AuraEnabled
    public static Account fetchSpermBankRecord(string accountId){
        Account acc = [SELECT Id, Name, Website, Phone FROM Account WHERE Id =: accountId LIMIT 1];
        return acc;
    }

}