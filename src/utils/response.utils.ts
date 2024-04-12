

export const formatResponse = (primaryContact: any, contacts: any[]) => {
    if(!contacts.length) {
        return {
            primaryContatctId: primaryContact.id,
            emails: primaryContact.email ? [primaryContact.email] : [],
            phoneNumbers: primaryContact.phoneNumber ? [primaryContact.phoneNumber] : [],
            secondaryContactIds: []
        }
    }

    const emailsSet = new Set<string>();
    const phoneNumbersSet = new Set<string>();
    const secondaryContactIds: number[] = [];

    for (const contact of contacts) {
        if (contact.email) emailsSet.add(contact.email);
        if (contact.phoneNumber) phoneNumbersSet.add(contact.phoneNumber);

        if (contact.id !== primaryContact.id) {
            secondaryContactIds.push(contact.id);
        }
    }

    const emails = [...emailsSet];
    const phoneNumbers = [...phoneNumbersSet];

    return {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryContactIds
    }
}