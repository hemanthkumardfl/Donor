import { LightningElement, track  } from 'lwc';
import ENVELOPE_LOGO from '@salesforce/resourceUrl/EnvelopeWithArrow';
import COMMENT_ICON from '@salesforce/resourceUrl/commentIcon';
import BELL_ICON from '@salesforce/resourceUrl/Bellicon';
import TREE_ICON from '@salesforce/resourceUrl/TreeIcon';
export default class DonorPreRegOffspringAgeUnder18 extends LightningElement {
    @track envelopeLogo = ENVELOPE_LOGO;
    @track commentIcon = COMMENT_ICON;
    @track bellicon = BELL_ICON;
    @track treeIcon = TREE_ICON;
}