module.exports = {
    async Respond_logger(req, res) {
        res.status(200).json({
            status: "ok",
            message: "Post-request logged"
        });
    },
}