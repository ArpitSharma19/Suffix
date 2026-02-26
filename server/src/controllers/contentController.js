const Content = require("../models/Content");

exports.getContent = async (req, res) => {
    try {
        const data = await Content.findAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getContentByKey = async (req, res) => {
    try {
        const item = await Content.findOne({ where: { key: req.params.key } });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateContent = async (req, res) => {
    try {
        const { key, value } = req.body;

        const [content, created] = await Content.findOrCreate({
            where: { key },
            defaults: { value }
        });

        if (!created) {
            content.value = value;
            await content.save();
        }

        res.json(content);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
