import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { cfg } from 'src/configuration';
import { AccessTokenPayload } from './at-payload.model';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.jwtSecret,
      ignoreExpiration: false,
    });
  }

  validate(payload: AccessTokenPayload) {
    return payload;
  }
}
