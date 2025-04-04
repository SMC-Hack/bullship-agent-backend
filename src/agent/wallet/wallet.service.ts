import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as crypto from 'crypto';
import { cfg } from 'src/configuration';

@Injectable()
export class WalletService {
  private readonly encryptionKey: string;

  constructor() {
    this.encryptionKey = cfg.walletEncryptionKey;
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'hex'),
      iv,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'hex'),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  createWallet() {
    const wallet = ethers.Wallet.createRandom();
    const encryptedPrivateKey = this.encrypt(wallet.privateKey);

    return {
      address: wallet.address,
      encryptedWalletData: encryptedPrivateKey,
    };
  }

  getSigner(encryptedWalletData: string): ethers.Signer {
    const privateKey = this.decrypt(encryptedWalletData);
    return new ethers.Wallet(privateKey);
  }
}
