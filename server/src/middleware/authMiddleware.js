const protect = async (req, res, next) => {
    console.log('[AUTH] bypass', { url: req.originalUrl });
    next();
};

module.exports = { protect };
