import { Request, Response } from 'express'
import log from '../helper/logger.helper';
import { checkIdentity } from '../service/identify.services';

export interface IContactInput {
    email?: string
    phoneNumber?: string
}

export const identifyController = async (req: Request, res: Response) => {
    try {
        const { email, phoneNumber } : IContactInput = req.body;

        const { contacts, message, error } = await checkIdentity(email as string, phoneNumber as string);
        if (error) {
            log.error(error);
            return res.status(400).json({ message: error });
        }

        log.info(message);
        return res.status(200).json({ contacts });
    } catch (error: any) {
        log.error(error);
        res.status(400).json({ message: "Controller: failed while identifying contacts" });
    }
}