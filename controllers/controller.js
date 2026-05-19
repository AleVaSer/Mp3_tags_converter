module.exports = {
    async Respond_logger(req, res) {
        res.status(200).json({
            status: "ok",
            message: "Post-request logged"
        });
    },
    async Respond_Error_logger(req, res) {
        res.status(404).json({
            status: "error",
            message: "Post-request failed"
        });
    },
}
