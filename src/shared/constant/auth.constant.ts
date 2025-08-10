export const JWT = {
  accessToken: {
    secret: process.env.JWT_ACCESS_TOKEN_SECRET ?? '',
    expireIn: 3600 * 1, // 1 Hour Dev
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_TOKEN_SECRET ?? '',
    expireIn: 3600 * 24, // 24 Hour Dev
  },
};
