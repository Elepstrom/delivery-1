export function verifyAuth(req, res, next) {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  req.user = { id: userId };
  next();
}