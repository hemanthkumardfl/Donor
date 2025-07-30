public class NewApexHandler {
	
	public class Egg {
		@AuraEnabled public Integer liveBirths;
		@AuraEnabled public Boolean currentOrFutureDonation;
		@AuraEnabled public Boolean workWithAnyAgencyOrEggBank;
		@AuraEnabled public Boolean workWithAttorney;
		@AuraEnabled public Boolean haveIntendedParentDetails;
	}

	public class Sperm {

	}

	public class DonationBasics {
		@AuraEnabled public Egg egg;
		@AuraEnabled public Sperm sperm;
	}

	public class Codes {
		@AuraEnabled public List<String> PMC;
		@AuraEnabled public List<String> EDN;
		@AuraEnabled public List<String> SDN;
		@AuraEnabled public List<String> EMB;
		@AuraEnabled public List<String> REC;
		@AuraEnabled public Boolean isSkipped;
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
	}

	@AuraEnabled
	public static void updateDonationOutCome(string donorDetails){
		DonorRegistrationWrapper donor = (DonorRegistrationWrapper) JSON.deserialize(donorDetails, DonorRegistrationWrapper.class);
		system.debug(donor);
		DonationBasics donationBasicsObj = donor.donationBasics;
		system.debug(donationBasicsObj);
	}
    
    @AuraEnabled
    public static void fetchSpermDonorBankAndClinicDetails(string sdncode){
         list<string> codeMergeList = new list<string>();
    }
    
    public class SpermDonorBankAndClincs{
        @AuraEnabled public list<Account> spermBanksList;
        @AuraEnabled public list<Account> spermClinicsList;
        @AuraEnabled public list<Account> agencyList;
    } 
    
    

}