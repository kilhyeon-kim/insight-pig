import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';

export class CustomTypeOrmLogger implements TypeOrmLogger {
  private formatSql(query: string, parameters?: any[]): string {
    let formattedQuery = query;

    // 파라미터를 실제 값으로 치환
    if (parameters && parameters.length > 0) {
      parameters.forEach((param, index) => {
        const placeholder = `:${index + 1}`;
        const value = typeof param === 'string' ? `'${param}'` : param;
        formattedQuery = formattedQuery.replace(placeholder, String(value));
      });
    }

    // SQL 키워드 앞에서 줄바꿈
    formattedQuery = formattedQuery
      .replace(/\bSELECT\b/gi, '\n  SELECT')
      .replace(/\bFROM\b/gi, '\n  FROM')
      .replace(/\bWHERE\b/gi, '\n  WHERE')
      .replace(/\bAND\b/gi, '\n    AND')
      .replace(/\bINNER JOIN\b/gi, '\n  INNER JOIN')
      .replace(/\bLEFT JOIN\b/gi, '\n  LEFT JOIN')
      .replace(/\bORDER BY\b/gi, '\n  ORDER BY')
      .replace(/\bGROUP BY\b/gi, '\n  GROUP BY')
      .replace(/\bFETCH\b/gi, '\n  FETCH')
      .replace(/\bUPDATE\b/gi, '\n  UPDATE')
      .replace(/\bSET\b/gi, '\n  SET');

    return formattedQuery;
  }

  logQuery(query: string, parameters?: any[], _queryRunner?: QueryRunner): void {
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    console.log('\n\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
    console.log(`\x1b[33m[${timestamp}] SQL:\x1b[0m`);
    console.log('\x1b[32m' + this.formatSql(query, parameters) + '\x1b[0m');
    console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');
  }

  logQueryError(error: string | Error, query: string, parameters?: any[], _queryRunner?: QueryRunner): void {
    console.log('\n\x1b[31m[SQL Error]\x1b[0m');
    console.log('\x1b[31m' + this.formatSql(query, parameters) + '\x1b[0m');
    console.log('\x1b[31mError: ' + error + '\x1b[0m\n');
  }

  logQuerySlow(time: number, query: string, parameters?: any[], _queryRunner?: QueryRunner): void {
    console.log(`\n\x1b[35m[Slow Query ${time}ms]\x1b[0m`);
    console.log('\x1b[35m' + this.formatSql(query, parameters) + '\x1b[0m\n');
  }

  logSchemaBuild(_message: string, _queryRunner?: QueryRunner): void {}
  logMigration(_message: string, _queryRunner?: QueryRunner): void {}
  log(_level: 'log' | 'info' | 'warn', _message: any, _queryRunner?: QueryRunner): void {}
}