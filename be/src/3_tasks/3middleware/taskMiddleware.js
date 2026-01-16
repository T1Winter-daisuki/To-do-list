export const validTask = (req, res, next) => {
    const { title, deadline } = req.body;
    
    if (!title || title.trim() === "")
        return res.status(400).json({ message: "Tiêu đề không được để trống."});
    
    if (deadline && isNaN(Date.parse(deadline)))
        return res.status(400).json({ message: "Deadline sai định dạng"});

    next();
}