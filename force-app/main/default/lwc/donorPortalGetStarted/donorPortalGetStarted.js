import { LightningElement } from 'lwc';

export default class DonorPortalGetStarted extends LightningElement {

    reminders = [
        { id: 1, label: 'Update Your Contact Info', dueDate: 'August 2, 2025',description : 'Make sure your contact details are current.' },
        { id: 2, label: 'Update Health Information', dueDate: 'September 20, 2025',description : 'Review and update health details.' },
        { id: 3, label: 'Next Account Billing', dueDate: 'October 15, 2025',description : 'Automatic payment scheduled.' },
    ];

    lastUpdate = 'January 15, 2025';
    nextUpdate = 'March 15, 2025';
    newMessages = 3;

    quickActions = [
        { 
            label: 'Create Health Report',
            description: 'Generates new health reports quickly!'
        },
        { 
            label: 'Review Reports',
            description: "Stay informed about your child's status."
        },
        { 
            label: 'Storage Vault',
            description: 'Keep your documents safe and secure.'
        },
        { 
            label: 'Memory Box',
            description: 'Capture special moments with your child.'
        },
        { 
            label: 'Connect with Donor',
            description: 'Reach out to connect with your child\'s donor.'
        },
        { 
            label: 'Support',
            description: 'Need help? Contact support for assistance.'
        }
    ];
}