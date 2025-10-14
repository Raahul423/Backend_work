const asynchandler = (reqhandler)=>{
    (req,res,next)=>{
        Promise.resolve(reqhandler(req,res,next)).catch((error)=>next(error));
    }
}