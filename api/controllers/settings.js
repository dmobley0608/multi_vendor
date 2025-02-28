import { Settings } from '../models/index.js';

export const getAllSettings = async (req, res) => {
    try {
        const settings = await Settings.findAll();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSetting = async (req, res) => {
    try {
        const setting = await Settings.findOne({
            where: { key: req.params.key }
        });
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getSettingByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await Settings.findOne({ where: { key }});
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        res.json(setting);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettingByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await Settings.findOne({where: { key }});
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        await setting.update(req.body);
        res.json(setting);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}



export const deleteSetting = async (req, res) => {
    try {
        const setting = await Settings.findOne({
            where: { key: req.params.key }
        });
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        await setting.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
