import { type Contact } from "@shared/schema";

export interface IStorage {
  identifyContact(email?: string, phoneNumber?: string): Promise<any>;
}

export class MemStorage implements IStorage {
  private contacts: Contact[] = [];
  private currentId = 1;

  async identifyContact(email?: string, phoneNumber?: string) {
    // 1. Find direct matches
    const directMatches = this.contacts.filter(c => 
      (email && c.email === email) || (phoneNumber && c.phoneNumber === phoneNumber)
    );

    if (directMatches.length === 0) {
      // Create new primary
      const newContact: Contact = {
        id: this.currentId++,
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: null,
        linkPrecedence: "primary",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.contacts.push(newContact);
      return this.formatResponse(newContact.id, [newContact]);
    }

    // 2. Find all primary IDs associated with matches
    const primaryIds = new Set<number>();
    for (const match of directMatches) {
      if (match.linkPrecedence === "primary") {
        primaryIds.add(match.id);
      } else if (match.linkedId) {
        primaryIds.add(match.linkedId);
      }
    }

    // Fetch ALL contacts that share these primary IDs.
    const allRelatedContacts = this.contacts.filter(c => 
      primaryIds.has(c.id) || (c.linkedId && primaryIds.has(c.linkedId))
    );

    // Get all unique primary contacts involved
    const primaryContacts = allRelatedContacts.filter(c => c.linkPrecedence === "primary");
    
    // Sort by createdAt to find the oldest
    primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // It's possible we only matched secondaries and primaryContacts is empty if data is corrupted,
    // but assuming consistency, it should be at least 1.
    const oldestPrimary = primaryContacts[0] || allRelatedContacts[0];
    
    // If there were older primaries, the oldest becomes the ultimate primary.
    const newerPrimaries = primaryContacts.slice(1);

    // Update newer primaries to secondary
    if (newerPrimaries.length > 0) {
      for (const newerPrimary of newerPrimaries) {
        const index = this.contacts.findIndex(c => c.id === newerPrimary.id);
        if (index !== -1) {
          this.contacts[index].linkPrecedence = "secondary";
          this.contacts[index].linkedId = oldestPrimary.id;
          this.contacts[index].updatedAt = new Date();
        }
      }
      
      // Update any secondary contacts that were linked to the newer primaries
      for (const newerPrimary of newerPrimaries) {
        for (let i = 0; i < this.contacts.length; i++) {
          if (this.contacts[i].linkedId === newerPrimary.id) {
            this.contacts[i].linkedId = oldestPrimary.id;
            this.contacts[i].updatedAt = new Date();
          }
        }
      }
    }

    // Refresh all related contacts after updates
    const updatedRelatedContacts = this.contacts.filter(c => 
      c.id === oldestPrimary.id || c.linkedId === oldestPrimary.id
    );

    // Check if we need to add a new secondary contact
    let hasNewEmail = false;
    let hasNewPhone = false;

    if (email) {
      hasNewEmail = !updatedRelatedContacts.some(c => c.email === email);
    }
    if (phoneNumber) {
      hasNewPhone = !updatedRelatedContacts.some(c => c.phoneNumber === phoneNumber);
    }

    if (hasNewEmail || hasNewPhone) {
      const newSecondary: Contact = {
        id: this.currentId++,
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: oldestPrimary.id,
        linkPrecedence: "secondary",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.contacts.push(newSecondary);
      updatedRelatedContacts.push(newSecondary);
    }

    return this.formatResponse(oldestPrimary.id, updatedRelatedContacts);
  }

  private formatResponse(primaryId: number, contacts: Contact[]) {
    const primaryContact = contacts.find(c => c.id === primaryId) || contacts[0];
    
    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    
    if (primaryContact.email) emails.add(primaryContact.email);
    if (primaryContact.phoneNumber) phoneNumbers.add(primaryContact.phoneNumber);

    const secondaryContactIds: number[] = [];

    const secondaryContacts = contacts.filter(c => c.id !== primaryId);
    
    for (const c of secondaryContacts) {
      if (c.email) emails.add(c.email);
      if (c.phoneNumber) phoneNumbers.add(c.phoneNumber);
      secondaryContactIds.push(c.id);
    }

    return {
      contact: {
        primaryContactId: primaryId,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds
      }
    };
  }
}

export const storage = new MemStorage();
