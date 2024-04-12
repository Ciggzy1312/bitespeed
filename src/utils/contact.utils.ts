import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export const checkContact = (uniqueEmails: Set<string>, uniquePhoneNumbers: Set<string>, email?: string, phoneNumber?: string) => {
    if (email && phoneNumber) {
        return uniqueEmails.has(email) && uniquePhoneNumbers.has(phoneNumber);
    } else if (email) {
        return uniqueEmails.has(email);
    } else if (phoneNumber) {
        return uniquePhoneNumbers.has(phoneNumber);
    } else {
        return false;
    }
}

export const getLinkedContacts = async (linkedContacts: any[]) => {
    try {
        const uniqueEmails = new Set(linkedContacts.map((item) => item.email));
        const uniquePhoneNumbers = new Set(linkedContacts.map((item) => item.phoneNumber));

        const allLinkedContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { email: { in: [...uniqueEmails] } },
                    { phoneNumber: { in: [...uniquePhoneNumbers] } }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        return { allLinkedContacts, uniqueEmails, uniquePhoneNumbers }
    } catch (error) {
        throw new Error("Error while getting all the linked contacts")
    }
} 