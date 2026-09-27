import jwt from 'jsonwebtoken';

export const generateToken = (id, role = null) => {
  const payload = { id };
  if (role) {
    payload.role = role.toString().toLowerCase().trim();
  }
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'admify_super_secret_jwt_fallback_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

export default generateToken;
