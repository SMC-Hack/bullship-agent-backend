import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ethers } from 'ethers';
import { AUTH_MESSAGE, AuthMessageStatus } from '../constants/auth.constant';
import { LoginDto } from './login.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/db/drizzle.provider';
import * as schema from 'src/db/schema';
import { eq } from 'drizzle-orm';
import * as dayjs from 'dayjs';

@Injectable()
export class VerifySignatureGuard implements CanActivate {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [req] = context.getArgs();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { body } = req;
    const { signature, nonce, walletAddress } = body as LoginDto;

    const foundMessage = await this.db.query.authMessagesTable.findFirst({
      where: eq(schema.authMessagesTable.id, parseInt(nonce)),
    });

    if (!foundMessage) {
      throw new NotFoundException('Nonce not found');
    }

    if (
      foundMessage.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
    ) {
      throw new BadRequestException('Unmatched wallet address');
    }

    if (
      dayjs(foundMessage?.createdAt).isBefore(dayjs().subtract(120, 'seconds'))
    ) {
      await this.db
        .update(schema.authMessagesTable)
        .set({
          status: AuthMessageStatus.expired,
        })
        .where(eq(schema.authMessagesTable.id, parseInt(nonce)));

      throw new UnauthorizedException('The signature had already expired');
    }

    if (foundMessage.status !== AuthMessageStatus.pending) {
      throw new UnauthorizedException(
        `The message had already been ${foundMessage.status}`,
      );
    }

    let signerWalletAddress: string;

    try {
      signerWalletAddress = this.verifySignature({
        signature,
        walletAddress,
        nonce,
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error verifying signature');
    }

    if (
      !signerWalletAddress ||
      signerWalletAddress?.toLowerCase() !== walletAddress?.toLowerCase()
    ) {
      throw new BadRequestException('Wrong signature');
    }

    await this.db
      .update(schema.authMessagesTable)
      .set({
        status: AuthMessageStatus.used,
      })
      .where(eq(schema.authMessagesTable.id, parseInt(nonce)));

    return true;
  }

  verifySignature({
    signature,
    walletAddress,
    nonce,
  }: {
    signature: string;
    walletAddress: string;
    nonce: string;
  }): string {
    const message = `${AUTH_MESSAGE}_${walletAddress.toLowerCase()}_${nonce}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const recoveredAddress = ethers.verifyMessage(message, signature);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return recoveredAddress;
  }
}
