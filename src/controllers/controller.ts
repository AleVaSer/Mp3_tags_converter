const controller = {
    async Respond_logger(req: any, res: any) {
        res.status(200).json({
            status: "ok",
            message: "Post-request logged"
        });
    },
}

export default controller;
