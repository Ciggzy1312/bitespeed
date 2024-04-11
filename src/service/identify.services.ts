import { LinkPrecedence, PrismaClient } from "@prisma/client";
import log from '../helper/logger.helper';

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
                id: 'asc',
            },
        })

        // if no contact then create a primary contact
        if (linkedContacts.length == 0) {
            const primaryContact = await prisma.contact.create({
                data: {
                    email: email ?? null,
                    phoneNumber: phoneNumber ?? null,
                    linkedId: null,
                    linkPrecedence: LinkPrecedence.primary
                }
            });

            return { linkedContacts: primaryContact, message: "Primary contact created successfully", error: null}
        }

        // if more data then create a primary contact and convert rest to secondary

        return { linkedContacts, message: "Linked contacts fetched successfully", error: null };
    } catch (error: any) {
        log.error(error.message);
        return { error: "Service: failed while identifying contacts" };
    } finally {
        await prisma.$disconnect();
    }
}