import { LinkPrecedence, PrismaClient } from "@prisma/client";
import log from '../helper/logger.helper';
import { formatResponse } from "../utils/response.utils";

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
        })

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
        
        const primaryContactList = linkedContacts.filter((item) => item.linkPrecedence === LinkPrecedence.primary)[0];

        return {
            contacts: formatResponse(primaryContactList, linkedContacts),
            message: "Linked contacts fetched successfully"
        }
    } catch (error: any) {
        log.error(error.message);
        return { error: "Service: failed while identifying contacts" };
    } finally {
        await prisma.$disconnect();
    }
}