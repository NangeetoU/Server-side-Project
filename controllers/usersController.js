const bcrypt = require('bcryptjs');
const { UsersModel } = require('../models/usersModel');

const UsersController = {
    // POST /users/register
    // อธิบาย 1) แปลง password ให้เป็น hash
    //       2) บันทึกลง DB ผ่าน UserModel.create
    //       3) หยิบ user ที่เพิ่ง insert กลับมาอีกครั้งสำหรับส่ง response    
    async register(req, res, next) {
    try {
      const { first_name, last_name, username, email, password } = req.body;
      if (!first_name || !last_name || !username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const password_hash = await bcrypt.hash(password, 10);
      const user_id = await UsersModel.create({ first_name, last_name, username, email, password_hash });
      const user = await UsersModel.findById(user_id);
      res.status(201).json(user);
    } catch (e) { next(e); }
  },


  // GET /users/:id
  async getById(req, res, next) {
    try {
        const id = Number(req.params.id);
        const user = await UsersModel.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
        } catch (e) { next(e); }
    },


  // PUT /users/:id 
  // อธิบาย 1) เตรียม payload ให้ครบทุก field
  //       2) แปลง password → hash ถ้าแก้ไข password
  //       3) กำหนด ok คือ payload แก้ไขลง DB ผ่าน UserModel.create
  async update(req, res, next) {
    try {
      const id = Number(req.params.id);

      const { first_name, last_name, username, email, password } = req.body;

      let password_hash = null;
      if (password) {
        password_hash = await bcrypt.hash(password, 10);
      }

      const ok = await UsersModel.update(id, {first_name,last_name,username,email,password_hash});

      if (!ok) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = await UsersModel.findById(id);
      res.json(user);
      } catch (e) {next(e);}
    },


    // DELETE /users/:id
    async remove(req, res, next) {
    try {
      const id = Number(req.params.id);
      const ok = await UsersModel.remove(id);
      if (!ok) return res.status(404).json({ error: 'User not found' });
      res.status(204).end();
     } catch (e) { next(e); }
    } 
};

module.exports = { UsersController };
