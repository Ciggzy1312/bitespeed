import { LinkPrecedence, PrismaClient } from "@prisma/client";
import log from '../helper/logger.helper';
import { formatResponse } from "../utils/response.utils";
import { checkContact, getLinkedContacts } from "../utils/contact.utils";

const prisma = new PrismaClient();

export const checkIdentity = async (email: string, phoneNumber: string) => {
    try {
        // search for all the linked contacts for the email or phoneNumber
        const linkedContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { email },
                    { phoneNumber }
                ]
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // if no contact then create a primary contact
        if (!linkedContacts.length) {
            const primaryContact = await prisma.contact.create({
                data: {
                    email: email ?? null,
                    phoneNumber: phoneNumber ?? null,
                    linkedId: null,
                    linkPrecedence: LinkPrecedence.primary
                }
            });

            return {
                contacts: formatResponse(primaryContact, []),
                message: "Primary contact created successfully"
            }
        }

        const { allLinkedContacts, uniqueEmails, uniquePhoneNumbers } = await getLinkedContacts(linkedContacts);

        const primaryContactList = allLinkedContacts.filter((item) => item.linkPrecedence === LinkPrecedence.primary);

        if (primaryContactList.length > 1) {
            const firstContact = primaryContactList[0];

            if (!firstContact.email || !firstContact.phoneNumber) {
                await prisma.contact.update({
                    where: {
                        id: firstContact.id
                    },
                    data: {
                        email: firstContact.email ?? email,
                        phoneNumber: firstContact.phoneNumber ?? phoneNumber
                    }
                });
            }

            const contacts = await prisma.contact.updateMany({
                where: {
                    id: { in: allLinkedContacts.filter((item) => item.id !== firstContact.id).map((item) => item.id) }
                },
                data: {
                    linkedId: firstContact.id,
                    linkPrecedence: LinkPrecedence.secondary
                }
            });

            const { allLinkedContacts: allUpdatedContacts } = await getLinkedContacts(linkedContacts)

            return {
                contacts: formatResponse(firstContact, allUpdatedContacts),
                message: "Contacts updated successfully"
            }
        } else {
            const primaryContact = primaryContactList[0];

            if (checkContact(uniqueEmails, uniquePhoneNumbers, email, phoneNumber)) {
                return {
                    contacts: formatResponse(primaryContact, allLinkedContacts),
                    message: "Linked contacts fetched successfully"
                }
            }
            else {
                const secondaryContact = await prisma.contact.create({
                    data: {
                        email: email ?? null,
                        phoneNumber: phoneNumber ?? null,
                        linkedId: primaryContact.id,
                        linkPrecedence: LinkPrecedence.secondary
                    }
                });

                return {
                    contacts: formatResponse(primaryContact, linkedContacts.concat(secondaryContact)),
                    message: "Linked contacts fetched successfully"
                }
            }
        }
    } catch (error: any) {
        log.error(error.message);
        return { error: "Service: failed while identifying contacts" };
    } finally {
        await prisma.$disconnect();
    }
}