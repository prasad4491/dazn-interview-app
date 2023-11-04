import { Request, Response } from "express";
function checkAdminRole(req: Request, res: Response, next: any) {
  const role = req.headers.role;
  if(role === 'admin') {
    next();
  } else {
    res.status(403).json({error: "Acces denied. Required admin previliges"});
  }
}
export default checkAdminRole;