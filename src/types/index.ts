export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
  ex: number;
}

export interface HeaderConfig {
  userId: string;
  isAdmin: string;
}
