public with sharing class HipaaFormController {
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
}