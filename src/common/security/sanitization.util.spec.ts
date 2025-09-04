import { SanitizationUtil } from './sanitization.util';

describe('SanitizationUtil', () => {
  describe('sanitizeHtml', () => {
    it('should escape HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const result = SanitizationUtil.sanitizeHtml(input);
      expect(result).toBe(
        '&amp;lt;script&amp;gt;alert(&amp;quot;xss&amp;quot;)&amp;lt;&amp;#x2F;script&amp;gt;',
      );
    });

    it('should escape quotes and slashes', () => {
      const input = 'test"value\'with/slash';
      const result = SanitizationUtil.sanitizeHtml(input);
      expect(result).toBe('test&amp;quot;value&amp;#x27;with&amp;#x2F;slash');
    });

    it('should handle empty string', () => {
      const result = SanitizationUtil.sanitizeHtml('');
      expect(result).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(SanitizationUtil.sanitizeHtml(null as any)).toBe('');
      expect(SanitizationUtil.sanitizeHtml(undefined as any)).toBe('');
    });
  });

  describe('sanitizeSql', () => {
    it('should remove SQL injection patterns', () => {
      const input = "'; DROP TABLE users; --";
      const result = SanitizationUtil.sanitizeSql(input);
      expect(result).toBe('TABLE users');
    });

    it('should remove quotes and backslashes', () => {
      const input = 'test"value\'with\\backslash';
      const result = SanitizationUtil.sanitizeSql(input);
      expect(result).toBe('testvaluewithbackslash');
    });

    it('should remove SQL keywords', () => {
      const input = 'SELECT * FROM users UNION SELECT password';
      const result = SanitizationUtil.sanitizeSql(input);
      expect(result).toBe('* FROM users   password');
    });

    it('should handle empty string', () => {
      const result = SanitizationUtil.sanitizeSql('');
      expect(result).toBe('');
    });
  });

  describe('sanitize', () => {
    it('should apply both HTML and SQL sanitization', () => {
      const input = '<script>alert("xss")</script>; DROP TABLE users; --';
      const result = SanitizationUtil.sanitize(input);
      expect(result).toBe(
        '&amp;lt;script&amp;gt;alert(xss)&amp;lt;&amp;#x2F;script&amp;gt;  TABLE users',
      );
    });

    it('should handle normal text', () => {
      const input = 'Hello World!';
      const result = SanitizationUtil.sanitize(input);
      expect(result).toBe('Hello World!');
    });
  });

  describe('sanitizeUrl', () => {
    it('should validate and return valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://api.just-swim.kr',
      ];

      validUrls.forEach((url) => {
        const result = SanitizationUtil.sanitizeUrl(url);
        expect(result).toBe(url + '/'); // URL constructor adds trailing slash
      });
    });

    it('should reject invalid protocols', () => {
      const invalidUrls = [
        'ftp://example.com',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
      ];

      invalidUrls.forEach((url) => {
        const result = SanitizationUtil.sanitizeUrl(url);
        expect(result).toBe('');
      });
    });

    it('should handle malformed URLs', () => {
      const malformedUrls = ['not-a-url', 'http://', 'https://', ''];

      malformedUrls.forEach((url) => {
        const result = SanitizationUtil.sanitizeUrl(url);
        expect(result).toBe('');
      });
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and normalize valid emails', () => {
      const validEmails = [
        'test@example.com',
        'USER@DOMAIN.COM',
        'test.email+tag@example.co.kr',
      ];

      validEmails.forEach((email) => {
        const result = SanitizationUtil.sanitizeEmail(email);
        expect(result).toBe(email.toLowerCase().trim());
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = ['not-an-email', '@example.com', 'test@', ''];

      invalidEmails.forEach((email) => {
        const result = SanitizationUtil.sanitizeEmail(email);
        expect(result).toBe('');
      });
    });

    it('should handle edge case emails', () => {
      // test..test@example.com is actually valid according to the regex
      const result = SanitizationUtil.sanitizeEmail('test..test@example.com');
      expect(result).toBe('test..test@example.com');
    });
  });

  describe('sanitizeNumber', () => {
    it('should convert valid numbers', () => {
      expect(SanitizationUtil.sanitizeNumber('123')).toBe(123);
      expect(SanitizationUtil.sanitizeNumber(456)).toBe(456);
      expect(SanitizationUtil.sanitizeNumber('0')).toBe(0);
    });

    it('should return null for invalid numbers', () => {
      expect(SanitizationUtil.sanitizeNumber('abc')).toBe(null);
      expect(SanitizationUtil.sanitizeNumber('')).toBe(null);
      expect(SanitizationUtil.sanitizeNumber(null)).toBe(null);
      expect(SanitizationUtil.sanitizeNumber(undefined)).toBe(null);
    });
  });
});

// Note: Decorator testing is complex and requires integration testing
// The decorators are tested through actual DTO usage in the application
