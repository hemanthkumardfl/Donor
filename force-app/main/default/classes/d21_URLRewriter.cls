global class d21_URLRewriter implements Site.UrlRewriter {
 
    global PageReference[] generateUrlFor(PageReference[] pages) {
        // Optional: modify outgoing URLs
        return pages;
    }
 
    global PageReference mapRequestUrl(PageReference request) {
        String url = request.getUrl();
        system.debug('url : '+url);
        // Match the user-friendly URL
        if (url == '/donor-registration') {
            system.debug('in 13');
            return Page.DonorPreregistrationSite_VF; // Make sure this VF page exists
        }
        else if (url == '/home') {
            system.debug('in 14');
            return Page.d21_Donor21Home_VF; // Make sure this VF page exists
        }
         else if (url == '/parent-registration') {
            system.debug('in 14');
            return Page.d21_ParenstPreRegistrationSite; // Make sure this VF page exists
        }
        return null; // Let Salesforce handle other URLs
    }
}