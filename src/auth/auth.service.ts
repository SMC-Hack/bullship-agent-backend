import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { cfg } from 'src/configuration';
import { AUTH_MESSAGE } from 'src/constants/auth.constant';
import { DrizzleAsyncProvider } from 'src/db/drizzle.provider';
import * as schema from 'src/db/schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async generateAuthMessage(walletAddress: string) {
    const authMessage = await this.db
      .insert(schema.authMessagesTable)
      .values({
        walletAddress,
      })
      .returning();

    return {
      authMessage: {
        nonce: authMessage[0].id,
        walletAddress: authMessage[0].walletAddress,
        message: `${AUTH_MESSAGE}_${walletAddress.toLowerCase()}_${
          authMessage[0].id
        }`,
      },
    };
  }

  async walletLogin(walletAddress: string) {
    let uid: number | undefined;

    const user = await this.db.query.usersTable.findFirst({
      where: eq(schema.usersTable.walletAddress, walletAddress),
    });

    uid = user?.id;

    if (!user) {
      const nU = await this.db
        .insert(schema.usersTable)
        .values({
          walletAddress,
        })
        .returning();

      uid = nU[0].id;
    }

    if (!uid) {
      throw new UnauthorizedException('User can not be authenticated');
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: uid },
      { secret: cfg.jwtSecret, expiresIn: '1d' },
    );

    return {
      accessToken,
    };
  }
}
