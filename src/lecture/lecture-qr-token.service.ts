import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LectureQrToken } from './entity/lecture-qr-token.entity';

export interface QrTokenPayload {
  lectureId: number;
  iat: number;
  exp: number;
  jti: string;
}

@Injectable()
export class LectureQrTokenService {
  private readonly QR_TOKEN_EXPIRY_DAYS = 90; // 90일 유효

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(LectureQrToken)
    private readonly qrTokenRepository: Repository<LectureQrToken>,
  ) {}

  /**
   * 강의용 QR 토큰 생성
   * @param lectureId 강의 ID
   * @returns JWT 토큰 문자열
   */
  async generateQrToken(lectureId: number): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = this.QR_TOKEN_EXPIRY_DAYS * 24 * 60 * 60; // 초 단위
    const jti = `qr_${lectureId}_${now}_${Math.random().toString(36).substring(2, 11)}`;

    const payload: QrTokenPayload = {
      lectureId,
      iat: now,
      exp: now + expiresIn,
      jti,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('QR_TOKEN_SECRET'),
      expiresIn: `${this.QR_TOKEN_EXPIRY_DAYS}d`,
    });

    // 선택적: DB에 토큰 저장 (무효화를 위해)
    try {
      const expiresAt = new Date((now + expiresIn) * 1000);
      await this.qrTokenRepository.save({
        lecture: { lectureId },
        token,
        expiresAt,
        isRevoked: false,
      });
    } catch (error) {
      // DB 저장 실패해도 토큰은 유효 (JWT 자체 검증 가능)
      // 로깅만 하고 계속 진행
      console.warn('QR 토큰 DB 저장 실패 (토큰은 여전히 유효):', error);
    }

    return token;
  }

  /**
   * QR 토큰 검증
   * @param token JWT 토큰 문자열
   * @returns 검증된 토큰 페이로드
   */
  async verifyQrToken(token: string): Promise<QrTokenPayload> {
    try {
      // JWT 토큰 검증
      const payload = this.jwtService.verify<QrTokenPayload>(token, {
        secret: this.configService.get<string>('QR_TOKEN_SECRET'),
      });

      // DB에서 토큰 무효화 여부 확인 (선택적)
      const dbToken = await this.qrTokenRepository.findOne({
        where: { token },
      });

      // DB에 토큰이 있고 무효화된 경우
      if (dbToken && dbToken.isRevoked) {
        throw new UnauthorizedException('무효화된 QR 코드입니다.');
      }

      // 만료 시간 재확인 (JWT exp 클레임과 DB expiresAt 모두 확인)
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new UnauthorizedException('만료된 QR 코드입니다.');
      }

      if (dbToken && dbToken.expiresAt < new Date()) {
        throw new UnauthorizedException('만료된 QR 코드입니다.');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // JWT 검증 실패
      throw new UnauthorizedException('유효하지 않은 QR 코드입니다.');
    }
  }

  /**
   * QR 토큰 무효화 (강의 삭제 시 등)
   * @param lectureId 강의 ID
   */
  async revokeQrTokensByLectureId(lectureId: number): Promise<void> {
    await this.qrTokenRepository.update(
      { lecture: { lectureId }, isRevoked: false },
      { isRevoked: true },
    );
  }

  /**
   * 특정 토큰 무효화
   * @param token 토큰 문자열
   */
  async revokeQrToken(token: string): Promise<void> {
    await this.qrTokenRepository.update(
      { token },
      { isRevoked: true },
    );
  }
}

