public without sharing class EggDonorPreRegistrationController {
    
    @AuraEnabled
    public static Response resendCode(string conId){
        try {
            Response emailResponse = new Response(false,'');
            Response smsResponse  = new Response(false,'');
            String otpData = string.valueOf(math.abs(Crypto.getRandomLong()));
            Integer otpCode = Integer.valueOf(otpData.substring(0, 6));
            Contact donor = [SELECT Id,Email,Phone,d21_Verification_Type__c 
                             FROM Contact 
                             WHERE Id =:conId];
            
            Boolean isEmail = (donor.d21_Verification_Type__c == 'Email' || donor.d21_Verification_Type__c == 'Both');
            Boolean isPhone = (donor.d21_Verification_Type__c == 'Phone' || donor.d21_Verification_Type__c == 'Both');
            if(isPhone){
                smsResponse = sendOtpByPhone(string.valueOf(otpCode),donor.Phone);
            }
            if(isEmail){
                emailResponse =  generateAndSendOTP(new SendOptWrapper(donor.Email, donor.Phone,isEmail,isPhone,null,donor.Id,null),otpCode);
            }
            else{
                d21_Security_Verification__c verification = new d21_Security_Verification__c();
                verification.Name = string.valueOf(otpCode);
                verification.d21_Email__c = donor.Email;
                verification.d21_Phone__c = donor.Phone;
                insert as User verification;
            }
            return new Response(true,JSON.serialize(smsResponse)+' - '+JSON.serialize(emailResponse));
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString()+' - '+e.getMessage()+' - '+e.getLineNumber());
        }
    }
    
    
    private static Response generateAndSendOTP(SendOptWrapper optDetails,Integer otpCode){
        d21_Security_Verification__c verification = new d21_Security_Verification__c();
        verification.Name = string.valueOf(otpCode);
        verification.d21_Email__c = optDetails.email;
        verification.d21_Phone__c = optDetails.phone;
        insert as User verification;
        optDetails.verificationCode = string.valueOf(otpCode);
        optDetails.verificationId = verification.Id;
        return sendOtp(optDetails);
    }
    
    
    private static Response sendOtpByPhone(string otp,string toPhone){
        String accountSid = 'ACf7cf16139492ed2ae2af8b95e87743a9';
        String authToken  = '0c200315ada0730d0e11a67e3ba03279';
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json');
        req.setMethod('POST');
        
        String version = '3.2.0';
        req.setHeader('X-Twilio-Client', 'salesforce-' + version);
        req.setHeader('User-Agent', 'twilio-salesforce/' + version);
        req.setHeader('Accept', 'application/json');
        req.setHeader('Accept-Charset', 'utf-8');
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        
        String authHeader = 'Basic ' + EncodingUtil.base64Encode(Blob.valueOf(accountSid + ':' + authToken));
        req.setHeader('Authorization', authHeader);
        
        String fromPhone = '+14159935694';
        String messageBody = otp + ' is your Donor OTP. Do not share it with anyone.';
        
        String body = 'To=' + EncodingUtil.urlEncode(toPhone, 'UTF-8') +
            '&From=' + EncodingUtil.urlEncode(fromPhone, 'UTF-8') +
            '&Body=' + EncodingUtil.urlEncode(messageBody, 'UTF-8');
        req.setBody(body);
        
        Http http = new Http();
        HttpResponse response = http.send(req);
        if(response.getStatusCode() == 201){
            return new Response(true, 'OTP Sent Successfully through ');
        }
        return new Response(false, 'OTP Sending Failed through ' + response);
    }
    
    
    public static Response sendOtp(SendOptWrapper optDetails){
        Response res;
        if(optDetails.isEmail){
            OrgWideEmailAddress owea = [SELECT Id FROM OrgWideEmailAddress 
                                        WHERE DisplayName = 'Megan' 
                                        LIMIT 1];
            
            EmailTemplate emailTempRec = [SELECT Id, Subject, HtmlValue 
                                          FROM EmailTemplate 
                                          WHERE DeveloperName = 'Donor_21_Verification_Codes' 
                                          LIMIT 1];
            
            String templateHtmlValue = emailTempRec.HtmlValue;
            String templateSubject = emailTempRec.Subject;
            templateHtmlValue = templateHtmlValue.replace('{!relatedTo.Name}', optDetails.verificationCode);
            
            Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
            message.setTargetObjectId(optDetails.donorId);
            message.setOrgWideEmailAddressId(owea.Id);
            message.setSaveAsActivity(true);
            message.setHtmlBody(templateHtmlValue);
            message.setSubject(templateSubject);
            // message.setTemplateId(emailTempRec.Id);
            Messaging.SendEmailResult[] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[] { message });
            system.debug('results >>> '+results);
            List<EmailMessage> messages = [
                SELECT Id, Subject, ToAddress, IsBounced, Status 
                FROM EmailMessage 
                WHERE ToAddress = :optDetails.email
            ];
        }
        res = new Response(true, optDetails.verificationCode);
        return res;
    }
    
    
    @AuraEnabled
    public static Response deleteOtp(string conId){
        try {
            string email = [SELECT Id,Email FROM Contact WHERE Id =:conId].Email;
            delete [SELECT Id,Name,d21_Email__c FROM d21_Security_Verification__c WHERE d21_Email__c =: email];
            return new Response(true,'OTP Deleted Successfully.');
        } catch (Exception e) {
            return new Response(false,e.getStackTraceString()+' - '+e.getMessage()+' - '+e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static Response verifyOTP(string email, string verificationOTPinput){
        try{
            List<d21_Security_Verification__c> verificationRceordList = [SELECT Id,Name,d21_Email__c
                                                                         FROM d21_Security_Verification__c 
                                                                         WHERE d21_Email__c =: email 
                                                                         AND Name =: verificationOTPinput 
                                                                         LIMIT 1];
            if(!verificationRceordList.isEmpty()){
                delete verificationRceordList;
                return new Response(true, 'OTP is Verified');
            }
            return new Response(false, 'OTP is not Verified');
        }
        catch(Exception e){
            return new Response(false,e.getStackTraceString()+' - '+e.getMessage()+' - '+e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static Response updateGetStarted(string contactObj){
        try {
            DonorRegistrationWrapper wrapper = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
            list<contact> conList = [select Id,Email,Progress__c,phone from Contact Where Email =:wrapper.email or phone =: wrapper.Phone limit 1];
            if(!conList.isEmpty()){
                
                if((conList[0].Email == wrapper.email) && (conList[0].Phone != wrapper.phone)){
                    return new Response(false,'Email Exists');
                } 
                
                if((conList[0].Email != wrapper.email) && (conList[0].Phone == wrapper.phone)){
                    return new Response(false,'Phone Exists');
                } 
                
                if((conList[0].Email == wrapper.email) && (conList[0].Phone == wrapper.phone)){
                    if(conList[0].Progress__c == 'Completed'){
                        return new Response(false,'Completed');
                    }
                    else{
                        Contact con = new Contact(
                            FirstName = wrapper.firstName,
                            LastName = wrapper.lastName,
                            Email = wrapper.email,
                            Phone = wrapper.phone,
                            d21_Preferred_Username__c = wrapper.preferredUserName,
                            d21_Preferred_Password__c = wrapper.preferredPassword,
                            d21_Verification_Type__c = wrapper.verificationType,
                            d21_Donor_Terms_and_Conditions__c = wrapper.terms,
                            Id = conList[0].Id
                        );
                        update con;
                        DonorRegistrationWrapper res = new DonorRegistrationWrapper();
                        res.firstName = con.FirstName;
                        res.lastName = con.LastName;
                        res.phone = con.Phone;
                        res.email = con.Email;
                        res.donorId = con.Id;
                        res.preferredUserName = con.d21_Preferred_Username__c;
                        res.preferredPassword = con.d21_Preferred_Password__c;
                        res.verificationType = con.d21_Verification_Type__c;
                        res.terms = con.d21_Donor_Terms_and_Conditions__c;
                        return new Response(true,JSON.serialize(res));
                    }
                }
                else{
                    return null;
                }
            }
            else{
                string recordTypeName = (wrapper.donorType == 'sperm') ? 'Sperm Donor' : 'Egg Donor';
                Account acc = new Account();
                acc.Name = wrapper.lastName;
                acc.recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Donor Household').getRecordTypeId();
                insert acc;
                system.debug('Account >>> '+acc);
                Contact con = new Contact(
                    FirstName = wrapper.firstName,
                    LastName = wrapper.lastName,
                    Email = wrapper.email,
                    Phone = wrapper.phone,
                    AccountId = acc.Id,
                    d21_Preferred_Username__c = wrapper.preferredUserName,
                    d21_Preferred_Password__c = wrapper.preferredPassword,
                    d21_Verification_Type__c = wrapper.verificationType,
                    d21_Donor_Terms_and_Conditions__c = wrapper.terms,
                    recordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get(recordTypeName).getRecordTypeId(),
                    Progress__c = 'Get Started'
                );
                insert con;
                system.debug('Contact >>> '+con);
                DonorRegistrationWrapper res = new DonorRegistrationWrapper();
                res.firstName = con.FirstName;
                res.lastName = con.LastName;
                res.phone = con.Phone;
                res.email = con.Email;
                res.donorId = con.Id;
                res.preferredUserName = con.d21_Preferred_Username__c;
                res.preferredPassword = con.d21_Preferred_Password__c;
                res.verificationType = con.d21_Verification_Type__c;
                res.terms = con.d21_Donor_Terms_and_Conditions__c;
                return new Response(true,JSON.serialize(res));
            }
        }        
        catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static Response sendOTPToEmailOrPhone(string contactObj,Boolean isOtpType){
        try {
            DonorRegistrationWrapper wrapper = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
            String otpData = string.valueOf(math.abs(Crypto.getRandomLong()));
            Integer otpCode = Integer.valueOf(otpData.substring(0, 6));
            string email = '';
            string phone = '';
            if(isOtpType){
                email = wrapper.email;
                phone = wrapper.Phone;
            }
            else{
                email = wrapper.alternateDetails.email;
                phone = wrapper.alternateDetails.phone;
            }
            if(wrapper.verificationType == 'Both' || wrapper.verificationType == 'Phone'){
                String accountSid = 'ACf7cf16139492ed2ae2af8b95e87743a9';
                String authToken  = '0c200315ada0730d0e11a67e3ba03279';
                
                HttpRequest req = new HttpRequest();
                req.setEndpoint('https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json');
                req.setMethod('POST');
                
                String version = '3.2.0';
                req.setHeader('X-Twilio-Client', 'salesforce-' + version);
                req.setHeader('User-Agent', 'twilio-salesforce/' + version);
                req.setHeader('Accept', 'application/json');
                req.setHeader('Accept-Charset', 'utf-8');
                req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                
                String authHeader = 'Basic ' + EncodingUtil.base64Encode(Blob.valueOf(accountSid + ':' + authToken));
                req.setHeader('Authorization', authHeader);
                
                String fromPhone = '+14159935694';
                String messageBody = string.valueOf(otpCode) + ' is your Donor OTP. Do not share it with anyone.';
                
                String body = 'To=' + EncodingUtil.urlEncode(phone, 'UTF-8') +
                    '&From=' + EncodingUtil.urlEncode(fromPhone, 'UTF-8') +
                    '&Body=' + EncodingUtil.urlEncode(messageBody, 'UTF-8');
                req.setBody(body);
                
                Http http = new Http();
                // HttpResponse response = http.send(req);
                // System.debug(response.getBody());
            }
            if(wrapper.verificationType == 'Both' || wrapper.verificationType == 'Email'){
                OrgWideEmailAddress owea = [SELECT Id FROM OrgWideEmailAddress 
                                            WHERE DisplayName = 'Megan' 
                                            LIMIT 1];
                
                EmailTemplate emailTempRec = [SELECT Id, Subject, HtmlValue 
                                              FROM EmailTemplate 
                                              WHERE DeveloperName = 'Donor_21_Verification_Codes' 
                                              LIMIT 1];
                
                String templateHtmlValue = emailTempRec.HtmlValue;
                String templateSubject = emailTempRec.Subject;
                templateHtmlValue = templateHtmlValue.replace('{!relatedTo.Name}', string.valueOf(otpCode));
                Contact con = [SELECT Id FROM Contact WHERE Email =: email AND Phone =: phone limit 1];
                Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
                message.setTargetObjectId(con.Id);
                message.setOrgWideEmailAddressId(owea.Id);
                message.setSaveAsActivity(false);
                message.setHtmlBody(templateHtmlValue);
                message.setSubject(templateSubject);
                Messaging.SendEmailResult[] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[] { message });
                system.debug('results >>> '+results);
            }
            d21_Security_Verification__c verification = new d21_Security_Verification__c();
            verification.Name = string.valueOf(otpCode);
            verification.d21_Email__c = email;
            verification.d21_Phone__c = phone;
            insert verification;
            return new Response(true,isOtpType ? 'true' : 'false');
        }        
        catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static Response deleteOTPCode(string contactObj){
        try{
            DonorRegistrationWrapper wrapper = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
            delete [select id from d21_Security_Verification__c Where d21_Email__c = :wrapper.email];
            return new Response(true,'OTP is Deleted.');
        }catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static Response validateCodeSubmission(string contactObj){
        try {
            DonorRegistrationWrapper wrapper = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
            system.debug('wrapper : '+wrapper);
            list<string> matchedCodes = new list<string>();
            list<string> NoMatchedCodes = new list<string>();
            list<string> codeList = new list<string>();
            codeList.addAll(wrapper.codes.PMC);
            codeList.addAll(wrapper.codes.EDN);
            codeList.addAll(wrapper.codes.SDN);
            codeList.addAll(wrapper.codes.EMB);
            codeList.addAll(wrapper.codes.REC);
            list<d21_Associated_Codes__c> associateCodeList = [select Id,Name
                                                               from d21_Associated_Codes__c Where (Name IN :wrapper.codes.EDN AND d21_Type__c = 'EDN') 
                                                               OR (Name IN :wrapper.codes.SDN AND d21_Type__c = 'SDN')
                                                               OR (Name IN :wrapper.codes.EMB AND d21_Type__c = 'EMB')
                                                               OR (Name IN :wrapper.codes.REC AND d21_Type__c = 'REC')];
            list<d21_PMC__c> PMCList = [Select Id,Name from d21_PMC__c Where Name IN :wrapper.codes.PMC];  
            for(d21_Associated_Codes__c associateCode : associateCodeList){
                matchedCodes.add(associateCode.Name);
            }
            for(d21_PMC__c pmc : PMCList){
                matchedCodes.add(pmc.Name);
            }
            system.debug('matchedCodes >>> '+matchedCodes);
            system.debug('codeList >>> '+codeList);
            for (String name : codeList) {
                if (!matchedCodes.contains(name)) {
                    NoMatchedCodes.add(name);
                }
            }
            system.debug('NoMatchedCodes >>> '+NoMatchedCodes);
            return new Response(true,JSON.serialize(NoMatchedCodes));
            
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static Response verifyReEnterCodes(string contactObj){
        try {
            DonorRegistrationWrapper wrapper = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
            list<string> codeList = new list<string>();
            list<string> pmcList = new list<string>();
            for(string code : wrapper.newCodeList){
                if(code.contains('PMC')){
                    pmcList.add(code);
                }else{
                    codeList.add(code);
                }
            }
            system.debug('pmcList >>> '+pmcList);
            system.debug('codeList >>> '+codeList);
            list<d21_Associated_Codes__c> associateCodeList = [select Id,Name from d21_Associated_Codes__c Where Name IN :codeList];
            list<d21_PMC__c> PMCRecords = [Select Id,Name from d21_PMC__c Where Name IN :pmcList];  
            system.debug('associateCodeList >>> '+associateCodeList);
            system.debug('PMCRecords >>> '+PMCRecords);
            if(!(codeList.size() == associateCodeList.size())){
                return new Response(false,'Not Matched');
            }
            if(!(pmcList.size() == PMCRecords.size())){
                return new Response(false,'Not Matched');
            }
            return new Response(true,'Matched');
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static Response updateDonationBasics(string contactObj){
        try {
            DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
            system.debug('donor >>>  '+donor);
            contact con = new contact();
            con.Id = donor.donorId;
            if(donor.donorType == 'egg'){
                con.d21_In_Cycle_Or_Future_Donation__c = (donor.donationBasics.egg.currentOrFutureDonation != null) ? donor.donationBasics.egg.currentOrFutureDonation : false;
                con.d21_No_Of_Donations_Completed__c = donor.donationBasics.egg.liveBirths;
                con.d21_Have_Intended_Parent_Contact_Info__c = (donor.donationBasics.egg.haveIntendedParentDetails != null) ? donor.donationBasics.egg.haveIntendedParentDetails : false;
                con.d21_Worked_with_Agency_Egg_Bank__c = (donor.donationBasics.egg.workWithAnyAgencyOrEggBank != null) ? donor.donationBasics.egg.workWithAnyAgencyOrEggBank : false;
                con.d21_Worked_With_Fertility_Attorney__c = (donor.donationBasics.egg.workWithAttorney != null) ? donor.donationBasics.egg.workWithAttorney : false;
            }
            else if(donor.donorType == 'sperm'){
                con.d21_Worked_With_Sperm_Bank__c = (donor.donationBasics.sperm.workWithAnySpermBank != null) ? donor.donationBasics.sperm.workWithAnySpermBank : false;
                con.d21_Worked_With_Clinic__c = (donor.donationBasics.sperm.workWithAnyClinic != null) ? donor.donationBasics.sperm.workWithAnyClinic : false;
                con.d21_Have_Intended_Parent_Contact_Info__c = (donor.donationBasics.sperm.haveIntendedParentDetailsForSperm != null) ?  donor.donationBasics.sperm.haveIntendedParentDetailsForSperm : false;
            }
            update con;
            return new Response(true, 'Updated Donation Basics');
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled 
    public static Response updateDonationCycles(String contactObj) {
        try {
            
            CycleResponse res = new  CycleResponse();
            DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);
            Integer liveBirths = donor.donationBasics.egg.liveBirths;
            List<d21_Cycle__c> insertCycleList = new List<d21_Cycle__c>();
            List<Cycle> allCycles = new List<Cycle>();
            
            List<d21_Cycle__c> existingCycles = [
                SELECT Id, Name ,d21_Agency__c,d21_Clinic__c,d21_Attorney__c
                FROM d21_Cycle__c 
                WHERE d21_Donor__c = :donor.donorId
            ];
            
            system.debug('existingCycles >>> '+existingCycles);
            
            if (existingCycles.size() != liveBirths) {
                res.isChanged = true;
                if (!existingCycles.isEmpty()) {
                    set<Id> accIds = new set<Id>();
                    set<Id> conIds = new set<Id>();
                    list<d21_PMC__c> allPMC = [SELECT Id,d21_Agency__c,d21_Clinic__c,d21_Attorney__c FROM d21_PMC__c LIMIT 49999];
                    list<d21_Donor_Agency__c> donorAgencyList = [SELECT Id FROM d21_Donor_Agency__c WHERE d21_Egg_Donor__c =:donor.donorId];
                    list<d21_Donor_Fertility_Clinic__c> donorClinicList = [SELECT Id FROM d21_Donor_Fertility_Clinic__c WHERE d21_Donor__c =:donor.donorId];
                    list<d21_Donor_Fertility_Attorney__c> donorAttorneyList = [SELECT Id FROM d21_Donor_Fertility_Attorney__c WHERE d21_Donor__c =:donor.donorId];
                    for(d21_Cycle__c cycle : existingCycles){
                        accIds.add(cycle.d21_Agency__c);
                        accIds.add(cycle.d21_Clinic__c);
                        conIds.add(cycle.d21_Attorney__c);
                    }
                    system.debug('accIds >>> '+accIds);
                    system.debug('conIds >>> '+conIds);
                    for(d21_PMC__c pmc : allPMC){
                        if(accIds.contains(pmc.d21_Agency__c)){
                            accIds.remove(pmc.d21_Agency__c);
                        }
                        if(accIds.contains(pmc.d21_Clinic__c)){
                            accIds.remove(pmc.d21_Clinic__c);
                        }
                        if(conIds.contains(pmc.d21_Attorney__c)){
                            conIds.remove(pmc.d21_Attorney__c);
                        }
                    } 
                    system.debug('accIds >>> '+accIds);
                    system.debug('conIds >>> '+conIds);
                    if(!accIds.isEmpty()){
                        delete [SELECT Id FROM Account WHERE Id IN :accIds];
                    }
                    if(!conIds.isEmpty()){
                        delete [SELECT Id FROM Contact WHERE Id IN :conIds];
                    } 
                    if(!donorAgencyList.isEmpty()){
                        try{
                            delete donorAgencyList;
                        }catch(Exception e){
                            system.debug('Error >>> '+e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
                        }
                    }  
                    if(!donorClinicList.isEmpty()){
                        delete donorClinicList;
                    } 
                    if(!donorAttorneyList.isEmpty()){
                        delete donorAttorneyList;
                    }                
                    delete existingCycles;
                }
                for (Integer i = 1; i <= liveBirths; i++) {
                    d21_Cycle__c cycle = new d21_Cycle__c(
                        Name = 'Cycle ' + i,
                        d21_Donor__c = donor.donorId
                    );
                    insertCycleList.add(cycle);
                }
                
                if (!insertCycleList.isEmpty()) {
                    insert insertCycleList;
                    system.debug('insertCycleList >>> '+insertCycleList);
                    for (d21_Cycle__c cyc : insertCycleList) {
                        Cycle rec = new Cycle();
                        rec.Id = cyc.Id;
                        rec.Name = cyc.Name;
                        allCycles.add(rec);
                    }
                }
            }
            else{
                res.isChanged = false;
                for (d21_Cycle__c cyc : existingCycles) {
                    Cycle rec = new Cycle();
                    rec.Id = cyc.Id;
                    rec.Name = cyc.Name;
                    allCycles.add(rec);
                }
            }
            res.allCyclesData = JSON.serialize(allCycles);
            return new Response(true, JSON.serialize(res));
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static Response updateAgencyWithoutCode(String contactObj) {
        try {
            DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);           
            system.debug('donor >>> '+donor);
            List<Account> accountsToUpsert = new List<Account>();
            List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
            Map<string,Account> cycleAccountMap = new Map<string,Account>();
            list<d21_Donor_Agency__c> donorAgencyList = new list<d21_Donor_Agency__c>();
            Set<Id> accIds = new Set<Id>();
            list<RecordWrapper> agencyList  = donor.agenciesWithoutCode;
            system.debug('donor.agenciesWithoutCode >>> '+donor.agenciesWithoutCode);
            list<d21_Cycle__c> cyclist = [SELECT Id,Name,d21_Agency__c,d21_Donor__c,d21_Clinic__c,d21_Agency__r.Name FROM d21_Cycle__c WHERE d21_Donor__c =:donor.donorId];
            
            for (RecordWrapper acc : donor.agenciesWithoutCode) {
                if(!acc.selectedCycles.isEmpty()){
                    Account a = new Account(
                        Id = String.isNotBlank(acc.agencyId) ? acc.agencyId : null,
                        Name = acc.AgencyName,
                        Website = acc.Website,
                        Phone = acc.Phone,
                        d21_Email__c = acc.Email,
                        recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Agency').getRecordTypeId(),
                        d21_Coordinator_Name__c = acc.CoordinatorName
                    );
                    accountsToUpsert.add(a);
                    for(Cycles cycle : acc.cycles){
                        if(cycle.checked){
                            cycleAccountMap.put(cycle.cycleName,a);
                        }
                    }
                }
            }
            
            system.debug('accountsToUpsert >>> '+accountsToUpsert);
            system.debug('agencyList >>> '+agencyList);
            
            if(!accountsToUpsert.isEmpty()){
                upsert accountsToUpsert;
                for (Integer i = 0; i < agencyList.size(); i++) {
                    if(!agencyList[i].selectedCycles.isEmpty() && accountsToUpsert.size() > i){
                        agencyList[i].agencyId = accountsToUpsert[i].Id;
                        system.debug('Agency >>> '+agencyList[i]);
                    }
                }
            }
            
            for(d21_Cycle__c cycle : cyclist){
                cycle.d21_Agency__c = cycleAccountMap.containsKey(cycle.Name) ? cycleAccountMap.get(cycle.Name).Id : null;
            }
            
            list<Cycle> dataList = new list<Cycle>();
            if(!cyclist.isEmpty()){
                update cyclist;
                list<d21_Donor_Agency__c> deleteDonorAgencyList = [SELECT Id,d21_Egg_Donor__c FROM d21_Donor_Agency__c WHERE d21_Egg_Donor__c =:donor.donorId];
                if(!deleteDonorAgencyList.isEmpty()){
                    delete deleteDonorAgencyList;
                }
                for(d21_Cycle__c cyc : cyclist){
                    if(!accIds.contains(cyc.d21_Agency__c) && cycleAccountMap.containsKey(cyc.Name)){
                        d21_Donor_Agency__c donorAgency = new d21_Donor_Agency__c();
                        donorAgency.Name = cycleAccountMap.get(cyc.Name).Name;
                        donorAgency.d21_Egg_Donor__c = donor.donorId;
                        donorAgency.Agency__c = cyc.d21_Agency__c;
                        donorAgencyList.add(donorAgency);
                        accIds.add(cyc.d21_Agency__c);
                    }
                }
                if(!donorAgencyList.isEmpty()){
                    insert donorAgencyList;
                }
            }
            return new Response(true, JSON.serialize(agencyList));
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static Response updateClinicWithoutCode(String contactObj) {
        try {
            DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);           
            system.debug('donor >>> '+donor);
            List<Account> accountsToUpsert = new List<Account>();
            List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
            Map<string,Account> cycleAccountMap = new Map<string,Account>();
            list<d21_Donor_Fertility_Clinic__c> donorAgencyList = new list<d21_Donor_Fertility_Clinic__c>();
            Set<Id> accIds = new Set<Id>();
            list<RecordWrapper> agencyList  = donor.clinicsWithoutCode;
            system.debug('donor.clinicsWithoutCode >>> '+donor.clinicsWithoutCode);
            list<d21_Cycle__c> cyclist = [SELECT Id,Name,d21_Agency__c,d21_Donor__c,d21_Clinic__c,d21_Agency__r.Name FROM d21_Cycle__c WHERE d21_Donor__c =:donor.donorId];
            
            for (RecordWrapper acc : donor.clinicsWithoutCode) {
                if(!acc.selectedCycles.isEmpty()){
                    Account a = new Account(
                        Id = String.isNotBlank(acc.agencyId) ? acc.agencyId : null,
                        Name = acc.ClinicName,
                        Website = acc.Website,
                        Phone = acc.Phone,
                        d21_Email__c = acc.Email,
                        d21_Doctor_Name__c = acc.DoctorName,
                        d21_City_State_Of_Clinic__c = acc.CityStateOfClinic,
                        recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Clinic').getRecordTypeId(),
                        d21_Coordinator_Name__c = acc.CoordinatorName
                    );
                    accountsToUpsert.add(a);
                    for(Cycles cycle : acc.cycles){
                        if(cycle.checked){
                            cycleAccountMap.put(cycle.cycleName,a);
                        }
                    }
                }
            }
            
            system.debug('accountsToUpsert >>> '+accountsToUpsert);
            system.debug('agencyList >>> '+agencyList);
            
            if(!accountsToUpsert.isEmpty()){
                upsert accountsToUpsert;
                for (Integer i = 0; i < agencyList.size(); i++) {
                    if(!agencyList[i].selectedCycles.isEmpty() && accountsToUpsert.size() > i){
                        agencyList[i].agencyId = accountsToUpsert[i].Id;
                        system.debug('Agency >>> '+agencyList[i]);
                    }
                }
            }
            
            for(d21_Cycle__c cycle : cyclist){
                cycle.d21_Clinic__c = cycleAccountMap.containsKey(cycle.Name) ? cycleAccountMap.get(cycle.Name).Id : null;
            }
            
            list<Cycle> dataList = new list<Cycle>();
            if(!cyclist.isEmpty()){
                update cyclist;
                list<d21_Donor_Fertility_Clinic__c> deleteDonorAgencyList = [SELECT Id,d21_Donor__c FROM d21_Donor_Fertility_Clinic__c WHERE d21_Donor__c =:donor.donorId];
                if(!deleteDonorAgencyList.isEmpty()){
                    delete deleteDonorAgencyList;
                }
                for(d21_Cycle__c cyc : cyclist){
                    if(!accIds.contains(cyc.d21_Clinic__c) && cycleAccountMap.containsKey(cyc.Name)){
                        d21_Donor_Fertility_Clinic__c donorAgency = new d21_Donor_Fertility_Clinic__c();
                        donorAgency.Name = cycleAccountMap.get(cyc.Name).Name;
                        donorAgency.d21_Donor__c = donor.donorId;
                        donorAgency.d21_Clinic__c = cyc.d21_Clinic__c;
                        donorAgencyList.add(donorAgency);
                        accIds.add(cyc.d21_Clinic__c);
                    }
                    Cycle record = new Cycle();
                    record.Name = cyc.Name;
                    record.Id = cyc.Id;
                    record.agencyId = cyc.d21_Clinic__c;
                    dataList.add(record);
                }
                if(!donorAgencyList.isEmpty()){
                    insert donorAgencyList;
                }
            }
            return new Response(true, JSON.serialize(agencyList));
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static Response updateRecipientWithoutCode(String contactObj) {
        try {
            DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);           
            system.debug('donor >>> '+donor);
            List<Account> accountsToUpsert = new List<Account>();
            List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
            Map<string,Account> cycleAccountMap = new Map<string,Account>();
            list<d21_Donor_Recipient__c> donorAgencyList = new list<d21_Donor_Recipient__c>();
            Set<Id> accIds = new Set<Id>();
            list<RecordWrapper> agencyList  = donor.recipientsWithoutCode;
            system.debug('donor.recipientsWithoutCode >>> '+donor.recipientsWithoutCode);
            list<d21_Cycle__c> cyclist = [SELECT Id,Name,d21_Agency__c,d21_Donor__c,d21_Clinic__c,d21_Agency__r.Name FROM d21_Cycle__c WHERE d21_Donor__c =:donor.donorId];
            
            for (RecordWrapper acc : donor.recipientsWithoutCode) {
                if(!acc.selectedCycles.isEmpty()){
                    Account a = new Account(
                        Id = String.isNotBlank(acc.agencyId) ? acc.agencyId : null,
                        Name = acc.recipient1LastName,
                        Phone = acc.Phone,
                        d21_Email__c = acc.Email,
                        recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Parent Household').getRecordTypeId()
                    );
                    accountsToUpsert.add(a);
                    for(Cycles cycle : acc.cycles){
                        if(cycle.checked){
                            cycleAccountMap.put(cycle.cycleName,a);
                        }
                    }
                }
            }
            
            system.debug('accountsToUpsert >>> '+accountsToUpsert);
            system.debug('agencyList >>> '+agencyList);
            
            if(!accountsToUpsert.isEmpty()){
                upsert accountsToUpsert;
                Map<Id,Account> accountMap = new Map<Id,Account>(accountsToUpsert);
                list<contact> insertContactRecords = new list<contact>();
                list<contact> conlist = [SELECT Id FROM Contact WHERE AccountId IN :accountMap.keySet()];
                if(!conlist.isEmpty()){
                    delete conlist;
                }
                for (Integer i = 0; i < agencyList.size(); i++) {
                    if(!agencyList[i].selectedCycles.isEmpty() && accountsToUpsert.size() > i){
                        agencyList[i].agencyId = accountsToUpsert[i].Id;
                        insertContactRecords.add(new contact(LastName = agencyList[i].recipient1LastName,FirstName = agencyList[i].recipient1FirstName,Phone = agencyList[i].Phone,Email = agencyList[i].Email));
                    }
                }
                
                if(!insertContactRecords.isEmpty()){
                    insert insertContactRecords;
                }
            }
            
            for(d21_Cycle__c cycle : cyclist){
                cycle.Recipient__c = cycleAccountMap.containsKey(cycle.Name) ? cycleAccountMap.get(cycle.Name).Id : null;
            }
            
            list<Cycle> dataList = new list<Cycle>();
            if(!cyclist.isEmpty()){
                update cyclist;
                list<d21_Donor_Recipient__c> deleteDonorAgencyList = [SELECT Id,d21_Contact__c FROM d21_Donor_Recipient__c WHERE d21_Contact__c =:donor.donorId];
                if(!deleteDonorAgencyList.isEmpty()){
                    delete deleteDonorAgencyList;
                }
                for(d21_Cycle__c cyc : cyclist){
                    if(!accIds.contains(cyc.Recipient__c) && cycleAccountMap.containsKey(cyc.Name)){
                        d21_Donor_Recipient__c donorAgency = new d21_Donor_Recipient__c();
                        donorAgency.Name = cycleAccountMap.get(cyc.Name).Name;
                        donorAgency.d21_Contact__c = donor.donorId;
                        donorAgency.d21_Recipient__c = cyc.Recipient__c;
                        donorAgencyList.add(donorAgency);
                        accIds.add(cyc.Recipient__c);
                    }
                }
                if(!donorAgencyList.isEmpty()){
                    insert donorAgencyList;
                }
            }
            return new Response(true, JSON.serialize(agencyList));
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static Response updateAttorneyWithoutCode(String contactObj) {
        try {
            system.debug('contactObj >>> '+contactObj);
            DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);           
            system.debug('donor >>> '+donor);
            List<Contact> accountsToUpsert = new List<Contact>();
            List<d21_Cycle__c> cycleList = new List<d21_Cycle__c>();
            Map<string,Contact> cycleAccountMap = new Map<string,Contact>();
            Map<string,Account> powerAccountMap = new Map<string,Account>();
            list<d21_Donor_Fertility_Attorney__c> donorAgencyList = new list<d21_Donor_Fertility_Attorney__c>();
            Set<Id> accIds = new Set<Id>();
            list<RecordWrapper> agencyList  = donor.AttorniesWithoutCode;
            list<Account> attorneyAccountList = new list<Account>();
            system.debug('donor.clinicsWithoutCode >>> '+donor.AttorniesWithoutCode);
            list<d21_Cycle__c> cyclist = [SELECT Id,d21_Attorney__c,Name,d21_Agency__c,d21_Donor__c,d21_Clinic__c,d21_Agency__r.Name FROM d21_Cycle__c WHERE d21_Donor__c =:donor.donorId];
            
            for (RecordWrapper acc : donor.AttorniesWithoutCode) {
                if(!acc.selectedCycles.isEmpty()){
                    if(string.isNotBlank(acc.LawFirm)){
                        Account acct = new Account();
                        acct.Name = acc.LawFirm;
                        acct.d21_Coordinator_Name__c = acc.CoordinatorName;
                        acct.Website = acc.Website;
                        acct.d21_City_State_Of_Clinic__c = acc.State;
                        acct.recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Attorney').getRecordTypeId();
                        attorneyAccountList.add(acct);
                        powerAccountMap.put(acc.LawFirm+' '+acc.AttorneyName,acct);
                    }
                    Contact a = new Contact(
                        Id = String.isNotBlank(acc.agencyId) ? acc.agencyId : null,
                        LastName = acc.AttorneyName,
                        FirstName = acc.LawFirm,
                        Phone = acc.Phone,
                        Email = acc.Email,
                        recordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Attorney').getRecordTypeId()
                    );
                    accountsToUpsert.add(a);
                    for(Cycles cycle : acc.cycles){
                        if(cycle.checked){
                            cycleAccountMap.put(cycle.cycleName,a);
                        }
                    }
                }
            }
            
            
            if(!powerAccountMap.values().isEmpty()){
                insert powerAccountMap.values();
            }
            
            system.debug('accountsToUpsert >>> '+accountsToUpsert);
            system.debug('agencyList >>> '+agencyList);
            
            if(!accountsToUpsert.isEmpty()){
                for(contact con : accountsToUpsert){
                    if(powerAccountMap.containsKey(con.FirstName+' '+con.LastName)){
                        con.AccountId = powerAccountMap.get(con.FirstName+' '+con.LastName).Id;
                        con.FirstName = '';
                    }
                }
                upsert accountsToUpsert;
                
                for (Integer i = 0; i < agencyList.size(); i++) {
                    if(!agencyList[i].selectedCycles.isEmpty() && accountsToUpsert.size() > i){
                        agencyList[i].agencyId = accountsToUpsert[i].Id;
                        system.debug('Agency >>> '+agencyList[i]);
                    }
                }
            }
            
            for(d21_Cycle__c cycle : cyclist){
                cycle.d21_Attorney__c = cycleAccountMap.containsKey(cycle.Name) ? cycleAccountMap.get(cycle.Name).Id : null;
            }
            
            list<Cycle> dataList = new list<Cycle>();
            if(!cyclist.isEmpty()){
                update cyclist;
                list<d21_Donor_Fertility_Attorney__c> deleteDonorAgencyList = [SELECT Id,d21_Donor__c,d21_Attorney__c FROM d21_Donor_Fertility_Attorney__c WHERE d21_Donor__c =:donor.donorId];
                if(!deleteDonorAgencyList.isEmpty()){
                    delete deleteDonorAgencyList;
                }
                for(d21_Cycle__c cyc : cyclist){
                    if(!accIds.contains(cyc.d21_Attorney__c) && cycleAccountMap.containsKey(cyc.Name)){
                        d21_Donor_Fertility_Attorney__c donorAgency = new d21_Donor_Fertility_Attorney__c();
                        donorAgency.Name = cycleAccountMap.get(cyc.Name).Name;
                        donorAgency.d21_Donor__c = donor.donorId;
                        donorAgency.d21_Attorney__c = cyc.d21_Attorney__c;
                        donorAgencyList.add(donorAgency);
                        accIds.add(cyc.d21_Attorney__c);
                    }
                    Cycle record = new Cycle();
                    record.Name = cyc.Name;
                    record.Id = cyc.Id;
                    record.agencyId = cyc.d21_Clinic__c;
                    dataList.add(record);
                }
                if(!donorAgencyList.isEmpty()){
                    insert donorAgencyList;
                }
            }
            return new Response(true, JSON.serialize(agencyList));
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static  Response fetchSpermDonorDetails(string contactObj){
        try {
            DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);  
            system.debug('Donor >>> '+donor);
            list<BankDetails> banks = new list<BankDetails>();
            list<string> codeMergeList = new list<string>();
            codeMergeList.addAll(donor.codes.EDN);
            codeMergeList.addAll(donor.codes.SDN);
            codeMergeList.addAll(donor.codes.EMB);
            codeMergeList.addAll(donor.codes.REC);
            list<d21_Associated_Codes__c> associateCodeList = [SELECT Id,Name,
                                                               d21_PMC_Code__r.d21_Sperm_Bank__r.Name, 
                                                               d21_PMC_Code__r.d21_Sperm_Bank__r.Website,
                                                               d21_PMC_Code__r.d21_Sperm_Bank__r.Phone,
                                                               d21_PMC_Code__r.d21_Sperm_Bank__r.d21_Email__c,
                                                               d21_PMC_Code__r.d21_Sperm_Bank__r.d21_Coordinator_Name__c
                                                               FROM d21_Associated_Codes__c
                                                               WHERE Name IN :codeMergeList];
            system.debug(associateCodeList);
            for(d21_Associated_Codes__c code : associateCodeList){
                BankDetails b = new BankDetails();
                b.bankName = code.d21_PMC_Code__r.d21_Sperm_Bank__r.Name;
                b.coordinatorName = code.d21_PMC_Code__r.d21_Sperm_Bank__r.d21_Coordinator_Name__c;
                b.website = code.d21_PMC_Code__r.d21_Sperm_Bank__r.Website;
                b.phone = code.d21_PMC_Code__r.d21_Sperm_Bank__r.Phone;
                b.email = code.d21_PMC_Code__r.d21_Sperm_Bank__r.d21_Email__c;
                banks.add(b);
            }
            system.debug(banks);
            return new Response(true,JSON.serialize(banks));
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static  Response fetchSpermDonorClinicDetails(string contactObj){//SpermClinicDetails
        try {
            DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);  
            system.debug('Donor >>> '+donor);
            list<BankDetails> banks = new list<BankDetails>();
            list<string> codeMergeList = new list<string>();
            codeMergeList.addAll(donor.codes.EDN);
            codeMergeList.addAll(donor.codes.SDN);
            codeMergeList.addAll(donor.codes.EMB);
            codeMergeList.addAll(donor.codes.REC);
            list<d21_Associated_Codes__c> associateCodeList = [SELECT Id,Name,
                                                               d21_PMC_Code__r.d21_Clinic__r.Name, 
                                                               d21_PMC_Code__r.d21_Clinic__r.Website,
                                                               d21_PMC_Code__r.d21_Clinic__r.Phone,
                                                               d21_PMC_Code__r.d21_Clinic__r.d21_Email__c,
                                                               d21_PMC_Code__r.d21_Clinic__r.d21_Coordinator_Name__c
                                                               FROM d21_Associated_Codes__c
                                                               WHERE Name IN :codeMergeList];
            system.debug(associateCodeList);
            for(d21_Associated_Codes__c code : associateCodeList){
                BankDetails b = new BankDetails();
                b.bankName = code.d21_PMC_Code__r.d21_Clinic__r.Name;
                b.coordinatorName = code.d21_PMC_Code__r.d21_Clinic__r.d21_Coordinator_Name__c;
                b.website = code.d21_PMC_Code__r.d21_Clinic__r.Website;
                b.phone = code.d21_PMC_Code__r.d21_Clinic__r.Phone;
                b.email = code.d21_PMC_Code__r.d21_Clinic__r.d21_Email__c;
                banks.add(b);
            }
            
            system.debug(banks);
            
            return new Response(true,JSON.serialize(banks));
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled
    public static Response verifyGivenCodesEmail(string contactObj){
        try {
            DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);  
            system.debug('Donor >>> '+donor);
            list<string> codeList = new list<string>();
            list<string> pmcList = new list<string>();
            for(string code : donor.newCodeList){
                if(code.contains('PMC')){
                    pmcList.add(code);
                }else{
                    codeList.add(code);
                }
            }
            list<d21_Associated_Codes__c> associateCodeList = [select Id,Name,d21_PMC_Code__r.d21_SpermDonor__r.Email,d21_PMC_Code__r.d21_EggDonor__r.Email from d21_Associated_Codes__c Where Name IN :codeList limit 1];
            list<d21_PMC__c> PMCRecords = [Select Id,Name,d21_SpermDonor__r.Email,d21_EggDonor__r.Email from d21_PMC__c Where Name IN :pmcList limit 1]; 
            if(donor.donorType == 'egg'){
                if(!PMCRecords.isEmpty()){
                    if(PMCRecords[0].d21_EggDonor__r.Email == donor.email){
                        return new Response(true,'Email matched');
                    }else if(!associateCodeList.isEmpty()){
                        if(associateCodeList[0].d21_PMC_Code__r.d21_EggDonor__r.Email == donor.email){
                            return new Response(true,'Email matched');
                        }else{
                            return new Response(false,'Email not matched');
                        }
                    }
                    else{
                        return new Response(false,'No Code Records');
                    }
                }
                else if(!associateCodeList.isEmpty()){
                    if(associateCodeList[0].d21_PMC_Code__r.d21_EggDonor__r.Email == donor.email){
                        return new Response(true,'Email matched');
                    }else{
                        return new Response(false,'Email not matched');
                    }
                }
                else{
                    return new Response(false,'No Code Records');
                }
            }
            else{
                if(!PMCRecords.isEmpty()){
                    if(PMCRecords[0].d21_SpermDonor__r.Email == donor.email){
                        return new Response(true,'Email matched');
                    }else if(!associateCodeList.isEmpty()){
                        if(associateCodeList[0].d21_PMC_Code__r.d21_SpermDonor__r.Email == donor.email){
                            return new Response(true,'Email matched');
                        }else{
                            return new Response(false,'Email not matched');
                        }
                    }
                    else{
                        return new Response(false,'No Code Records');
                    }
                }
                else if(!associateCodeList.isEmpty()){
                    if(associateCodeList[0].d21_PMC_Code__r.d21_SpermDonor__r.Email == donor.email){
                        return new Response(true,'Email matched');
                    }else{
                        return new Response(false,'Email not matched');
                    }
                }
                else{
                    return new Response(false,'No Code Records');
                }
            }
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    @AuraEnabled 
    public static Response pmcEmailVerification(String contactObj) {
        try {
            DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(contactObj, DonorRegistrationWrapper.class);  
            
            List<String> allCodes = donor.newCodeList != null 
                ? donor.newCodeList 
                : new List<String>();
            allCodes.addAll(donor.codes.PMC);
            allCodes.addAll(donor.codes.EDN);
            allCodes.addAll(donor.codes.SDN);
            allCodes.addAll(donor.codes.EMB);
            allCodes.addAll(donor.codes.REC);
            
            List<String> pmcList = new List<String>();
            List<String> codeList = new List<String>();
            
            for (String code : allCodes) {
                if (code.contains('PMC')) {
                    pmcList.add(code);
                } else {
                    codeList.add(code);
                }
            }
            
            List<d21_Associated_Codes__c> associateCodeList = [
                SELECT Id, Name,
                d21_PMC_Code__r.d21_EggDonor__r.Email, d21_PMC_Code__r.d21_EggDonor__r.Phone,
                d21_PMC_Code__r.d21_SpermDonor__r.Email, d21_PMC_Code__r.d21_SpermDonor__r.Phone 
                FROM d21_Associated_Codes__c 
                WHERE Name IN :codeList
            ];
            
            List<d21_PMC__c> pmcRecords = [
                SELECT Id, Name,
                d21_EggDonor__r.Email, d21_EggDonor__r.Phone,
                d21_SpermDonor__r.Email, d21_SpermDonor__r.Phone 
                FROM d21_PMC__c 
                WHERE Name IN :pmcList
            ];
            
            String donorEmail = donor.alternateDetails.email;
            String donorPhone = donor.alternateDetails.phone;
            
            Boolean isEgg = donor.donorType == 'egg';
            
            for (d21_PMC__c pmc : pmcRecords) {
                String email = isEgg ? pmc.d21_EggDonor__r.Email : pmc.d21_SpermDonor__r.Email;
                String phone = isEgg ? pmc.d21_EggDonor__r.Phone : pmc.d21_SpermDonor__r.Phone;
                
                if (email == donorEmail && phone == donorPhone) {
                    return new Response(true, 'Matched');
                }
            }
            
            for (d21_Associated_Codes__c assoc : associateCodeList) {
                String email = isEgg ? assoc.d21_PMC_Code__r.d21_EggDonor__r.Email : assoc.d21_PMC_Code__r.d21_SpermDonor__r.Email;
                String phone = isEgg ? assoc.d21_PMC_Code__r.d21_EggDonor__r.Phone : assoc.d21_PMC_Code__r.d21_SpermDonor__r.Phone;
                
                if (email == donorEmail && phone == donorPhone) {
                    return new Response(true, 'Matched');
                }
            }
            
            return new Response(false, associateCodeList.isEmpty() && pmcRecords.isEmpty() ? 'No Code Records' : 'Not Matched');
            
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - ' + e.getLineNumber());
        }
    }
    
    
    private static boolean checkCode(string code){
        list<d21_Associated_Codes__c> codeList = [SELECT Id,Name FROM d21_Associated_Codes__c Where Name = :code];
        return codeList.isEmpty();
    }
    
    
    @AuraEnabled
    public static Response getRelatedRecords(String contactId, String donorType) {
        try {
            String codeType = (donorType == 'egg') ? 'EDN-' : 'SDN-';
            String newCode = '';
            Integer maxAttempts = 5;
            Integer attempt = 0;
            
            // Generate unique code with max 5 retries
            do {
                String randomSuffix = String.valueOf(Math.abs(Crypto.getRandomLong())).substring(0, 6);
                newCode = codeType + randomSuffix;
                attempt++;
            } while (!checkCode(newCode) && attempt < maxAttempts);
            
            if (!checkCode(newCode)) {
                return new Response(false, 'Unable to generate unique code after ' + maxAttempts + ' attempts.');
            }
            
            d21_Associated_Codes__c codeRecord = new d21_Associated_Codes__c(
                Name = newCode,
                d21_Contact__c = contactId
            );
            insert codeRecord;
            
            return new Response(true, newCode);
            
        } catch (Exception e) {
            return new Response(false, e.getStackTraceString() + ' - ' + e.getMessage() + ' - Line: ' + e.getLineNumber());
        }
    }
    
    
    public class BankDetails{
        @AuraEnabled public string bankName;
        @AuraEnabled public string website;
        @AuraEnabled public string phone;
        @AuraEnabled public string email;
        @AuraEnabled public string coordinatorName;
    }
    
    
    public class SpermClinicDetails{
        @AuraEnabled public string bankName;
        @AuraEnabled public string website;
        @AuraEnabled public string phone;
        @AuraEnabled public string email;
        @AuraEnabled public string coordinatorName;
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
        @AuraEnabled public DonationBasics donationBasics;
        @AuraEnabled public list<string> newCodeList;
        @AuraEnabled public list<RecordWrapper> agenciesWithoutCode;
        @AuraEnabled public list<RecordWrapper> clinicsWithoutCode;
        @AuraEnabled public list<RecordWrapper> AttorniesWithoutCode;
        @AuraEnabled public list<RecordWrapper> recipientsWithoutCode;
        @AuraEnabled public list<Cycle> allCycles;
        @AuraEnabled public AlternateObject alternateDetails;
        @AuraEnabled public ClinicDetails clinicsWithCodes;    
        @AuraEnabled public AgencyDetails agenciesWithCodes;
    }
    
    
    public class AgencyDetails{
        @AuraEnabled public list<RecordWrapper> donationOutcomesListFromApex;
        @AuraEnabled public list<RecordWrapper> additionalAgencies;
    }
    
    
    public class ClinicDetails{
        @AuraEnabled public list<RecordWrapper> donationOutcomesListFromApex;
        @AuraEnabled public list<RecordWrapper> additionalClinics;
    }
    
    
    public class AlternateObject {
        @AuraEnabled public String email;
        @AuraEnabled public String phone;
        @AuraEnabled public Boolean isOptOut;
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
    
    
    public class Sperm {
        @AuraEnabled public Boolean workWithAnySpermBank;
        @AuraEnabled public Boolean workWithAnyClinic;
        @AuraEnabled public Boolean haveIntendedParentDetailsForSperm;
    } 
    
    
    public class RecordWrapper {
        @AuraEnabled public String AgencyName;
        @AuraEnabled public String AttorneyName;
        @AuraEnabled public String Website;
        @AuraEnabled public String Phone;
        @AuraEnabled public String Email;
        @AuraEnabled public String CoordinatorName;
        @AuraEnabled public string ClinicName;
        @AuraEnabled public string DoctorName;
        @AuraEnabled public string CityStateOfClinic;
        @AuraEnabled public list<String> selectedCycles;
        @AuraEnabled public string LawFirm;
        @AuraEnabled public string State;
        @AuraEnabled public string recipient1FirstName;
        @AuraEnabled public string recipient1LastName;
        @AuraEnabled public string additionalInfo;
        @AuraEnabled public list<String> totalSelectedCycles;
        @AuraEnabled public list<Cycles> cycles;
        @AuraEnabled public String agencyId;
        @AuraEnabled public string clinicId;
        @AuraEnabled public string recipientId;
        @AuraEnabled public String attorneyId; 
        @AuraEnabled public String contactId;
        @AuraEnabled public String junctionId;
        @AuraEnabled public String recipientNumber;
        @AuraEnabled public String attorneyNumber;
        @AuraEnabled public string Agency;
        @AuraEnabled public Integer index;
        @AuraEnabled public Boolean noAgencyChecked;
        @AuraEnabled public Boolean noClinicChecked;
        @AuraEnabled public Boolean noAttorneyChecked;
        @AuraEnabled public Boolean noSpermBankChecked;
    }
    
    
    public class Cycles{
        @AuraEnabled public Integer index;
        @AuraEnabled public string cycleId;
        @AuraEnabled public string cycleName;
        @AuraEnabled public Boolean disabled;
        @AuraEnabled public Boolean checked;
    }
    
    
    public class Cycle{
        @AuraEnabled public string Id;
        @AuraEnabled public string Name;
        @AuraEnabled public string agencyId;
        @AuraEnabled public string clinicId;
    }
    
    
    public class Response{
        @AuraEnabled public string message;
        @AuraEnabled public boolean isSuccess;
        public Response(boolean isSuccess, string message){
            this.isSuccess = isSuccess;
            this.message = message;
        }
    }
    
    
    public class SendOptWrapper{
        @AuraEnabled public string email;
        @AuraEnabled public string phone;
        @AuraEnabled public boolean isEmail;
        @AuraEnabled public boolean isPhone;
        @AuraEnabled public string verificationCode;
        @AuraEnabled public string donorId;
        @AuraEnabled public string verificationId;
        public SendOptWrapper(string email, string phone, boolean isEmail, boolean isPhone, string verificationCode, string donorId,string verificationId){
            this.email = email;
            this.phone = phone;
            this.isEmail = isEmail;
            this.isPhone = isPhone;
            this.verificationCode = verificationCode;
            this.donorId = donorId;
            this.verificationId = verificationId;
        }
    }
    
    
    public class CycleResponse{
        @AuraEnabled public string allCyclesData;
        @AuraEnabled public boolean isChanged;
    }
    
}